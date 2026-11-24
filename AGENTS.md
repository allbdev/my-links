# AGENTS.md — helping someone make this page their own

> **First, check where you are.** Run `git remote get-url origin`. If it is `https://github.com/allbdev/my-links` (or its `.git`/SSH form), this is the original maintainer's repo: **don't follow this file** (it deletes their content); follow `CLAUDE.md` instead.

You are an AI coding assistant, and the person you're helping wants **their own** link-in-bio page from this repo. They may never have written code. This file is your playbook. `CLAUDE.md` is the original maintainer's working notes: if this checkout isn't `allbdev/my-links` itself (check `git remote get-url origin`), **ignore `CLAUDE.md`** and follow this file plus `docs/CONFIGURE.md` and `docs/DEPLOY.md`.

## Ground rules

- **No code changes are needed** for a normal setup. Everything a visitor sees comes from `content/links.json` and the images in `public/`. Change code only if the person asks for something the file can't do (another colour scheme, one language only, a new icon).
- **Explain in plain words.** Say what you're about to do and why, one short sentence per step. Don't make them read JSON unless they want to.
- **Never invent their content.** Ask for it. Placeholder text on a live page is worse than no page.
- **Some steps only they can do** (see below). Say clearly when it's their turn and what to click.
- The build validates `links.json`. When it fails, the message names the field (`blocks[2].url: must be an https:// URL, …`): fix it and run again.

## 1. Ask first, all in one message

Before touching anything, ask for:

1. **Name** (up to 60 characters) and a **handle** for the top bar (`/ada`: letters, digits, `.`, `-`, `_`).
2. A **bio** of one or two lines (up to 160 characters).
3. A **photo** (square works best). Without one, their initials are shown.
4. **Social profiles**: any of GitHub, LinkedIn, X, Instagram, YouTube, WhatsApp, e-mail.
5. **Links**, top to bottom, each with a title. Optional: section headings, one link to highlight, one "featured" project with a wide image.
6. **Languages**: the page has English at `/` and Brazilian Portuguese at `/pt/`. Do they want Portuguese texts too, the same text on both, or English only? (See `docs/CONFIGURE.md` §4. "Same text on both" needs no code; "English only" is a code change.)
7. **Address**: a free `something.vercel.app` address, or a domain they own (and where its DNS is managed).

## 2. Clean up the previous owner

The repo ships with the original owner's real page. Do this before adding anything:

- Delete the maintainer's notes: `CLAUDE.md`, `PLAN.md`, `ROADMAP.md`, `LINKS.md`, `TODO_FOR_YOU.md` and the `design/` folder. (Delete this `AGENTS.md` last, or keep it if they'll keep using an assistant.)
- Delete `public/avatar.jpg` and everything in `public/thumbs/`. An empty or missing `public/` is fine.
- Rewrite `content/links.json` with their content. Point `profile.author` and `profile.repoUrl` at the person, or remove them (with both gone, the page has no footer).
- `NOTICE.md`: delete the "Project icons" section (it describes the thumbnails you just deleted).
- `README.md`: it describes the original page. Delete the screenshot (`design/01-Page.jpg`), the "Heads-up: the person on this page is real" note, the "How the original page was built" section and the sentence about Git LFS and `design/`; replace the "Live example" line with their address once it's live. Or offer to rewrite it as a short README about their page.
- `tools/designs/` and the `designs` script capture the deleted design boards. They're harmless; leave them.

## 3. Build it locally

Check the tools: `node --version` (needs 22 or newer), `npm --version`, `git --version`. If Node is missing, help them install it from https://nodejs.org (the LTS installer) or with their package manager, then:

```sh
npm install
npm run dev        # http://localhost:3000: show them the page
npm run check      # lint, types, tests, build, size budget: must pass
```

The tests read their expected values from `content/links.json`, so they pass with the new content; checks for things the page doesn't have (no socials, no thumbnails) are skipped, so the unit tests simply pass and some end-to-end tests report as skipped. If a test fails after a content-only change, read the message: it's usually a broken link or a missing image.

## 4. Their turn: accounts

You can't create accounts or sign in for them. Walk them through, one at a time:

1. **GitHub account** (https://github.com/signup), then a repository for the page. If the GitHub CLI is installed, they can run `gh auth login` and you can create the repo and push for them. Otherwise, give them the clicks.
2. **Vercel account** (https://vercel.com/signup, "Continue with GitHub"), then import the repo: `docs/DEPLOY.md` §1. No settings to change.
3. **Custom domain** (optional): `docs/DEPLOY.md` §2–4. They copy one DNS record from Vercel into their DNS provider.

Vercel deploys the `main` branch to production. Make sure their work is committed on `main` (`git branch --show-current`) before the first push; anything else only gets a preview URL.

Before deploying, set `profile.siteUrl` to the final address (the `*.vercel.app` one if they have no domain).

## 5. Afterwards

Tell them how to change things later: edit `content/links.json` (on GitHub's website is fine), commit, and Vercel redeploys within a minute. If the file has a mistake, the deploy fails and the old page stays up.
