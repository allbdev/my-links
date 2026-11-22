import type { NextConfig } from "next";

// Fully static: `next build` writes plain HTML, CSS and JS to out/.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  poweredByHeader: false,
  reactStrictMode: true,
  // Each language has its own root layout, so the 404 page needs its own
  // document (src/app/global-not-found.tsx).
  experimental: { globalNotFound: true },
};

export default nextConfig;
