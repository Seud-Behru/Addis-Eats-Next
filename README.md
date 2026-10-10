# Addis Eats

An Ethiopian food-ordering web app for Addis Ababa: browse the menu, search,
add dishes to a cart, sign in, place an order and watch its status update.

It started as a React (Vite) project and is being ported to **Next.js (App
Router)** one day at a time. This folder is the current state of that port.

> Class / learning project. There is **no database**: orders live in memory and
> reset when the server restarts, and the user accounts are hard-coded.

## Features

- **Menu** with category filter, plus a live search backed by `/api/dishes` (paged).
- **Dish pages** pre-built for every dish, each with its own title, description,
  social preview image and `MenuItem` structured data.
- **Cart** kept in the browser (Zustand + localStorage).
- **Sign in** with a signed session cookie, **checkout** and **order history**,
  all protected on several layers (see `AUTH.md`).
- **Live order status** that polls every 5 seconds (see `DATA.md`).
- **Kitchen view** for staff accounts.
- **Light / dark theme** that is applied before first paint, so there is no flash.
- **Fast by default**: `next/image` everywhere, a self-hosted font, one preloaded
  hero image, and an optional, lazily loaded analytics script (see `PERF.md`).
- **Findable**: metadata, Open Graph images, JSON-LD, `sitemap.xml` and
  `robots.txt` (see `SEO.md`).

## Tech stack

| | |
|---|---|
| Framework | Next.js 16 (App Router), React 19 with the React Compiler |
| Styling | Tailwind CSS 4 (design tokens in `app/globals.css`) |
| State | Zustand (cart), React context (theme, favorites, menu) |
| Data fetching | SWR |
| Icons | lucide-react |
| Fonts | Newsreader and Plus Jakarta Sans, self-hosted with `next/font/local` |

## Getting started

Requirements: Node.js 20.9 or newer, and npm.

```bash
npm install
cp .env.example .env.local    # then edit the values (Windows: copy .env.example .env.local)
npm run dev                   # http://localhost:3000
```

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server with hot reload. **Not** for performance testing. |
| `npm run build` | Production build. Prints which routes are static (`○`) or dynamic (`ƒ`). |
| `npm start` | Serves the last production build. Rebuild after every code change. |
| `npm run lint` | ESLint. |

Build and start in one line: `npm run build && npm start`.

### Environment variables

Copy `.env.example` to `.env.local`. `.env.local` is gitignored; `.env.example` is
committed and must only ever hold dummy values.

| Variable | Needed? | Purpose |
|---|---|---|
| `SESSION_SECRET` | Yes in production | Signs the session cookie. Generate one with `openssl rand -base64 32`. If unset, an insecure dev-only secret is used. |
| `NEXT_PUBLIC_SITE_URL` | Yes when deployed | Public address with no trailing slash. Used for canonical URLs, `og:image`, the sitemap and `robots.txt`. Defaults to `http://localhost:3000`. |
| `NEXT_PUBLIC_GA_ID` | Optional | Google Analytics 4 id (like `G-AB12CD34EF`). Leave **empty** to disable analytics; a placeholder id is ignored. |

## Demo accounts

Defined in `lib/users.js`. For local testing only.

| Email | Password | Role |
|---|---|---|
| almaz@addiseats.com | almaz123 | customer |
| bereket@addiseats.com | bereket123 | customer |
| staff@addiseats.com | staff123 | staff (also sees Kitchen) |

## Routes

| Route | Rendering | Notes |
|---|---|---|
| `/` | Static | Hero, categories, featured dishes. |
| `/menu` | ISR, revalidates hourly | Category filter and live search. |
| `/menu/[id]` | Static (one page per dish) | Includes JSON-LD and a generated social image. |
| `/cart` | Static shell, client state | The cart lives in the browser. |
| `/signin` | Dynamic | Sign-in form; the work happens in a server action. |
| `/checkout` | Dynamic, signed-in only | Delivery details and placing the order. |
| `/orders`, `/orders/[id]` | Dynamic, signed-in only | Your orders; status polls every 5 s. |
| `/kitchen` | Dynamic, staff only | Incoming orders. |
| `/api/menu` | Static | Full dish list for the client-side menu context. |
| `/api/dishes` | Dynamic | Search and pagination. |
| `/api/session` | Dynamic | Who is signed in (used by the header). |
| `/api/orders`, `/api/orders/[id]` | Dynamic | Each checks the session itself. |
| `/sitemap.xml`, `/robots.txt` | Static | Generated from the dish data. Private routes are excluded. |

## Project structure

```
app/
  layout.js            root layout: fonts, metadata template, providers, header, footer
  page.js              home
  menu/                menu list and /menu/[id] (+ opengraph-image.jsx per dish)
  cart/ checkout/ signin/ orders/ kitchen/
  api/                 dishes, menu, orders, session
  components/          Header, Hero, DishCard, CartView, SearchBox, Analytics, ...
  actions.js           server actions (sign in, sign out, place order)
  opengraph-image.jsx  site-wide social image
  sitemap.js robots.js
  fonts/ assets/       self-hosted fonts and the hero photo
data/menu-data.json    the six dishes
lib/
  cartStore.js         Zustand cart
  menu.js orders.js    data access (orders are in memory)
  session*.js users.js signed-cookie sessions and demo users
  site.js seo.js       site URL, brand, JSON-LD helpers
  useAuth.js           session state for the header
  context/             theme, favorites and menu providers
middleware.js          guards /checkout and /orders/*
public/images/         dish photos
```

## Documentation in this repo

| File | What it covers |
|---|---|
| `app/STRATAGY.md` | Rendering strategy per route (the file name is spelled that way). Written earlier in the port, so some route names in it are outdated. |
| `app/BOUNDARY.md` | Which components run on the server and which on the client. |
| `AUTH.md` | How `/checkout`, `/orders` and the order APIs are protected, layer by layer. |
| `DATA.md` | The live data fetching with SWR. |
| `PERF.md` | Performance work, Lighthouse results and what is still unmeasured. |
| `SEO.md` | Metadata, social images, structured data, sitemap and robots. |

## Performance and SEO notes

- Always measure with a **production build** in an Incognito window
  (`npm run build && npm start`), never `npm run dev`. Load each page once first so the
  image cache is warm, then take the median of 3 Lighthouse runs.
- Dish photos are in `public/images/` and referenced as `/images/<exact filename>`.
  File names are case-sensitive on Linux hosts (`Pizza.jpg` is not `pizza.jpg`).
- Social preview images are drawn as text cards and do not embed the dish photo, so
  a slow image host can never break the build.

## Known limitations

- Orders are stored in memory and are lost on restart; there is no database.
- Passwords are plain text in `lib/users.js`. Replace this with a real user table and
  password hashing before using it for anything real.
- Sessions are a signed cookie with no server-side store, so they can't be revoked early.
- Some dish photo file names contain typos (`cofee.jpg`, `derk-tibs.jpg`, `doro-wate.jpg`).
- `middleware.js` still works in Next.js 16, but the framework now calls this file
  convention "proxy"; renaming it is a future cleanup.

## Deploying

Any host that runs Next.js works (for example Vercel). Set `SESSION_SECRET` and
`NEXT_PUBLIC_SITE_URL` in the host's environment settings *before* building, because
the site URL is baked into the sitemap and metadata at build time. After deploying,
check the live page source (`curl -s https://YOUR-SITE/menu/doro-wat`) for the title,
`og:image` and JSON-LD.
