import type { ImgHTMLAttributes } from "react";

/**
 * A plain <img> with required dimensions, so nothing shifts while it loads.
 * Used instead of next/image: in a static export images aren't optimised, and
 * next/image would only add client JS.
 */
export function StaticImage({
  src,
  alt,
  width,
  height,
  priority = false,
  ...rest
}: Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt" | "width" | "height" | "loading"> & {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- see the comment above
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      {...(priority ? { fetchPriority: "high" as const } : {})}
      {...rest}
    />
  );
}
