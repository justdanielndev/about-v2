import type { Metadata } from "next";
import LayoutNameSync from "@/components/layout-name-sync";
import { buildSiteTitle, DEFAULT_NAME, DEFAULT_TRUENAME, getDefaultName, TRUENAME_DOMAINS } from "@/lib/name-resolution";
import "./globals.css";

const defaultName = getDefaultName();

export const metadata: Metadata = {
  title: buildSiteTitle(defaultName),
  description: `Hi! :3 I'm ${defaultName}! I'm a director, writer, developer... Overall, I make projects that are designed improve people's lives.`
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const earlyNameScript = `(function(){try{var defaultName=${JSON.stringify(DEFAULT_NAME)};var trueName=${JSON.stringify(DEFAULT_TRUENAME)};var domains=${JSON.stringify(TRUENAME_DOMAINS)};var params=new URLSearchParams(window.location.search);var override=(params.get('truename')||'').trim();var host=(window.location.hostname||'').toLowerCase();var isTrueDomain=domains.some(function(d){return host===d||host.endsWith('.'+d)});var resolved=defaultName;if(override&&override.toLowerCase()===trueName.toLowerCase())resolved=trueName;else if(isTrueDomain)resolved=trueName;document.documentElement.setAttribute('data-display-name',resolved);document.title=resolved+' (Portfolio)';var el=document.getElementById('display-name');if(el)el.textContent=resolved;}catch(e){}})();`;
  return (
    <html lang="en" data-theme="dark" style={{ colorScheme: "dark" }} suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: earlyNameScript }} />
        <LayoutNameSync />
        {children}
      </body>
    </html>
  );
}
