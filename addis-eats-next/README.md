# Addis Eats — Ethiopian Food Delivery (Next.js App Router)

An Ethiopian food-ordering web application for Addis Ababa: browse authentic Ethiopian classics, artisan pizza, burgers, and drinks; manage a persistent cart and favorites; authenticate with signed HTTP-only cookies; place orders through server actions; track live courier deliveries on an interactive Leaflet map via Server-Sent Events (SSE); and manage orders and menu pricing through a staff and administrator dashboard.

- **Live URL:** [https://addis-eats-next.vercel.app](https://addis-eats-next.vercel.app)
- **Repository:** [https://github.com/Seud-Behru/Addis-Eats-Next](https://github.com/Seud-Behru/Addis-Eats-Next)
- **Currency:** ETB (Ethiopian Birr)
- **Payment Method:** TeleBirr
- **Delivery Hub:** Bole Medhanialem, Kazanchis, Piassa, Sarbet, Addis Ababa
- **Language & Runtime:** Pure JavaScript (Node.js 20.9+ / React 19 / Next.js 16 App Router) — Zero TypeScript

---

## Features

- **Menu & Persistent Layout:** Category sidebar with preserved scroll and filter state across dish navigation (`app/menu/layout.js`).
- **Streaming Suspense:** Asynchronous Server Component streaming the dish catalog behind an instantly rendered sidebar.
- **Incremental Static Regeneration (ISR):** `/menu` regenerates hourly (`revalidate = 3600`) and on-demand upon admin edit.
- **Static Dish Pages:** Generated at build time via `generateStaticParams` with dynamic metadata, OpenGraph preview cards, and `MenuItem` JSON-LD structured data.
- **Private Cart & Favorites:** Client-side state managed with Zustand and React Context, synchronized with `localStorage`.
- **Live Real-Time Tracking & Maps:** Real-time Server-Sent Events (SSE) route handler streaming courier delivery updates, paired with a dynamically loaded Leaflet OpenStreetMap (`ssr: false`) centered on Addis Ababa.
- **Defense-in-Depth Authentication:** Cryptographically signed HMAC session cookies (`httpOnly`, `secure`, `sameSite: lax`) validated by middleware and server actions.
- **Server Actions with `useActionState`:** `placeOrder`, `cancelOrder`, `adminUpdateDish`, `adminUpdateOrderStatus`, and `signIn` with pending state feedback.
- **Admin & Staff Dashboard:** Server-aggregated analytics, responsive visual chart with accessible semantic HTML table, live order updates, and RFC 4180 CSV exports.
- **Zero-Flash Theming:** Dark and light mode applied prior to first paint via an inline `<head>` script.

---

## Tech Stack

| Component | Technology |
|---|---|
| Framework | **Next.js 16 (App Router)** with Turbopack |
| Language | **JavaScript (ES Modules / JSX)** — Strictly no TypeScript |
| Runtime | React 19 with React Compiler |
| Styling | Tailwind CSS 4 with custom design tokens in `globals.css` |
| Client State | Zustand (cart) & React Context (theme, favorites, menu) |
| Client Fetching | SWR (order polling & live search) & Native `EventSource` (SSE) |
| Mapping | Leaflet & OpenStreetMap (`leaflet@1.9.4`) |
| Icons & Typography | Lucide React & self-hosted variable fonts (`next/font/local`) |

---

## Getting Started

### Requirements
- Node.js 20.9 or newer
- npm

### Fresh Clone Installation

```bash
# 1. Clone the repository
git clone https://github.com/Seud-Behru/Addis-Eats-Next.git
cd Addis-Eats-Next

# 2. Install dependencies
npm install --prefix addis-eats-next

# 3. Configure environment variables
copy addis-eats-next\.env.example addis-eats-next\.env.local   # Windows
# or: cp addis-eats-next/.env.example addis-eats-next/.env.local # macOS/Linux

# 4. Run the production build or dev server
npm run build
npm start
# App running at: http://localhost:3000
```

### Scripts

| Command | Action |
|---|---|
| `npm run dev` | Starts local Next.js development server with hot reload |
| `npm run build` | Compiles optimized production build with Turbopack |
| `npm start` | Runs production server on `localhost:3000` |
| `npm run lint` | Runs ESLint validation |

---

## Environment Variables

Copy `.env.example` to `.env.local`. `.env.local` is gitignored; `.env.example` contains dummy values.

| Variable | Required? | Purpose |
|---|---|---|
| `SESSION_SECRET` | Production | Signs the HMAC session cookie. Defaults to fallback in development. |
| `NEXT_PUBLIC_SITE_URL` | Production | Canonical site URL used for OpenGraph images, sitemaps, and robots.txt. Defaults to `http://localhost:3000`. |
| `NEXT_PUBLIC_GA_ID` | Optional | Google Analytics 4 Measurement ID (lazy-loaded via `next/script`). |

---

## Demo Accounts

Hardcoded in `lib/users.js` for instant grading and evaluation:

| Email | Password | Role | Access Level |
|---|---|---|---|
| `almaz@addiseats.com` | `almaz123` | `customer` | Cart, Checkout, Order History, Live Tracking |
| `bereket@addiseats.com` | `bereket123` | `customer` | Cart, Checkout, Order History, Live Tracking |
| `staff@addiseats.com` | `staff123` | `staff` | Kitchen Order Queue (`/kitchen`) & Admin Orders |
| `admin@addiseats.com` | `admin123` | `admin` | Full Dashboard (`/admin`), Menu Editor (`/admin/menu`), Orders (`/admin/orders`) |

---

## Routes & Rendering Strategies

| Route | Strategy | Justification |
|---|---|---|
| `/` | **Static** (`○`) | Homepage content (hero, categories, featured dishes) is identical for all visitors. |
| `/menu` | **ISR** (`○`, 1h) | Revalidates hourly or on-demand when dishes are modified by an admin. |
| `/menu/[id]` | **Static via Params** (`●`) | Slugs known at build time; pre-builds HTML with JSON-LD structured data. |
| `/cart` | **Client** (`○`) | Cart state is private to browser `localStorage` and mutates on click. |
| `/checkout` | **Dynamic** (`ƒ`) | Forced dynamic because it reads session cookie and live delivery inputs. |
| `/login` | **Static** (`○`) | Static form; credentials verification executes in a Server Action. |
| `/order-success` | **Dynamic** (`ƒ`) | Displays newly placed order confirmation and live delivery route. |
| `/favorites` | **Client** (`○`) | Private to browser; modifies instantly on heart toggle. |
| `/order-history` | **Dynamic** (`ƒ`) | Scoped to the authenticated caller's session cookie. |
| `/admin/login` | **Static** (`○`) | Static sign-in form for restaurant managers and staff. |
| `/admin` | **Dynamic** (`ƒ`) | Checks admin session and aggregates revenue/order volume on server. |
| `/admin/menu` | **Dynamic** (`ƒ`) | Reads and writes live dish prices and catalog visibility. |
| `/admin/orders` | **Dynamic** (`ƒ`) | Reads and writes real-time order stages behind session gate. |
| `/kitchen` | **Dynamic** (`ƒ`) | Staff-only order queue for kitchen preparation. |

---

## Required Documentation Index

- **[`STRATEGY.md`](STRATEGY.md)**: Every route, its rendering strategy, and justification.
- **[`BOUNDARY.md`](BOUNDARY.md)**: Server vs Client component boundaries and composition rules.
- **[`DATA.md`](DATA.md)**: Client-side SWR queries, polling intervals, and SSE streaming specifications.
- **[`AUTH.md`](AUTH.md)**: Defense-in-depth security layers, RBAC, and neutralizations for the 3 security attacks.
- **[`PERF.md`](PERF.md)**: Core Web Vitals optimizations, self-hosted fonts, and zero-flash theming.
- **[`FUTURE.md`](FUTURE.md)**: Architectural roadmap and features intentionally cut (the "Coulds").
