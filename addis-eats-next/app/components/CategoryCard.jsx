import Link from "next/link";
import {
    Beef,
    Coffee,
    Pizza,
    Utensils,
} from "lucide-react";

const icons = {
    restaurant: Utensils,
    local_pizza: Pizza,
    lunch_dining: Beef,
    coffee: Coffee,
};

function CategoryCard({ name, description, icon, menuCategory }) {
    const Icon = icons[icon];

    return (
        <Link
            href="/menu?category"
            className="group flex flex-col rounded-2xl bg-forest p-5 transition duration-300 hover:-translate-y-1 hover:bg-deep-forest focus:outline-none focus:ring-2 focus:ring-terracotta focus:ring-offset-2 sm:p-6"
        >
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-white transition group-hover:scale-105 sm:mb-6">
                {Icon && (
                    <Icon
                        size={24}
                        strokeWidth={1.8}
                        aria-hidden="true"
                    />
                )}
            </div>

            <h3 className="font-body text-lg font-bold text-white">
                {name}
            </h3>

            <p className="mt-2 font-body text-sm text-white/60">
                {description}
            </p>
        </Link>
    );
}

export default CategoryCard;
