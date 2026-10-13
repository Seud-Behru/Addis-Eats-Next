# BOUNDARY.md — Server vs Client Component Boundaries

In the Addis Eats Next.js App Router architecture, components default to **Server Components** unless interactive browser APIs, DOM hooks (`useState`, `useEffect`, `useActionState`), or client-side storage are strictly required. The `"use client"` directive is pushed down to interactive leaf nodes.

| Component / File | Side | Rationale |
|---|---|---|
| `app/layout.js` (RootLayout) | Server | Owns `<html>` and `<body>`, registers local fonts, injects metadata template, and wraps `{children}` without client overhead. |
| `app/menu/layout.js` (MenuLayout) | Server | Nested layout persisting the Category Sidebar structure across menu and dish routes without unmounting. |
| `app/page.js` (Home) | Server | Statically pre-rendered homepage composing Hero, CategoryBrowser, and FeaturedDishes. |
| `Hero.jsx`, `FeaturedDishes.jsx`, `CategoryBrowser.jsx` | Server | Pure markup rendered directly from static assets and JSON data. |
| `DishCard.jsx` | Server | Renders dish card image, description, and price; embeds client leaves for cart and favorite interactions. |
| `app/menu/page.js` | Server | Asynchronous server component with `revalidate = 3600` (ISR) streaming the dish catalog via Suspense. |
| `app/menu/[id]/page.js` | Server | Pre-rendered via `generateStaticParams`; injects `MenuItem` JSON-LD and dynamic metadata. |
| `app/cart/page.js` | Server | Static page shell wrapping the interactive client `CartView`. |
| `app/checkout/page.js` | Server | Forced dynamic server component reading session cookie and pre-populating delivery details. |
| `app/order-history/page.js` | Server | Dynamic server component reading session cookie and fetching user-scoped orders directly. |
| `app/orders/[id]/page.js` | Server | Dynamic server component validating session and record ownership before rendering live order tracking. |
| `app/order-success/page.js` | Server | Dynamic post-checkout confirmation reading session and order record. |
| `app/kitchen/page.js` | Server | Dynamic server component strictly enforcing `session.role === "staff"` before listing all orders. |
| `app/admin/page.js` | Server | Dynamic admin dashboard summarizing revenue and volume on the server before passing aggregated metrics. |
| `app/admin/menu/page.js` | Server | Dynamic administrative view loading live dishes from memory. |
| `app/admin/orders/page.js` | Server | Dynamic administrative view loading live orders from memory. |
| `app/login/page.js` & `app/admin/login/page.js` | Server | Statically pre-rendered page shells wrapping `SignInForm` in Suspense boundaries. |
| `app/not-found.js` | Server | Pre-rendered 404 error page. |
| `Footer.jsx` | Server | Pure static layout markup with navigation links. |
| `Header.jsx` | Client | Reads reactive cart count, favorites count, dark/light theme toggle, and mobile menu drawer state. |
| `Providers.jsx` | Client | Isolates `ThemeProvider` and `FavoritesProvider` context boundaries from the server RootLayout. |
| `CategorySidebar.jsx` | Client | Preserves sidebar scroll position in `sessionStorage` and tracks active category selection. |
| `FilterShell.jsx` | Client | Receives server-rendered `DishCard` components via the `children` prop and filters using CSS data attributes. |
| `SearchBox.jsx` | Client | Handles debounced live input, query parameters, and SWR caching (`keepPreviousData`). |
| `AddToCartButton.jsx` | Client | Interactive leaf button firing `useCartStore` actions on click. |
| `FavoriteToggleButton.jsx` | Client | Interactive leaf button reading and updating `useFavorites` context on click. |
| `CartView.jsx` | Client | Reads and modifies browser cart items, quantity modifiers, and total calculation. |
| `app/favorites/page.js` | Client | Browser-private favorites view that updates in real time on toggle. |
| `CheckoutForm.jsx` | Client | Form state management driven by `useActionState(placeOrder)` with accessible error bindings. |
| `SignInForm.jsx` | Client | Form state driven by `useActionState(signIn)` and SWR session cache revalidation. |
| `OrderLiveTracker.jsx` | Client | Real-time SSE connection using native `EventSource`, seeded from server data with cleanup on unmount. |
| `DeliveryMap.jsx` & `DeliveryMapInner.jsx` | Client | Dynamic Leaflet OpenStreetMap rendering (`ssr: false`) with explicit pixel height and plain text fallback. |
| `AdminRevenueChart.jsx` | Client | Responsive visual bar chart accompanied by a semantic accessible HTML table. |
| `AdminMenuManager.jsx` | Client | Interactive table for modifying dish pricing and toggling catalog visibility via server action. |
| `AdminOrdersManager.jsx` | Client | Interactive order status stage dropdowns and filtering. |
| `ExportOrdersButton.jsx` | Client | Client-side RFC 4180 CSV blob generation and file download trigger. |
| `CancelOrderButton.jsx` | Client | Action caller using `useTransition` to cancel orders and revalidate paths. |
| `app/menu/error.js` | Client | Error boundary with interactive retry button calling `reset()`. |

## Composition Rule: Server Components as Children

To prevent pushing `"use client"` up the tree, the client component `FilterShell.jsx` receives the entire list of server-rendered `DishCard` items via the `children` prop. Zero callback functions (`onClick`) are passed across the Server/Client boundary.
