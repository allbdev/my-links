import { t } from "@/content/strings";

/** Tells screen-reader users that a link opens in a new tab. */
export function NewTabHint() {
  return (
    <>
      {" "}
      <span className="visually-hidden">{t("link.newTab")}</span>
    </>
  );
}
