import type { Locale } from "@/lib/i18n";

/**
 * Interface text, one dictionary per language. Content text (name, bio, links)
 * lives in content/links.json. Slots look like {name} and are filled by `t`.
 */
const EN = {
  "share.page": "Share this page",
  "share.link": "Share link: {title}",
  "share.dialogPage": "Share page",
  "share.dialogLink": "Share link",
  "share.close": "Close",
  "share.copy": "Copy link",
  "share.copied": "Copied!",
  "share.copyFailed": "Couldn't copy. Select the link and copy it.",
  "share.copyField": "Link to copy",
  "share.whatsapp": "WhatsApp",
  "share.linkedin": "LinkedIn",
  "share.x": "X",
  "share.email": "Email",
  "share.more": "More options",
  "share.actions": "Share options",
  "link.newTab": "(opens in a new tab)",
  "profile.photo": "Photo of {name}",
  "profile.socials": "Social links",
  "social.github": "GitHub",
  "social.linkedin": "LinkedIn",
  "social.email": "Email",
  "social.x": "X",
  "social.instagram": "Instagram",
  "social.youtube": "YouTube",
  "social.whatsapp": "WhatsApp",
  "footer.builtBy": "Built by",
  "footer.code": "see the code",
  "locale.nav": "Language",
  "locale.en": "English",
  "locale.pt": "Português",
  "notFound.title": "Page not found",
  "notFound.back": "Back to the links",
} as const;

export type StringKey = keyof typeof EN;

const PT: Record<StringKey, string> = {
  "share.page": "Compartilhar esta página",
  "share.link": "Compartilhar link: {title}",
  "share.dialogPage": "Compartilhar página",
  "share.dialogLink": "Compartilhar link",
  "share.close": "Fechar",
  "share.copy": "Copiar link",
  "share.copied": "Copiado!",
  "share.copyFailed": "Não deu para copiar. Selecione o link e copie.",
  "share.copyField": "Link para copiar",
  "share.whatsapp": "WhatsApp",
  "share.linkedin": "LinkedIn",
  "share.x": "X",
  "share.email": "E-mail",
  "share.more": "Mais opções",
  "share.actions": "Opções de compartilhamento",
  "link.newTab": "(abre em nova aba)",
  "profile.photo": "Foto de {name}",
  "profile.socials": "Redes",
  "social.github": "GitHub",
  "social.linkedin": "LinkedIn",
  "social.email": "E-mail",
  "social.x": "X",
  "social.instagram": "Instagram",
  "social.youtube": "YouTube",
  "social.whatsapp": "WhatsApp",
  "footer.builtBy": "Feito por",
  "footer.code": "ver o código",
  "locale.nav": "Idioma",
  "locale.en": "English",
  "locale.pt": "Português",
  "notFound.title": "Página não encontrada",
  "notFound.back": "Voltar para os links",
};

export const STRINGS: Record<Locale, Record<StringKey, string>> = { en: EN, pt: PT };

/** Returns the string for `key` in `locale` with every {slot} replaced. Throws on a missing slot. */
export function t(locale: Locale, key: StringKey, slots: Record<string, string> = {}): string {
  return STRINGS[locale][key].replace(/\{(\w+)\}/g, (_match, name: string) => {
    const value = slots[name];
    if (value === undefined) throw new Error(`Missing slot {${name}} for "${key}"`);
    return value;
  });
}
