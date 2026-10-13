# DATA.md — Client-Side Queries & Real-Time Data

All standard client-side fetches share the unified error-throwing fetcher in `lib/fetcher.js`.

---

## 1. Order Status Polling — `app/components/OrderStatus.jsx`

| Dimension | Specification & Setting |
|---|---|
| **Key** | `` `/api/orders/${id}` `` — active for the rendered order ID. |
| **Refresh Rule** | `refreshInterval: 5000` — polls automatically every 5 seconds. |
| **Seed** | `fallbackData: initialOrder` — pre-seeded from server component render. |
| **Why Polling** | Provides a robust fallback across all network environments without requiring persistent duplex websockets. |
| **Why `fallbackData`** | Guarantees that the initial server HTML paint displays real, fully formatted order details immediately. Zero layout shift or spinner flash. |
| **Why 5 Seconds** | Matches the kitchen progression stages (Preparing, Out for delivery, Delivered) without creating unnecessary server load. |

---

## 2. Dish Live Search — `app/components/SearchBox.jsx`

| Dimension | Specification & Setting |
|---|---|
| **Key** | `` `/api/dishes?q=${term}&page=${page}` `` or `null` when input is empty. |
| **Refresh Rule** | On-demand: triggers only when debounced search term or page index changes. |
| **`keepPreviousData`** | `true` — ensures previous search results stay visible while next page fetches. |
| **Debounce** | 400ms delay prevents sending requests on every keystroke. |
| **Why `null` Key** | Prevents redundant network requests when the user has not typed a query. |
| **Why URL Query String** | Page numbers (`?page=2`) and search terms (`?q=tib`) live in the URL, making search states bookmarkable, linkable, and shareable. |

---

## 3. Real-Time Order Stream (SSE) — `app/components/OrderLiveTracker.jsx`

| Dimension | Specification & Setting |
|---|---|
| **Stream Route** | `` `/api/orders/${id}/stream` `` |
| **Protocol** | Native Server-Sent Events (`EventSource`) with standard MIME type `text/event-stream`. |
| **Format** | `data: ${JSON.stringify(order)}\n\n` (data prefix + double newline delimiter). |
| **Seeding** | Initial order state is hydrated directly from Server Component props (`initialOrder`). |
| **Lifecycle & Cleanup** | `eventSource.close()` is executed in the `useEffect` cleanup return to terminate connection immediately on unmount. |
| **Termination Rule** | Closes automatically when the order reaches terminal state (`Delivered` or `Cancelled`). |

---

## 4. User Session Query — `lib/useAuth.js`

| Dimension | Specification & Setting |
|---|---|
| **Key** | `"/api/session"` |
| **Refresh Rule** | Manual cache mutation (`mutate("/api/session")`) triggered immediately upon `signIn` and `signOut` server actions. |
| **Why Client-Side** | Keeps static pages (`/`, `/menu`, `/login`) prerenderable at build time while allowing the sticky header to display customized auth pills and roles. |
