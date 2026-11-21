# What I need from you

> Things only you can do (decisions, content, accounts). Claude keeps this list current while working; newest items at the top of each section.
> Last updated: 20 Nov 2026.

## To do now

- [ ] **Connect Vercel and the domain.** Import `allbdev/my-links` on Vercel and point `links.vinicius-albuquerque.com.br` at it from Cloudflare. Step by step in [`docs/DEPLOY.md`](docs/DEPLOY.md) (about 10 minutes). (Roadmap task 38)

## Decisions (quick)

- [ ] **Page language.** Default: PT-BR only, as in the mockups. Alternative: English by default with a PT-BR toggle, like Cartório Simulator (recruiters abroad). Interface text is in one file either way, so switching later is cheap. (`PLAN.md` D5)
- [ ] **Styling.** Built with CSS Modules + tokens as CSS custom properties. Tell me if you'd rather have Tailwind. (`PLAN.md` §9)
- [x] ~~**E-mail on the page.**~~ Yes, the address from your site (20 Nov 2026).
- [x] ~~**Hosting and domain.**~~ Vercel at `links.vinicius-albuquerque.com.br`, DNS on Cloudflare (20 Nov 2026).
- [x] ~~**Repo name and owner.**~~ `allbdev/my-links` (20 Nov 2026).

## Content

- [ ] **Photo.** Replace `public/avatar.svg` (a placeholder with your initials) with a square photo, at least 400 × 400 px, e.g. `public/avatar.jpg`, and change `profile.avatar` in `content/links.json` to match.
- [ ] **Link list.** Filled from your site's `llms.txt`: Portfólio · Currículo · GitHub · LinkedIn · Projetos (Path Trader featured, The Single Hole, Cartório Simulator, Tavi, Vestra) · Contato (e-mail, LinkedIn). Change titles, order or sections in `content/links.json`.
- [ ] **Featured image.** Path Trader's card uses a drawn placeholder (`public/thumbs/path-trader.svg`). A real screenshot (about 800 × 400, WebP) would look better.

## Design canvas

- [ ] **Look at the canvas** (https://claude.ai/artifact/TvGyvKmYvhYzxHkrz5qgR3) and change anything you want; I re-read the boards before each UI task.

## Checks (needs you)

- [ ] **Phone check after launch:** open the link from Instagram's and LinkedIn's in-app browsers (they handle `navigator.share` and new tabs differently) and from WhatsApp.
- [ ] **Preview check:** paste the link in WhatsApp, LinkedIn and X and confirm the preview card looks right.
