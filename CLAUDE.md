# CLAUDE.md — Links

A personal Linktree in **TypeScript (strict) + Next.js App Router, fully static** (`output: "export"`). One page, driven by `content/links.json`. Sibling of `../cartorio-simulator` (same habits: content is data, logic separate from views, tests for everything, design canvas in sync). Design: `PLAN.md` (original pitch: `LINKS.md`). Ordered task list: `ROADMAP.md`. Things only the developer can do: `TODO_FOR_YOU.md`. Mockups: the design canvas and `design/`.

Repo: https://github.com/allbdev/my-links (remote `origin`, branch `main`). Hosted on **Vercel** (Git integration deploys `main`; pull requests get preview URLs) at **https://links.vinicius-albuquerque.com.br** (DNS on Cloudflare; setup in `docs/DEPLOY.md`).

## Security audit before every push (strict)

- **Run the `security-audit` skill on the changes being pushed before every `git push`.** No exceptions: not for small fixes, docs-only changes, a JSON edit or a push the developer asked for in a hurry.
- Fix every finding, or get the developer to explicitly accept it, before pushing. Mention the audit result in your message when you push.
- If the audit can't run, don't push; say why.

## Design canvas (two-way sync, strict)

The mockups live on the claude.ai design canvas **"Links — Vinícius (clone do Linktree)"**: https://claude.ai/artifact/TvGyvKmYvhYzxHkrz5qgR3 (page "Site real": captures of the built site; page "Mockups desenhados": the original drawn boards "Perfil · mobile (interativo)" and "Modal de compartilhar aberto"). Its source files are in `design/` (the canvas serves them under `project/`); `design/README.md` maps each board.

The site, the docs and the canvas must always agree:

