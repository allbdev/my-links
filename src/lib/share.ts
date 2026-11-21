/** What gets shared: the page or one link. */
export interface ShareTarget {
  title: string;
  url: string;
}

export interface ShareLinks {
  whatsapp: string;
  linkedin: string;
  x: string;
  email: string;
}

const LONE_SURROGATE = /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g;

/** encodeURIComponent that never throws: lone surrogates become U+FFFD first. */
export function encode(value: string): string {
  return encodeURIComponent(value.replace(LONE_SURROGATE, "�"));
}

export function whatsappUrl({ title, url }: ShareTarget): string {
  return `https://wa.me/?text=${encode(`${title} ${url}`)}`;
}

export function linkedinUrl({ url }: ShareTarget): string {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encode(url)}`;
}

export function xUrl({ title, url }: ShareTarget): string {
  return `https://x.com/intent/post?text=${encode(title)}&url=${encode(url)}`;
}

export function emailUrl({ title, url }: ShareTarget): string {
  return `mailto:?subject=${encode(title)}&body=${encode(url)}`;
}

/** Every share URL for `target`, built from its title and URL. */
export function shareLinks(target: ShareTarget): ShareLinks {
  return {
    whatsapp: whatsappUrl(target),
    linkedin: linkedinUrl(target),
    x: xUrl(target),
    email: emailUrl(target),
  };
}
