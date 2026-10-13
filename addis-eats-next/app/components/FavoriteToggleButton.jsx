"use client";

import { Heart } from "lucide-react";
import useFavorites from "@/lib/context/useFavorites";

export default function FavoriteToggleButton({ dish, className = "" }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const active = isFavorite(dish.id);

  function handleClick(e) {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(dish);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={active ? `Remove ${dish.name} from favorites` : `Add ${dish.name} to favorites`}
      aria-pressed={active}
      className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-white/90 p-2.5 text-charcoal shadow-sm backdrop-blur transition hover:bg-white hover:text-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta dark:bg-card/90 dark:text-heading ${className}`}
    >
      <Heart
        className={`h-5 w-5 transition-transform ${
          active ? "fill-terracotta text-terracotta scale-110" : "text-muted hover:text-terracotta"
        }`}
        aria-hidden="true"
      />
    </button>
  );
}
