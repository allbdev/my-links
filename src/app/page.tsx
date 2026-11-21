import { Footer } from "@/components/footer";
import { Profile } from "@/components/profile";
import { TopBar } from "@/components/top-bar";
import { getContent } from "@/lib/content";
import styles from "./page.module.css";

export default function Home() {
  const { profile, socials } = getContent();
  return (
    <main className={styles.page}>
      <TopBar handle={profile.handle} />
      <Profile profile={profile} socials={socials} />
      <Footer repoUrl={profile.repoUrl} />
    </main>
  );
}
