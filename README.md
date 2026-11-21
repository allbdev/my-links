# Links

> *One link in every bio.* My own Linktree: one static page with my photo, a short bio and my links, driven by a single JSON file that the build validates.

**Live:** https://links.vinicius-albuquerque.com.br (once the Vercel project and DNS are connected; see [`docs/DEPLOY.md`](docs/DEPLOY.md))

<img src="design/01-Page.jpg" alt="The page on a phone: profile, links, a featured project card and a contact section" width="300" align="right">

The page is in Brazilian Portuguese. Code, comments and docs are in English.

| Doc | What's in it |
|---|---|
| [`PLAN.md`](PLAN.md) | Design, data format, look and tokens, architecture, risks |
| [`ROADMAP.md`](ROADMAP.md) | Ordered task list and current progress |
| [`CLAUDE.md`](CLAUDE.md) | Project rules (language, testing, git workflow, design sync, architecture) |
| [`TODO_FOR_YOU.md`](TODO_FOR_YOU.md) | Open decisions and things only the developer can do |
| [`docs/DEPLOY.md`](docs/DEPLOY.md) | Vercel project and Cloudflare DNS for `links.vinicius-albuquerque.com.br` |
| [`LINKS.md`](LINKS.md) | The original one-page pitch |
| [`design/`](design) | The design canvas: captures of the real site and the original drawn mockups |
| [`NOTICE.md`](NOTICE.md) | Third-party icon and font licences |

## What it does

- Profile (photo, name, bio, social icons), links as cards, section headings and one featured card with an image.
- A share dialog for the whole page and for each link: copy, WhatsApp, LinkedIn, X, e-mail and the phone's own share sheet.
- Link previews: an Open Graph image and tags generated from the same file.
- No cookies, no analytics, no server, no requests to other origins.

<br clear="right">

## The interesting part

### The build is the validator

`content/links.json` is parsed with a strict [Zod](https://zod.dev) schema (`src/lib/schema.ts`) when the page is built. A misspelt key, a `javascript:` URL, a title that's too long or an image that isn't in `public/` stops the build with a message that points at the field:

```
Error [ContentError]: content/links.json has problems:
blocks[2].url: must be an https:// URL, a mailto: address, or a path on this site such as "/cv.pdf"
blocks[5].image: file not found: public/thumbs/missing.webp
```

So a typo made while editing the file on GitHub fails CI and never reaches the live page. Links accept only `https:`, `mailto:` and paths on this site; `javascript:`, `data:`, `http:`, protocol-relative URLs and paths with whitespace or `..` are rejected (and tested).

### Static, with one small island

Next.js App Router with `output: "export"`: the profile, cards and footer are Server Components rendered to HTML at build time. The share dialog is the only client component. Images are plain `<img>` elements with fixed sizes: a static export can't optimise images, so `next/image` would only have added client JS.

### Accessible by default

Real links and buttons; a native `<dialog>` that moves focus to its first action and back to the button that opened it; Esc and backdrop clicks close it; every icon-only button has a label; links that open a new tab say so to screen readers; 44 px touch targets; text contrast checked by a unit test for every colour pairing; `prefers-reduced-motion` respected. axe runs in CI on the page and on the open dialog, on desktop and phone.

### The numbers

Lighthouse (mobile, local production build served with gzip):

| Performance | Accessibility | Best practices | SEO |
|---|---|---|---|
| 97–98 | 100 | 100 | 100 |

First contentful paint 0.9 s, largest contentful paint 2.5 s, total blocking time 10 ms, layout shift 0. First-load JS is 144 KB gzipped, almost all of it the Next.js and React runtime; `npm run size` fails CI above 150 KB.

### Security headers

`vercel.json` sets a Content Security Policy (this site's own scripts, styles, fonts and images only), HSTS, `nosniff`, frame denial, and referrer, permissions and opener policies. The local preview server applies the same file, so the end-to-end tests load the page under the real CSP and fail on any console error.

## Editing the links

Edit `content/links.json` (on GitHub is fine) and push. CI validates it; Vercel builds and deploys.

```json
{
  "profile": {
    "name": "Vinícius Albuquerque",
    "handle": "vinicius",
    "bio": "Engenheiro full-stack sênior. …",
    "avatar": "/avatar.jpg",
    "siteUrl": "https://links.vinicius-albuquerque.com.br",
    "repoUrl": "https://github.com/allbdev/my-links"
  },
  "socials": [{ "type": "github", "url": "https://github.com/allbdev" }],
  "blocks": [
    { "type": "link", "title": "Portfólio", "url": "https://…", "icon": "globe", "highlight": true },
    { "type": "header", "title": "Projetos" },
    { "type": "featured", "title": "Path Trader", "subtitle": "…", "url": "https://…", "image": "/thumbs/path-trader.webp", "badge": "No ar" },
    { "type": "link", "title": "Mandar um e-mail", "url": "mailto:…", "icon": "mail" }
  ]
}
```

- `blocks` keeps the page order. A `header` starts a new section.
- A `link` can have an `icon` (one of the names in `ICON_NAMES` in `src/lib/schema.ts`) or an `image` (a file in `public/`), not both. `highlight: true` makes it a dark card.
- `hidden: true` keeps a block in the file but off the page (a heading whose section ends up empty is hidden too).
- One `featured` block at most; it needs an `image` (about 800 × 400).
- The full rules are in `PLAN.md` §6.

## Requirements

- **Node.js 22 LTS** and npm
- **Git LFS** (the design captures are stored in LFS)

```sh
brew install node git-lfs && git lfs install
git clone https://github.com/allbdev/my-links.git && cd my-links
git lfs pull
npm install
```

## Running

```sh
npm run dev          # local dev server
npm run build        # static build in out/
npm run preview      # serve out/ on http://127.0.0.1:4180 with the vercel.json headers
```

## Tests and tools

```sh
npm run check        # lint + typecheck + unit tests + build + size budget (run before every commit)
npm test             # Vitest: schema, loader, share URLs (property tests), components, tokens
npm run e2e          # Playwright on desktop and phone: page, share dialog, axe, headers, metadata
npm run size         # first-load JS and CSS against the budget
npm run designs      # capture the design-canvas boards from the built site
```

GitHub Actions runs `check` and the e2e tests on every push and pull request. Vercel deploys `main` and gives every pull request a preview URL.

## Project layout

```
content/
  links.json     The page's content. The only file to edit day to day.
src/
  app/           Layout, page, metadata, Open Graph image, icons, robots, sitemap, tokens.css.
  components/    Profile, link card, featured card, sections, footer, icons, share/ (the client island).
  lib/           Pure logic: schema, content loader, sections, share URLs, URL and text helpers.
  content/       strings.ts: interface text (PT-BR).
public/          Avatar, thumbnails.
tests/           Vitest tests mirroring src/, fixtures/, and e2e/ (Playwright).
tools/           Preview server, vercel.json header emulation, size check, design-board capture.
design/          Design canvas files and captures (reference only, not used in the site).
docs/            Deploy guide.
```

## Contributing workflow

1. Pick the next task in `ROADMAP.md`.
2. Write the feature together with its tests, keeping logic in `src/lib/`.
3. If it changes something a design board shows, update the board (see `CLAUDE.md`).
4. Run `npm run check` and make sure it passes.
5. Commit. Before every push, run the `security-audit` skill on the changes (see `CLAUDE.md`).

## License

MIT. Icon and font notices in `NOTICE.md`.
