# What I need from you

> Things only you can do (decisions, content, accounts). Claude keeps this list current while working; newest items at the top of each section.
> Last updated: 20 Nov 2026. The first version is built and pushed: the page, the share dialog, link previews, security headers, tests and CI, all green. What's left needs you: Vercel and DNS, your photo, and a look at it.

## To do now

- [ ] **Connect Vercel and the domain.** Import `allbdev/my-links` on Vercel and point `links.vinicius-albuquerque.com.br` at it from Cloudflare (CNAME `links` → the value Vercel shows, **DNS only**). Step by step in [`docs/DEPLOY.md`](docs/DEPLOY.md), about 10 minutes. (Roadmap task 38)
- [ ] **Look at it.** `npm install && npm run build && npm run preview`, then open http://127.0.0.1:4180 (or the Vercel URL once it's up). Tell me what to change.

## Content

- [ ] **Photo.** Replace the placeholder `public/avatar.svg` with a square photo, at least 400 × 400 px, saved as `public/avatar.jpg` (or `.webp`), and set `"avatar": "/avatar.jpg"` in `content/links.json`. A JPEG or PNG also shows up in the link-preview image (an SVG or WebP shows your initials there instead). (Roadmap task 35)
- [ ] **Featured image.** Path Trader's card uses a drawn placeholder (`public/thumbs/path-trader.svg`). A real screenshot, about 800 × 400, as WebP, would look better: save it in `public/thumbs/` and change `image` in `content/links.json`.
- [ ] **Link list.** Filled from your site's `llms.txt`: Portfólio (highlighted) · Currículo · GitHub · LinkedIn · Projetos (Path Trader featured, The Single Hole, Cartório Simulator, Tavi, Vestra) · Contato (e-mail). Change titles, order or sections in `content/links.json`; the build tells you if anything is wrong.
- [ ] **Bio.** Written from your site: "Engenheiro full-stack sênior. Co-fundador técnico da Path Trader e, nas horas vagas, jogos de navegador. Vila Velha, Brasil." Change it in `content/links.json` (at most 160 characters).

## Decisions (quick)

- [ ] **Page language.** Built in PT-BR only, as in the mockups. Alternative: English by default with a PT-BR toggle, like Cartório Simulator (recruiters abroad). All interface text is in `src/content/strings.ts`, so switching is a small task. (`PLAN.md` D5)
- [ ] **Styling.** Built with CSS Modules + tokens as CSS custom properties. Tell me if you'd rather have Tailwind. (`PLAN.md` §9)
- [x] ~~**E-mail on the page.**~~ Yes, the address from your site (20 Nov 2026). E-mail links have no share button (a `mailto:` means nothing to whoever you'd share it with).
- [x] ~~**Hosting and domain.**~~ Vercel at `links.vinicius-albuquerque.com.br`, DNS on Cloudflare (20 Nov 2026).
- [x] ~~**Repo name and owner.**~~ `allbdev/my-links` (20 Nov 2026).

## Design canvas

- [ ] **Look at the canvas** (https://claude.ai/artifact/TvGyvKmYvhYzxHkrz5qgR3). It now opens on a "Site real" page with captures of the built site; your drawn mockups are on "Mockups desenhados". Small differences from the drawings: after copying, "Copiado!" and its icon turn green (`#1A7A43`); the highlighted card (Portfólio) is dark with a blue icon tile; e-mail links have no ⋮ button.

## After launch (needs you)

- [ ] **Put the link in your bios:** GitHub profile, LinkedIn, CV, portfolio. (Roadmap task 40)
- [ ] **Phone check:** open the link from Instagram's and LinkedIn's in-app browsers (they handle `navigator.share` and new tabs differently) and from WhatsApp.
- [ ] **Preview check:** paste the link in WhatsApp, LinkedIn and X and confirm the preview card looks right (https://www.opengraph.xyz shows it too).
- [ ] **Headers check:** https://securityheaders.com on the live URL.
