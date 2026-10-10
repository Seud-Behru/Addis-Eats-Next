import Link from "next/link";
import CategoryCard from "./CategoryCard.jsx";


const categories = [{
    id: "ethiopian",

    menuCategory: "Ethiopian",
    name: "Ethiopian Classics",
    description: "Traditional flavors",
    icon: "restaurant",
},
{
    id: "pizza",

    menuCategory: "Pizza",
    name: "Artisanal Pizza",
    description: "Fermented dough",
    icon: "local_pizza",
},
{
    id: "burgers",
    menuCategory: "Burgers",
    name: "Gourmet Burgers",
    description: "Brioche & Angus",
    icon: "lunch_dining",
},
{
    id: "drinks",
    menuCategory: "Drinks",
    name: "Coffee & Tej",
    description: "Yirgacheffe & spiced tej",
    icon: "coffee",
},]

function CategoryBrowser() {
    return (
        <section className="bg-forest">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 md:py-20">
                <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="font-body text-xs font-bold uppercase tracking-[0.12em] text-terracotta-bright">
                            What are you craving?
                        </p>

                        <h2 className="mt-2 font-display text-2xl font-semibold text-white sm:text-3xl md:text-4xl">
                            Browse by food type
                        </h2>
                    </div>

                    <Link
                        href="/menu"
                        className="font-body text-sm font-semibold text-white/70 transition hover:text-white"
                    >
                        See full menu →
                    </Link>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {categories.map((category) => (
                        <CategoryCard
                            key={category.id}
                            name={category.name}
                            description={category.description}
                            icon={category.icon}
                            menuCategory={category.menuCategory}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

export default CategoryBrowser;