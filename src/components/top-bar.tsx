import type { ReactNode } from "react";
import styles from "./top-bar.module.css";

/** Handle on the left, an action (the page's share button) on the right. */
export function TopBar({ handle, action }: { handle: string; action?: ReactNode }) {
  return (
    <header className={styles.bar}>
      <span className={styles.handle}>/{handle}</span>
      {action}
    </header>
  );
}
