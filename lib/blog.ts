import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import GithubSlugger from "github-slugger";
import { cache } from "react";

const BLOG_DIRECTORY = path.join(process.cwd(), "content", "blog");

export type BlogHeading = {
  id: string;
  level: 2 | 3;
  title: string;
};

export type BlogFrontmatter = {
  title: string;
  description: string;
  publishedAt: string;
  updatedAt: string;
  author: string;
  authorRole?: string;
  authorImage?: string;
};

export type BlogPost = {
  slug: string;
  frontmatter: BlogFrontmatter;
  content: string;
  headings: BlogHeading[];
  excerpt: string;
  readingMinutes: number;
};

function parseFrontmatterDate(value: unknown): string {
  if (typeof value === "string") {
    return value.trim();
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }

  return "";
}

function normalizeFrontmatter(frontmatter: Record<string, unknown>, slug: string): BlogFrontmatter {
  const title = typeof frontmatter.title === "string" ? frontmatter.title.trim() : "";
  const description = typeof frontmatter.description === "string" ? frontmatter.description.trim() : "";
  const publishedAt = parseFrontmatterDate(frontmatter.publishedAt);
  const updatedAt = parseFrontmatterDate(frontmatter.updatedAt) || publishedAt;
  const author = typeof frontmatter.author === "string" ? frontmatter.author.trim() : "";

  if (!title || !description || !publishedAt || !author) {
    throw new Error(`Invalid blog frontmatter in ${slug}.mdx. Required: title, description, publishedAt, author.`);
  }

  return {
    title,
    description,
    publishedAt,
    updatedAt,
    author,
    authorRole: typeof frontmatter.authorRole === "string" ? frontmatter.authorRole.trim() : undefined,
    authorImage: typeof frontmatter.authorImage === "string" ? frontmatter.authorImage.trim() : undefined
  };
}

function stripInlineMarkdown(value: string): string {
  return value
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .trim();
}

function stripHtmlTags(value: string): string {
  return value.replace(/<[^>]+>/g, "").trim();
}

function extractHeadings(content: string): BlogHeading[] {
  const lines = content.split(/\r?\n/);
  const headings: BlogHeading[] = [];
  const slugger = new GithubSlugger();
  let inCodeFence = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      inCodeFence = !inCodeFence;
      continue;
    }

    if (inCodeFence) {
      continue;
    }

    const markdownMatch = /^(#{2,3})\s+(.+)$/.exec(trimmed);
    if (markdownMatch) {
      const level = markdownMatch[1].length as 2 | 3;
      const title = stripInlineMarkdown(markdownMatch[2]);
      if (!title) {
        continue;
      }

      headings.push({
        id: slugger.slug(title),
        level,
        title
      });
      continue;
    }

    const htmlMatch = /^<h([23])([^>]*)>([\s\S]*?)<\/h\1>$/.exec(trimmed);
    if (!htmlMatch) {
      continue;
    }

    const level = Number(htmlMatch[1]) as 2 | 3;
    const attrs = htmlMatch[2] ?? "";
    const rawTitle = htmlMatch[3] ?? "";
    const title = stripInlineMarkdown(stripHtmlTags(rawTitle));
    if (!title) {
      continue;
    }

    const idMatch = /\sid=(?:"([^"]+)"|'([^']+)')/.exec(attrs);
    const explicitId = idMatch?.[1] ?? idMatch?.[2];

    headings.push({
      id: explicitId || slugger.slug(title),
      level,
      title
    });
  }

  return headings;
}

function extractExcerpt(content: string): string {
  const cleaned = content
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#") && line !== "---")
    .map((line) => stripInlineMarkdown(line));

  return cleaned[0] ?? "";
}

function calculateReadingMinutes(content: string): number {
  const words = content
    .replace(/```[\s\S]*?```/g, "")
    .replace(/<[^>]+>/g, "")
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(1, Math.ceil(words / 220));
}

async function readPostBySlug(slug: string): Promise<BlogPost | null> {
  const fullPath = path.join(BLOG_DIRECTORY, `${slug}.mdx`);

  let raw: string;
  try {
    raw = await fs.readFile(fullPath, "utf8");
  } catch {
    return null;
  }

  const parsed = matter(raw);
  const frontmatter = normalizeFrontmatter(parsed.data, slug);
  const content = parsed.content.trim();

  return {
    slug,
    frontmatter,
    content,
    headings: extractHeadings(content),
    excerpt: extractExcerpt(content),
    readingMinutes: calculateReadingMinutes(content)
  };
}

export const getBlogPostSlugs = cache(async (): Promise<string[]> => {
  const entries = await fs.readdir(BLOG_DIRECTORY, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".mdx"))
    .map((entry) => entry.name.replace(/\.mdx$/, ""))
    .sort();
});

export const getBlogPostBySlug = cache(async (slug: string): Promise<BlogPost | null> => {
  return readPostBySlug(slug);
});

export const getAllBlogPosts = cache(async (): Promise<BlogPost[]> => {
  const slugs = await getBlogPostSlugs();
  const posts = await Promise.all(slugs.map((slug) => readPostBySlug(slug)));

  return posts
    .filter((post): post is BlogPost => post !== null)
    .sort((a, b) => b.frontmatter.publishedAt.localeCompare(a.frontmatter.publishedAt));
});
