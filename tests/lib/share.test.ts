import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { emailUrl, encode, linkedinUrl, shareLinks, whatsappUrl, xUrl } from "@/lib/share";

const TARGET = { title: "Portfólio & projetos #1", url: "https://example.com/a?b=c&d=e#f" };

describe("share URLs", () => {
  it("builds WhatsApp with title and URL in one text", () => {
    expect(whatsappUrl(TARGET)).toBe(
      "https://wa.me/?text=Portf%C3%B3lio%20%26%20projetos%20%231%20https%3A%2F%2Fexample.com%2Fa%3Fb%3Dc%26d%3De%23f",
    );
  });

  it("builds LinkedIn with the URL only", () => {
    expect(linkedinUrl(TARGET)).toBe(
      "https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fexample.com%2Fa%3Fb%3Dc%26d%3De%23f",
    );
  });

  it("builds X with text and url params", () => {
    const url = new URL(xUrl(TARGET));
    expect(url.origin + url.pathname).toBe("https://x.com/intent/post");
    expect(url.searchParams.get("text")).toBe(TARGET.title);
    expect(url.searchParams.get("url")).toBe(TARGET.url);
  });

  it("builds e-mail with subject and body", () => {
    expect(emailUrl(TARGET)).toMatch(/^mailto:\?subject=Portf%C3%B3lio%20%26/);
    const params = new URLSearchParams(emailUrl(TARGET).slice("mailto:?".length));
    expect(params.get("subject")).toBe(TARGET.title);
    expect(params.get("body")).toBe(TARGET.url);
  });

  it("returns all four", () => {
    expect(Object.keys(shareLinks(TARGET))).toEqual(["whatsapp", "linkedin", "x", "email"]);
  });

  it("never throws on lone surrogates", () => {
    expect(encode("a\uD800b")).toBe("a%EF%BF%BDb");
    expect(encode("\uDC00")).toBe("%EF%BF%BD");
    expect(encode("😀")).toBe("%F0%9F%98%80");
  });

  it("round-trips any well-formed title and URL (property)", () => {
    const title = fc.string({ unit: "grapheme", maxLength: 80 });
    fc.assert(
      fc.property(title, fc.webUrl({ withQueryParameters: true, withFragments: true }), (t, u) => {
        const target = { title: t, url: u };
        const links = shareLinks(target);
        expect(new URL(links.whatsapp).searchParams.get("text")).toBe(`${t} ${u}`);
        expect(new URL(links.linkedin).searchParams.get("url")).toBe(u);
        expect(new URL(links.x).searchParams.get("text")).toBe(t);
        expect(new URL(links.x).searchParams.get("url")).toBe(u);
        const mail = new URLSearchParams(links.email.slice("mailto:?".length));
        expect(mail.get("subject")).toBe(t);
        expect(mail.get("body")).toBe(u);
      }),
      { numRuns: 500 },
    );
  });

  it("only ever produces https: or mailto: links (property)", () => {
    fc.assert(
      fc.property(fc.string({ unit: "binary" }), fc.string({ unit: "binary" }), (t, u) => {
        const links = shareLinks({ title: t, url: u });
        expect(links.whatsapp.startsWith("https://wa.me/?text=")).toBe(true);
        expect(links.linkedin.startsWith("https://www.linkedin.com/")).toBe(true);
        expect(links.x.startsWith("https://x.com/intent/post?")).toBe(true);
        expect(links.email.startsWith("mailto:?subject=")).toBe(true);
        for (const link of Object.values(links)) expect(link).not.toMatch(/[\s<>"]/);
      }),
      { numRuns: 500 },
    );
  });
});
