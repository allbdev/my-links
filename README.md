# Links

> *One link in every bio.* An open-source, self-hosted link-in-bio page: one static page with your photo, a short bio and your links, driven by a single JSON file that the build validates.

**Live example:** https://links.vinicius-albuquerque.com.br

<img src="design/01-Page.jpg" alt="The page on a phone: profile, links, a featured project card and a contact section" width="300" align="right">

## What you get

- Profile (photo, name, bio, social icons), links as cards, section headings and one featured card with an image.
- A share dialog for the whole page and for each link: copy, WhatsApp, LinkedIn, X, e-mail and the phone's own share sheet.
- Two languages: English at `/` and Brazilian Portuguese at `/pt/`, each a static page with its own `<html lang>`, metadata, `hreflang` links and preview image.
- Link previews: an Open Graph image and tags generated from the same file.
- No cookies, no server, no requests to other origins. Optional, cookieless page-view counts with Vercel Web Analytics.
- Free to host: a static site on Vercel's free plan (or anywhere that serves files).

<br clear="right">

## Make it yours

> **Heads-up: the person on this page is real.** The face in `public/avatar.jpg`, the bio, the projects and the e-mail in `content/links.json` all belong to Vinícius, the original author. Lovely as that is, your visitors came to see *you*, and nobody wants a link page that sends recruiters to someone else's CV. So step zero is a polite eviction: delete the photo and thumbnails in `public/` and replace the content with yours.

### Never written code? Ask your AI assistant

You don't need to know how to code. Open this folder in an AI coding assistant (Claude Code, Cursor, Codex, …) and say:

```
I want my own link-in-bio page from this repo. I've never coded. Follow AGENTS.md:
ask me for my details, remove the previous owner's content, and help me put it online.
```

[`AGENTS.md`](AGENTS.md) tells it what to ask you for and in what order. A few steps are yours alone, because they need your accounts: installing Node.js if it's missing, signing up for GitHub and Vercel (both free), and, if you have your own domain, adding one DNS record. The assistant will tell you when it's your turn and what to click.

### Doing it yourself

