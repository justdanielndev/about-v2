import type { Metadata } from "next";
import BuildMetaFooter from "@/components/build-meta-footer";
import GlobalStructuredData from "@/components/global-structured-data";
import PostHogClientProvider from "@/components/posthog-provider";
import { buildSiteTitle, getDefaultName } from "@/lib/name-resolution";
import { CANONICAL_ORIGIN } from "@/lib/seo";
import "./globals.css";

const defaultName = getDefaultName();

export const metadata: Metadata = {
  metadataBase: new URL(CANONICAL_ORIGIN),
  alternates: {
    canonical: "/"
  },
  robots: {
    index: true,
    follow: true
  },
  title: buildSiteTitle(defaultName),
  description: `Hi! :3 I'm ${defaultName}! I'm a director, writer, developer... Overall, I make projects that are designed to improve people's lives.`
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const posthogKey = process.env.POSTHOG_KEY || process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const posthogHost = process.env.POSTHOG_HOST || process.env.NEXT_PUBLIC_POSTHOG_HOST;
  return (
    <html lang="en" data-theme="dark" style={{ colorScheme: "dark" }} suppressHydrationWarning>
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
