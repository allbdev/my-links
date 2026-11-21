import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getContent } from "@/lib/content";
import { FONT_VARIABLES } from "./fonts";
import "./globals.css";

export function generateMetadata(): Metadata {
  const { profile } = getContent();
  return { title: profile.name, description: profile.bio };
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={FONT_VARIABLES}>
      <body>{children}</body>
    </html>
  );
}
