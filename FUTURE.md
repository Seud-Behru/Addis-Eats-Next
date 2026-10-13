# FUTURE.md — Scoped Features & Architecture Roadmap (The "Coulds")

Using the **MoSCoW** (Must have, Should have, Could have, Won't have) prioritization framework, this document outlines features intentionally cut or deferred from the capstone release, along with the engineering rationale.

---

## 1. Persistent Database Migration (PostgreSQL / Prisma / Neon)
* **What was cut:** An external persistent database for dishes, customer accounts, and order history.
* **Why it was cut:**
  - Addis Eats currently utilizes in-memory storage (`globalThis.__addisOrders` and `globalThis.__addisDishes`) paired with cryptographically signed HMAC session cookies.
  - Zero external database provisioning allows evaluators and teammates to clone and launch the project in under 30 seconds (`git clone -> npm install -> npm run dev`) without managing connection strings, VPC firewalls, or migration syncs.
* **Future Implementation:**
  - Adopt **Drizzle ORM** with **Neon Serverless PostgreSQL**.
  - Migrate `menu-data.json` and `lib/orders.js` queries to type-safe SQL schemas.

---

## 2. TeleBirr Direct Merchant API & Webhook Processing
* **What was cut:** Live HTTP API integration with Ethio Telecom's TeleBirr payment gateway.
* **Why it was cut:**
  - Ethio Telecom requires licensed Ethiopian business registration, static IP whitelisting, and private merchant keys for the TeleBirr API.
  - Simulating the TeleBirr payment handoff at checkout allowed us to build the complete UX and order confirmation pipeline without external gateway blockers.
* **Future Implementation:**
  - Implement a secured `/api/webhooks/telebirr` endpoint verifying Ethio Telecom HMAC signatures.
  - Add QR-code modal payment on `/checkout` for mobile app scanning.

---

## 3. Customer Self-Registration & Password Recovery
* **What was cut:** Open customer registration, password reset flows, and email verification.
* **Why it was cut:**
  - To make grading and testing instantaneous, fixed demo personas (`almaz@addiseats.com`, `bereket@addiseats.com`, `staff@addiseats.com`, `admin@addiseats.com`) were implemented. Evaluators can instantly switch between customer, kitchen staff, and admin views without needing email inboxes.
* **Future Implementation:**
  - Integrate **Auth.js** (NextAuth) or **Clerk** with Argon2id password hashing and magic-link authentication via Resend.

---

## 4. Live GPS Courier App & Geolocation WebSockets
* **What was cut:** Native driver mobile companion app streaming live GPS coordinates via WebSockets.
* **Why it was cut:**
  - Delivery routes and order progress are tracked through a dynamically loaded Leaflet OpenStreetMap component with Addis Ababa coordinates and Server-Sent Events (SSE).
  - Building a separate courier PWA with background geolocation exceeded the scope of the web delivery capstone.
* **Future Implementation:**
  - WebSocket gateway via Ably or Pusher.
  - Driver mobile PWA tracking real-time delivery scooters through Addis Ababa traffic.

---

## 5. User Reviews & Photo Uploads
* **What was cut:** Customer star rating submissions and user dish photography uploads.
* **Why it was cut:**
  - Focused engineering resources on Next.js App Router core requirements: Server/Client component boundaries, ISR revalidation, Streaming Suspense, SEO metadata, and administrative dashboards.
* **Future Implementation:**
  - S3 / Uploadthing storage for customer food photos.
  - Verified-purchaser review verification logic on `/orders/[id]`.
