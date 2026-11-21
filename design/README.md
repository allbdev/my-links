# Design

Source files of the design canvas **"Links — Vinícius (clone do Linktree)"**: https://claude.ai/artifact/TvGyvKmYvhYzxHkrz5qgR3. Reference only, not used in the site. The canvas serves these files under `project/`.

The canvas, these files, `PLAN.md` and the site are kept in sync both ways (see `CLAUDE.md`).

The page **"Site real"** shows captures of the built site, made by `npm run designs` (`tools/designs/capture.ts`) and uploaded to the canvas as images. The page **"Mockups desenhados"** keeps the original hand-drawn boards (placeholder photo, URLs and links), which remain the reference for structure and look.

| File | Canvas page | Board | What it shows |
|---|---|---|---|
| `canvas.json` | — | — | Canvas index: pages, board positions, sizes and order |
| `SitePage.dc.html` + `01-Page.jpg` | Site real | Perfil · mobile (site real) | The built page at 390 px, full height |
| `SiteShare.dc.html` + `02-Share.jpg` | Site real | Modal de compartilhar (site real) | The share dialog open on a link |
| `Main.dc.html` | Mockups desenhados | Perfil · mobile (interativo) | The drawn page: top bar, profile, links, sections, featured card, footer. Interactive: the share buttons open the modal |
| `Share.dc.html` | Mockups desenhados | Modal de compartilhar aberto | The drawn page with the share modal forced open (imports `Main`) |

## Refreshing the captures

```sh
npm run build && npm run preview          # in one terminal
npm run designs -- --out=design           # in another: rewrites 01-Page.jpg and 02-Share.jpg
```

Then upload both JPGs as canvas assets and point the `<img>` in `SitePage.dc.html` and `SiteShare.dc.html` at the new `/_blob/` ids (and update the board heights in `canvas.json` if the page got taller).
