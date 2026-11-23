// Emulates Vercel Web Analytics' routes for the local preview server.

/**
 * Stand-ins for the routes Vercel adds when Web Analytics is enabled, so the
 * page behaves locally as in production: the loader script is a no-op and
 * page-view beacons are accepted and dropped. Null for every other path.
 */
export function vercelInsights(
  urlPath: string,
): { status: number; type?: string; body: string } | null {
  const path = urlPath.split("?")[0] ?? "";
  if (!path.startsWith("/_vercel/insights/")) return null;
  if (path === "/_vercel/insights/script.js") {
    return {
      status: 200,
      type: "text/javascript; charset=utf-8",
      body: "/* Vercel Web Analytics stub */\n",
    };
  }
  return { status: 204, body: "" };
}
