# Deploy: Vercel + Cloudflare DNS

How `https://links.vinicius-albuquerque.com.br` is served: **Vercel** builds and hosts the static site from GitHub; **Cloudflare** only holds the DNS record that points the subdomain at Vercel. Vercel issues the HTTPS certificate.

```
visitor ──► Cloudflare DNS (CNAME links → Vercel, DNS only) ──► Vercel edge ──► out/ (static files)
GitHub push to main ──► Vercel build (npm run build) ──► production
GitHub pull request ──► Vercel preview URL        GitHub Actions ──► check + e2e (no deploy)
```

Time: about 10 minutes, plus DNS propagation (usually under 5 minutes on Cloudflare).

---

## 1. Create the Vercel project

1. Go to https://vercel.com/new and sign in with GitHub.
2. **Import Git Repository** → pick `allbdev/my-links`. If it isn't listed, click **Adjust GitHub App Permissions** and give Vercel access to the repo.
3. Settings on the import screen:
   - **Framework Preset:** Next.js (detected).
   - **Root Directory:** `./`
   - **Build Command:** leave the default (`npm run build`). **Output Directory:** leave the default. Vercel sees `output: "export"` in `next.config.ts` and serves `out/`.
   - **Node.js version:** 22.x (Project → Settings → Build and Deployment, after the first deploy, if it isn't already).
   - **Environment variables:** none needed.
4. Click **Deploy**. When it's done you get a `*.vercel.app` URL. Open it and check the page.

From now on every push to `main` deploys to production and every pull request gets a preview URL.

## 2. Add the domain on Vercel

1. Project → **Settings** → **Domains** → **Add Domain**.
2. Type `links.vinicius-albuquerque.com.br` and confirm. Choose **Connect to an environment: Production**. Don't add the redirect from `www` (it doesn't apply to a subdomain).
3. Vercel shows **Invalid Configuration** and the record it wants, something like:

   | Type | Name | Value |
   |---|---|---|
   | CNAME | `links` | `cname.vercel-dns.com` (or a project-specific value such as `abc123.vercel-dns-017.com`) |

   **Copy the exact value Vercel shows**; newer projects get a project-specific target.
4. If Vercel also asks for a **TXT** record named `_vercel` (it does when the domain was used in another Vercel account), copy that too.

## 3. Add the record on Cloudflare

1. https://dash.cloudflare.com → the `vinicius-albuquerque.com.br` zone → **DNS** → **Records** → **Add record**.
2. Fill in:

   | Field | Value |
   |---|---|
   | Type | `CNAME` |
   | Name | `links` |
   | Target | the value from Vercel (step 2.3) |
   | Proxy status | **DNS only** (grey cloud) |
   | TTL | Auto |

3. **Save.** If Vercel asked for the `_vercel` TXT record, add it the same way (Type `TXT`, Name `_vercel`, Content the value Vercel showed).

### Why "DNS only" (grey cloud)

Vercel is already a CDN and issues its own certificate. With Cloudflare's proxy on (orange cloud):
- Vercel can't complete the certificate challenge, so the domain may stay at "Invalid Configuration" or show certificate errors.
- With Cloudflare's SSL mode on **Flexible**, the site loops with **"too many redirects"**.
- Two CDNs cache the same files, and Vercel's analytics and preview logic see Cloudflare's IPs instead of visitors'.

If you ever want the proxy on anyway, set **SSL/TLS → Overview → Full (strict)** for the zone first, and expect to toggle the proxy off when Vercel renews the certificate.

### CAA records

If the zone has **CAA** records (DNS → Records, filter by CAA), certificates are only issued by the authorities they list. Vercel uses Let's Encrypt, so add:

| Type | Name | Tag | CA domain |
|---|---|---|---|
| CAA | `links` (or `@` for the whole zone) | Only allow issuance (`issue`) | `letsencrypt.org` |

If there are no CAA records at all, skip this; any authority may issue.

## 4. Check it

Back on Vercel → Settings → Domains, the domain turns to **Valid Configuration** and the certificate is issued within a minute or two. From a terminal:

```sh
dig +short links.vinicius-albuquerque.com.br CNAME   # → the Vercel target
curl -sI https://links.vinicius-albuquerque.com.br | head -n 20   # → HTTP/2 200, server: Vercel, plus the headers from vercel.json
```

Then:
- Open the page on a phone, open the share modal, copy the link.
- Paste the URL into https://www.opengraph.xyz (or into WhatsApp/LinkedIn) to check the preview card.
- Check the security headers at https://securityheaders.com.

## 5. Afterwards

- **`siteUrl`** in `content/links.json` must be `https://links.vinicius-albuquerque.com.br`. It's used for canonical URLs, share links and the Open Graph image, so preview deployments still share the production URL (on purpose).
- **Headers** (CSP, HSTS, `Referrer-Policy`, `X-Content-Type-Options`, `Permissions-Policy`, `X-Frame-Options`, `Cross-Origin-Opener-Policy`) are in `vercel.json`. Next's `headers()` doesn't apply to a static export. `npm run preview` applies the same file, and the e2e tests load the page under that CSP, so a header change that breaks the page fails CI. `script-src` allows `'unsafe-inline'` because the static export inlines Next's bootstrap scripts; nothing on the page comes from visitors.
- **Production branch** is `main` (Settings → Git). Leave **Vercel Authentication** on for previews if you don't want preview URLs public (Settings → Deployment Protection); production stays public.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| "Invalid Configuration" for more than 10 minutes | Wrong target, or proxied | Compare the CNAME target with Vercel's; set the record to **DNS only** |
| "Too many redirects" | Cloudflare proxy on with SSL mode Flexible | Grey cloud, or SSL mode **Full (strict)** |
| Certificate error / not issued | CAA records without `letsencrypt.org`, or proxied | Add the CAA record above; grey cloud |
| 404 on every path but `/` | Output directory overridden | Remove any Output Directory override in Vercel; redeploy |
| Build fails on Vercel only | Node version | Set Node.js 22.x in Build and Deployment settings |
| Build fails with a `links.json` error | Invalid content (that's the point) | Read the message: it names the field; fix the JSON and push |
| Build fails with "Invalid JPEG", or images are broken on the live site | An image in `public/` was committed through Git LFS; Vercel clones without LFS and gets a text pointer | Keep `public/` out of LFS (`.gitattributes` already does; `git add --renormalize public`). The build names the file: "… is a Git LFS pointer, not the file" |
| Vercel's comment toolbar doesn't load on previews | The CSP in `vercel.json` only allows this site's own scripts | Expected; turn the toolbar off (Settings → General → Vercel Toolbar) or ignore it |
