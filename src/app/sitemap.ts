import type { MetadataRoute } from "next";
import { getContent } from "@/lib/content";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const { siteUrl } = getContent().profile;
  return [{ url: `${siteUrl}/`, changeFrequency: "monthly", priority: 1 }];
}
