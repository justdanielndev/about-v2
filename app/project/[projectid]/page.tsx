import type { Metadata } from "next";
import Home from "@/components/home";
import { notFound } from "next/navigation";
import { projects, projectsById } from "@/lib/projects";
import { getBlogEntries } from "@/lib/blog";
import { toCanonicalUrl } from "@/lib/seo";
import { getPrimaryImage } from "@/lib/entry-images";

type ProjectPageProps = {
  params: Promise<{ projectid: string }>;
};

export async function generateStaticParams() {
  return projects.map((project) => ({
    projectid: project.id
  }));
}

export async function generateMetadata({
  params
}: ProjectPageProps): Promise<Metadata> {
  const { projectid } = await params;
  const project = projectsById[projectid];

  if (!project) {
    return {};
  }

  const primarySrc = getPrimaryImage(project);
  const primaryImageUrl = primarySrc ? toCanonicalUrl(primarySrc) : undefined;

  return {
    title: `${project.name} | Daniel Negre Navarro`,
    description: project.summary,
    alternates: {
      canonical: `/project/${project.id}`
    },
    openGraph: {
      title: project.name,
      description: project.summary,
      url: toCanonicalUrl(`/project/${project.id}`),
      type: "article",
      ...(primaryImageUrl ? { images: [{ url: primaryImageUrl, alt: project.name }] } : {})
    },
    twitter: {
      card: "summary_large_image",
      title: project.name,
      description: project.summary,
      ...(primaryImageUrl ? { images: [primaryImageUrl] } : {})
    }
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectid } = await params;
  const project = projectsById[projectid];

  if (!project) {
    notFound();
  }

  const blogEntries = await getBlogEntries();

  return (
    <div data-vaul-drawer-wrapper>
      <Home initialProjectId={project.id} standaloneProjectRoute blogEntries={blogEntries} />
    </div>
  );
}
