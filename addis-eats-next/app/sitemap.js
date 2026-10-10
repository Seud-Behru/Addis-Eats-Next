import { getDishes } from "@/lib/menu";
import { SITE_URL } from "@/lib/site";

// Built from the same records the site renders: every visible dish gets a
// URL, a hidden dish (visible: false) is automatically absent. Private
// routes (/cart, /checkout, /orders, /kitchen, /signin) are never listed.
// No lastModified: the data has no timestamps, and a made-up "now" on every
// build would tell crawlers everything changed every time.
export default function sitemap() {
  const dishes = getDishes().map((dish) => ({
    url: `${SITE_URL}/menu/${dish.id}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/menu`, changeFrequency: "daily", priority: 0.9 },
    ...dishes,
  ];
}
