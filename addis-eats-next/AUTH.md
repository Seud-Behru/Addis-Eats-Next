# AUTH.md — protected routes, layer by layer

There's still no database. `lib/users.js` is three hardcoded accounts with
plain-text passwords — fine for a class project, not for anything real.
Sessions are a signed cookie (`lib/session-token.js`), not a server-side
session store, so nothing here needs a database to check who's signed in.

## /checkout

| Layer | File | Proves |
|---|---|---|
| 1 | `middleware.js` | A validly-signed session cookie is present on the request, before any page code runs. |
| 2 | `placeOrder` in `app/actions.js` | The action refuses to run unauthenticated on its own — it doesn't trust that it was only ever reached through layer 1. If the matcher below were ever edited wrong, this is what still stops it. |
| 3 | `submitOrder()` in `lib/orders.js` | The order's `userId` comes from `session.id`, never from submitted form data — there's no field a crafted request could set to place an order under someone else's account. |

## /orders and /orders/[id]

| Layer | File | Proves |
|---|---|---|
| 1 | `middleware.js` | Same as above — matcher includes `/orders/:path*`. |
| 2 | `app/orders/page.js`, `app/orders/[id]/page.js` | Call `getSession()` again rather than trusting the redirect already happened — a session can expire in the gap, and the page needs the session's own `id` anyway, not just proof one exists. |
| 3 | `getOrdersForUser(session.id)` (listing) / the `order.userId !== session.id` check (detail) | The listing query is scoped by the session's id with no parameter that could widen it. The detail page treats someone else's order exactly like an order that doesn't exist — both call `notFound()`, so there's no way to tell the two cases apart from outside. |

## /api/orders (POST) and /api/orders/[id] (GET)

Deliberately **not** in `middleware.js`'s matcher. A route handler can be
called directly with `curl`, bypassing the browser (and middleware)
entirely, so each one calls `getSession()` itself and returns a plain
`401` rather than depending on ever being reached through a page redirect.
The ownership check on `/api/orders/[id]` returns the same `404` a missing
order would, for the same ambiguity-on-purpose reason as the page above.

```
curl -i localhost:3000/api/orders/<id>                        # no cookie -> 401
curl -i localhost:3000/api/orders/<id> -b "addis_session=..."  # someone else's order -> 404
```

## /kitchen

No middleware layer at all — left out of the matcher on purpose, to show
that not every protected route has to go through it.

| Layer | File | Proves |
|---|---|---|
| 1 | `app/kitchen/page.js`: `if (!session) redirect(...)` | Not signed in at all → **401**-shaped response: sent to `/signin`, since signing in would fix it. |
| 2 | `app/kitchen/page.js`: `if (session.role !== "staff")` | Signed in but wrong role → **403**-shaped response: a plain "Staff only" message, not a redirect, because signing in again wouldn't help. The check runs in this server component, not in whether a "Kitchen" link happens to render in the header — a customer who types the URL in by hand gets the exact same response as one who clicks a link that isn't there. |

## The `next` parameter

`lib/session.js` exports `safeNext(value)`, used in both
`app/signin/page.js` (to sanitize what gets echoed into the form's hidden
field) and the `signIn` action in `app/actions.js` (to re-validate what
was actually submitted — a hidden input can be edited in devtools before
submit, so the page sanitizing it once isn't enough on its own).

Rule: `next` must start with exactly one `/`. `//evil.com` starts with a
slash too, but a browser reads a leading `//` as protocol-relative — i.e.
still an external redirect — so that's rejected as well, falling back to
`/`.

```
/signin?next=%2F%2Fevil.com  ->  hidden field renders "/", not "//evil.com"
```

## Why `Header.jsx` doesn't call `getSession()`

`Header` renders on every page, via the root layout. If it read the
session cookie itself, reading `cookies()` anywhere in a route's render
tree forces that whole route to render dynamically — so every route in
Day 40's `STRATEGY.md`, including the static `/` and the hourly-ISR
`/menu`, would silently become server-rendered on every request. That's
the exact trap Day 37 warned about ("you opt out by accident").

Instead, `Header` (a client component since Day 44's redesign, still
server-rendered for the first paint) reads no cookies, and a small hook
(`lib/useAuth.js`) fetches its own `/api/session` endpoint with SWR. The only route that becomes dynamic is
that one small endpoint — `npm run build`'s output still shows `○` for
`/`, `/cart`, and `/menu`, unchanged from Day 40.

## Known simplifications

- Passwords are plain text in `lib/users.js`. There's no sign-up — three
  fixed accounts (see `app/signin/page.js` for the list).
- The session cookie is **signed, not encrypted** — `role`/`email` are
  readable by decoding the cookie by hand, just not forgeable without the
  server's `SESSION_SECRET`. Nothing in the payload is sensitive enough
  to need encryption.
- `SESSION_SECRET` falls back to a hardcoded dev value if unset. Set a
  real one via an environment variable before deploying anywhere real.
