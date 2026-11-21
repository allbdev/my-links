import { ImageResponse } from "next/og";
import { getContent } from "@/lib/content";
import { pageTitle } from "@/lib/metadata";
import { avatarDataUri, fontsourceFile } from "@/lib/og";
import { initials } from "@/lib/text";
import { displayUrl } from "@/lib/url";

export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = pageTitle(getContent());

// Colours from src/app/tokens.css (CSS variables don't reach Satori).
const BG = "#eceef2";
const CARD = "#ffffff";
const INK = "#12151a";
const MUTED = "#5b6270";
const LINE = "#e1e4ea";
const ACCENT = "#2546e8";
const AVATAR = 120;

export default function OpengraphImage() {
  const { profile, blocks } = getContent();
  const photo = avatarDataUri(profile.avatar);
  const preview = blocks
    .filter((block) => block.type === "link")
    .slice(0, 3)
    .map((block) => block.title);

  const avatarFrame = {
    width: AVATAR,
    height: AVATAR,
    minWidth: AVATAR,
    borderRadius: AVATAR / 2,
    border: `6px solid ${CARD}`,
  };

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        gap: 64,
        padding: "0 80px",
        background: BG,
        color: INK,
        fontFamily: "Inter",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, gap: 14 }}>
        {photo ? (
          <img
            src={photo}
            alt=""
            width={AVATAR}
            height={AVATAR}
            style={{ ...avatarFrame, objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              ...avatarFrame,
              background: INK,
              color: CARD,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "Space Grotesk",
              fontWeight: 700,
              fontSize: 44,
            }}
          >
            {initials(profile.name)}
          </div>
        )}
        <div
          style={{
            marginTop: 18,
            fontFamily: "Space Grotesk",
            fontWeight: 700,
            fontSize: 54,
            lineHeight: 1.1,
          }}
        >
          {profile.name}
        </div>
        <div style={{ fontFamily: "JetBrains Mono", fontSize: 24, color: ACCENT }}>
          {displayUrl(profile.siteUrl)}
        </div>
        <div style={{ marginTop: 8, fontSize: 28, lineHeight: 1.4, color: MUTED }}>
          {profile.bio}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, width: 320, minWidth: 320 }}>
        {preview.map((title, index) => (
          <div
            key={title}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: 76,
              padding: "0 20px",
              borderRadius: 16,
              border: `1px solid ${index === 0 ? INK : LINE}`,
              background: index === 0 ? INK : CARD,
              color: index === 0 ? CARD : INK,
              fontWeight: 500,
              fontSize: 24,
            }}
          >
            {title}
          </div>
        ))}
      </div>
    </div>,
    {
      ...size,
      fonts: [
        {
          name: "Inter",
          data: fontsourceFile("inter", "inter-latin-400-normal.woff"),
          weight: 400,
        },
        {
          name: "Inter",
          data: fontsourceFile("inter", "inter-latin-500-normal.woff"),
          weight: 500,
        },
        {
          name: "Space Grotesk",
          data: fontsourceFile("space-grotesk", "space-grotesk-latin-700-normal.woff"),
          weight: 700,
        },
        {
          name: "JetBrains Mono",
          data: fontsourceFile("jetbrains-mono", "jetbrains-mono-latin-500-normal.woff"),
          weight: 500,
        },
      ],
    },
  );
}
