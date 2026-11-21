import styles from "./section-heading.module.css";

export function SectionHeading({ id, title }: { id: string; title: string }) {
  return (
    <h2 id={id} className={styles.heading}>
      {title}
    </h2>
  );
}
