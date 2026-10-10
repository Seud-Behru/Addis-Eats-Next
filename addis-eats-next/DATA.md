# DATA.md — live queries

Two SWR calls in this app. Both share `lib/fetcher.js`.

## 1. Order status — `app/components/OrderStatus.jsx`

| | |
|---|---|
| Key | `` `/api/orders/${id}` `` — never `null`; an order id always exists once you're on the page. |
| Refresh rule | `refreshInterval: 5000` — polls every 5 seconds, no `dedupingInterval` override. |
| Seed | `fallbackData: initialOrder`, the order `app/orders/[id]/page.js` already fetched on the server. |
| Why polling, not once | An order's status can change at any moment and there's no database to push an update from — polling is the simplest way to notice a change without the person refreshing by hand. |
| Why `fallbackData` | Without it, the page would render with `order` undefined for a moment and either show a spinner or crash on `order.status`. Seeding it from the server means the first paint already has real data — confirmed by there being no loading state in `OrderStatus.jsx` at all. |
| Why 5 seconds | Order status here only has three stages over about 45 seconds total (see `lib/orders.js`) — 5s is frequent enough to feel live without hammering the endpoint. |

## 2. Dish search — `app/components/SearchBox.jsx`

| | |
|---|---|
| Key | `` `/api/dishes?q=${term}&page=${page}` ``, or **`null`** when `term` is empty. |
| Refresh rule | No interval — this is on-demand, not polled. Re-fetches only when the key changes (new term or new page). |
| `keepPreviousData` | `true` |
| Debounce | Raw input is debounced 400ms before it becomes `term`, so typing doesn't fire a request per keystroke. |
| Why `null` when empty | There's nothing to search for yet. A `null` key tells SWR not to fetch at all, rather than fetching an empty string and getting the whole menu back every keystroke. |
| Why `keepPreviousData` | Without it, `data` becomes `undefined` for an instant on every new term or page, and the results list disappears and reappears — `keepPreviousData` keeps last search's results on screen until the new ones arrive, so the grid never flashes empty. |
| Why the page number lives in the URL | `?q=...&page=...` is set with `history.replaceState` (the same trick `MenuFilter.jsx` already uses for `?category=`), so a search is shareable and survives a page refresh instead of resetting to page 1. |
| Page size | 2 — deliberately small. This dataset only has 6 dishes, and a page size of 6 would never produce a second page to click to.