1. **Fork** this repo (or clone it and push it to your own).
2. **Edit `content/links.json`**: your name, bio, socials and links. Put your photo and thumbnails in `public/` (and delete the previous owner's; see above).
3. **Run it:** `npm install && npm run dev`, then open http://localhost:3000.
4. **Deploy** on Vercel and point your domain at it.

The full walkthrough is in **[`docs/CONFIGURE.md`](docs/CONFIGURE.md)**: every field, images, languages, colours, and analytics. Deploying (Vercel plus DNS for a custom domain) is in **[`docs/DEPLOY.md`](docs/DEPLOY.md)**.

A taste of the content file:

```json
{
  "profile": {
    "name": "Ada Lovelace",
    "handle": "ada",
    "bio": { "en": "Mathematician and writer.", "pt": "Matemática e escritora." },
    "avatar": "/avatar.jpg",
    "siteUrl": "https://links.example.com"
  },
  "socials": [{ "type": "github", "url": "https://github.com/ada" }],
  "blocks": [
    { "type": "link", "title": "Portfolio", "url": "https://example.com", "icon": "globe", "highlight": true },
    { "type": "header", "title": { "en": "Projects", "pt": "Projetos" } },
    { "type": "featured", "title": "My big project", "url": "https://example.com/p", "image": "/thumbs/p.webp", "badge": "New" },
    { "type": "link", "title": "Email me", "url": "mailto:ada@example.com", "icon": "mail" }
  ]
}
```

## How it works

### The build is the validator

`content/links.json` is parsed with a strict [Zod](https://zod.dev) schema (`src/lib/schema.ts`) when the page is built. A misspelt key, a `javascript:` URL, a title that's too long or an image that isn't in `public/` stops the build with a message that points at the field:

```
Error [ContentError]: content/links.json has problems:
blocks[2].url: must be an https:// URL, a mailto: address, or a path on this site such as "/cv.pdf"
blocks[5].image: file not found: public/thumbs/missing.webp
```

So a typo made while editing the file on GitHub fails CI and never reaches the live page. Links accept only `https:`, `mailto:` and paths on this site; `javascript:`, `data:`, `http:`, protocol-relative URLs and paths with whitespace or `..` are rejected (and tested).

### Static, with two small islands

Next.js App Router with `output: "export"`: the profile, cards and footer are Server Components rendered to HTML at build time. The share dialog and `Reveal` (which plays the entrance of cards below the fold as they scroll into view) are the only client components of its own (plus Vercel's `<Analytics />` loader); without JS the page still renders and animates fully. Images are plain `<img>` elements with fixed sizes: a static export can't optimise images, so `next/image` would only have added client JS.

### Accessible by default

Real links and buttons; motion that drops all movement under `prefers-reduced-motion`; a native `<dialog>` that moves focus to its first action and back to the button that opened it; Esc and backdrop clicks close it; every icon-only button has a label; links that open a new tab say so to screen readers; 44 px touch targets; text contrast checked by a unit test for every colour pairing; `prefers-reduced-motion` respected. axe runs in CI on the page and on the open dialog, on desktop and phone.

### The numbers

Lighthouse for the live example (mobile, local production build served with gzip):

| Performance | Accessibility | Best practices | SEO |
|---|---|---|---|
| 95 | 100 | 100 | 100 |

First contentful paint 0.9 s, largest contentful paint 2.9 s, total blocking time 0–10 ms, layout shift 0. The page entrance costs nothing measurable here (95 with or without it); the featured card's animated WebP (63 KB) is what moved the score from 97–98. First-load JS is about 147 KB gzipped, almost all of it the Next.js and React runtime; `npm run size` fails CI above 150 KB.

### Security headers

`vercel.json` sets a Content Security Policy (this site's own scripts, styles, fonts and images only), HSTS, `nosniff`, frame denial, and referrer, permissions and opener policies. The local preview server applies the same file, so the end-to-end tests load the page under the real CSP and fail on any console error.

## Development

Requires **Node.js 22** and npm. Git LFS is only needed for the design captures in `design/`.

```sh
npm run dev          # local dev server
npm run build        # static build in out/
npm run preview      # serve out/ on http://127.0.0.1:4180 with the vercel.json headers
npm run check        # lint + typecheck + unit tests + build + size budget
npm test             # Vitest: schema, loader, share URLs (property tests), components, tokens
npm run e2e          # Playwright on desktop and phone: page, share dialog, axe, headers, metadata
npm run size         # first-load JS and CSS against the budget
```

GitHub Actions runs `check` and the e2e tests on every push and pull request.

### Project layout

```
content/
  links.json     The page's content. The only file to edit day to day.
src/
  app/           Layout, page, metadata, Open Graph image, icons, robots, sitemap, tokens.css.
  components/    Profile, link card, featured card, sections, footer, icons, share/ and reveal.tsx (the client islands).
  lib/           Pure logic: schema, content loader, sections, share URLs, URL and text helpers.
  content/       strings.ts: interface text (English and PT-BR).
public/          Avatar, thumbnails and any file you link to (e.g. a CV).
tests/           Vitest tests mirroring src/, fixtures/, and e2e/ (Playwright).
tools/           Preview server, vercel.json header emulation, size check, design-board capture.
docs/            Setup and deploy guides.
```

### How the original page was built

These are the maintainer's working notes, kept as a record of the process. You don't need them to use the project.

| Doc | What's in it |
|---|---|
| [`PLAN.md`](PLAN.md) | Design, data format, look and tokens, architecture, risks |
| [`ROADMAP.md`](ROADMAP.md) | Ordered task list and progress |
| [`CLAUDE.md`](CLAUDE.md) | Project rules for the AI assistant (language, testing, git workflow, design sync) |
| [`TODO_FOR_YOU.md`](TODO_FOR_YOU.md) | The maintainer's open to-dos |
| [`LINKS.md`](LINKS.md) | The original one-page pitch |
| [`design/`](design) | The design canvas: captures of the live page and the original drawn mockups |

## Contributing

Issues and pull requests are welcome. Keep logic in `src/lib/` with tests next to it in `tests/`, run `npm run check` before committing, and keep every visitor-facing string in both languages (`src/content/strings.ts`).

## License

MIT. Icon and font notices in [`NOTICE.md`](NOTICE.md).
