import dishes from "@/data/menu-data.json";

export const CATEGORIES = ["Ethiopian", "Pizza", "Burgers", "Drinks"];

// Read on the server. Dishes an admin hid never reach a customer page.
export function getDishes() {
  return dishes.filter((d) => d.visible !== false);
}

export function getDish(id) {
  return getDishes().find((d) => d.id === id) ?? null;
}

// ---------------------------------------------------------------------
// Powers the live search box (SearchBox.jsx) through /api/dishes.
// Kept separate from getDishes()/getDish() above, which the static and
// ISR pages use directly with no endpoint involved.
// ---------------------------------------------------------------------
const SEARCH_PAGE_SIZE = 2; // small on purpose — this dataset only has 6 dishes

export function searchDishes({ q = "", page = 1, pageSize = SEARCH_PAGE_SIZE } = {}) {
  const term = q.trim().toLowerCase();

  const matches = term
    ? getDishes().filter((d) =>
        `${d.name} ${d.description} ${d.category}`.toLowerCase().includes(term)
      )
    : getDishes();

  const total = matches.length;
  const safePage = Math.max(1, page);
  const start = (safePage - 1) * pageSize;

  const items = matches
    .slice(start, start + pageSize)
    .map(({ id, name, price, image, category }) => ({ id, name, price, image, category }));

  return { items, page: safePage, pageSize, total, hasMore: start + pageSize < total };
}
