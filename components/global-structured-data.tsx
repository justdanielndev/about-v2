"use client";

import { usePathname } from "next/navigation";
import { DEFAULT_NAME } from "@/lib/name-resolution";
import { CANONICAL_ORIGIN, toCanonicalUrl } from "@/lib/seo";
import { projects, projectsById } from "@/lib/projects";
import { works, workById } from "@/lib/work";
import { getEntryImagesWithCaptions, getPrimaryImage, getImageCaption } from "@/lib/entry-images";

function resolveYear(year: string): string {
  return year === "202X" ? String(new Date().getFullYear()) : year;
}

function toImageObjects(images: { url: string; caption: string }[]) {
  return images.map(({ url, caption }) => ({
    "@type": "ImageObject",
    url,
    contentUrl: url,
    ...(caption ? { caption } : {})
  }));
}

function getPageName(pathname: string): string {
  if (pathname === "/blog") {
    return `${DEFAULT_NAME} Blog`;
  }
  if (pathname.startsWith("/blog/")) {
    return `${DEFAULT_NAME} Blog Post`;
  }
  if (pathname.startsWith("/work/")) {
    const work = workById[pathname.slice("/work/".length)];
    return work ? `${work.name} | ${DEFAULT_NAME}` : `${DEFAULT_NAME} Work`;
  }
  if (pathname.startsWith("/project/")) {
    const project = projectsById[pathname.slice("/project/".length)];
    return project ? `${project.name} | ${DEFAULT_NAME}` : `${DEFAULT_NAME} Project`;
  }
  if (pathname === "/void") {
    return `${DEFAULT_NAME} (???)`;
  }
  return `${DEFAULT_NAME} (Portfolio)`;
}

function getMainEntityId(pathname: string): string | undefined {
  if (pathname.startsWith("/project/")) {
    const project = projectsById[pathname.slice("/project/".length)];
    return project ? `${toCanonicalUrl(`/project/${project.id}`)}#creativework` : undefined;
  }
  if (pathname.startsWith("/work/")) {
    const work = workById[pathname.slice("/work/".length)];
    return work ? `${toCanonicalUrl(`/work/${work.id}`)}#creativework` : undefined;
  }
  return undefined;
}

const DANIEL_AVATAR_URL = toCanonicalUrl("/daniel-negre.png");
const DANIEL_AVATAR_CAPTION = getImageCaption("/daniel-negre.png");

function getBreadcrumbList(pathname: string): Record<string, unknown> | undefined {
  const homeCrumb = { "@type": "ListItem", position: 1, name: DEFAULT_NAME, item: CANONICAL_ORIGIN };

  if (pathname.startsWith("/project/")) {
    const project = projectsById[pathname.slice("/project/".length)];
    if (!project) {
      return undefined;
    }
    return {
      "@type": "BreadcrumbList",
      itemListElement: [homeCrumb, { "@type": "ListItem", position: 2, name: project.name }]
    };
  }

  if (pathname.startsWith("/work/")) {
    const work = workById[pathname.slice("/work/".length)];
    if (!work) {
      return undefined;
    }
    return {
      "@type": "BreadcrumbList",
      itemListElement: [homeCrumb, { "@type": "ListItem", position: 2, name: work.name }]
    };
  }

  if (pathname === "/blog" || pathname.startsWith("/blog/")) {
    return {
      "@type": "BreadcrumbList",
      itemListElement: [homeCrumb, { "@type": "ListItem", position: 2, name: `${DEFAULT_NAME} Blog` }]
    };
  }

  return undefined;
}

function getPrimaryImageObject(pathname: string): Record<string, unknown> | undefined {
  let entry: { content: string; image?: string } | undefined;

  if (pathname.startsWith("/project/")) {
    entry = projectsById[pathname.slice("/project/".length)];
  } else if (pathname.startsWith("/work/")) {
    entry = workById[pathname.slice("/work/".length)];
  }

  if (!entry) {
    return undefined;
  }

  const src = getPrimaryImage(entry);
  if (!src) {
    return undefined;
  }

  const url = toCanonicalUrl(src);
  const caption = getImageCaption(src);

  return {
    "@type": "ImageObject",
    url,
    contentUrl: url,
    ...(caption ? { caption } : {})
  };
}

export default function GlobalStructuredData() {
  const pathname = usePathname() || "/";
  const canonicalUrl = toCanonicalUrl(pathname);
  const primaryImageOfPage = getPrimaryImageObject(pathname);
  const breadcrumbList = getBreadcrumbList(pathname);
  const mainEntityId = getMainEntityId(pathname);

  const projectNodes = projects.map((project) => ({
    "@type": "CreativeWork",
    "@id": `${toCanonicalUrl(`/project/${project.id}`)}#creativework`,
    name: project.name,
    description: project.summary,
    genre: project.type,
    dateCreated: resolveYear(project.year),
    url: toCanonicalUrl(`/project/${project.id}`),
    creator: { "@id": `${CANONICAL_ORIGIN}/#person` },
    image: toImageObjects(getEntryImagesWithCaptions(project))
  }));

  const workNodes = works.map((work) => ({
    "@type": "CreativeWork",
    "@id": `${toCanonicalUrl(`/work/${work.id}`)}#creativework`,
    name: work.name,
    description: work.summary,
    genre: work.type,
    dateCreated: resolveYear(work.year),
    url: toCanonicalUrl(`/work/${work.id}`),
    creator: { "@id": `${CANONICAL_ORIGIN}/#person` },
    image: toImageObjects(getEntryImagesWithCaptions(work))
  }));

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${CANONICAL_ORIGIN}/#person`,
        name: DEFAULT_NAME,
        url: CANONICAL_ORIGIN,
        image: {
          "@type": "ImageObject",
          url: DANIEL_AVATAR_URL,
          contentUrl: DANIEL_AVATAR_URL,
          ...(DANIEL_AVATAR_CAPTION ? { caption: DANIEL_AVATAR_CAPTION } : {})
        }
      },
      {
        "@type": "WebSite",
        "@id": `${CANONICAL_ORIGIN}/#website`,
        url: CANONICAL_ORIGIN,
        name: `${DEFAULT_NAME} (Portfolio)`,
        publisher: {
          "@id": `${CANONICAL_ORIGIN}/#person`
        }
      },
      {
        "@type": "WebPage",
        "@id": `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: getPageName(pathname),
        isPartOf: {
          "@id": `${CANONICAL_ORIGIN}/#website`
        },
        about: {
          "@id": `${CANONICAL_ORIGIN}/#person`
        },
        ...(mainEntityId ? { mainEntity: { "@id": mainEntityId } } : {}),
        ...(primaryImageOfPage ? { primaryImageOfPage } : {})
      },
      ...(breadcrumbList ? [breadcrumbList] : []),
      ...projectNodes,
      ...workNodes
    ]
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />;
}
