import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// The same mark as icon.svg, on a full square (iOS rounds the corners).
export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#12151a",
      }}
    >
      <svg width="132" height="132" viewBox="0 0 64 64">
        <path
          d="M27 37a8 8 0 0 0 12 1l6-6a8 8 0 0 0-11.3-11.3l-2.2 2.2"
          fill="none"
          stroke="#ffffff"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M37 27a8 8 0 0 0-12-1l-6 6a8 8 0 0 0 11.3 11.3l2.2-2.2"
          fill="none"
          stroke="#2546e8"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>,
    size,
  );
}
