// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Profile } from "@/components/profile";
import type { Profile as ProfileData, Social } from "@/lib/schema";

const PROFILE: ProfileData = {
  name: "Ana Teste",
  handle: "ana",
  bio: "Faz coisas na web.",
  avatar: "/avatar.svg",
  siteUrl: "https://links.example.com",
};
const SOCIALS: Social[] = [
  { type: "github", url: "https://github.com/ana" },
  { type: "email", url: "mailto:ana@example.com" },
];

describe("Profile", () => {
  it("shows the name as the only h1, and the bio", () => {
    render(<Profile profile={PROFILE} socials={SOCIALS} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Ana Teste");
    expect(screen.getByText("Faz coisas na web.")).toBeInTheDocument();
  });

  it("shows the photo with a description and fixed size", () => {
    render(<Profile profile={PROFILE} socials={SOCIALS} />);
    const img = screen.getByRole("img", { name: "Foto de Ana Teste" });
    expect(img).toHaveAttribute("src", "/avatar.svg");
    expect(img).toHaveAttribute("width", "96");
    expect(img).toHaveAttribute("height", "96");
  });

  it("falls back to initials without an avatar", () => {
    render(<Profile profile={{ ...PROFILE, avatar: undefined }} socials={SOCIALS} />);
    expect(screen.getByRole("img", { name: "Foto de Ana Teste" })).toHaveTextContent("AT");
  });

  it("lists socials with labels; web ones open a new tab, e-mail doesn't", () => {
    render(<Profile profile={PROFILE} socials={SOCIALS} />);
    const list = screen.getByRole("list", { name: "Redes" });
    const github = within(list).getByRole("link", { name: "GitHub (abre em nova aba)" });
    expect(github).toHaveAttribute("href", "https://github.com/ana");
    expect(github).toHaveAttribute("target", "_blank");
    expect(github).toHaveAttribute("rel", "noopener noreferrer");
    const email = within(list).getByRole("link", { name: "E-mail" });
    expect(email).toHaveAttribute("href", "mailto:ana@example.com");
    expect(email).not.toHaveAttribute("target");
  });

  it("omits the list when there are no socials", () => {
    render(<Profile profile={PROFILE} socials={[]} />);
    expect(screen.queryByRole("list")).toBeNull();
  });
});
