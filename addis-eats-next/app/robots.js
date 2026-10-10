import { SITE_URL, PRIVATE_PATHS } from "@/lib/site";

// Keep crawlers out of anything that is private or per-visitor.
// Note: robots.txt stops crawling, not indexing by itself — which is why the
// private pages ALSO set `robots: { index: false }` in their metadata.
export default function robots() {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: PRIVATE_PATHS }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
