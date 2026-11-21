// Tiny static server for out/ (npm run preview). Dev and test only.
import { createReadStream, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";

const ROOT = resolve("out");
const PORT = Number(process.env.PORT ?? 4180);
const TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".pdf": "application/pdf",
  ".xml": "application/xml",
};

function isFile(path: string): boolean {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
}

/** Maps a URL path to a file inside out/, or null. Never escapes ROOT. */
export function resolveFile(urlPath: string): string | null {
  let decoded: string;
  try {
    decoded = decodeURIComponent(urlPath.split("?")[0] ?? "/");
  } catch {
    return null;
  }
  const target = normalize(join(ROOT, decoded));
  if (target !== ROOT && !target.startsWith(ROOT + sep)) return null;
  for (const candidate of [target, join(target, "index.html"), `${target}.html`]) {
    if (isFile(candidate)) return candidate;
  }
  return null;
}

createServer((req, res) => {
  const file = resolveFile(req.url ?? "/");
  const status = file ? 200 : 404;
  const body = file ?? join(ROOT, "404.html");
  res.writeHead(status, { "content-type": TYPES[extname(body)] ?? "application/octet-stream" });
  createReadStream(body).pipe(res);
}).listen(PORT, "127.0.0.1", () => {
  console.log(`Serving out/ on http://localhost:${PORT}`);
});
