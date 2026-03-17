import type { Metadata } from "next";
import Home from "@/app/page";
import { notFound } from "next/navigation";
import { projects, projectsById } from "@/lib/projects";
import { toCanonicalUrl } from "@/lib/seo";

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
      type: "article"
    },
    twitter: {
      card: "summary_large_image",
      title: project.name,
      description: project.summary
    }
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectid } = await params;
  const project = projectsById[projectid];

  if (!project) {
    notFound();
  }

  return (
    <div data-vaul-drawer-wrapper>
      <Home initialProjectId={project.id} standaloneProjectRoute />
    </div>
  );
}
