# PERF.md — Day 43: Make Addis Eats fast

> **Status: code changes done and build-verified. The Lighthouse numbers below
> are NOT filled in yet** — they have to be measured on your machine with Chrome.
> Run the "How to measure" steps, then replace every `TODO` cell.
> Please do not guess these numbers; the deliverable is a *measured* before/after.

## How to measure (do it the same way twice)

1. `npm run build && npm start` — always a **production** build, never `next dev`.
2. Open `http://localhost:3000/` in an **Incognito** window (no extensions).
3. DevTools → **Lighthouse** → Mode: Navigation, Device: **Mobile**,
   Throttling: default **Simulated** (Slow 4G + 4x CPU). Categories: Performance.
4. Run **3 times** and record the **median** of each metric.
5. Repeat on `/menu`.
6. INP is a field metric; Lighthouse's lab stand-in is **TBT**. Record TBT, and
   if you want a real INP, use DevTools → Performance → "Interactions" while
   clicking "+ Add" / typing in search.

Do the **BEFORE** run on the Day_42 code (unzip `Day_42.zip`, `npm ci`, build,
measure), then the **AFTER** run on this folder.

## Measured results — `/` (home), Mobile, Slow 4G, Moto G Power, Lighthouse 13.4.1

Measured by the developer on their own machine. Run A had no build mode recorded
and a broken hero image, so it is **not a clean "before"**. Run B is a production
build in Incognito, with two Lighthouse warnings (first-visit image optimization
made the page load slowly; IndexedDB data present).

| Metric | Run A (Day 41 code, build mode unknown) | Run B (Day 43, `build` + `start`) | Day 44 fixes (re-measure) |
|---|---|---|---|
| Performance | 70 | 76 | TODO |
| FCP | 0.8 s | 0.8 s | TODO |
| LCP | 1.3 s (hero image was broken, so this was text) | 3.1 s (real hero photo) | TODO |
| TBT (lab stand-in for INP) | 2,580 ms | 720 ms | TODO |
| CLS | 0 | 0 | TODO |
| Speed Index | 3.5 s | 1.9 s | TODO |
| Accessibility / Best Practices / SEO | 95 / 96 / 100 | 95 / 96 / 100 | TODO |

To get a proper before/after, run the same procedure on the Day_42 zip. Warm the
image cache first (load every page once), then take the median of 3 runs.

## Problems found in Run B, and what Day 44 changed

| Lighthouse finding | Cause found in the code | Fix |
|---|---|---|
| Best Practices: browser errors in console | `MenuProvider` fetched `/menu-data.json`, which is not in `public/` (404 on every page). Dish images in the data were `./images/x.jpg` (relative paths `next/image` rejects, 400) and two names did not match the files (`derek-tibs` vs `derk-tibs.jpg`, `pizza.jpg` vs `Pizza.jpg`, which also breaks on case-sensitive hosts). The placeholder GA id made the browser load a useless gtag script. | New `app/api/menu/route.js`; `MenuProvider` uses it. Data paths are now `/images/<exact filename>`. `Analytics.jsx` ignores empty/placeholder ids; `.env.example` has `NEXT_PUBLIC_GA_ID=` empty. |
| Accessibility: contrast | White on orange buttons was 3.8:1 (2.95:1 in dark mode); orange small text 3.5:1; muted text on `surface` 4.49:1. | New tokens in `globals.css`: `terracotta` `#b0451e`, `cta`, `terracotta-bright` (for text on dark green), `muted` `#5f615c`. All now 4.7:1 or more by calculation. Filled buttons use `bg-cta`. |
| LCP request discovery | Hero was preloaded and eager, but had no `fetchpriority="high"`. | `fetchPriority="high"` on the hero `<Image>`; now on both the `<link rel=preload>` and the `<img>`. |
| TBT / main-thread work / unused JS | The fake GA id still downloaded and ran gtag.js. | Removed with the Analytics guard. The rest of the blocking time (hydration, providers) is **not** profiled yet. |
| Non-composited animations / light-to-dark flash | Theme was applied only after React hydrated, so dark-mode users saw light first and `html, body` colour transitions ran at load. | Tiny inline script in `<head>` applies the saved theme before first paint (`layout.js`, `suppressHydrationWarning` on `<html>`). |

