import type { Metadata } from "next";
import { Inter } from "next/font/google";
import BuildMetaFooter from "@/components/build-meta-footer";
import CursorBoard from "@/components/cursorboard/cursorboard";
import CustomCursor from "@/components/custom-cursor";
import GlobalStructuredData from "@/components/global-structured-data";
import PostHogClientProvider from "@/components/posthog-provider";
import { LAST_COMMIT_DATE } from "@/lib/build-info";
import { buildSiteTitle, getDefaultName } from "@/lib/name-resolution";
import { CANONICAL_HOME_URL, CANONICAL_ORIGIN } from "@/lib/seo";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const defaultName = getDefaultName();

export const metadata: Metadata = {
  metadataBase: new URL(CANONICAL_ORIGIN),
  alternates: { canonical: CANONICAL_HOME_URL },
  robots: { index: true, follow: true },
  title: buildSiteTitle(defaultName),
  description: "Daniel Negre is a developer, director, and writer from Valencia, Spain. Founder of Nix Entertainment.",
  keywords: ["Daniel Negre", "portfolio", "developer", "director", "writer", "Valencia", "Nix Entertainment", "Spain"],
  openGraph: {
    title: `${defaultName} | Developer, Director & Writer from Valencia`,
    description: "Founder of Nix Entertainment. Portfolio of projects built from Valencia, Spain.",
    url: CANONICAL_HOME_URL,
    siteName: defaultName,
    images: [{ url: "/link.png", width: 1200, height: 630, alt: `${defaultName} | Developer, Director & Writer` }],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${defaultName} | Developer, Director & Writer`,
    description: "Founder of Nix Entertainment. Portfolio of projects spanning AI, games, infrastructure & animation.",
    images: ["/link.png"]
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const posthogKey = process.env.POSTHOG_KEY || process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const posthogHost = process.env.POSTHOG_HOST || process.env.NEXT_PUBLIC_POSTHOG_HOST;
  return (
    <html lang="en" data-theme="dark" style={{ colorScheme: "dark" }} suppressHydrationWarning className={inter.variable}>
      <head>
        <link rel="preload" as="image" href="/daniel-negre-photo.jpg" />
        <link rel="preload" as="image" href="/envelope.png" />
        <link rel="preload" as="image" href="/nix.png" />
        <link rel="preload" as="image" href="/wave.png" />
        <link rel="me" href="https://www.linkedin.com/in/daniel-negre/" />
        <link rel="me" href="https://github.com/justdanielndev" />
        <link rel="me" href="https://orcid.org/0009-0008-2507-2584" />
      </head>
      <body>
        <GlobalStructuredData lastCommitDate={LAST_COMMIT_DATE} />
        <CustomCursor />
        <CursorBoard />
        <PostHogClientProvider apiKey={posthogKey} apiHost={posthogHost}>
          <div className="site-root">
            <div className="site-root-content">{children}</div>
            <BuildMetaFooter />
          </div>
        </PostHogClientProvider>
      </body>
    </html>
  );
}
