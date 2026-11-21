import { Footer } from "@/components/footer";
import { TopBar } from "@/components/top-bar";
import { getContent } from "@/lib/content";
import styles from "./page.module.css";

export default function Home() {
  const { profile } = getContent();
  return (
    <main className={styles.page}>
      <TopBar handle={profile.handle} />
      <Footer repoUrl={profile.repoUrl} />
    </main>
  );
}
