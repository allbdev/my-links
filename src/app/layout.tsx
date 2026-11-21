import type { ReactNode } from "react";
import { FONT_VARIABLES } from "./fonts";
import "./globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={FONT_VARIABLES}>
      <body>{children}</body>
    </html>
  );
}
