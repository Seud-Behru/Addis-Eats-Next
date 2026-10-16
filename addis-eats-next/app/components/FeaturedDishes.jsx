import DishCard from "./DishCard.jsx";
import { getDishes } from "@/lib/menu";

// How many dishes to show under "Today's specials".
const FEATURED_COUNT = 4;

// Server component: reads dishes directly on the server at render time.
// No client fetch, no skeleton, no 1.5s delay. The HTML arrives complete,
// giving an instant Speed Index and zero Total Blocking Time from this section.
export default function FeaturedDishes() {
  const allDishes = getDishes().filter((d) => d.visible !== false);
  const featuredDishes = allDishes.slice(0, FEATURED_COUNT);

  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 md:py-24">
        <div className="mb-10">
          <p className="font-body text-xs font-bold uppercase tracking-[0.12em] text-terracotta">
            Addis morning prep
          </p>

          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="font-display text-2xl font-semibold text-heading sm:text-3xl md:text-4xl">
              Today&apos;s specials
            </h2>

            <p className="font-body text-sm text-muted">
              Slow-simmered &amp; flame-fired every morning
            </p>
          </div>
        </div>

        {featuredDishes.length === 0 ? (
          <p className="font-body text-sm text-muted">
            No dishes are available right now. Please check back soon.
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {featuredDishes.map((dish) => (
              <DishCard key={dish.id} dish={dish} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
