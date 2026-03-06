import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import TableOfContents from "../_components/table-of-contents";
import BlogPostAnalytics from "../_components/blog-post-analytics";
import styles from "../blog.module.css";
import { getBlogPostBySlug, getBlogPostSlugs } from "@/lib/blog";
import { toCanonicalUrl } from "@/lib/seo";

type Params = {
  slug: string;
};

export const dynamicParams = false;

function formatDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  }).format(date);
}

export async function generateStaticParams() {
  const slugs = await getBlogPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const post = await getBlogPostBySlug(resolvedParams.slug);

  if (!post) {
    return {
      title: "Blog post not found"
    };
  }

  return {
    title: `${post.frontmatter.title} | Blog`,
    description: post.frontmatter.description,
    alternates: {
      canonical: `/blog/${post.slug}`
    },
    openGraph: {
      title: post.frontmatter.title,
      description: post.frontmatter.description,
      type: "article"
    },
    twitter: {
      card: "summary_large_image",
      title: post.frontmatter.title,
      description: post.frontmatter.description
    }
  };
}

export default async function BlogPostPage({
  params
}: {
  params: Promise<Params>;
}) {
  const resolvedParams = await params;
  const post = await getBlogPostBySlug(resolvedParams.slug);

  if (!post) {
    notFound();
  }

  let paragraphIndex = 0;
  const canonicalUrl = toCanonicalUrl(`/blog/${post.slug}`);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${canonicalUrl}#blogpost`,
    headline: post.frontmatter.title,
    description: post.frontmatter.description,
    datePublished: post.frontmatter.publishedAt,
    dateModified: post.frontmatter.updatedAt,
    author: {
      "@type": "Person",
      name: post.frontmatter.author
    },
    mainEntityOfPage: canonicalUrl,
    url: canonicalUrl
  };

  return (
    <div className={styles.container} data-align="right">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <BlogPostAnalytics
        slug={post.slug}
        title={post.frontmatter.title}
        estimatedReadingMinutes={post.readingMinutes}
        publishedAt={post.frontmatter.publishedAt}
        updatedAt={post.frontmatter.updatedAt}
      />

      <TableOfContents headings={post.headings} />

      <header id="pre" className={`${styles.articleHeader} ${styles.blogTextRise}`}>
        <h1 className={`${styles.fluid} ${styles.articleTitle}`}>{post.frontmatter.title}</h1>
        <div className={styles.articleAuthor}>
          <div className={styles.articleAuthorInfo}>
            <span>
              Originally written on {formatDate(post.frontmatter.publishedAt)}, last updated on {formatDate(post.frontmatter.updatedAt)}.
            </span>
          </div>
        </div>
      </header>

      <main className={`${styles.articleMain} ${styles.blogTextRise} ${styles.blogTextRiseDelay1}`}>
        <article className={styles.prose}>
          <MDXRemote
            source={post.content}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm],
                rehypePlugins: [rehypeSlug]
              }
            }}
            components={{
              p: ({ children, ...props }) => {
                paragraphIndex += 1;
                const className = paragraphIndex === 1 ? styles.intro : undefined;
                return (
                  <p {...props} className={className}>
                    {children}
                  </p>
                );
              },
              a: ({ href, children, ...props }) => {
                const external = typeof href === "string" && /^https?:\/\//.test(href);
                return (
                  <a
                    href={href}
                    {...props}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noopener noreferrer" : undefined}
                  >
                    {children}
                  </a>
                );
              },
              hr: (props) => <hr {...props} className={styles.rule} />
            }}
          />
        </article>
      </main>

      <hr className={styles.containerRule} />

      <footer className={styles.footer}>
        <p className={styles.footerCopy}>Written with love and effort :D © {new Date().getFullYear()} Daniel Negre on most content. Each brand is the property of its respective owner.</p>
      </footer>
    </div>
  );
}
