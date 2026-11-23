// Tiny static server for out/ (npm run preview). Dev and test only.
import { createReadStream, statSync } from "node:fs";
import { createServer } from "node:http";
import { createGzip } from "node:zlib";
import { extname, join, normalize, resolve, sep } from "node:path";
import { headersFor, loadHeaderRules } from "./vercel-headers";
import { vercelInsights } from "./vercel-insights";

const ROOT = resolve("out");
const PORT = Number(process.env.PORT ?? 4180);
const RULES = loadHeaderRules();
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
  const insights = vercelInsights(req.url ?? "/");
  if (insights) {
    res.writeHead(insights.status, insights.type ? { "content-type": insights.type } : {});
    res.end(insights.body);
    return;
  }
  const file = resolveFile(req.url ?? "/");
  const status = file ? 200 : 404;
  const body = file ?? join(ROOT, "404.html");
  const path = (req.url ?? "/").split("?")[0] ?? "/";
  const type = TYPES[extname(body)] ?? "application/octet-stream";
  // Compress text like Vercel does, so local measurements are comparable.
  const gzip =
    /^(text\/|application\/(json|xml)|image\/svg)/.test(type) &&
    /\bgzip\b/.test(String(req.headers["accept-encoding"] ?? ""));
  res.writeHead(status, {
    "content-type": type,
    ...(gzip ? { "content-encoding": "gzip", vary: "Accept-Encoding" } : {}),
    ...headersFor(path, RULES),
  });
  const stream = createReadStream(body).on("error", () => res.end());
  if (gzip) stream.pipe(createGzip()).pipe(res);
  else stream.pipe(res);
}).listen(PORT, "127.0.0.1", () => {
  console.log(`Serving out/ on http://localhost:${PORT}`);
});
