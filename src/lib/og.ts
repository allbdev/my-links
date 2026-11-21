import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PUBLIC_DIR, publicFileExists } from "./content";

const RASTER_TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
};

/**
 * The avatar as a data URI for the Open Graph image, or null when it isn't a
 * PNG or JPEG (the image then shows initials).
 */
export function avatarDataUri(sitePath: string | undefined, publicDir = PUBLIC_DIR): string | null {
  if (!sitePath) return null;
  const ext = sitePath.split(".").pop()?.toLowerCase() ?? "";
  const type = RASTER_TYPES[ext];
  if (!type || !publicFileExists(sitePath, publicDir)) return null;
  const data = readFileSync(join(publicDir, sitePath)).toString("base64");
  return `data:${type};base64,${data}`;
}

/** Reads a font file shipped by an @fontsource package. Build time only. */
export function fontsourceFile(pkg: string, file: string): Buffer {
  return readFileSync(join("node_modules", "@fontsource", pkg, "files", file));
}
