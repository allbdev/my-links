import { z } from "zod";

/** Social networks shown as round icon buttons under the bio. */
export const SOCIAL_TYPES = [
  "github",
  "linkedin",
  "email",
  "x",
  "instagram",
  "youtube",
  "whatsapp",
] as const;

/** Icons a link may use. Brand icons are local SVGs; the rest come from Lucide. */
export const ICON_NAMES = [
  "github",
  "linkedin",
  "x",
  "instagram",
  "youtube",
  "whatsapp",
  "mail",
  "globe",
  "briefcase",
  "file-text",
  "gamepad",
  "calendar",
  "code",
  "rocket",
  "book",
  "link",
  "wallet",
  "sparkles",
] as const;

export const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "webp", "avif", "svg"] as const;

export const LIMITS = { title: 80, subtitle: 120, badge: 20, bio: 160, name: 60 } as const;

const text = (max: number) =>
  z.string().trim().min(1, "must not be empty").max(max, `must be at most ${max} characters`);

/**
 * True for a path such as "/cv.pdf": starts with one slash, no "..", no
 * backslash, no whitespace or control characters (browsers strip tabs and
 * newlines, which could turn "/\t/host" into a protocol-relative URL).
 */
function isRootRelative(value: string): boolean {
  return (
    value.startsWith("/") &&
    !/[\s\u0000-\u001f\u007f]/.test(value) &&
    !value.startsWith("//") &&
    !value.includes("\\") &&
    !value.split("/").includes("..")
  );
}

function parseUrl(value: string): URL | null {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function isHttpsUrl(value: string): boolean {
  const url = parseUrl(value);
  return url !== null && url.protocol === "https:" && url.hostname !== "" && !url.username;
}

function isMailto(value: string): boolean {
  return /^mailto:[^\s@/]+@[^\s@/]+\.[^\s@/]+(\?.*)?$/i.test(value);
}

const httpsUrl = z.string().trim().refine(isHttpsUrl, "must be an https:// URL");

/** Where a link may point: https, mailto, or a file on this site. */
const linkUrl = z
  .string()
  .trim()
  .refine(
    (v) => isHttpsUrl(v) || isMailto(v) || isRootRelative(v),
    'must be an https:// URL, a mailto: address, or a path on this site such as "/cv.pdf"',
  );

/** A file in public/, referenced as "/name.ext". */
const imagePath = z
  .string()
  .trim()
  .refine(isRootRelative, 'must be a path inside public/, such as "/avatar.jpg"')
  .refine(
    (v) => IMAGE_EXTENSIONS.some((ext) => v.toLowerCase().endsWith(`.${ext}`)),
    `must end in ${IMAGE_EXTENSIONS.map((e) => `.${e}`).join(", ")}`,
  );

const iconName = z.enum(ICON_NAMES, {
  error: () => `must be one of: ${ICON_NAMES.join(", ")}`,
});

export const profileSchema = z.strictObject({
  name: text(LIMITS.name),
  handle: z
    .string()
    .trim()
    .regex(/^[a-z0-9._-]{1,30}$/i, "must be 1–30 letters, digits, dots, dashes or underscores"),
  bio: text(LIMITS.bio),
  avatar: imagePath.optional(),
  siteUrl: httpsUrl.refine(
    (v) => parseUrl(v)?.pathname === "/" && !v.endsWith("/"),
    'must be the site\'s origin, without a path or trailing slash (e.g. "https://example.com")',
  ),
  repoUrl: httpsUrl.optional(),
});

export const socialSchema = z
  .strictObject({
    type: z.enum(SOCIAL_TYPES, { error: () => `must be one of: ${SOCIAL_TYPES.join(", ")}` }),
    url: z.string().trim(),
  })
  .superRefine((social, ctx) => {
    const ok = social.type === "email" ? isMailto(social.url) : isHttpsUrl(social.url);
    if (!ok) {
      ctx.addIssue({
        code: "custom",
        path: ["url"],
        message:
          social.type === "email"
            ? 'must be a mailto: address, e.g. "mailto:me@example.com"'
            : "must be an https:// URL",
      });
    }
  });

const flags = {
  hidden: z.boolean().optional(),
};

export const linkBlockSchema = z
  .strictObject({
    type: z.literal("link"),
    title: text(LIMITS.title),
    url: linkUrl,
    icon: iconName.optional(),
    image: imagePath.optional(),
    highlight: z.boolean().optional(),
    ...flags,
  })
  .refine((link) => !(link.icon && link.image), {
    message: "use either icon or image, not both",
    path: ["image"],
  });

export const headerBlockSchema = z.strictObject({
  type: z.literal("header"),
  title: text(LIMITS.title),
  ...flags,
});

export const featuredBlockSchema = z.strictObject({
  type: z.literal("featured"),
  title: text(LIMITS.title),
  subtitle: text(LIMITS.subtitle).optional(),
  url: linkUrl,
  image: imagePath,
  badge: text(LIMITS.badge).optional(),
  ...flags,
});

export const blockSchema = z.discriminatedUnion("type", [
  linkBlockSchema,
  headerBlockSchema,
  featuredBlockSchema,
]);

export const contentSchema = z
  .strictObject({
    profile: profileSchema,
    socials: z.array(socialSchema).max(8, "must have at most 8 entries"),
    blocks: z.array(blockSchema).min(1, "must have at least one block"),
  })
  .superRefine((content, ctx) => {
    const featured = content.blocks
      .map((block, index) => ({ block, index }))
      .filter(({ block }) => block.type === "featured");
    for (const { index } of featured.slice(1)) {
      ctx.addIssue({
        code: "custom",
        path: ["blocks", index, "type"],
        message: "only one featured block is allowed",
      });
    }
  });

export type Content = z.infer<typeof contentSchema>;
export type Profile = z.infer<typeof profileSchema>;
export type Social = z.infer<typeof socialSchema>;
export type SocialType = (typeof SOCIAL_TYPES)[number];
export type IconName = (typeof ICON_NAMES)[number];
export type Block = z.infer<typeof blockSchema>;
export type LinkBlock = z.infer<typeof linkBlockSchema>;
export type HeaderBlock = z.infer<typeof headerBlockSchema>;
export type FeaturedBlock = z.infer<typeof featuredBlockSchema>;

/** Formats Zod issues as "blocks[3].url: must be …", one per line. */
export function formatIssues(error: z.ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.reduce<string>(
        (acc, part) =>
          typeof part === "number"
            ? `${acc}[${part}]`
            : acc
              ? `${acc}.${String(part)}`
              : String(part),
        "",
      );
      return `${path || "(root)"}: ${issue.message}`;
    })
    .join("\n");
}
