# What I need from you

> Things only you can do (decisions, content, accounts). Claude keeps this list current while working; newest items at the top of each section.
> Last updated: 20 Nov 2026. The first version is built and pushed: the page, the share dialog, link previews, security headers, tests and CI, all green. What's left needs you: Vercel and DNS, your photo, and a look at it.

## To do now

- [x] ~~**Turn on Web Analytics in Vercel.**~~ Enabled (23 Nov 2026); page views show under the project's Analytics tab.
- [x] **Connect Vercel and the domain.** Import `allbdev/my-links` on Vercel and point `links.vinicius-albuquerque.com.br` at it from Cloudflare (CNAME `links` → the value Vercel shows, **DNS only**). Step by step in [`docs/DEPLOY.md`](docs/DEPLOY.md), about 10 minutes. (Roadmap task 38)
- [x] **Look at it.** `npm install && npm run build && npm run preview`, then open http://127.0.0.1:4180 (or the Vercel URL once it's up). Tell me what to change.

## Content

- [x] **Check my English.** I translated the bio, link titles, Path Trader's subtitle and badge ("Live"), and the section headings myself. Read `/` and change anything in `content/links.json` (each is `{ "en": …, "pt": … }`).
- [x] **CV in English?** Both languages link the same `cv.pdf`. If you have an English CV, give its URL and I'll make the link per language (like Portfolio, which goes to `/en` or `/pt`).
- [x] ~~**Photo.**~~ Your profile picture, cropped square around your face and resized to 480 × 480 (`public/avatar.jpg`, 24 KB). It also shows in the link-preview images (22 Nov 2026).
- [x] ~~**Featured image.**~~ Path Trader's card now shows your GIF, converted to an animated WebP (`public/thumbs/path-trader.webp`, 63 KB instead of 657 KB, same frames) (22 Nov 2026).
- [ ] **Link list.** Filled from your site's `llms.txt`: Portfólio (highlighted) · Currículo · GitHub · LinkedIn · Projetos (Path Trader featured, Park the Cart, The Single Hole, Cartório Simulator, Tavi, Vestra) · Contato (e-mail). Change titles, order or sections in `content/links.json`; the build tells you if anything is wrong.
- [x] **Bio.** Written from your site: "Engenheiro full-stack sênior. Co-fundador técnico da Path Trader e, nas horas vagas, jogos de navegador. Vila Velha, Brasil." Change it in `content/links.json` (at most 160 characters).

## Decisions (quick)

- [x] ~~**Page language.**~~ English by default at `/`, PT-BR at `/pt/`, with an EN | PT switch (22 Nov 2026). (`PLAN.md` D5)
- [x] **Styling.** Built with CSS Modules + tokens as CSS custom properties. Tell me if you'd rather have Tailwind. (`PLAN.md` §9)
- [x] ~~**E-mail on the page.**~~ Yes, the address from your site (20 Nov 2026). E-mail links have no share button (a `mailto:` means nothing to whoever you'd share it with).
- [x] ~~**Hosting and domain.**~~ Vercel at `links.vinicius-albuquerque.com.br`, DNS on Cloudflare (20 Nov 2026).
- [x] ~~**Repo name and owner.**~~ `allbdev/my-links` (20 Nov 2026).

## Design canvas

- [x] ~~**Refresh the "Site real" captures on the canvas.**~~ Done by Claude with the footer change (23 Nov 2026): new captures uploaded, both boards repointed, the page board is 1636 px tall.
- [x] **Look at the canvas** (https://claude.ai/artifact/TvGyvKmYvhYzxHkrz5qgR3). It now opens on a "Site real" page with captures of the built site; your drawn mockups are on "Mockups desenhados". Small differences from the drawings: after copying, "Copiado!" and its icon turn green (`#1A7A43`); the highlighted card (Portfólio) is dark with a blue icon tile; e-mail links have no ⋮ button.

## After launch (needs you)

- [x] **Put the link in your bios:** GitHub profile, LinkedIn, CV, portfolio. (Roadmap task 40)
- [x] **Phone check:** open the link from Instagram's and LinkedIn's in-app browsers (they handle `navigator.share` and new tabs differently) and from WhatsApp.
- [x] **Preview check:** paste the link in WhatsApp, LinkedIn and X and confirm the preview card looks right (https://www.opengraph.xyz shows it too).
- [x] **Headers check:** https://securityheaders.com on the live URL.
