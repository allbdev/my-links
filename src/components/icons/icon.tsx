import {
  BookOpen,
  Briefcase,
  Calendar,
  Code,
  FileText,
  Gamepad2,
  Globe,
  Link,
  Mail,
  Rocket,
  Sparkles,
  Wallet,
} from "lucide-react";
import type { ComponentType } from "react";
import type { IconName, SocialType } from "@/lib/schema";
import {
  GithubIcon,
  type IconProps,
  InstagramIcon,
  LinkedinIcon,
  WhatsappIcon,
  XIcon,
  YoutubeIcon,
} from "./brand";

type IconComponent = ComponentType<IconProps>;

/** Every icon name the schema allows, mapped to its component. */
export const ICONS: Record<IconName, IconComponent> = {
  github: GithubIcon,
  linkedin: LinkedinIcon,
  x: XIcon,
  instagram: InstagramIcon,
  youtube: YoutubeIcon,
  whatsapp: WhatsappIcon,
  mail: Mail,
  globe: Globe,
  briefcase: Briefcase,
  "file-text": FileText,
  gamepad: Gamepad2,
  calendar: Calendar,
  code: Code,
  rocket: Rocket,
  book: BookOpen,
  link: Link,
  wallet: Wallet,
  sparkles: Sparkles,
};

/** The icon for each social network. */
export const SOCIAL_ICONS: Record<SocialType, IconComponent> = {
  github: GithubIcon,
  linkedin: LinkedinIcon,
  email: Mail,
  x: XIcon,
  instagram: InstagramIcon,
  youtube: YoutubeIcon,
  whatsapp: WhatsappIcon,
};

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const Component = ICONS[name];
  return <Component size={size} aria-hidden="true" focusable="false" />;
}
