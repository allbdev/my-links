# Make it yours

A step-by-step guide to turning this repo into your own link-in-bio page. Everything a visitor sees comes from one file, `content/links.json`, plus the images in `public/`. You don't need to touch any code for a normal setup.

Time: about 30 minutes for content, plus about 10 minutes to deploy ([`DEPLOY.md`](DEPLOY.md)).

---

## 1. Get a copy

Fork the repo on GitHub, or clone it and push it to a new repository of your own:

```sh
git clone https://github.com/allbdev/my-links.git my-links && cd my-links
git remote set-url origin https://github.com/<you>/<your-repo>.git
npm install
npm run dev            # http://localhost:3000
```

You need **Node.js 22** and npm. Git LFS is only needed if you want the design captures in `design/` (they aren't used by the site).

## 2. Replace the content

Open `content/links.json`. It has three parts: `profile`, `socials` and `blocks`. The dev server reloads as you save. If something is wrong, the page (and later the build) shows a message naming the field, for example `blocks[2].url: must be an https:// URL`.

### `profile`

```json
"profile": {
  "name": "Ada Lovelace",
  "handle": "ada",
  "bio": { "en": "Mathematician and writer.", "pt": "Matemática e escritora." },
  "avatar": "/avatar.jpg",
  "siteUrl": "https://links.example.com",
  "repoUrl": "https://github.com/ada/links",
  "author": { "name": "ada", "url": "https://github.com/ada" }
}
```

| Field | Required | What it does |
|---|---|---|
| `name` | yes | The heading, the page title ("Ada Lovelace · Links") and the preview image. Up to 60 characters. |
| `handle` | yes | Shown as `/ada` in the top bar. Letters, digits, `.`, `-`, `_`, up to 30. |
| `bio` | yes | One or two lines under your name. Up to 160 characters. |
| `avatar` | no | A square photo in `public/` (480 × 480 is plenty). Without it, your initials are shown. |
| `siteUrl` | yes | The address the page will live at, with no path or trailing slash. Used for canonical URLs, share links and the link-preview image, so set it to your real domain before you deploy. |
| `repoUrl` | no | Adds "see the code" to the footer. |
| `author` | no | Adds "Built by *name*" to the footer, linking to `url`. Remove it, or put your own name in it. |

### `socials`

The round icons under the bio:

```json
"socials": [
  { "type": "github", "url": "https://github.com/ada" },
  { "type": "email", "url": "mailto:ada@example.com" }
]
```

`type` is one of `github`, `linkedin`, `email`, `x`, `instagram`, `youtube`, `whatsapp`. `email` needs a `mailto:` URL; the others need `https://`. Use `[]` for none.

### `blocks`

The page itself, top to bottom. There are three kinds:

```json
"blocks": [
  { "type": "link", "title": "Portfolio", "url": "https://example.com", "icon": "globe", "highlight": true },
  { "type": "header", "title": "Projects" },
  {
    "type": "featured",
    "title": "My big project",
    "subtitle": "What it is, in one line",
    "url": "https://example.com/project",
    "image": "/thumbs/project.webp",
    "badge": "New"
  },
  { "type": "link", "title": "Side project", "url": "https://example.com/side", "image": "/thumbs/side.png" },
  { "type": "link", "title": "My CV", "url": "/cv.pdf", "icon": "file-text" },
  { "type": "link", "title": "Old thing", "url": "https://example.com/old", "hidden": true }
]
```

- **`link`** is a card. It can have an `icon` or an `image` (a 48 × 48 thumbnail; give it a square file of about 96 × 96), not both. `highlight: true` makes it a dark card; use it for the one link that matters most.
- **`header`** starts a new section with a heading.
- **`featured`** is a large card with an image (about 800 × 400) and an optional `subtitle` and `badge`. At most one per page.
- **`hidden: true`** keeps a block in the file but off the page. A heading whose section ends up empty is hidden too.

**URLs** must be `https://`, `mailto:` or a path on your own site (`/cv.pdf`, which serves `public/cv.pdf`). `http:`, `javascript:` and `data:` are rejected on purpose.

**Icons:** `github`, `linkedin`, `x`, `instagram`, `youtube`, `whatsapp`, `mail`, `globe`, `briefcase`, `file-text`, `gamepad`, `calendar`, `code`, `rocket`, `book`, `link`, `wallet`, `sparkles`. To add one, see [Adding an icon](#adding-an-icon).

**Limits:** titles up to 80 characters, subtitles 120, badges 20. Unknown keys are an error, so a misspelt key never disappears silently.

The full rules are in `src/lib/schema.ts`; the tests in `tests/lib/schema.test.ts` show valid and invalid examples.

## 3. Add your images

Put images in `public/` and reference them from the root: `public/avatar.jpg` becomes `"/avatar.jpg"`. Allowed formats: `.png`, `.jpg`, `.jpeg`, `.webp`, `.avif`, `.svg`. The build fails if a referenced file is missing.

- Keep files small (the whole page is meant to load fast on a phone). WebP is a good default; an animated WebP works for the featured card.
- Delete the images of the original owner that you don't use (`public/avatar.jpg`, `public/thumbs/*`).
- **Don't put `public/` in Git LFS.** Vercel clones without LFS, so the site would get text pointers instead of images. `.gitattributes` already excludes `public/`, and the build stops with a clear message if it finds a pointer.

## 4. Languages

The page is in **English at `/`** and **Brazilian Portuguese at `/pt/`**, with a switch in the top bar.

- Any `bio`, `title`, `subtitle`, `badge` or `url` can be a plain string (used in both languages) or `{ "en": "…", "pt": "…" }` (both keys required). `name`, `handle`, socials and images are the same in both.
- If you only write plain strings, both pages show the same content; the interface text (share dialog, labels, footer) is still translated.
- Interface text lives in `src/content/strings.ts`, one dictionary per language.
- Changing or removing a language is a code change: the list is in `src/lib/i18n.ts`, and each language has a route folder in `src/app/` (`(en)` and `(pt)/pt`).

## 5. Look and feel (optional)

Colours, corner radii, fonts and motion are CSS custom properties in `src/app/tokens.css`. Components only use these tokens, so changing a value there restyles the whole page. Three places repeat the background colour for things CSS can't reach: `themeColor` in `src/app/_shared/locale-layout.tsx` and `BG` in `src/app/_shared/og-image.tsx` (the link-preview image). Update them together.

`tests/app/tokens.test.ts` checks text contrast (4.5:1) for every colour pairing. If you pick colours that are too light, the test tells you which pair fails.

Fonts are self-hosted through `next/font` in `src/app/fonts.ts`.

### Adding an icon

Interface icons come from [Lucide](https://lucide.dev); brand logos are local SVGs in `src/components/icons/brand.tsx`. Add the name to `ICON_NAMES` in `src/lib/schema.ts` and map it in the icon component (`src/components/icons/icon.tsx`). The type checker shows anything you missed.

## 6. Analytics (optional)

The page includes [Vercel Web Analytics](https://vercel.com/docs/analytics) (`<Analytics />` in `src/app/_shared/locale-layout.tsx`). It's cookieless and loads its script from your own domain (`/_vercel/insights/`), so the Content Security Policy needs no changes.

- **To use it:** deploy on Vercel, then open your project → **Analytics** → **Enable**.
- **To skip it:** leave it disabled; the script request then gets a harmless 404. To remove it completely, delete the `<Analytics />` line and its import, then run `npm uninstall @vercel/analytics`.
- On other hosts it does nothing.

## 7. Check and deploy

```sh
npm run check        # lint, types, unit tests, build, size budget
npm run build && npm run preview     # the real static build on http://127.0.0.1:4180
```

**Heads-up about the tests:** a few tests check the original owner's content, not just the format. `tests/lib/content.test.ts` checks `siteUrl`, and the end-to-end tests in `tests/e2e/` check the name, page title, section names, share URLs and some link targets. After you replace the content, update the expected values in those files (search them for the old name and domain), or delete the assertions you don't need.

Then follow [`DEPLOY.md`](DEPLOY.md) to put it online. After that, editing `content/links.json` on GitHub and committing is enough: CI validates it and Vercel redeploys.

## 8. Clean up what isn't yours

These files document how the original page was planned and built. They're fine to keep as reference, but you'll probably want to delete or rewrite them:

- `PLAN.md`, `ROADMAP.md`, `LINKS.md`, `TODO_FOR_YOU.md`: the original design notes, task list and to-do list.
- `CLAUDE.md`: rules for the AI assistant used to build it.
- `design/`: mockups and captures of the original page.
- `LICENSE`: MIT. Keep the original copyright line and add yours if you redistribute the code.
