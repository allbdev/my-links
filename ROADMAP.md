# Roadmap — Links

> Tasks **in order**. Work top to bottom; move to the next phase only when the current phase's exit criteria are met.
> **The data comes first:** the schema and the content loader are what make "edit one file" safe, so they're built and tested before any UI. Then the page, then the share modal, then metadata and launch.
> Design details live in `PLAN.md`. Mockups on the design canvas and in `design/`. Project rules in `CLAUDE.md`. Things only the developer can do in `TODO_FOR_YOU.md`.

**Language rule:** visitor-facing text in **PT-BR**, content in `content/links.json`, interface text in `src/content/strings.ts`. Code, comments and docs in English.

**Design rule:** any task that changes what a board shows also updates the board (see `CLAUDE.md`).

**Definition of done:** a task is `[x]` only when it's implemented **and covered by passing tests** (see `CLAUDE.md`).

**Target (from `PLAN.md`):** one or two evenings for the first version. Every number below is a first guess.

**Legend:** `[ ]` todo · `[~]` in progress · `[x]` done

---

## Phase 0 · Setup

1. [x] `git init`, public GitHub repo (`allbdev/my-links`), MIT `LICENSE`, Git LFS (`.gitattributes` already lists the binary types)
2. [x] Next.js App Router + TypeScript strict scaffold, `output: "export"`, `images.unoptimized`, `trailingSlash`; folders `content/`, `src/app`, `src/components`, `src/lib`, `src/content`, `tests/`, `tools/`, `public/`
3. [x] ESLint + Prettier; `npm run check` (lint + typecheck + unit tests + build + size)
4. [x] Vitest (+ jsdom, Testing Library) + fast-check, first test; Playwright with a "page loads" smoke test on desktop and phone
5. [x] GitHub Actions: `check` + e2e on every push/PR; `vercel.json` for the Vercel deploy (connecting the project and DNS are in `TODO_FOR_YOU.md`, guide in `docs/DEPLOY.md`)
6. [x] Fonts via `next/font` (Space Grotesk, Inter, JetBrains Mono; self-hosted) and the tokens from `PLAN.md` §7 in `src/app/tokens.css`
7. [x] `src/content/strings.ts` with the interface text; `<html lang="pt-BR">`
8. [x] `tools/size-check.ts` (`npm run size`): gzipped JS on first load of `out/index.html` against the budget in `CLAUDE.md`

**Exit:** the empty page builds to `out/` and CI is green. ✅ (first-load JS 133.5 KB gzipped, mostly the Next + React runtime)

---

## Phase 1 · Content: schema and loader (no UI)

> Pure logic in `src/lib`, tested without a DOM.

9. [x] Zod schema (`src/lib/schema.ts`) with every rule in `PLAN.md` §6: block types, URL protocols, image xor icon, one featured at most, strict objects, length limits
10. [x] A valid fixture in `tests/fixtures/` and one mutation per rule in `tests/lib/schema.test.ts`; each fails with a readable message (field path + expectation)
11. [x] Loader (`src/lib/content.ts`): reads `content/links.json`, parses, checks that every `image` exists in `public/`, filters `hidden`, throws a formatted error
12. [x] First `content/links.json` with real content from the portfolio site (placeholder avatar and featured image); test that the real file parses
13. [x] Share URL builders (`src/lib/share.ts`): WhatsApp, LinkedIn, X, e-mail; property tests with fast-check (any title and URL round-trip through encoding)
14. [x] URL helpers (`src/lib/url.ts`): resolve root-relative paths against `siteUrl`; is-external check (decides `target="_blank"`)

**Exit:** a broken `links.json` fails `npm run build` with a message that points at the bad field; all helpers covered. ✅

---

## Phase 2 · The page

> Re-read the board "Perfil · mobile (interativo)" before starting (see `CLAUDE.md`). Everything here is a Server Component.

15. [x] Layout: centred column (max 480 px), background, top bar (handle + share button slot), footer ("Feito com Next.js · ver o código")
16. [x] Profile: avatar through `next/image` with initials fallback, name, bio, social icon buttons (Lucide + local brand SVGs)
17. [x] Link card: icon or thumbnail, title, ⋮ button slot, `highlight` variant, external vs `mailto:` vs relative behaviour
18. [x] Section heading and featured card (image, title, subtitle, badge)
19. [x] Block renderer: maps `blocks` to components in order; component tests for every block type and option
20. [x] Hover lift and focus ring; `prefers-reduced-motion` respected
21. [x] Keyboard and screen-reader pass: tab order, aria labels, heading levels (one `h1`, `h2` per section); axe in the e2e smoke test

**Exit:** the page matches the board on a phone and on desktop, with no JS shipped yet beyond the Next runtime. ✅

---

## Phase 3 · Share

> Re-read the board "Modal de compartilhar aberto" before starting.

22. [ ] `ShareProvider` + `ShareButton` (client island); top bar shares the page, each ⋮ shares its link
23. [ ] `ShareDialog`: native `<dialog>`, heading, close, preview card (avatar, title, URL), action grid
24. [ ] Copy link: clipboard, "Copiado!" for 2 s, selected read-only field as fallback
25. [ ] WhatsApp, LinkedIn, X, e-mail links from `src/lib/share.ts`
26. [ ] "Mais opções": `navigator.share`, rendered only when supported; cancelling isn't an error
27. [ ] Focus: first action on open, back to the opener on close; Esc and backdrop close; component tests for all of it
28. [ ] E2E: open from the top bar and from a ⋮, copy (with clipboard permission), Esc, focus return, axe on the open modal

**Exit:** the first version from `PLAN.md` §5 works end to end on desktop and phone.

---

## Phase 4 · Metadata and previews

29. [ ] `generateMetadata` from `links.json`: title, description, canonical, Open Graph, Twitter card
30. [ ] `opengraph-image.tsx` (static): avatar, name, bio, handle in the site's look
31. [ ] Favicon and apple-touch icon; `robots.txt` and `sitemap.xml` (static)
32. [ ] Tests: metadata values come from the JSON; e2e checks the OG tags in the built HTML

---

## Phase 5 · Design sync tooling

33. [ ] `tools/designs/capture.ts` (`npm run designs`): Playwright screenshots of the built page and the open modal at board size (390 × 1380)
34. [ ] Replace the drawn boards on the canvas with captures from the real site (keep the drawn ones on a separate page); add JPG exports to `design/` and list them in `design/README.md`

---

## Phase 6 · Launch

35. [ ] Real content: photo, bio, URLs, CV PDF, featured image (all in `TODO_FOR_YOU.md`)
36. [ ] Images pre-sized to WebP; size budget and Lighthouse (mobile) checked; numbers in the README
37. [ ] README: screenshot, the JSON format, how the build validates it, the share modal's accessibility, Lighthouse numbers
38. [ ] Production deploy on Vercel at `links.vinicius-albuquerque.com.br` (`docs/DEPLOY.md`); `siteUrl` set
39. [ ] Security headers in `vercel.json` (CSP, `Referrer-Policy`, `X-Content-Type-Options`, `Permissions-Policy`)
40. [ ] Put the link in every bio (GitHub, LinkedIn, CV)

---

## Later (not in the first version)

- Click counts without cookies (Plausible or Umami)
- Dark theme that follows the system
- QR code in the share modal
- English toggle
- Markdown as an alternative to JSON
