/**
 * Interface text (PT-BR). Content text (name, bio, links) lives in
 * content/links.json. Slots look like {name} and are filled by `t`.
 */
export const STRINGS = {
  "share.page": "Compartilhar esta página",
  "share.link": "Compartilhar link: {title}",
  "share.dialogPage": "Compartilhar esta página",
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
  "footer.builtWith": "Feito com Next.js",
  "footer.code": "ver o código",
} as const;

export type StringKey = keyof typeof STRINGS;

/** Returns the string for `key` with every {slot} replaced. Throws on a missing slot. */
export function t(key: StringKey, slots: Record<string, string> = {}): string {
  return STRINGS[key].replace(/\{(\w+)\}/g, (_match, name: string) => {
    const value = slots[name];
    if (value === undefined) throw new Error(`Missing slot {${name}} for "${key}"`);
    return value;
  });
}
