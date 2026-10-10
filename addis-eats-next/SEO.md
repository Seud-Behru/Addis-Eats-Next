# SEO.md — Day 44: Make Addis Eats findable

Set `NEXT_PUBLIC_SITE_URL` (see `.env.example`) to the deployed address before
building. Everything absolute (canonical, og:image, sitemap, robots, JSON-LD)
is built from it via `lib/site.js`.

## What was added

| Requirement | Where |
|---|---|
| `metadataBase`, title template, default title + description | `app/layout.js` |
| Own title + human description per static route | `app/page.js`, `menu/page.js`, `cart`, `checkout`, `signin`, `orders`, `orders/[id]`, `kitchen` |
| `generateMetadata` for dishes (name, price, summary from data) | `app/menu/[id]/page.js`, `lib/seo.js` |
| Site-wide OG image + one per dish (`ImageResponse`, 1200x630) | `app/opengraph-image.jsx`, `app/menu/[id]/opengraph-image.jsx` |
| `MenuItem` JSON-LD from the dish object the page renders | `lib/seo.js` -> `menu/[id]/page.js` |
| Sitemap from real records, private routes excluded | `app/sitemap.js` |
| robots excluding /cart and /checkout (+ other private routes) | `app/robots.js`, `lib/site.js` |

## Checked against the production server's page source (`next build && next start`)

- `/` `<title>` = site default; `/menu` = `Menu | Addis Eats`; dish = `Authentic Doro Wat | Addis Eats`.
- Dish page: description `Authentic Doro Wat — 850 ETB. Free-range chicken…`, canonical, `og:image`
  `…/menu/doro-wat/opengraph-image?<hash>` (1200x630), `twitter:card=summary_large_image`.
- `<script type="application/ld+json">` on the dish page parses as valid JSON: `MenuItem`,
  name/description/image match the page, `Offer` 850 ETB.
- `/cart`, `/signin` (and the other private pages) carry `noindex, nofollow`.
- `/robots.txt` disallows /cart /checkout /orders /kitchen /signin /api/ and points to the sitemap.
- `/sitemap.xml` lists `/`, `/menu` and the 6 dishes — none of the private routes.
- Both OG images are real 1200x630 PNGs (looked at them).

## Still to do on the real deployment

I checked a local production build, not your deployed site (I have no access to it).
After deploying: `curl -s https://YOUR-SITE/menu/doro-wat | grep -E "<title>|og:|ld\+json"`, then paste a dish URL
into Google's Rich Results Test and a social-card debugger.

## Notes

- `aggregateRating` is left out of the JSON-LD: schema.org doesn't allow it on `MenuItem`.
- OG images are text cards (name, category, rating, price); they don't embed the dish photo, so a slow third-party image host can't break the build.
- robots.txt blocks crawling, not indexing by itself, so private pages also set `noindex`.
- Sitemap has no `lastModified`: the data has no timestamps and inventing one would be misleading.

## Update after Day 44 re-base
- Dish photos are now local (`/images/...`). `lib/seo.js` turns them into absolute URLs for the JSON-LD `image`.
- File names: `derk-tibs.jpg`, `doro-wate.jpg`, `cofee.jpg`, `braised-lamp.avif` look like typos; consider renaming
  (and updating `data/menu-data.json`). `Pizza.jpg` has a capital P, so the data must use that exact case.

## Link previews show no image? (Telegram, WhatsApp, X)
The `og:image` address is built from the site URL (`lib/site.js`). Order of preference:
`NEXT_PUBLIC_SITE_URL`, then Vercel's `VERCEL_PROJECT_PRODUCTION_URL`, then `VERCEL_URL`, then localhost.
On Vercel a localhost or example.com value is ignored. After deploying, run
`curl -s https://YOUR-SITE/menu/doro-wat | grep og:image`: the address must be your real domain.
Previews are cached by the chat app: refresh with the @WebpageBot bot in Telegram.
