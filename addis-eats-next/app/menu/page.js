import { Suspense } from "react";

import DishCard from "../components/DishCard";
import MenuFilter from "../components/MenuFilter";
import SearchBox from "../components/SearchBox";
import menuData from "@/data/menu-data.json"

export const metadata = {
  title: "Menu",
  description: "Browse every dish on the Addis Eats menu — Ethiopian classics, pizza, burgers and cold drinks — and filter by category or search by name.",
  alternates: { canonical: "/menu" },
};



export const revalidate = 3600;


export default async function MenuPage() {
    // A dish hidden by an admin never reaches the customer menu.
    const dishes = menuData.filter((dish) => dish.visible !== false);


    // which ones to show. "node" is finished markup, not code.
    const cards = dishes.map((dish) => ({
        id: dish.id,
        category: dish.category,
        searchText: `${dish.name} ${dish.description}`.toLowerCase(),
        node: <DishCard dish={dish} />,
    }));

    return (
        <section className="bg-cream">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 md:py-20">
                <div className="max-w-2xl">
                    <p className="font-body text-xs font-bold uppercase tracking-[0.12em] text-terracotta">
                        Addis Eats menu
                    </p>

                    <h1 className="mt-3 font-display text-4xl font-semibold text-heading sm:text-5xl">
                        Explore the menu
                    </h1>

                    <p className="mt-4 font-body leading-7 text-muted">
                        Search your favorites or browse by category.
                    </p>
                </div>

                {/* Live search: hits /api/dishes as you type. Independent of
                    the category buttons rendered inside MenuFilter below. */}
                <SearchBox />

                {/* useSearchParams needs a Suspense boundary on a static page.
                    The fallback is the full list of server-rendered cards, so the
                    HTML that crawlers and slow phones receive already contains
                    the whole menu; the filter takes over once the page hydrates. */}
                <Suspense
                    fallback={
                        <div className="mt-10 grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                            {cards.map((card) => (
                                <div key={card.id} className="contents">
                                    {card.node}
                                </div>
                            ))}
                        </div>
                    }
                >
                    <MenuFilter cards={cards} />
                </Suspense>
            </div>
        </section>
    );
}
