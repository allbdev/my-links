# Links

> *One link in every bio.* My own Linktree: one static page with my photo, a short bio and my links, driven by a single JSON file that the build validates.

**Status:** plan and mockups done; nothing built yet (see `ROADMAP.md`).

The page is in Brazilian Portuguese. Code, comments and docs are in English.

| Doc | What's in it |
|---|---|
| [`PLAN.md`](PLAN.md) | Design, data format, look and tokens, architecture, risks |
| [`ROADMAP.md`](ROADMAP.md) | Ordered task list and current progress |
| [`CLAUDE.md`](CLAUDE.md) | Project rules (language, testing, git workflow, design sync, architecture) |
| [`TODO_FOR_YOU.md`](TODO_FOR_YOU.md) | Open decisions and things only the developer can do |
| [`docs/DEPLOY.md`](docs/DEPLOY.md) | Vercel project and Cloudflare DNS for `links.vinicius-albuquerque.com.br` |
| [`LINKS.md`](LINKS.md) | The original one-page pitch |
| [`design/`](design) | Source of the design canvas boards (the page and the share modal) |

## What it does

- Profile (photo, name, bio, social icons), links as cards, section headings and one featured card with an image.
- A share modal for the whole page and for each link: copy, WhatsApp, LinkedIn, X, e-mail and the phone's own share sheet.
- Link previews (Open Graph image and tags) generated from the same file.
- No cookies, no analytics, no server.

## The interesting part

- **The build is the validator.** `content/links.json` is parsed with a strict Zod schema at build time. A misspelt key, a `javascript:` URL or an image that isn't in `public/` fails the build with a message that points at the field, so a typo never reaches the live page.
- **Static, with one island.** Next.js App Router with `output: "export"`: the page is Server Components rendered at build time, and the share modal is the only client component.
- **Accessible by default.** Real links and buttons, a native `<dialog>` with focus return, 44 px touch targets, passing contrast, and axe in CI.

## Editing the links

Edit `content/links.json` (on GitHub is fine) and push. CI validates it, builds and deploys.

```json
{
  "profile": { "name": "…", "handle": "…", "bio": "…", "avatar": "/avatar.jpg", "siteUrl": "https://…", "repoUrl": "https://…" },
  "socials": [{ "type": "github", "url": "https://github.com/…" }],
  "blocks": [
    { "type": "link", "title": "Portfólio", "url": "https://…", "icon": "briefcase" },
    { "type": "header", "title": "Projetos" },
    { "type": "featured", "title": "…", "subtitle": "…", "url": "https://…", "image": "/thumbs/….webp", "badge": "Em breve" }
  ]
}
```

The full format and its rules are in `PLAN.md` §6.

## Requirements

- **Node.js 22 LTS** and npm
- **Git LFS** (images and the CV are stored in LFS)

```sh
brew install node git-lfs && git lfs install
npm install
```

## Running

```sh
npm run dev          # local dev server
npm run build        # static build in out/
npm run preview      # serve out/
```

## Tests and tools

```sh
npm run check        # lint + typecheck + unit tests + build + size budget (run before every commit)
npm test             # Vitest (unit, component and property tests)
npm run e2e          # Playwright smoke + axe, desktop and phone
npm run size         # first-load JS against the budget
npm run designs      # capture the design-canvas boards from the built site
```

GitHub Actions runs `check` and the e2e tests on every push and pull request. Vercel deploys `main` to https://links.vinicius-albuquerque.com.br and gives every pull request a preview URL (setup: `docs/DEPLOY.md`).

## Project layout

```
content/
  links.json     The page's content. The only file to edit day to day.
src/
  app/           Layout, page, metadata, Open Graph image, tokens.css.
  components/    Profile, link card, featured card, section heading, share dialog, icons.
  lib/           Pure logic: schema, content loader, share URLs, URL helpers. No DOM.
  content/       strings.ts: interface text (PT-BR).
public/          Avatar, thumbnails, CV, favicon.
tests/           Vitest tests mirroring src/, fixtures/, and e2e/ (Playwright).
tools/           Size check, design-board capture.
design/          Design canvas source (reference only, not used in the site).
```

## Contributing workflow

1. Pick the next task in `ROADMAP.md`.
2. Write the feature together with its tests, keeping logic in `src/lib/`.
3. If it changes something a design board shows, update the board (see `CLAUDE.md`).
4. Run `npm run check` and make sure it passes.
5. Commit. Before every push, run the `security-audit` skill on the changes (see `CLAUDE.md`).

## License

MIT.