Verified in a local production build: 10 pages and 237 referenced assets all
return 200; `/api/menu` returns the 6 dishes; the hero is served as a 17 KB AVIF.
Not verified: Lighthouse itself (no browser in my environment), so every number
in the "Day 44 fixes" column above is still TODO.

## What changed, and why it should move each number

| # | Change | Files | Targets |
|---|---|---|---|
| 1 | **Every `<img>` → `next/image`** with real `width`/`height` and an honest `sizes`. Browser reserves the box before the file arrives, and downloads a right-sized AVIF/WebP instead of the full original. | `Hero.jsx`, `DishCard.jsx`, `menu/[id]/page.js`, `CartView.jsx`, `SearchBox.jsx`, `next.config.mjs` (`remotePatterns`) | CLS, LCP, bytes |
| 2 | **`preload` on the hero image only** (the one largest above-the-fold image). `priority` was deprecated in Next 16 in favour of `preload`; it does the same job (`<link rel="preload" as="image">` in `<head>`, eager load). Nothing else is preloaded. | `Hero.jsx` | LCP |
| 3 | **Hero served from the build, not `./heroimage.svg`.** The old path pointed at a file that isn't in `public/`, and the original SVG was a 90 KB wrapper around a base64 JPEG. Now `app/assets/hero.jpg` (same photo, 448×560) is statically imported, so Next knows its real size and generates a blur placeholder. | `Hero.jsx`, `app/assets/hero.jpg` | LCP, CLS |
| 4 | **Google Fonts `@import` → `next/font/local`.** Removes the render-blocking CSS request to `fonts.googleapis.com` and the second connection to `fonts.gstatic.com`. Fonts are served from our origin, preloaded, `font-display: swap`, with a **size-adjusted fallback** so the swap doesn't shift layout. | `layout.js`, `globals.css`, `app/fonts/*` | LCP, CLS |
| 5 | **Third-party script → `next/script` with `lazyOnload`.** The app had no third-party script, so I added the one a real site needs (GA4) as an opt-in component that renders nothing unless `NEXT_PUBLIC_GA_ID` is set. It loads after the page is idle. | `Analytics.jsx`, `layout.js` | INP/TBT, LCP |
| 6 | **`.env.example` committed, real env files ignored.** `.gitignore` had `.env*`, which also ignored the example; added `!.env.example`. | `.env.example`, `.gitignore` | hygiene |

### Bug fixed on the way
`FeaturedDishes` passed `id`, `name`, … as separate props, but `DishCard`
reads a single `dish` prop (changed in Day 41/42). Home would have crashed on
`dish` being `undefined` once the menu loaded. It now passes `dish={dish}`.

## Verified here (no browser available in my sandbox)

- `npm run build` succeeds; `/`, `/menu`, `/menu/[id]`, `/cart` are still
  static/ISR (nothing became dynamic).
- Home HTML: **0** references to `googleapis`; 2 font preloads (self-hosted);
  exactly **1** image preload (the hero); hero `<img>` has `width="448" height="560"`.
- Dish page `<img>` has `width/height`, `sizes`, a generated `srcSet`, and `loading="lazy"`.
- `git check-ignore`: `.env.local` and `.env.production` are ignored;
  `.env.example` is tracked.
- `npm run lint`: the five `no-img-element` warnings are gone. The 3 remaining
  errors (`set-state-in-effect` x2, an apostrophe in `FeaturedDishes`) were
  already in Day 42 and are untouched.

## Not verified / open items

- **No Lighthouse run** (see the status note at the top).
- Remote dish photos (Unsplash / Google) are fetched and re-encoded by *your*
  server on first request, so the first hit per size is slower; later hits are cached.
- `/menu` shows `BAILOUT_TO_CLIENT_SIDE_RENDERING` in its HTML: `SearchBox`
  calls `useSearchParams` outside a `<Suspense>`, so the whole page renders on
  the client. That's from Day 42, not this change, but it will hurt `/menu` LCP.
  Wrapping `<SearchBox />` in `<Suspense>` is the likely next win — measure
  before/after if you try it.
- Only the home hero has `preload`. On `/menu/[id]` the dish photo is the LCP
  element but is deliberately *not* preloaded, per "one image and nothing else".
