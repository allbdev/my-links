import type { ReactNode } from "react";
import styles from "./top-bar.module.css";

/** Handle on the left; controls (language switch, share button) on the right. */
export function TopBar({ handle, children }: { handle: string; children?: ReactNode }) {
  return (
    <header className={styles.bar}>
      <span className={styles.handle}>/{handle}</span>
      <div className={styles.controls}>{children}</div>
    </header>
  );
}
