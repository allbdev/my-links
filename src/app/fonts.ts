import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";

// next/font downloads the files at build time and serves them from our own
// origin: no runtime requests to Google.
export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const FONT_VARIABLES = [spaceGrotesk.variable, inter.variable, jetbrainsMono.variable].join(
  " ",
);
