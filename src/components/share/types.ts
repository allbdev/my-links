import type { ShareTarget } from "@/lib/share";

export type ShareKind = "page" | "link";

/** What the dialog is sharing, and whether it's the whole page or one link. */
export interface OpenShare extends ShareTarget {
  kind: ShareKind;
}
