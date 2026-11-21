/** The absolute URL for `href`: site paths ("/cv.pdf") are resolved against `siteUrl`. */
export function absoluteUrl(href: string, siteUrl: string): string {
  if (href.startsWith("/") && !href.startsWith("//")) return `${siteUrl}${href}`;
  return href;
}

/** External https links open in a new tab; mailto: and site paths don't. */
export function opensInNewTab(href: string): boolean {
  return href.startsWith("https://");
}

/** A short, readable form for the share preview: no scheme, no trailing slash. */
export function displayUrl(url: string): string {
  if (url.startsWith("mailto:")) return url.slice("mailto:".length).split("?")[0]!;
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}
