"use client";

import { usePathname } from "next/navigation";
import { DEFAULT_NAME } from "@/lib/name-resolution";
import { CANONICAL_ORIGIN, toCanonicalUrl } from "@/lib/seo";

function getPageName(pathname: string): string {
  if (pathname === "/blog") {
    return `${DEFAULT_NAME} Blog`;
  }
  if (pathname.startsWith("/blog/")) {
    return `${DEFAULT_NAME} Blog Post`;
  }
  if (pathname.startsWith("/project/")) {
    return `${DEFAULT_NAME} Project`;
  }
  if (pathname === "/void") {
    return `${DEFAULT_NAME} (???)`;
  }
  return `${DEFAULT_NAME} (Portfolio)`;
}

export default function GlobalStructuredData() {
  const pathname = usePathname() || "/";
  const canonicalUrl = toCanonicalUrl(pathname);

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${CANONICAL_ORIGIN}/#person`,
        name: DEFAULT_NAME,
        url: CANONICAL_ORIGIN
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
        }
      }
    ]
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />;
}
