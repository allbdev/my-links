# Links (a personal link-in-bio page)

**Author:** Vinícius Albuquerque Barros · **Written:** 20 Nov 2026 · **Status:** plan only, nothing built

A self-hosted link-in-bio page, in the spirit of Linktree but my own: one static page with my photo, a short bio and the links I want to show. Free, open-source, no accounts. A portfolio piece: the code is part of the product. Effort figures are estimates, not measurements.

**Pitch:** one link in every bio that I own, host for free and change by editing one file.

## The page
1. Top bar: handle on the left, share button on the right.
2. Profile: round photo, name, one-line bio, social icons (GitHub, LinkedIn, e-mail).
3. Links as full-width buttons. Each can have a thumbnail, and each opens in a new tab.
4. Optional section headings ("Projects", "Contact") and a featured link with a large image.
5. Every link has a ⋮ button that opens the share modal for that link; the top-right button shares the whole page.
6. Share modal: a preview card (photo, title, URL), then Copy link, WhatsApp, LinkedIn, X, E-mail, More options (the phone's native share sheet).

Reference: https://linktr.ee/eusouaspect (layout, link buttons, ⋮ menu, share modal).

## Scope
**First version**
- One `content/links.json` file drives the whole page.
- Profile, social icons, links with optional image, sections, one featured link.
- Share modal for the page and for each link.
- Mobile first; on desktop the same column is centred.
- Open Graph image and meta tags, so the link previews well when pasted.

**Later**
- Click counts without cookies (a privacy-friendly counter such as Plausible or Umami).
- A dark theme that follows the system.
- A QR code in the share modal.
- Markdown as an alternative to JSON.

## Data
One file, validated at build time with Zod. A broken file fails the build instead of shipping a broken page.

```json
{
  "profile": {
    "name": "Vinícius Albuquerque",
    "handle": "vinicius",
    "bio": "Full-stack product engineer. I build SaaS from scratch and, on the side, browser games.",
    "avatar": "/avatar.jpg",
    "siteUrl": "https://[your-domain]"
  },
  "socials": [
    { "type": "github", "url": "https://github.com/allbdev" },
    { "type": "linkedin", "url": "https://www.linkedin.com/in/albuquerque-vinicius/" },
    { "type": "email", "url": "mailto:[your-email]" }
  ],
  "blocks": [
    { "type": "link", "title": "Portfolio", "url": "https://[your-portfolio]", "image": "/thumbs/portfolio.png" },
    { "type": "link", "title": "GitHub · open source", "url": "https://github.com/allbdev", "icon": "github" },
    { "type": "header", "title": "Projects" },
    { "type": "featured", "title": "Estacione o Carrinho", "subtitle": "Browser game", "url": "https://[game-url]", "image": "/thumbs/cart.jpg", "badge": "Coming soon" },
    { "type": "link", "title": "Path Trader · solo SaaS", "url": "https://[path-trader]" }
  ]
}
```

- `blocks` keeps the order on the page. Types: `link`, `header`, `featured`.
- `image` (a file in `public/`) or `icon` (a name from the icon set); neither is fine.
- Optional per link: `hidden` (keep it in the file but off the page), `highlight` (dark button).

## Architecture
- **Next.js App Router, fully static** (`output: "export"`). The page is a Server Component that reads the JSON at build time; no API, no database.
- **The share modal is the only client component.** It uses `navigator.share` when the browser has it and falls back to the button grid. Copy uses `navigator.clipboard`.
- **Share URLs are built, not hard-coded:** `wa.me/?text=`, `linkedin.com/sharing/share-offsite/?url=`, `x.com/intent/post?url=`, `mailto:`.
- **Links** use `target="_blank" rel="noopener noreferrer"`.
- **Images** through `next/image` with fixed sizes, so nothing jumps while loading.
- **Metadata** (`generateMetadata`) and an Open Graph image from `opengraph-image.tsx`, both read from the same JSON.

## What it shows
- A clean static Next.js build with schema-validated content.
- Accessibility done properly: real buttons and links, focus trap and Esc in the modal, 44 px touch targets, contrast that passes.
- A Lighthouse score worth putting in the README.

## Risks
| Risk | Mitigation |
|---|---|
| Too small to be interesting as a portfolio piece | Keep it short; the README talks about the schema, the static export and accessibility |
| Thumbnails make the page heavy | `next/image`, small fixed sizes, WebP |
| The modal is not accessible | Native `<dialog>` element, focus returns to the button that opened it |
| Copying Linktree's look too closely | Same structure, my own colours, type and icons; no Linktree logo or name on the page |

**Effort (estimate):** about one evening for the first version.

## Look

Mockups are in the design canvas "Links — Vinícius": the mobile page (interactive: the share buttons open the modal) and the modal open. Cool grey background, white link cards with 16 px corners, near-black type, one blue accent. Space Grotesk for name and headings, Inter for text, JetBrains Mono for the handle and URLs. The photo, URLs and link list are placeholders until the JSON exists.

## Stack and conventions

| Decision | Proposal | Why |
|---|---|---|
| Language | TypeScript, strict | Day-to-day stack |
| Framework | Next.js (App Router), static export | What you asked for; deploys anywhere |
| Styling | Tailwind CSS or CSS Modules | Small, no runtime |
| Validation | Zod on `links.json` at build | A typo fails CI, not the live page |
| Icons | Lucide | One consistent stroke set |
| Tests | Vitest for the schema and share-URL helpers, Playwright for one smoke test (modal opens, copy works) | Logic separate from drawing, and tested |
| CI | GitHub Actions: lint, test, build, deploy on push | Editing the JSON on GitHub redeploys the page |
| Hosting | Vercel or Cloudflare Pages, custom domain | Free, static |
| Repo | Public, MIT, README with a screenshot and the JSON format | The README is what a recruiter reads |
| Text | PT-BR on the page; English README | Your call |
| Data | No cookies, no personal data stored | Nothing to comply with |

## What already exists

Linktree, Beacons, Bento and many open-source clones (LittleLink, LinkStack). This one is not a product; it is my own page and a small, tidy codebase to show.
