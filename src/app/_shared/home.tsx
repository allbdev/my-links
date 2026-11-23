import { Blocks } from "@/components/blocks";
import { Footer } from "@/components/footer";
import { LanguageSwitch } from "@/components/language-switch";
import { Profile } from "@/components/profile";
import { Reveal } from "@/components/reveal";
import { ShareButton } from "@/components/share/share-button";
import { ShareProvider } from "@/components/share/share-context";
import { TopBar } from "@/components/top-bar";
import { getContent } from "@/lib/content";
import { LOCALE_INFO, type Locale } from "@/lib/i18n";
import type { CardBlock } from "@/lib/sections";
import { initials } from "@/lib/text";
import { absoluteUrl } from "@/lib/url";
import styles from "./home.module.css";

/** The whole page in one language. */
export function Home({ locale }: { locale: Locale }) {
  const { profile, socials, blocks } = getContent(locale);
  const pageUrl = absoluteUrl(LOCALE_INFO[locale].path, profile.siteUrl);

  // E-mail links aren't shared: a mailto: URL means nothing to someone else.
  const shareFor = (block: CardBlock) =>
    block.url.startsWith("mailto:") ? null : (
      <ShareButton kind="link" title={block.title} url={absoluteUrl(block.url, profile.siteUrl)} />
    );

  return (
    <ShareProvider locale={locale} avatar={profile.avatar} initials={initials(profile.name)}>
      <main className={styles.page}>
        <TopBar handle={profile.handle}>
          <LanguageSwitch locale={locale} />
          <ShareButton kind="page" title={profile.name} url={pageUrl} />
        </TopBar>
        <Profile locale={locale} profile={profile} socials={socials} />
        <Blocks locale={locale} blocks={blocks} share={shareFor} />
        <Footer locale={locale} author={profile.author} repoUrl={profile.repoUrl} />
      </main>
      <Reveal />
    </ShareProvider>
  );
}
