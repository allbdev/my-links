import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { LocaleLayout, localeMetadata, VIEWPORT } from "@/app/_shared/locale-layout";

export const viewport: Viewport = VIEWPORT;

export function generateMetadata(): Metadata {
  return localeMetadata("en");
}

export default function Layout({ children }: { children: ReactNode }) {
  return <LocaleLayout locale="en">{children}</LocaleLayout>;
}
