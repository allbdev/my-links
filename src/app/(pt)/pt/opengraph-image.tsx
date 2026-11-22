import { OG_SIZE, ogAlt, ogImage } from "@/app/_shared/og-image";

export const dynamic = "force-static";
export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = ogAlt("pt");

export default function OpengraphImage() {
  return ogImage("pt");
}
