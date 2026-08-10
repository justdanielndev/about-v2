import type { Metadata } from "next";
import Home from "@/app/page";
import { notFound } from "next/navigation";
import { works, workById } from "@/lib/work";
import { toCanonicalUrl } from "@/lib/seo";
import { getPrimaryImage } from "@/lib/entry-images";

type WorkPageProps = {
  params: Promise<{ projectid: string }>;
};

export async function generateStaticParams() {
  return works.map((project) => ({
    projectid: project.id
  }));
}

export async function generateMetadata({
  params
}: WorkPageProps): Promise<Metadata> {
  const { projectid } = await params;
  const project = workById[projectid];

  if (!project) {
    return {};
  }

  const primarySrc = getPrimaryImage(project);
  const primaryImageUrl = primarySrc ? toCanonicalUrl(primarySrc) : undefined;

  return {
    title: `${project.name} | Daniel Negre Navarro`,
    description: project.summary,
    alternates: {
      canonical: `/work/${project.id}`
    },
    openGraph: {
      title: project.name,
      description: project.summary,
      url: toCanonicalUrl(`/work/${project.id}`),
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

export default async function WorkPage({ params }: WorkPageProps) {
  const { projectid } = await params;
  const project = workById[projectid];

  if (!project) {
    notFound();
  }

  return (
    <div data-vaul-drawer-wrapper>
      <Home initialProjectId={project.id} standaloneProjectRoute />
    </div>
  );
}
