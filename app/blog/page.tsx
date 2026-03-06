import type { Metadata } from "next";
import PostsList from "./_components/posts-list";
import styles from "./blog.module.css";
import { getAllBlogPosts } from "@/lib/blog";
import { getDefaultName } from "@/lib/name-resolution";

export const metadata: Metadata = {
  title: `${getDefaultName()} (Blog)`,
  description: "Articles and notes on design engineering, systems thinking, and building digital products."
};

export default async function BlogIndexPage() {
  const posts = await getAllBlogPosts();

  return (
    <>
      <section className={styles.blogTextRise}>
        <p className="site-bhdr">
          Welcome, welcome... To my blog!<br/><br/>Here I share articles and notes on many topics, sometimes related to my work, but sometimes unrelated things that I've investigated and want to write about.<br/><br/>These are not structured like usual posts, but rather could be compared to formally written documents or short essays. They sometimes cite other sources and studies as well, and they're designed to be as impartial and accurate as possible.<br/><br/>Every post is written across a few days or weeks, and I always make sure that every detail is as accurate and well-researched as possible. I do try to make them as easy to read as I can, though.
        </p>
      </section>

      {posts.length > 0 ? (
        <PostsList
          posts={posts.map((post) => ({
            slug: post.slug,
            title: post.frontmatter.title,
            description: post.frontmatter.description,
            excerpt: post.excerpt,
            publishedAt: post.frontmatter.publishedAt
          }))}
        />
      ) : (
        <section className={`${styles.blogEmptySection} ${styles.blogTextRise} ${styles.blogTextRiseDelay1}`}>
          <p className={styles.blogEmptyState}>
            Nothing released yet. Check back in just a few days!
          </p>
        </section>
      )}
    </>
  );
}
