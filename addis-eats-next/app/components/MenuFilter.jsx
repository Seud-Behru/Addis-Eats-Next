"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

const categories = ["All", "Ethiopian", "Pizza", "Burgers", "Drinks"];

// Client shell: owns the search text and the selected category (the two
// pieces of state), and nothing else.
//
// The dish cards are NOT built here. The server page renders every <DishCard>
// and hands them in through the `cards` prop, so DishCard ships no JavaScript.
// Each card arrives as { id, category, searchText, node }, where `node` is
// the already-rendered card. This component only decides which ones to show.
export default function MenuFilter({ cards }) {
    const [search, setSearch] = useState("");

    // The category lives in the URL (?category=Pizza) so the home page's
    // category tiles keep working, exactly like the React Router version.
    const searchParams = useSearchParams();
    const category = searchParams.get("category") ?? "All";

    function handleCategoryChange(next) {
        const url = next === "All"
            ? "/menu"
            : `/menu?category=${encodeURIComponent(next)}`;

        // Next.js keeps useSearchParams in sync with history.replaceState,
        // so this updates the URL without asking the server for anything.
        window.history.replaceState(null, "", url);
    }

    const normalizedSearch = search.trim().toLowerCase();

    const shown = cards.filter((card) => {
        const matchesCategory = category === "All" || card.category === category;
        const matchesSearch =
            normalizedSearch === "" || card.searchText.includes(normalizedSearch);

        return matchesCategory && matchesSearch;
    });

    return (
        <>


            {/* Category bar */}
            <div className="mt-8">
                <div className="flex flex-wrap gap-3">
                    {categories.map((item) => {
                        const isActive = category === item;

                        return (
                            <button
                                key={item}
                                type="button"
                                onClick={() => handleCategoryChange(item)}
                                aria-pressed={isActive}
                                className={[
                                    "rounded-full px-5 py-2.5 font-body text-sm font-semibold transition",
                                    isActive
                                        ? "bg-forest text-white"
                                        : "bg-surface text-heading hover:bg-border",
                                ].join(" ")}
                            >
                                {item}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Result summary */}
            <div className="mt-10 flex items-center justify-between gap-4">
                <p className="font-body text-sm text-muted">
                    {shown.length} {shown.length === 1 ? "dish" : "dishes"} found
                </p>

                {category !== "All" && (
                    <button
                        type="button"
                        onClick={() => handleCategoryChange("All")}
                        className="font-body text-sm font-semibold text-terracotta hover:text-terracotta-dark"
                    >
                        Clear category
                    </button>
                )}
            </div>

            {/* Empty search/filter result */}
            {shown.length === 0 ? (
                <div className="mt-10 rounded-2xl bg-surface px-4 py-12 text-center sm:px-6 sm:py-16">
                    <p className="font-body text-xs font-bold uppercase tracking-[0.12em] text-terracotta">
                        No matches
                    </p>

                    <h2 className="mt-3 font-display text-2xl font-semibold text-heading sm:text-3xl">
                        Nothing matched your search.
                    </h2>

                    <p className="mx-auto mt-4 max-w-md font-body leading-7 text-muted">
                        Try another search term or choose a different food category.
                    </p>

                    <button
                        type="button"
                        onClick={() => {
                            setSearch("");
                            handleCategoryChange("All");
                        }}
                        className="mt-6 rounded-full bg-forest px-6 py-3 font-body text-sm font-semibold text-white transition hover:bg-deep-forest"
                    >
                        Show all dishes
                    </button>
                </div>
            ) : (
                <div className="mt-10 grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                    {shown.map((card) => (
                        <div key={card.id} className="contents">
                            {card.node}
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}
