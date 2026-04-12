import type { MetadataRoute } from "next";
import { getBlogPostSlugs } from "@/lib/blog";
import { projects } from "@/lib/projects";
import { toCanonicalUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const blogSlugs = await getBlogPostSlugs();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: toCanonicalUrl("/"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1
    },
    {
      url: toCanonicalUrl("/blog"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8
    },
    {
      url: toCanonicalUrl("/void"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.1
    }
  ];

  const blogRoutes: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: toCanonicalUrl(`/blog/${slug}`),
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7
  }));

  const projectRoutes: MetadataRoute.Sitemap = projects.map((project) => ({
    url: toCanonicalUrl(`/project/${project.id}`),
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.5
  }));

  return [...staticRoutes, ...blogRoutes, ...projectRoutes];
}
