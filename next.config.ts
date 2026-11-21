import type { NextConfig } from "next";

// Fully static: `next build` writes plain HTML, CSS and JS to out/.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
