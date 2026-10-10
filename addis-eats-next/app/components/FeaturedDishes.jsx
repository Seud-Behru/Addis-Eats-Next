"use client";
import DishCard from "./DishCard.jsx";
import useMenu from "@/lib/context/useMenu.js";

// How many dishes to show under "Today's specials".
const FEATURED_COUNT = 4;

function FeaturedDishes() {

    const { visibleDishes, loading } = useMenu();

    const featuredDishes = visibleDishes.slice(0, FEATURED_COUNT);

    return (
        <section className="bg-cream">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 md:py-24">
                <div className="mb-10">
                    <p className="font-body text-xs font-bold uppercase tracking-[0.12em] text-terracotta">
                        Addis morning prep
                    </p>

                    <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <h2 className="font-display text-2xl font-semibold text-heading sm:text-3xl md:text-4xl">
                            Today's specials
                        </h2>

                        <p className="font-body text-sm text-muted">
                            Slow-simmered & flame-fired every morning
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div
                        className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4"
                        role="status"
                        aria-label="Loading today's specials"
                    >
                        {Array.from({ length: FEATURED_COUNT }).map((_, index) => (
                            <div
                                key={index}
                                className="overflow-hidden rounded-2xl bg-card shadow-sm"
                            >
                                <div className="aspect-4/3 animate-pulse bg-border" />

                                <div className="space-y-3 p-5">
                                    <div className="h-3 w-20 animate-pulse rounded-full bg-border" />
                                    <div className="h-5 w-3/4 animate-pulse rounded-full bg-border" />
                                    <div className="h-3 w-full animate-pulse rounded-full bg-border" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : featuredDishes.length === 0 ? (
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

export default FeaturedDishes;
