# BOUNDARY.md — server vs client components

| Component | Runs on | Why |
|---|---|---|
| `app/layout.js` | Server | Just passes `children` through; owns `<html>`/`<body>` and imports global CSS. |
| `Header` | Client | Holds the mobile-menu-open state, reads the theme toggle, and reads the live cart count from the cart store. |
| `Footer` | Server | Pure markup, no state, no interactivity. |
| `Providers` (theme + favorites context, and loads the saved cart) | Client | Context needs state; isolated in its own file so `layout.js` itself can stay server. |
| `app/page.js` (Home) | Server | Composes the hero, category browser, and featured dishes — none of it needs to respond to clicks. |
| `Hero`, `CategoryCard`, `FeaturedDishes` | Server | Pure markup from data. |
| `app/menu/page.js` | Server | Awaits the dish list directly — no fetch needed, it's on the same machine as the data now. |
| `MenuFilter` (search box + category bar, split out of the old `Menu.jsx`) | Client | Holds the search text and selected category as state; receives the finished cards as a prop, so it never imports `DishCard`. |
| `DishCard` (markup only) | Server | Image, name, price, rating — nothing here needs a click handler. Rendered by `app/menu/page.js` and passed into `MenuFilter`. |
| `AddToCartButton` (new — split out of `DishCard` / `DishDetail`) | Client | `onClick`, writes to the cart store. |
| `FavoriteButton` (new — split out of `DishCard` / `DishDetail`) | Client | `onClick`, writes to the favorites store. |
| `app/menu/[id]/page.js` | Server | Awaits a single dish by id; calls `notFound()` if it doesn't exist. |
| `app/cart/page.js` | Client | Reads and writes the cart store directly (quantity +/-, remove). |
| `CheckoutForm` | Client | Needs `useState` / `onChange` for the delivery fields — but submits through a server action, so it still works with JavaScript off. |
| `LoginForm` | Client | Same reasoning — form state, but the actual check happens in a server action. |
| `AdminDishForm` | Client | Form state for adding or editing a dish. |
| `AdminOrderStatusButton` | Client | `onClick` calls a server action to change an order's status. |
| `app/order-history/page.js`, admin list pages | Server | Await the relevant data (this user's orders, or all orders) directly. |

**Two things that disappear entirely:** `ProtectedRoute.jsx` and `UserProtectedRoute.jsx` aren't components anymore — in Next.js, a page or layout just checks the session cookie itself and calls `redirect()` (from `next/navigation`) if it's missing. Same for `ErrorBoundary.jsx` and `LoadingState.jsx` — those become `error.js` and `loading.js` files per segment instead of components you import.