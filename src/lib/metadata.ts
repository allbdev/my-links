import type { Metadata } from "next";
import type { Content } from "./schema";

export const SITE_TITLE_SUFFIX = "Links";

/** The page title: "Name · Links". */
export function pageTitle(content: Content): string {
  return `${content.profile.name} · ${SITE_TITLE_SUFFIX}`;
}

/** Everything that goes in <head> for the page, from links.json. */
export function buildMetadata(content: Content): Metadata {
  const { profile } = content;
  const title = pageTitle(content);
  return {
    metadataBase: new URL(profile.siteUrl),
    title,
    description: profile.bio,
    applicationName: title,
    authors: [{ name: profile.name, url: profile.siteUrl }],
    alternates: { canonical: "/" },
    openGraph: {
      type: "profile",
      locale: "pt_BR",
      url: "/",
      siteName: title,
      title,
      description: profile.bio,
      username: profile.handle,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: profile.bio,
    },
    robots: { index: true, follow: true },
    formatDetection: { email: false, telephone: false, address: false },
  };
}
