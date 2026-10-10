# STRATEGY.md — Addis Eats rendering strategy

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

**Rule of thumb used above:** if a route depends on who's asking (a cookie) or needs to reflect a change the instant it happens (an admin edit, a cart), it's dynamic or client. If it looks the same to everyone and changes rarely, it's static or ISR.