"use client";

import { EllipsisVertical, Share } from "lucide-react";
import { t } from "@/content/strings";
import styles from "./share.module.css";
import { useShare } from "./share-context";
import type { ShareKind } from "./types";

/** The top bar's share button (kind "page") or a card's ⋮ button (kind "link"). */
export function ShareButton({ kind, title, url }: { kind: ShareKind; title: string; url: string }) {
  const { locale, open } = useShare();
  const label = kind === "page" ? t(locale, "share.page") : t(locale, "share.link", { title });
  return (
    <button
      type="button"
      className={kind === "page" ? styles.pageButton : styles.linkButton}
      aria-label={label}
      aria-haspopup="dialog"
      onClick={() => open({ kind, title, url })}
    >
      {kind === "page" ? (
        <Share size={18} aria-hidden="true" />
      ) : (
        <EllipsisVertical size={18} aria-hidden="true" />
      )}
    </button>
  );
}
