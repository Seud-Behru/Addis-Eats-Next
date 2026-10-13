# STRATEGY.md — Addis Eats Rendering Strategy

| Route | Strategy | Why |
|---|---|---|
| `/` | Static | Homepage content (hero, categories, featured dishes) is the same for every visitor and doesn't change between deploys. |
| `/menu` | ISR, `revalidate = 3600` | Every visitor sees the same menu; dishes only change when an admin edits them, so an hourly refresh keeps it fast without ever showing very stale data. |
| `/menu/[id]` | Static via `generateStaticParams` | Every dish id is known at build time (from `menu-data.json`), so Next.js can pre-build one HTML page per dish. |
| `/cart` | Client | The cart is private to one browser and changes constantly (add/remove/quantity) — there's nothing worth rendering on the server. |
| `/checkout` | Dynamic | Needs to read the session cookie (who's ordering) and reflect the live cart total — neither can be known at build time. |
| `/login` | Static | Just a form. The actual sign-in work happens in a server action, not in how the page is rendered. |
| `/order-success` | Dynamic | Displays the order that was *just* placed, which only exists after checkout — there's nothing to prerender. |
| `/favorites` | Client | Same reasoning as the cart: private to one browser, changes on every click. |
| `/order-history` | Dynamic | Has to read the session cookie to know *whose* orders to show — the response depends on who's asking. |
| `/admin/login` | Static | Just a form, same as customer login. |
| `/admin` (dashboard) | Dynamic | Reads the session cookie and checks the admin role before showing anything. |
| `/admin/menu` | Dynamic | Reads and writes live menu data; an admin edit must show up immediately, not after an hour. |
| `/admin/orders` | Dynamic | Reads and writes live order data, and — like the dashboard — is gated behind the session cookie. |
| `/kitchen` | Dynamic | Real-time kitchen view that reads and updates active kitchen orders, protected by staff role check. |

## Strategy Principles & Justifications

1. **Static Pre-rendering (`/`, `/login`, `/admin/login`)**:
   These routes contain static presentational layouts or purely client-driven forms where data mutations happen inside Server Actions rather than during route generation. Pre-rendering them creates zero server-side computation overhead.

2. **Incremental Static Regeneration (`/menu`)**:
   The public menu is accessed by every visitor. Using `revalidate = 3600` allows the menu to serve instant edge-cached HTML globally while allowing background revalidation every hour or immediate on-demand revalidation when an admin edits a dish.

3. **Static Generation via Params (`/menu/[id]`)**:
   All dish slugs are known at build time. `generateStaticParams` ensures complete pre-rendering of SEO-rich HTML pages with JSON-LD structured data and dynamic OpenGraph preview cards.

4. **Client-Side Rendering (`/cart`, `/favorites`)**:
   Shopping cart and favorites state are entirely private to an individual user's browser, stored in `localStorage`, and updated with every button click.

5. **Dynamic On-Demand Rendering (`/checkout`, `/order-history`, `/order-success`, `/admin`, `/admin/menu`, `/admin/orders`, `/kitchen`)**:
   These routes directly read the HTTP-only session cookie to identify the authenticated caller, enforce role-based access control (RBAC), and query user-scoped or live administrative order metrics.