- **Site → canvas.** Any change to something a board shows (layout, colours, fonts, radii, copy, the link list's structure, the share modal) updates that board in the same task. A task isn't done until both match.
- **Canvas → site.** The developer edits boards by hand. Before starting any UI task, re-read the boards it touches (Artifact `read`) and bring every difference into the code, the tokens and `PLAN.md`. If a canvas change conflicts with the plan, ask.
- **Docs too.** `PLAN.md` §3, §4 and §7 (page, share modal, look and tokens) describe the same things as the boards; keep them in step.
- **New looks are tried on the canvas first**, on a new board, then built.
- Placeholder content (photo, URLs, link titles) on the drawn boards doesn't need to follow `links.json`; structure and look do.
- **The "Site real" boards are captures.** After any visible change: `npm run build && npm run preview`, then `npm run designs -- --out=design`, upload the JPGs as canvas assets and point the two boards at the new `/_blob/` ids (steps in `design/README.md`).
- If Claude can't update a board itself, list what's stale in `TODO_FOR_YOU.md`.

## Language rules (strict)

| What | Language |
|---|---|
| Code: identifiers, file/folder names, CSS classes, JSON keys, test names | **English** |
| Code comments, commit messages, PR descriptions | **English** |
| Docs (`*.md`, including this file) | **English** |
| **Visitor-facing text** (page, share modal, aria labels, `<title>`/meta, OG image) | **English** at `/` (default) and **Brazilian Portuguese (PT-BR)** at `/pt/`, always both (decision D5 in `PLAN.md`) |

- Content text (name, bio, link titles, section headings) lives in `content/links.json`. Any text or URL there is either one string (same in both languages) or `{ "en": "…", "pt": "…" }`; the schema requires both keys.
- Interface text (share modal labels, aria labels, footer, "Copied!") lives in **one file**, `src/content/strings.ts`, with an `EN` and a `PT` dictionary; the types make every key exist in both. Never inline in components. Don't add an i18n library without asking.
- Every new visitor-facing string gets both languages in the same change. Components take a `locale` prop (the share island reads it from its context).
- `<html lang>` is `en` on `/` and `pt-BR` on `/pt/` (one root layout per language: `src/app/(en)` and `src/app/(pt)/pt`).

## Testing rules

- **Every feature ships with tests.** A roadmap task isn't done until its tests are written and passing.
- Frameworks: **Vitest** (unit and component, with Testing Library + jsdom), **fast-check** (property-based), **Playwright** with **@axe-core/playwright** (end-to-end smoke and accessibility).
- Tests go in `tests/`, mirroring `src/` (`src/lib/share.ts` → `tests/lib/share.test.ts`). End-to-end tests are in `tests/e2e/`.
- Cover: the schema (every rule in `PLAN.md` §6, valid and invalid fixtures, readable error messages), the real `content/links.json` parses, share URL builders (encoding of accents, `&`, `#`, emoji, spaces; property test: decoding the built URL gives back the input), relative URL resolution, what each block renders (link, header, featured, hidden, highlight, icon vs image), the share dialog (opens, copy success and fallback, native share present and absent, Esc, focus return), metadata.
- E2E smoke on desktop and phone: page loads, every visible link has an `href`, the share modal opens from the top bar and from a ⋮, Esc closes it, focus returns, axe reports no violations.
- Test behaviour and markup, not pixels.
- Bug fixes start with a failing test that reproduces the bug.
- Run the full check before every commit, and don't commit when it fails:
  ```sh
  npm run check && git commit ...
  ```
  (`npm run check` = lint (warnings fail) + typecheck + unit tests + build + size budget.) Check the exit code, not the last lines of output.

## Git workflow

- **Before every push, run the `security-audit` skill** (see the section at the top).
- Commit or push only when asked. Never push with failing checks.
- Small, logical commits (one feature or chore each).
- Large binary assets (`.png`, `.jpg`, `.webp`, `.pdf`, `.woff2`) go through Git LFS (see `.gitattributes`), **except everything in `public/`**: Vercel clones without LFS, so files the site serves or the build reads must be plain files (keep them small). A test fails if anything in `public/` is LFS-tracked, and the build fails with a clear message if an image in `links.json` is an LFS pointer. CI checks out with `lfs: true` (for the design captures).

## Code conventions

- TypeScript `strict: true`, no `any` (use `unknown` and narrow). ESLint (Next config + `typescript-eslint` strict) + Prettier, enforced in CI.
- `camelCase` for variables and functions, `PascalCase` for components and types, `CONSTANT_CASE` for module constants, `kebab-case` for file names (`share-dialog.tsx`).
- **Content is data.** Links, sections, socials and profile live in `content/links.json`. Adding a link never touches code.
- **Server Components by default.** `"use client"` only for the share island and `Reveal` (the scroll-triggered entrance, added at the developer's request). Don't add client state, effects or context anywhere else without asking.
- Styling: CSS Modules per component + tokens from `src/app/tokens.css`. No hard-coded colours, radii or font names in components; use the tokens.
- No runtime dependencies beyond `next`, `react`, `react-dom`, `zod` and `lucide-react` without asking. Dev dependencies are fine when they serve the stack above.
- `src/lib` is pure: no DOM, no `window`, no React. Components call it; tests call it directly.

## Architecture notes

- **Layout.** `content/` is the data. `src/lib/` is pure logic (schema, content loader, share URLs, URL helpers). `src/components/` draws. `src/app/` is the Next.js routes: one route group per language (`(en)` at `/`, `(pt)/pt` at `/pt/`), each a thin wrapper over `src/app/_shared/` (layout, page, OG image), plus `global-not-found.tsx` (the 404, in both languages). `src/lib/i18n.ts` lists the locales; `src/content/strings.ts` is the interface text.
- **Static export.** `output: "export"`, `images.unoptimized: true`, `trailingSlash: true`. No route handlers that need a server, no `headers()`/`cookies()`, no ISR. Served from the domain root on Vercel, so no `basePath`. Security headers live in `vercel.json` (Next's `headers()` doesn't apply to a static export).
- **Validation at build.** `src/lib/content.ts` is the only place that reads `links.json`; it parses with the schema and throws a formatted error on failure. Image paths are checked against `public/`. `getContent(locale)` returns the content with every per-language value resolved, so components only see plain strings.
- **Languages.** Plain links between `/` and `/pt/` (the switch in the top bar), `hreflang` alternates in the head and the sitemap, a preview image per language. No language detection, no redirects, no cookies: English unless the visitor picks PT.
- **Safe links.** The schema rejects anything but `https:`, `mailto:` and root-relative URLs. External links get `target="_blank" rel="noopener noreferrer"`. Never use `dangerouslySetInnerHTML` for content.
- **Share.** `ShareProvider` (client) holds `{ open, title, url }`; `ShareButton` calls it; `ShareDialog` is a native `<dialog>` opened with `showModal()`. URLs come from `src/lib/share.ts`. Clipboard and `navigator.share` are feature-detected; both have a fallback.
- **Accessibility.** Keyboard and screen-reader usable; real `<a>` and `<button>`; every icon-only button has an aria label from `strings.ts`; visible focus ring (`--accent`); text contrast 4.5:1; 44 px targets; motion (entrance, press, dialog, view transition; `PLAN.md` §7) uses the tokens in `tokens.css`, and `prefers-reduced-motion` removes all movement, leaving short fades. `tests/app/motion.test.ts` checks the CSS for this.
- **Privacy.** No cookies, no analytics, no `localStorage`, no third-party requests at runtime (fonts are self-hosted).
- **Performance budget.** First load under 150 KB gzipped JS and 20 KB CSS (the Next 16 + React 19 runtime alone is about 135 KB; `noModule` polyfills excluded; measured by `npm run size` on `out/`), no layout shift, Lighthouse 100 in all four categories on mobile as the target. First guesses; adjust after the first build.

## Workflow

- Work through `ROADMAP.md` in order. Mark tasks `[~]` when started and `[x]` when done and tested.
- Don't add scope that isn't in the roadmap without asking first.
- Keep `TODO_FOR_YOU.md` current: anything that needs the developer (decisions, content, photo, accounts, domain) goes there, newest at the top of each section.
- Keep the design canvas, `design/` and `PLAN.md` in sync with the site (see the second section).
