// One place for "what is our public address and brand". Everything that
// needs an absolute URL (metadataBase, sitemap, robots, JSON-LD) reads it
// from here, so a deploy only has to set NEXT_PUBLIC_SITE_URL once.
const raw = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const SITE_URL = raw.replace(/\/+$/, "");
export const SITE_NAME = "Addis Eats";
export const SITE_DESCRIPTION =
  "Order fresh Ethiopian food, pizza, burgers and drinks from local kitchens, delivered across Addis Ababa.";
export const CURRENCY = "ETB";

// Routes that belong to one visitor, or that crawlers have no use for.
// Used by robots.js (Disallow) — and each page also sets robots: noindex.
export const PRIVATE_PATHS = ["/cart", "/checkout", "/orders", "/kitchen", "/signin", "/api/"];
