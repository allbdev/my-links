import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { getContent } from "@/lib/content";
import { buildMetadata } from "@/lib/metadata";
import { FONT_VARIABLES } from "./fonts";
import "./globals.css";

export function generateMetadata(): Metadata {
  return buildMetadata(getContent());
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#eceef2",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={FONT_VARIABLES}>
      <body>{children}</body>
    </html>
  );
}
