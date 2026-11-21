import { existsSync, readFileSync, statSync } from "node:fs";
import { join, resolve, sep } from "node:path";
import { type Block, type Content, contentSchema, formatIssues } from "./schema";

export const CONTENT_FILE = "content/links.json";
export const PUBLIC_DIR = "public";

/** Thrown when links.json can't be used. The message is meant for a person reading a build log. */
export class ContentError extends Error {
  override name = "ContentError";
}

/** True when `sitePath` ("/thumbs/a.webp") is a regular file inside `publicDir`. */
export function publicFileExists(sitePath: string, publicDir = PUBLIC_DIR): boolean {
  const root = resolve(publicDir);
  const file = resolve(join(root, sitePath));
  if (!file.startsWith(root + sep)) return false;
  return existsSync(file) && statSync(file).isFile();
}

/** Every image path the content refers to, with where it's referenced. */
function imageRefs(content: Content): { path: string; where: string }[] {
  const refs: { path: string; where: string }[] = [];
  if (content.profile.avatar) refs.push({ path: content.profile.avatar, where: "profile.avatar" });
  content.blocks.forEach((block, index) => {
    if ((block.type === "link" || block.type === "featured") && block.image) {
      refs.push({ path: block.image, where: `blocks[${index}].image` });
    }
  });
  return refs;
}

/**
 * Parses and validates the text of links.json. `fileExists` decides whether an
 * image path is present in public/ (injected so tests don't need files).
 */
export function parseContent(
  raw: string,
  fileExists: (sitePath: string) => boolean,
  source = CONTENT_FILE,
): Content {
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new ContentError(`${source} is not valid JSON: ${reason}`);
  }

  const result = contentSchema.safeParse(json);
  if (!result.success) {
    throw new ContentError(`${source} has problems:\n${formatIssues(result.error)}`);
  }

  const missing = imageRefs(result.data)
    .filter(({ path }) => !fileExists(path))
    .map(({ path, where }) => `${where}: file not found: public${path}`);
  if (missing.length > 0) {
    throw new ContentError(`${source} has problems:\n${missing.join("\n")}`);
  }

  return result.data;
}

/**
 * Blocks that appear on the page: hidden blocks are dropped, and so is a
 * heading whose section ends up empty.
 */
export function visibleBlocks(blocks: readonly Block[]): Block[] {
  const shown = blocks.filter((block) => !block.hidden);
  return shown.filter((block, index) => {
    if (block.type !== "header") return true;
    const next = shown[index + 1];
    return next !== undefined && next.type !== "header";
  });
}

let cache: Content | undefined;

/** Reads, validates and returns links.json with only the visible blocks. Throws ContentError. */
export function getContent(): Content {
  if (!cache) {
    const raw = readFileSync(CONTENT_FILE, "utf8");
    const content = parseContent(raw, (path) => publicFileExists(path));
    cache = { ...content, blocks: visibleBlocks(content.blocks) };
  }
  return cache;
}
