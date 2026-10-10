import { SITE_URL, SITE_NAME, CURRENCY } from "@/lib/site";

// Short, human description used for <meta description> and og:description.
// Built from the same dish record the page renders: name, price, summary.
export function dishSummary(dish) {
  return `${dish.name} — ${dish.price} ${CURRENCY}. ${dish.description}`;
}

// schema.org MenuItem for one dish. Takes the exact object the page renders
// (getDish(id)), so the markup can't drift from what a visitor sees.
// aggregateRating is deliberately left out: schema.org does not allow it on
// MenuItem, and invalid structured data is worse than none.
// Local photos are stored as "/images/x.jpg"; structured data wants a full URL.
function absoluteUrl(path) {
  return /^https?:\/\//.test(path) ? path : `${SITE_URL}${path}`;
}

export function dishJsonLd(dish) {
  return {
    "@context": "https://schema.org",
    "@type": "MenuItem",
    "@id": `${SITE_URL}/menu/${dish.id}#menuitem`,
    name: dish.name,
    description: dish.description,
    image: absoluteUrl(dish.image),
    url: `${SITE_URL}/menu/${dish.id}`,
    offers: {
      "@type": "Offer",
      price: String(dish.price),
      priceCurrency: CURRENCY,
      availability: "https://schema.org/InStock",
      seller: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    },
  };
}

// JSON.stringify is not enough inside <script>: a "</script>" in a dish
// description would end the tag early. Escaping "<" closes that hole.
export function jsonLdString(data) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
