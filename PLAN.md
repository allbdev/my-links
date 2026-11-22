# Links — Plan

> *One link in every bio.* A personal link-in-bio page I own, host for free and change by editing one file.
> Free, open-source, no accounts. A portfolio piece: the code is part of the product.

**Author:** Vinícius Albuquerque Barros · **Written:** 20 Nov 2026 · **Updated:** 22 Nov 2026 · **Status:** built and tested in English and PT-BR, with real content and motion; waiting on the Vercel project and DNS

The original pitch is `LINKS.md`. Mockups live on the design canvas "Links — Vinícius" (https://claude.ai/artifact/TvGyvKmYvhYzxHkrz5qgR3); its source files are in `design/`. The canvas and this file are kept in sync both ways (see `CLAUDE.md`). Copy and link lists are placeholders until `content/links.json` holds the real ones. Effort figures are estimates, not measurements.

---

## 1. Pitch

One static page with my photo, a short bio and the links I want to show. Edit one JSON file, push, and the page redeploys.

## 2. Decisions so far

| # | Decision | Choice | Why |
|---|---|---|---|
| D1 | Concept | A single-user link-in-bio page (the kind Linktree popularised): profile, links, sections, a featured card, a share modal | One link for every bio, owned by me |
| D2 | Platform | Static site, mobile first; on desktop the same column is centred | It is opened from a bio on a phone |
| D3 | Stack | TypeScript strict, Next.js App Router with `output: "export"`, Zod, Vitest + fast-check, Playwright, GitHub Actions | See §9 |
| D4 | Content | One file, `content/links.json`, validated with Zod at build time | A typo fails the build, not the live page |
| D5 | Text | Page in **English** at `/` (default) and **PT-BR** at `/pt/`, with an EN/PT switch; README and code in English | Recruiters abroad read English; Brazilians get PT (decided 22 Nov 2026) |
| D6 | Money and data | None. No ads, no cookies, no accounts, no personal data stored | Nothing to comply with |
| D7 | Look | Cool grey, white cards, near-black type, one blue accent (see §7) | Same structure as Linktree, my own look |
| D8 | Repo | Public, MIT | The README is what a recruiter reads |

Open decisions are in `TODO_FOR_YOU.md`.

## 3. The page

Canvas board "Perfil · mobile (interativo)" (`design/Main.dc.html`).

1. **Top bar:** handle (`/vinicius`, monospace) on the left; on the right, an "EN | PT" switch (a pill with two 44 px links, the current language filled in ink) and a round share button that shares the page in the current language.
2. **Profile:** round photo (96 px), name, one-line bio, social icons (GitHub, LinkedIn, e-mail) as 44 px round buttons.
3. **Links:** full-width white cards. Each card is a link (opens in a new tab) plus a ⋮ button that opens the share modal for that link. Optional icon or thumbnail on the left.
4. **Section headings:** optional ("Projetos", "Contato").
5. **Featured link:** a card with a large image, title, subtitle and an optional badge ("EM BREVE").
6. **Footer:** "Feito com Next.js · ver o código" linking to the repo.

Placeholder order in the mockup: Portfólio · GitHub · LinkedIn · Currículo (PDF) · **Projetos:** Estacione o Carrinho (featured, coming soon) · Path Trader · Dig to Japan · **Contato:** Agendar uma conversa.

## 4. The share modal

Canvas board "Modal de compartilhar aberto" (`design/Share.dc.html`).

- Opens from the top-right button (the page) or from any ⋮ (that link). E-mail links have no ⋮: a `mailto:` URL means nothing to the person it's shared with.
- Heading ("Compartilhar página" or "Compartilhar link"), close button, a dark preview card (avatar, title, URL), then a 3-column grid of round actions: **Copiar link**, **WhatsApp**, **LinkedIn**, **X**, **E-mail**, **Mais opções**.
- **Copiar link** uses `navigator.clipboard`; the label turns into "Copiado!" for 2 s. If the clipboard is blocked, the URL is shown selected in a read-only field so it can be copied by hand.
- **Mais opções** calls `navigator.share` (the phone's share sheet). It is only rendered when the browser has `navigator.share`.
- Share URLs are built from the link, never hard-coded:

| Target | URL |
|---|---|
| WhatsApp | `https://wa.me/?text=<title> <url>` |
| LinkedIn | `https://www.linkedin.com/sharing/share-offsite/?url=<url>` |
| X | `https://x.com/intent/post?text=<title>&url=<url>` |
| E-mail | `mailto:?subject=<title>&body=<url>` |

- Native `<dialog>` with `showModal()`: background is inert, **Esc** closes, focus goes to the first action and returns to the button that opened it. Clicking the backdrop closes.

## 5. Scope

**First version**
- `content/links.json` drives the whole page.
- Profile, social icons, links with optional icon or image, section headings, one featured link.
- `hidden` (in the file, off the page) and `highlight` (dark card) per link.
- Share modal for the page and for each link.
- Open Graph image and meta tags read from the same JSON.
- Mobile first; the same column centred on desktop (max 480 px).

**Later**
- Click counts without cookies (Plausible or Umami).
- A dark theme that follows the system.
- A QR code in the share modal.
- Markdown as an alternative to JSON.

## 6. Data

One file, `content/links.json`, validated at build time with Zod (`src/lib/schema.ts`). A broken file fails the build with a readable message (path to the bad field + what was expected).

```json
{
  "profile": {
    "name": "Vinícius Albuquerque",
    "handle": "vinicius",
    "bio": "Full-stack product engineer. Construo SaaS do zero e, nas horas vagas, jogos de navegador. Brasil.",
    "avatar": "/avatar.jpg",
    "siteUrl": "https://links.vinicius-albuquerque.com.br",
    "repoUrl": "https://github.com/allbdev/my-links"
  },
  "socials": [
    { "type": "github", "url": "https://github.com/allbdev" },
    { "type": "linkedin", "url": "https://www.linkedin.com/in/albuquerque-vinicius/" },
    { "type": "email", "url": "mailto:[your-email]" }
  ],
  "blocks": [
    { "type": "link", "title": "Portfólio", "url": "https://[your-portfolio]", "icon": "briefcase" },
    { "type": "link", "title": "GitHub · código aberto", "url": "https://github.com/allbdev", "icon": "github" },
    { "type": "header", "title": "Projetos" },
    { "type": "featured", "title": "Estacione o Carrinho", "subtitle": "Jogo de navegador · física e replays determinísticos", "url": "https://[game-url]", "image": "/thumbs/cart.webp", "badge": "Em breve" },
    { "type": "link", "title": "Path Trader · SaaS solo", "url": "https://[path-trader]" }
  ]
}
```

Rules the schema enforces:

- `blocks` keeps the page order. Types: `link`, `header`, `featured`.
- `url` must be `https:` or `mailto:` (or a root-relative path such as `/cv.pdf`). `javascript:`, `data:` and `http:` are rejected.
- `image` is a root-relative path to a file in `public/`, and the file must exist. `icon` is a name from the icon set. A link may have one, the other or neither, not both.
- `hidden` and `highlight` are optional booleans. At most one `featured` block.
- `socials[].type` is one of `github`, `linkedin`, `email`, `x`, `instagram`, `youtube`, `whatsapp`.
- Titles are non-empty, trimmed, at most 80 characters; the bio at most 160.
- Unknown keys are an error (strict objects), so a misspelt key never silently disappears.
- **Languages.** `profile.bio` and every block's `title`, `subtitle`, `badge` and `url` may be one string (used for both languages) or `{ "en": "…", "pt": "…" }`. Both keys are required, other keys are an error, and each value follows the field's own rules (`blocks[0].url.pt: must be an https:// URL`). Name, handle, socials and images are the same in both languages.

## 7. Look

Canvas boards above. Light only for the first version.

- Cool grey background, white cards with 16 px corners, near-black type, **one** blue accent.
- **Motion** (tokens `--ease-out`, `--ease-in-out`, `--duration-*` in `tokens.css`):
  - Page entrance: what's on screen at load (photo, name, bio, socials, the first cards) rises 24 px and fades in, 800 ms, staggered 90 ms. Cards below the fold wait and rise the same way as they scroll into view, once (`<Reveal>`, an IntersectionObserver; batches stagger up to 4 deep). The load entrance is CSS only: without JS everything plays at load.
  - Cards lift 2 px with a soft shadow on hover (mouse only); pressing a card or a round button sinks it slightly (scale 0.98 / 0.94, 120 ms).
  - Share dialog: rises and fades in (340 ms) and back out (220 ms); the backdrop fades with it. The copy icon pops in when it swaps to the check.
  - Language switch: a cross-page view transition (450 ms) crossfades the page and slides the dark pill from EN to PT.
  - Feedback stays fast on purpose: press 120 ms, hover 150 ms.
  - `prefers-reduced-motion`: no movement anywhere; the entrance and the dialog only fade, nothing waits for scrolling, and there's no view transition.
- Every touch target is at least 44 × 44 px.
- No Linktree logo, name or colours anywhere.

**Tokens** (CSS custom properties in `src/app/tokens.css`)

| Token | Value | Use |
|---|---|---|
| `--bg` | `#ECEEF2` | Page background; grey action circles in the share modal |
| `--card` | `#FFFFFF` | Link cards, modal |
| `--ink` | `#12151A` | Text, icon tiles, highlighted card, share preview card |
| `--muted` | `#5B6270` | Bio, handle, subtitles, ⋮ buttons |
| `--line` | `#DDE1E7` | Round button borders, avatar ring |
| `--line-card` | `#E1E4EA` | Link card borders |
| `--hover` | `#F1F3F6` | Icon-button hover |
| `--accent` | `#2546E8` | Link hover, focus ring, highlighted icon tile, preview avatar |
| `--accent-soft` | `#E8ECFF` | Accent backgrounds |
| `--ok` | `#1A7A43` | "Copiado!" text and check icon (darker than the mockup's green so text passes 4.5:1) |
| `--badge` / `--badge-ink` | `#FFD43B` / `#A4161A` | Featured badge |
| `--on-ink-muted` | `#C9CED6` | URL on the share preview card |
| `--overlay` | `rgb(18 21 26 / 55%)` | Modal backdrop |
| `--brand-whatsapp` / `--brand-linkedin` | `#1F8F4E` / `#0A66C2` | Share action circles (white icon) |

| Radius | Use |
|---|---|
| 16 px | Link cards |
| 22 px | 44 px round buttons |
| 24 px | Modal |
| 18 px | Share preview card |
| 10 px | Icon tiles, thumbnails, featured image |
| 50% | Avatar |

| Font | Use |
|---|---|
| Space Grotesk (500, 700) | Name and headings |
| Inter (400, 500, 600) | Text |
| JetBrains Mono (500) | Handle and URLs |

All three are OFL and self-hosted through `next/font` (no runtime calls to Google Fonts).

**Icons:** Lucide for interface icons (share, ⋮, copy, close, mail, globe…). Lucide has no brand logos, so GitHub, LinkedIn, X, WhatsApp, Instagram and YouTube are local stroke icons in the same style (`src/components/icons/brand.tsx`: Lucide's former brand icons, ISC, and Tabler Icons, MIT; notices in `NOTICE.md`).

## 8. Architecture

- **Fully static.** `next.config.ts` sets `output: "export"`; `next build` writes plain HTML, CSS and JS to `out/`. No API routes, no server, no database.
- **Content at build time.** `src/lib/content.ts` reads `content/links.json`, parses it with the Zod schema and returns typed data. It throws on invalid content, which fails the build.
- **Server Components by default.** The page, profile, cards and footer render on the server at build time and ship no JS.
- **Two client islands.** `ShareProvider` + `ShareDialog` (`"use client"`) own the modal state; the share buttons are tiny client components that call `open({ title, url })`. `Reveal` (renders nothing) holds back the entrance of elements below the fold until they scroll into view.
- **Pure helpers.** `src/lib/share.ts` builds the share URLs; `src/lib/url.ts` resolves relative links against `siteUrl`. No DOM, tested on their own.
- **Images.** A plain `<img>` (`StaticImage`) with required `width`/`height` so nothing shifts, lazy below the fold, files pre-sized as WebP. Not `next/image`: a static export can't optimise images, so it would only add about 14 KB of client JS.
- **Languages.** One root layout per language through route groups: `app/(en)/` renders `/` with `<html lang="en">`, `app/(pt)/pt/` renders `/pt/` with `<html lang="pt-BR">`. Both are thin wrappers over `app/_shared/`. `app/global-not-found.tsx` (experimental `globalNotFound` flag) is the 404 in both languages, since there's no single root layout.
- **Metadata.** `generateMetadata` and each language's `opengraph-image.tsx` (`dynamic = "force-static"`) read the same JSON: title, description, canonical URL, `hreflang` alternates, Open Graph (with `og:locale`) and Twitter cards. The route groups make Next add a hash to the image's name (`/opengraph-image-35z9bs`), so `vercel.json` matches `/opengraph-image(.*)`.
- **Links** open with `target="_blank" rel="noopener noreferrer"`; `mailto:` links don't.

```
content/links.json ──► lib/content.ts (Zod, getContent(locale)) ──► app/(en)/page.tsx    ──► out/index.html
                                                              ├──► app/(pt)/pt/page.tsx ──► out/pt/index.html
                                                              └──► opengraph-image.tsx (per language)
                         lib/share.ts ◄── components/share-dialog.tsx (Client)
```

## 9. Stack and conventions

| Decision | Choice | Why |
|---|---|---|
| Language | TypeScript, strict | Day-to-day stack |
| Framework | Next.js (App Router), static export | Deploys anywhere; shows a clean static build |
| Styling | CSS Modules + tokens as CSS custom properties | No runtime, no extra build step; maps 1:1 to the mockup's styles (open in `TODO_FOR_YOU.md`) |
| Validation | Zod on `links.json` at build | A typo fails CI, not the live page |
| Icons | Lucide + local brand SVGs | One stroke set; Lucide has no brand logos |
| Tests | Vitest (+ Testing Library) for schema, helpers and components; fast-check for URL encoding; Playwright + axe for the smoke test | Logic separate from drawing, and tested |
| CI | GitHub Actions: lint, typecheck, test, build, size, e2e on every push and PR; Vercel deploys `main` | Editing the JSON on GitHub redeploys the page |
| Hosting | Vercel (Git integration) at `links.vinicius-albuquerque.com.br`, DNS on Cloudflare (`docs/DEPLOY.md`) | Free, static, preview URLs per PR, headers via `vercel.json` |
| Repo | Public, MIT, README with a screenshot, the JSON format and Lighthouse numbers | The README is what a recruiter reads |
| Data | No cookies, no personal data stored | D6 |

## 10. What it shows

- A clean static Next.js build with schema-validated content: the build is the validator.
- Accessibility done properly: real links and buttons, native `<dialog>`, focus return, 44 px targets, passing contrast, axe in CI.
- Performance: almost no JS (one island), no layout shift, a Lighthouse score worth putting in the README.

## 11. Risks

| Risk | Mitigation |
|---|---|
| Too small to be interesting as a portfolio piece | Keep it short; the README talks about the schema, the static export and accessibility |
| Thumbnails make the page heavy | Small fixed sizes, WebP, `loading="lazy"` below the fold; a size check in CI |
| The modal is not accessible | Native `<dialog>`, focus returns to the opener, axe and keyboard tests |
| A public e-mail address attracts spam | The address is already public on my site; accepted (decided 20 Nov 2026) |
| Copying Linktree's look too closely | Same structure, my own colours, type and icons; no Linktree logo or name |
| Static export limits (no `headers()`, no image optimisation) | Pre-size images; security headers in `vercel.json` |

**Effort (estimate):** one or two evenings for the first version.

## 12. What already exists

Linktree, Beacons, Bento and many open-source clones (LittleLink, LinkStack). This one is not a product; it is my own page and a small, tidy codebase to show.
