import dishes from "@/data/menu-data.json";

// In-memory store for live dishes so admin edits work without restarting
const liveDishes = (globalThis.__addisDishes ??= JSON.parse(JSON.stringify(dishes)));

export const CATEGORIES = ["Ethiopian", "Pizza", "Burgers", "Drinks"];

// Read on the server. Dishes an admin hid never reach a customer page.
export function getDishes() {
  return liveDishes.filter((d) => d.visible !== false);
}

// Admin view includes hidden dishes
export function getAllDishesAdmin() {
  return [...liveDishes];
}

export function getDish(id) {
  return liveDishes.find((d) => d.id === id && d.visible !== false) ?? null;
}

export function getDishAdmin(id) {
  return liveDishes.find((d) => d.id === id) ?? null;
}

export function updateDish(id, updates) {
  const index = liveDishes.findIndex((d) => d.id === id);
  if (index === -1) return null;
  liveDishes[index] = { ...liveDishes[index], ...updates };
  return liveDishes[index];
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
