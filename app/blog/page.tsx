import type { Metadata } from "next";
import Home from "@/components/home";
import { getAllBlogPosts, getBlogEntries } from "@/lib/blog";
import { getDefaultName } from "@/lib/name-resolution";
import { toCanonicalUrl } from "@/lib/seo";

const BLOG_DESCRIPTION =
  "A collection of articles and notes on various topics, written by Daniel Negre. These are well-researched and impartial, and they sometimes cite other sources and studies as well.";

export const metadata: Metadata = {
  title: `${getDefaultName()} (Blog)`,
  description: BLOG_DESCRIPTION,
  alternates: {
    canonical: "/blog"
  },
  openGraph: {
    title: `${getDefaultName()} Blog`,
    description: BLOG_DESCRIPTION,
    url: toCanonicalUrl("/blog"),
    type: "website",
    images: [{ url: toCanonicalUrl("/link.png"), alt: `${getDefaultName()} Blog` }]
  },
  twitter: {
    card: "summary_large_image",
    title: `${getDefaultName()} Blog`,
    description: BLOG_DESCRIPTION,
    images: [toCanonicalUrl("/link.png")]
  }
};

export default async function BlogIndexPage() {
  const [posts, blogEntries] = await Promise.all([getAllBlogPosts(), getBlogEntries()]);
  const canonicalUrl = toCanonicalUrl("/blog");
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${canonicalUrl}#blog`,
    url: canonicalUrl,
    name: `${getDefaultName()} Blog`,
    description: metadata.description,
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      "@id": `${toCanonicalUrl(`/blog/${post.slug}`)}#blogpost`,
      headline: post.frontmatter.title,
      datePublished: post.frontmatter.publishedAt,
      dateModified: post.frontmatter.updatedAt,
      author: {
        "@type": "Person",
        name: post.frontmatter.author
      },
      url: toCanonicalUrl(`/blog/${post.slug}`)
    }))
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <div data-vaul-drawer-wrapper>
        <Home initialTopTab="blog" standaloneProjectRoute blogEntries={blogEntries} />
      </div>
    </>
  );
}
