import type { Metadata } from "next";
import Home from "@/components/home";
import { notFound } from "next/navigation";
import { getBlogEntries, getBlogPostBySlug, getBlogPostSlugs } from "@/lib/blog";
import { toCanonicalUrl, CANONICAL_HOME_URL } from "@/lib/seo";
import { DEFAULT_NAME } from "@/lib/name-resolution";

type Params = {
  slug: string;
};

export const dynamicParams = false;

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
    title: `${post.frontmatter.title} | ${DEFAULT_NAME} Blog`,
    description: post.frontmatter.description,
    alternates: {
      canonical: `/blog/${post.slug}`
    },
    openGraph: {
      title: post.frontmatter.title,
      description: post.frontmatter.description,
      type: "article",
      url: toCanonicalUrl(`/blog/${post.slug}`),
      publishedTime: post.frontmatter.publishedAt,
      modifiedTime: post.frontmatter.updatedAt,
      authors: [post.frontmatter.author]
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
  const [post, blogEntries] = await Promise.all([
    getBlogPostBySlug(resolvedParams.slug),
    getBlogEntries()
  ]);

  if (!post) {
    notFound();
  }

  const canonicalUrl = toCanonicalUrl(`/blog/${post.slug}`);
  const isDefaultAuthor = post.frontmatter.author === DEFAULT_NAME;
  const blogPostingData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${canonicalUrl}#blogpost`,
    headline: post.frontmatter.title,
    description: post.frontmatter.description,
    datePublished: post.frontmatter.publishedAt,
    dateModified: post.frontmatter.updatedAt,
    author: {
      "@type": "Person",
      name: post.frontmatter.author,
      ...(isDefaultAuthor ? { url: CANONICAL_HOME_URL } : {}),
      ...(post.frontmatter.authorImage ? { image: toCanonicalUrl(post.frontmatter.authorImage) } : {})
    },
    mainEntityOfPage: canonicalUrl,
    url: canonicalUrl
  };
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: DEFAULT_NAME, item: CANONICAL_HOME_URL },
      { "@type": "ListItem", position: 2, name: `${DEFAULT_NAME} Blog`, item: toCanonicalUrl("/blog") },
      { "@type": "ListItem", position: 3, name: post.frontmatter.title }
    ]
  };
  const structuredData = [blogPostingData, breadcrumbData];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <div data-vaul-drawer-wrapper>
        <Home initialProjectId={post.slug} standaloneProjectRoute blogEntries={blogEntries} />
      </div>
    </>
  );
}
