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

| Metric | Run A (Day 41 code, build mode unknown) | Run B (final project, `build` + `start`) | 
|---|---|---|---|
| Performance | 70 | 76 | 86 |
| FCP | 0.8 s | 0.8 s | 1.7|
| LCP | 3.1 s (hero image was broken) | 1.7 s (real hero photo)
| TBT (lab stand-in for INP) | 2,580 ms | 980 ms|
| CLS | 0 | 0 | TODO |
| Speed Index | 3.5 s | 1.9 s | TODO |
| Accessibility / Best Practices / SEO | 95 / 96 / 100 | 100/ 100 / 100 |

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
