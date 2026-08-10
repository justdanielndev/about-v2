import type { MetadataRoute } from "next";
import { getBlogPostSlugs } from "@/lib/blog";
import { projects } from "@/lib/projects";
import { works } from "@/lib/work";
import { toCanonicalUrl } from "@/lib/seo";
import { extractEntryImages } from "@/lib/entry-images";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const blogSlugs = await getBlogPostSlugs();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: toCanonicalUrl("/"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
      images: [toCanonicalUrl("/daniel-negre.png")]
    },
    {
      url: toCanonicalUrl("/blog"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5
    }
  ];

  const blogRoutes: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: toCanonicalUrl(`/blog/${slug}`),
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6
  }));

  const projectRoutes: MetadataRoute.Sitemap = projects.map((project) => ({
    url: toCanonicalUrl(`/project/${project.id}`),
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
    images: extractEntryImages(project)
  }));

  const workRoutes: MetadataRoute.Sitemap = works.map((work) => ({
    url: toCanonicalUrl(`/work/${work.id}`),
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
    images: extractEntryImages(work)
  }));

  return [...staticRoutes, ...blogRoutes, ...projectRoutes, ...workRoutes];
}
