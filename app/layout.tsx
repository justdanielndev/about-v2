import type { Metadata } from "next";
import { Inter } from "next/font/google";
import BuildMetaFooter from "@/components/build-meta-footer";
import GlobalStructuredData from "@/components/global-structured-data";
import PostHogClientProvider from "@/components/posthog-provider";
import { buildSiteTitle, getDefaultName } from "@/lib/name-resolution";
import { CANONICAL_ORIGIN } from "@/lib/seo";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const defaultName = getDefaultName();

export const metadata: Metadata = {
  metadataBase: new URL(CANONICAL_ORIGIN),
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  title: buildSiteTitle(defaultName),
  description: "Daniel Negre is a developer, director, and writer from Valencia, Spain. Founder of Nix Entertainment.",
  keywords: ["Daniel Negre", "portfolio", "developer", "director", "writer", "Valencia", "Nix Entertainment", "Spain"],
  openGraph: {
    title: `${defaultName} | Developer, Director & Writer from Valencia`,
    description: "Founder of Nix Entertainment. Portfolio of projects built from Valencia, Spain.",
    url: CANONICAL_ORIGIN,
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
        <link rel="preload" as="image" href="/image.jpg" />
        <link rel="preload" as="image" href="/envelope.png" />
        <link rel="preload" as="image" href="/nix.png" />
        <link rel="preload" as="image" href="/wave.png" />
      </head>
      <body>
        <GlobalStructuredData />
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
