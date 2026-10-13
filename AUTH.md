# AUTH.md — Authentication, Authorization & Security Architecture

Addis Eats utilizes a zero-trust, layered security architecture. Authentication relies on cryptographically signed HTTP-only cookies (`lib/session-token.js`) verified universally on the server via `lib/session.js`.

---

## 1. Protected Routes & Defense-in-Depth Layers

### `/checkout`
| Layer | Verification Mechanism | Protection Proved |
|---|---|---|
| **Layer 1: Edge Proxy** | `middleware.js` | Fast-path check: ensures a cryptographically signed session cookie exists before executing the page. Redirects unsigned users to `/signin?next=/checkout`. |
| **Layer 2: Server Component** | `app/checkout/page.js` | Calls `getSession()` directly; prevents stale/expired cookie bypass and guarantees session context for pre-populating customer info. |
| **Layer 3: Server Action** | `placeOrder` in `app/actions.js` | Universal write guard: never trusts that caller came through the UI. Validates session before writing. |
| **Layer 4: Data Layer** | `submitOrder()` in `lib/orders.js` | Hard boundary: `userId` is strictly derived from the validated server session, never accepted from user form inputs. |

### `/order-history`, `/orders`, and `/orders/[id]`
| Layer | Verification Mechanism | Protection Proved |
|---|---|---|
| **Layer 1: Edge Proxy** | `middleware.js` | Matcher intercepts `/orders/:path*` and `/order-history`. |
| **Layer 2: Server Component** | `app/order-history/page.js` | Independent `getSession()` check scopes queries strictly to `session.id`. |
| **Layer 3: Scope Guard** | `getOrdersForUser(session.id)` | Data query only fetches orders matching the caller's session ID. |
| **Layer 4: Order Detail Ambiguity** | `app/orders/[id]/page.js` | Unauthorized access to another user's order returns the exact same `notFound()` (404) as a non-existent ID, preventing user enumeration. |

### `/admin`, `/admin/menu`, `/admin/orders`, and `/kitchen`
| Layer | Verification Mechanism | Protection Proved |
|---|---|---|
| **Layer 1: Edge Proxy** | `middleware.js` | Protects `/admin/:path*` routes from unauthenticated access. |
| **Layer 2: Role Verification** | Server Component Guard | Server components strictly check `session.role === "admin"` or `session.role === "staff"`. Unprivileged customers receive an HTTP 403 response or clean redirection. |
| **Layer 3: Action Guard** | `adminUpdateDish`, `adminUpdateOrderStatus` | Server actions verify `session.role` before mutating in-memory store and revalidating cached paths. |

---

## 2. API Endpoints: Direct Request Protection

Route handlers (`/api/orders`, `/api/orders/[id]`, `/api/orders/[id]/stream`) are deliberately decoupled from middleware redirections. Direct HTTP clients (like `curl`) bypassing the browser will never receive an HTML login redirect:
- `POST /api/orders`: Returns `401 Unauthorized` if session is missing, and `422 Unprocessable Entity` with `fieldErrors` if input fails validation.
- `GET /api/orders/[id]`: Returns `401` if signed out, and `404 Not Found` if the order belongs to another customer.

---

## 3. The 3 Security Attacks & Verification Proofs

### Attack 1: Calling a write action while signed out
* **Attack Vector**: An attacker crafts a `curl` POST request to `/api/orders` or invokes `placeOrder` / `cancelOrder` server actions without an active session cookie.
* **Defense**: `getSession()` returns `null`. The server action terminates immediately returning `{ ok: false, fieldErrors: { session: "Please sign in" } }` and route handlers respond with `401 Unauthorized`. Zero database or memory mutation occurs.

### Attack 2: Calling a write action on someone else's record
* **Attack Vector**: An attacker signs in as User A (`u_almaz`), but sends an order payload claiming `userId: "u_bereket"` or invokes `cancelOrder("ord_other_user")`.
* **Defense**:
  1. For order placement, `submitOrder` ignores any client-supplied `userId` and uses only `session.id` extracted from the cryptographically verified HMAC session token.
  2. For order cancellation, `cancelOrderInStore` explicitly checks `order.userId === session.id` (or `role === "admin" / "staff"`). Any attempt to cancel another user's order fails with `{ ok: false, error: "Unauthorized to cancel this order" }`.

### Attack 3: Crafting a sign-in link with an external `next` URL (Open Redirect)
* **Attack Vector**: An attacker emails a phishing link like `https://addiseats.com/signin?next=//evil-phishing.com` or `https://addiseats.com/signin?next=/\malicious.site`.
* **Defense**: `safeNext()` in `lib/session.js` validates that:
  - Value must start with a single `/`.
  - Protocol-relative prefixes (`//`, `/\`) and backslashes (`\`) are strictly forbidden.
  - The parsed destination `URL.origin` must strictly match the local application origin.
  - Any failure safely defaults to `"/"`, preventing open redirects.

---

## 4. Preservation of Static Prerendering

The persistent header (`app/components/Header.jsx`) does **not** read cookies directly. If `cookies()` were called inside the root layout, every child route (`/`, `/menu`, `/login`) would be forced into dynamic rendering. Instead, the header remains a client component that reads the auth state asynchronously through `/api/session` via SWR, ensuring homepage and menu pages remain 100% statically optimized and edge-cached.
