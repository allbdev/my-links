"use client";

import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { ShareDialog } from "./share-dialog";
import type { OpenShare } from "./types";

interface ShareContextValue {
  locale: Locale;
  open: (target: OpenShare) => void;
}

const ShareContext = createContext<ShareContextValue | null>(null);

export function useShare(): ShareContextValue {
  const value = useContext(ShareContext);
  if (!value) throw new Error("useShare must be used inside <ShareProvider>");
  return value;
}

/** Owns the share dialog: one dialog for the page, opened by any ShareButton. */
export function ShareProvider({
  locale,
  avatar,
  initials,
  children,
}: {
  locale: Locale;
  /** Shown on the dialog's preview card. */
  avatar?: string;
  initials: string;
  children: ReactNode;
}) {
  const [target, setTarget] = useState<OpenShare | null>(null);
  const open = useCallback((next: OpenShare) => setTarget(next), []);
  const close = useCallback(() => setTarget(null), []);
  const value = useMemo(() => ({ locale, open }), [locale, open]);
  return (
    <ShareContext.Provider value={value}>
      {children}
      <ShareDialog
        locale={locale}
        target={target}
        onClose={close}
        avatar={avatar}
        initials={initials}
      />
    </ShareContext.Provider>
  );
}
