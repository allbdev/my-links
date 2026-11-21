import Image from "next/image";
import { t } from "@/content/strings";
import type { Profile as ProfileData, Social } from "@/lib/schema";
import { initials } from "@/lib/text";
import { opensInNewTab } from "@/lib/url";
import { SOCIAL_ICONS } from "./icons/icon";
import styles from "./profile.module.css";

export function Profile({ profile, socials }: { profile: ProfileData; socials: Social[] }) {
  const photoLabel = t("profile.photo", { name: profile.name });
  return (
    <section className={styles.profile} aria-labelledby="profile-name">
      {profile.avatar ? (
        <Image
          className={styles.avatar}
          src={profile.avatar}
          alt={photoLabel}
          width={96}
          height={96}
          priority
          unoptimized
        />
      ) : (
        <div className={styles.initials} role="img" aria-label={photoLabel}>
          {initials(profile.name)}
        </div>
      )}
      <h1 id="profile-name" className={styles.name}>
        {profile.name}
      </h1>
      <p className={styles.bio}>{profile.bio}</p>
      {socials.length > 0 && (
        <ul className={styles.socials} aria-label={t("profile.socials")}>
          {socials.map((social) => {
            const SocialIcon = SOCIAL_ICONS[social.type];
            const newTab = opensInNewTab(social.url);
            const label = t(`social.${social.type}`);
            return (
              <li key={`${social.type}-${social.url}`}>
                <a
                  className={styles.social}
                  href={social.url}
                  aria-label={newTab ? `${label} ${t("link.newTab")}` : label}
                  {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  <SocialIcon size={22} />
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
