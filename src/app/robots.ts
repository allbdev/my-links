import type { MetadataRoute } from "next";
import { getRawContent } from "@/lib/content";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const { siteUrl } = getRawContent().profile;
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
