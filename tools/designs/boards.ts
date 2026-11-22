/** The design-canvas boards captured from the real site (see design/README.md). */
export interface Board {
  /** File name in design/ and in the capture output. */
  file: string;
  title: string;
  /** Opens the share dialog for this button name before capturing. */
  openShare?: string;
  fullPage: boolean;
}

export const BOARD_WIDTH = 390;
export const BOARD_HEIGHT = 844;

export const BOARDS: Board[] = [
  { file: "01-Page.jpg", title: "Perfil · mobile (site real)", fullPage: true },
  {
    file: "02-Share.jpg",
    title: "Modal de compartilhar (site real)",
    openShare: "Share link: Path Trader",
    fullPage: false,
  },
];
