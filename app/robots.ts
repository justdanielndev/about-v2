import type { MetadataRoute } from "next";
import fs from "fs";
import path from "path";
import { CANONICAL_ORIGIN } from "@/lib/seo";
import { IMAGE_SEO_ALLOWLIST } from "@/lib/entry-images";

const IMAGE_EXTENSION_PATTERN = /\.(png|jpe?g|gif|webp|svg|ico)$/i;

function getDisallowedImagePaths(): string[] {
  const publicDir = path.join(process.cwd(), "public");

  let files: string[];
  try {
    files = fs.readdirSync(publicDir);
  } catch {
    return [];
  }

  return files
    .filter((file) => IMAGE_EXTENSION_PATTERN.test(file))
    .map((file) => `/${file}`)
    .filter((src) => !IMAGE_SEO_ALLOWLIST.has(src))
    .sort();
}

export default function robots(): MetadataRoute.Robots {
  const disallowedImages = getDisallowedImagePaths();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/"
      },
      ...(disallowedImages.length > 0
        ? [
            {
              userAgent: "Googlebot-Image",
              disallow: disallowedImages
            }
          ]
        : [])
    ],
    sitemap: `${CANONICAL_ORIGIN}/sitemap.xml`,
    host: CANONICAL_ORIGIN
  };
}
