"use client";

import { usePathname } from "next/navigation";
import { DEFAULT_NAME } from "@/lib/name-resolution";
import { CANONICAL_HOME_URL, CANONICAL_ORIGIN, toCanonicalUrl } from "@/lib/seo";
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

const PERSON_ID = `${CANONICAL_ORIGIN}/#person`;
const NIX_ID = `${CANONICAL_ORIGIN}/#nix-entertainment`;

const NIX_LOGO_SRC = "/nix-rebrand-logo.png";
const NIX_LOGO_URL = toCanonicalUrl(NIX_LOGO_SRC);
const NIX_LOGO_CAPTION = getImageCaption(NIX_LOGO_SRC);

const PROFILE_CREATED_DATE = "2026-02-20";

function getBreadcrumbList(pathname: string): Record<string, unknown> | undefined {
  const homeCrumb = { "@type": "ListItem", position: 1, name: DEFAULT_NAME, item: CANONICAL_HOME_URL };

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

type GlobalStructuredDataProps = {
  lastCommitDate?: string | null;
};

export default function GlobalStructuredData({ lastCommitDate }: GlobalStructuredDataProps) {
  const pathname = usePathname() || "/";
  const isHome = pathname === "/";
  const canonicalUrl = toCanonicalUrl(pathname);
  const primaryImageOfPage = getPrimaryImageObject(pathname);
  const breadcrumbList = getBreadcrumbList(pathname);
  const mainEntityId = getMainEntityId(pathname);

  const currentProjectId = pathname.startsWith("/project/") ? pathname.slice("/project/".length) : null;
  const currentWorkId = pathname.startsWith("/work/") ? pathname.slice("/work/".length) : null;

  const projectNodes = projects
    .filter((project) => project.id === currentProjectId)
    .map((project) => ({
      "@type": "CreativeWork",
      "@id": `${toCanonicalUrl(`/project/${project.id}`)}#creativework`,
      name: project.name,
      description: project.summary,
      genre: project.type,
      dateCreated: resolveYear(project.year),
      url: toCanonicalUrl(`/project/${project.id}`),
      creator: { "@id": PERSON_ID },
      image: toImageObjects(getEntryImagesWithCaptions(project))
    }));

  const workNodes = works
    .filter((work) => work.id === currentWorkId)
    .map((work) => ({
      "@type": "CreativeWork",
      "@id": `${toCanonicalUrl(`/work/${work.id}`)}#creativework`,
      name: work.name,
      description: work.summary,
      genre: work.type,
      dateCreated: resolveYear(work.year),
      url: toCanonicalUrl(`/work/${work.id}`),
      creator: { "@id": PERSON_ID },
      image: toImageObjects(getEntryImagesWithCaptions(work))
    }));

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": PERSON_ID,
        name: DEFAULT_NAME,
        url: CANONICAL_HOME_URL,
        jobTitle: "Founder & Chief Director, Nix Entertainment",
        description:
          "Daniel Negre is a developer, director, and writer from Valencia, Spain, and the founder and Chief Director of Nix Entertainment.",
        email: "daniel@negrenavarro.me",
        nationality: {
          "@type": "Country",
          name: "Spain"
        },
        homeLocation: {
          "@type": "Place",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Valencia",
            addressRegion: "Valencian Community",
            addressCountry: "ES"
          }
        },
        worksFor: { "@id": NIX_ID },
        hasOccupation: [
          { "@type": "Occupation", name: "Animation Director" },
          { "@type": "Occupation", name: "Writer" },
          { "@type": "Occupation", name: "Software Developer" },
          { "@type": "Occupation", name: "Technical Researcher"}
        ],
        knowsAbout: [
          "JavaScript",
          "TypeScript",
          "Next.js",
          "Node.js",
          "Expo",
          "Python",
          "Docker",
          "Coolify",
          "Self-hosting and homelab infrastructure",
          "Artificial intelligence",
          "Animation direction",
          "Screenwriting",
          "Character design",
          "Branding and visual design"
        ],
        award: [
          "First prize, goCalp innovation competition (Global Omnium, 2024)",
          "Selected finalist, The Challenge (EduCaixa, 2025)"
        ],
        sameAs: [
          "https://www.linkedin.com/in/daniel-negre/",
          "https://github.com/justdanielndev",
          "https://orcid.org/0009-0008-2507-2584"
        ],
        image: {
          "@type": "ImageObject",
          url: DANIEL_AVATAR_URL,
          contentUrl: DANIEL_AVATAR_URL,
          ...(DANIEL_AVATAR_CAPTION ? { caption: DANIEL_AVATAR_CAPTION } : {})
        }
      },
      {
        "@type": "Organization",
        "@id": NIX_ID,
        name: "Nix Entertainment",
        url: "https://nixentertainment.com",
        description: "Indie media group focused on webcomics and animated shows.",
        founder: { "@id": PERSON_ID },
        logo: {
          "@type": "ImageObject",
          url: NIX_LOGO_URL,
          contentUrl: NIX_LOGO_URL,
          ...(NIX_LOGO_CAPTION ? { caption: NIX_LOGO_CAPTION } : {})
        }
      },
      {
        "@type": "WebSite",
        "@id": `${CANONICAL_ORIGIN}/#website`,
        url: CANONICAL_HOME_URL,
        name: `${DEFAULT_NAME} (Portfolio)`,
        publisher: {
          "@id": PERSON_ID
        }
      },
      {
        "@type": isHome ? "ProfilePage" : "WebPage",
        "@id": `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: getPageName(pathname),
        isPartOf: {
          "@id": `${CANONICAL_ORIGIN}/#website`
        },
        about: {
          "@id": PERSON_ID
        },
        ...(isHome ? { dateCreated: PROFILE_CREATED_DATE } : {}),
        ...(isHome && lastCommitDate ? { dateModified: lastCommitDate } : {}),
        ...(isHome ? { mainEntity: { "@id": PERSON_ID } } : {}),
        ...(!isHome && mainEntityId ? { mainEntity: { "@id": mainEntityId } } : {}),
        ...(primaryImageOfPage ? { primaryImageOfPage } : {})
      },
      ...(breadcrumbList ? [breadcrumbList] : []),
      ...projectNodes,
      ...workNodes
    ]
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />;
}
