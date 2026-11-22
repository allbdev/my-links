import { t } from "@/content/strings";
import type { Locale } from "@/lib/i18n";

/** Tells screen-reader users that a link opens in a new tab. */
export function NewTabHint({ locale }: { locale: Locale }) {
  return (
    <>
      {" "}
      <span className="visually-hidden">{t(locale, "link.newTab")}</span>
    </>
  );
}
