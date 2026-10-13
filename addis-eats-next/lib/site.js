// One place for "what is our public address and brand". Everything that
// needs an absolute URL (metadataBase, sitemap, robots, JSON-LD) reads it
// from here, so a deploy only has to set NEXT_PUBLIC_SITE_URL once.
// Where is the site? First match wins:
//   1. NEXT_PUBLIC_SITE_URL   - set by you (your own domain, if you have one)
//   2. VERCEL_PROJECT_PRODUCTION_URL - Vercel fills this in by itself
//   3. VERCEL_URL             - the address of this particular deployment
//   4. http://localhost:3000  - local development
// Why so careful: if this resolves to localhost or a placeholder, og:image
// points somewhere Telegram/WhatsApp/X can't reach, so link previews show the
// text but no picture.
function clean(value) {
  if (!value) return "";
  const v = value.trim().replace(/\/+$/, "");
  return /^https?:\/\//i.test(v) ? v : `https://${v}`; // tolerate "my-site.vercel.app"
}

function isPlaceholder(url) {
  return /localhost|127\.0\.0\.1|example\.(com|org|net)/i.test(url);
}

function resolveSiteUrl() {
  const onVercel = Boolean(process.env.VERCEL);
  const candidates = [
    clean(process.env.NEXT_PUBLIC_SITE_URL),
    clean(process.env.VERCEL_PROJECT_PRODUCTION_URL),
    clean(process.env.VERCEL_URL),
  ].filter(Boolean);

  // On Vercel, ignore localhost / example.com values (a common copy-paste from
  // .env.example) and fall through to the real address.
  const usable = candidates.find((url) => !onVercel || !isPlaceholder(url));
  return usable || "http://localhost:3000";
}

export const SITE_URL = resolveSiteUrl();
export const SITE_NAME = "Addis Eats";
export const SITE_DESCRIPTION =
  "Order fresh Ethiopian food, pizza, burgers and drinks from local kitchens, delivered across Addis Ababa.";
export const CURRENCY = "ETB";

// Routes that belong to one visitor, or that crawlers have no use for.
// Used by robots.js (Disallow) — and each page also sets robots: noindex.
export const PRIVATE_PATHS = [
  "/cart",
  "/checkout",
  "/orders",
  "/order-history",
  "/order-success",
  "/favorites",
  "/kitchen",
  "/admin",
  "/signin",
  "/api/",
];
