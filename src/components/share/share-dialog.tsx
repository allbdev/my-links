"use client";

import { Check, Ellipsis, Link as LinkIcon, Mail, X } from "lucide-react";
import { type MouseEvent, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { t } from "@/content/strings";
import type { Locale } from "@/lib/i18n";
import { shareLinks } from "@/lib/share";
import { displayUrl } from "@/lib/url";
import { LinkedinIcon, WhatsappIcon, XIcon } from "../icons/brand";
import { StaticImage } from "../static-image";
import styles from "./share.module.css";
import type { OpenShare } from "./types";

export const COPIED_MS = 2000;

type CopyState = "idle" | "copied" | "failed";

const subscribeNever = () => () => {};

/** True in browsers with the native share sheet; false on the server and in the first render. */
function useCanNativeShare(): boolean {
  return useSyncExternalStore(
    subscribeNever,
    () => typeof navigator !== "undefined" && typeof navigator.share === "function",
    () => false,
  );
}

export function ShareDialog({
  locale,
  target,
  onClose,
  avatar,
  initials,
}: {
  locale: Locale;
  target: OpenShare | null;
  onClose: () => void;
  avatar?: string;
  initials: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const firstActionRef = useRef<HTMLButtonElement>(null);
  const copyFieldRef = useRef<HTMLInputElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const [copy, setCopy] = useState<CopyState>("idle");
  const canNativeShare = useCanNativeShare();

  // What the dialog shows: the last target, kept after closing so the content
  // stays visible while the dialog fades out. Updated during render (React's
  // "adjust state when a prop changes" pattern), not in an effect.
  const [shown, setShown] = useState<OpenShare | null>(target);
  if (target && target !== shown) setShown(target);

  // Open and close the native dialog with the target; return focus to the opener.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (target && !dialog.open) {
      openerRef.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setCopy("idle");
      dialog.showModal();
      firstActionRef.current?.focus();
    } else if (!target && dialog.open) {
      dialog.close();
    }
  }, [target]);

  // "Copied!" goes back to "Copy link" after a moment.
  useEffect(() => {
    if (copy !== "copied") return;
    const timer = setTimeout(() => setCopy("idle"), COPIED_MS);
    return () => clearTimeout(timer);
  }, [copy]);

  // When copying fails, show the URL selected so it can be copied by hand.
  useEffect(() => {
    if (copy === "failed") copyFieldRef.current?.select();
  }, [copy]);

  function handleClose() {
    onClose();
    openerRef.current?.focus();
    openerRef.current = null;
  }

  function handleBackdrop(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === dialogRef.current) dialogRef.current.close();
  }

  async function handleCopy() {
    if (!target) return;
    try {
      if (!navigator.clipboard) throw new Error("No clipboard");
      await navigator.clipboard.writeText(target.url);
      setCopy("copied");
    } catch {
      setCopy("failed");
    }
  }

  async function handleNativeShare() {
    if (!target) return;
    try {
      await navigator.share({ title: target.title, url: target.url });
    } catch {
      // Cancelling the share sheet rejects; nothing to do.
    }
  }

  const links = shown ? shareLinks(shown) : null;
  const heading =
    shown?.kind === "page" ? t(locale, "share.dialogPage") : t(locale, "share.dialogLink");

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby="share-title"
      onClose={handleClose}
      onClick={handleBackdrop}
    >
      {shown && links && (
        <div className={styles.panel}>
          <div className={styles.header}>
            <span className={styles.spacer} aria-hidden="true" />
            <h2 id="share-title" className={styles.title}>
              {heading}
            </h2>
            <button
              type="button"
              className={styles.close}
              aria-label={t(locale, "share.close")}
              onClick={() => dialogRef.current?.close()}
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>

          <div className={styles.preview}>
            {avatar ? (
              <StaticImage
                className={styles.previewAvatar}
                src={avatar}
                alt=""
                width={72}
                height={72}
              />
            ) : (
              <span className={styles.previewAvatar} aria-hidden="true">
                {initials}
              </span>
            )}
            <span className={styles.previewTitle}>{shown.title}</span>
            <span className={styles.previewUrl}>{displayUrl(shown.url)}</span>
          </div>

          <ul className={styles.actions} aria-label={t(locale, "share.actions")} role="list">
            <li>
              <button
                ref={firstActionRef}
                type="button"
                className={styles.action}
                onClick={handleCopy}
              >
                <span className={styles.circle} data-copied={copy === "copied" || undefined}>
                  {copy === "copied" ? (
                    <Check size={20} aria-hidden="true" />
                  ) : (
                    <LinkIcon size={20} aria-hidden="true" />
                  )}
                </span>
                <span className={copy === "copied" ? styles.copied : undefined}>
                  {copy === "copied" ? t(locale, "share.copied") : t(locale, "share.copy")}
                </span>
              </button>
            </li>
            <li>
              <a
                className={styles.action}
                href={links.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className={`${styles.circle} ${styles.whatsapp}`}>
                  <WhatsappIcon size={20} />
                </span>
                {t(locale, "share.whatsapp")}
              </a>
            </li>
            <li>
              <a
                className={styles.action}
                href={links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className={`${styles.circle} ${styles.linkedin}`}>
                  <LinkedinIcon size={20} />
                </span>
                {t(locale, "share.linkedin")}
              </a>
            </li>
            <li>
              <a className={styles.action} href={links.x} target="_blank" rel="noopener noreferrer">
                <span className={`${styles.circle} ${styles.dark}`}>
                  <XIcon size={18} />
                </span>
                {t(locale, "share.x")}
              </a>
            </li>
            <li>
              <a className={styles.action} href={links.email}>
                <span className={styles.circle}>
                  <Mail size={20} aria-hidden="true" />
                </span>
                {t(locale, "share.email")}
              </a>
            </li>
            {canNativeShare && (
              <li>
                <button type="button" className={styles.action} onClick={handleNativeShare}>
                  <span className={styles.circle}>
                    <Ellipsis size={20} aria-hidden="true" />
                  </span>
                  {t(locale, "share.more")}
                </button>
              </li>
            )}
          </ul>

          <div role="status" className={copy === "failed" ? styles.fallback : "visually-hidden"}>
            {copy === "copied" && t(locale, "share.copied")}
            {copy === "failed" && (
              <>
                <span>{t(locale, "share.copyFailed")}</span>
                <label className="visually-hidden" htmlFor="share-copy-field">
                  {t(locale, "share.copyField")}
                </label>
                <input
                  ref={copyFieldRef}
                  id="share-copy-field"
                  className={styles.copyField}
                  type="text"
                  readOnly
                  value={shown.url}
                  onFocus={(event) => event.currentTarget.select()}
                />
              </>
            )}
          </div>
        </div>
      )}
    </dialog>
  );
}
