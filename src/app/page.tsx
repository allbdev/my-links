import { Blocks } from "@/components/blocks";
import { Footer } from "@/components/footer";
import { Profile } from "@/components/profile";
import { ShareButton } from "@/components/share/share-button";
import { ShareProvider } from "@/components/share/share-context";
import { TopBar } from "@/components/top-bar";
import { getContent } from "@/lib/content";
import type { CardBlock } from "@/lib/sections";
import { initials } from "@/lib/text";
import { absoluteUrl } from "@/lib/url";
import styles from "./page.module.css";

export default function Home() {
  const { profile, socials, blocks } = getContent();

  // E-mail links aren't shared: a mailto: URL means nothing to someone else.
  const shareFor = (block: CardBlock) =>
    block.url.startsWith("mailto:") ? null : (
      <ShareButton kind="link" title={block.title} url={absoluteUrl(block.url, profile.siteUrl)} />
    );

  return (
    <ShareProvider avatar={profile.avatar} initials={initials(profile.name)}>
      <main className={styles.page}>
        <TopBar
          handle={profile.handle}
          action={<ShareButton kind="page" title={profile.name} url={profile.siteUrl} />}
        />
        <Profile profile={profile} socials={socials} />
        <Blocks blocks={blocks} share={shareFor} />
        <Footer repoUrl={profile.repoUrl} />
      </main>
    </ShareProvider>
  );
}
