import { Suspense } from "react";
import DishCard from "../components/DishCard";
import FilterShell from "../components/FilterShell";
import SearchBox from "../components/SearchBox";
import { getDishes, CATEGORIES } from "@/lib/menu";

export const metadata = {
  title: "Menu",
  description:
    "Browse every dish on the Addis Eats menu — Ethiopian classics, pizza, burgers and cold drinks — and filter by category or search by name.",
  alternates: { canonical: "/menu" },
};

// ISR: Hourly refresh keeps it fast without ever showing stale data.
// Marked static in the build output.
export const revalidate = 3600;

// Async Server Component streaming the dish catalog behind the layout's sidebar
async function DishList() {
  const dishes = getDishes();

  return (
    <FilterShell categories={CATEGORIES}>
      {dishes.map((dish) => (
        <DishCard key={dish.id} dish={dish} />
      ))}
    </FilterShell>
  );
}

function DishListSkeleton() {
  return (
    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="h-80 animate-pulse rounded-2xl bg-surface" />
      ))}
    </div>
  );
}

export default function MenuPage() {
  return (
    <section>
      <div className="max-w-2xl">
        <p className="font-body text-xs font-bold uppercase tracking-[0.12em] text-terracotta">
          Addis Eats Menu
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-heading sm:text-5xl">
          Explore Our Menu
        </h1>
        <p className="mt-3 font-body leading-7 text-muted">
          Search your favorites or browse by authentic Ethiopian dishes, artisan pizza, burgers, and drinks.
        </p>
      </div>

      {/* Live search backed by /api/dishes */}
      <Suspense fallback={<div className="mt-6 h-12 w-full animate-pulse rounded-full bg-surface" />}>
        <SearchBox />
      </Suspense>

      {/* Streaming: Suspense boundary streams the slow dish list behind an instantly rendered sidebar */}
      <Suspense fallback={<DishListSkeleton />}>
        <DishList />
      </Suspense>
    </section>
  );
}
