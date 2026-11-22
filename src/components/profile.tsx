import { t } from "@/content/strings";
import type { Locale } from "@/lib/i18n";
import type { Profile as ProfileData, Social } from "@/lib/schema";
import { initials } from "@/lib/text";
import { opensInNewTab } from "@/lib/url";
import { SOCIAL_ICONS } from "./icons/icon";
import { cx, enter } from "./enter";
import { StaticImage } from "./static-image";
import styles from "./profile.module.css";

export function Profile({
  locale,
  profile,
  socials,
}: {
  locale: Locale;
  profile: ProfileData;
  socials: Social[];
}) {
  const photoLabel = t(locale, "profile.photo", { name: profile.name });
  return (
    <section className={styles.profile} aria-labelledby="profile-name">
      {profile.avatar ? (
        <StaticImage
          {...enter(0)}
          className={cx("enter", styles.avatar)}
          src={profile.avatar}
          alt={photoLabel}
          width={96}
          height={96}
          priority
        />
      ) : (
        <div
          {...enter(0)}
          className={cx("enter", styles.initials)}
          role="img"
          aria-label={photoLabel}
        >
          {initials(profile.name)}
        </div>
      )}
      <h1 id="profile-name" {...enter(1)} className={cx("enter", styles.name)}>
        {profile.name}
      </h1>
      <p {...enter(2)} className={cx("enter", styles.bio)}>
        {profile.bio}
      </p>
      {socials.length > 0 && (
        <ul
          {...enter(3)}
          className={cx("enter", styles.socials)}
          aria-label={t(locale, "profile.socials")}
        >
          {socials.map((social) => {
            const SocialIcon = SOCIAL_ICONS[social.type];
            const newTab = opensInNewTab(social.url);
            const label = t(locale, `social.${social.type}`);
            return (
              <li key={`${social.type}-${social.url}`}>
                <a
                  className={styles.social}
                  href={social.url}
                  aria-label={newTab ? `${label} ${t(locale, "link.newTab")}` : label}
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
