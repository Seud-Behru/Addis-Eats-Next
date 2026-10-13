"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Trash2 } from "lucide-react";
import useFavorites from "@/lib/context/useFavorites";
import AddToCartButton from "@/app/components/AddToCartButton";
import { etb } from "@/lib/format";

export default function FavoritesPage() {
  const { favorites, removeFavorite } = useFavorites();

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-16">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <p className="font-body text-xs font-bold uppercase tracking-[0.12em] text-terracotta">
            Saved Dishes
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-heading sm:text-5xl">
            Your Favorites
          </h1>
          <p className="mt-2 text-sm text-muted">
            Dishes you&apos;ve loved and saved for quick re-ordering.
          </p>
        </div>

        <Link
          href="/menu"
          className="inline-flex min-h-[44px] items-center rounded-full bg-forest px-5 py-2.5 text-xs font-bold text-white transition hover:bg-deep-forest"
        >
          Browse Full Menu
        </Link>
      </div>

      {favorites.length === 0 ? (
        <section
          aria-labelledby="empty-favorites-heading"
          className="mt-12 rounded-3xl bg-card p-12 text-center shadow-sm"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-surface text-terracotta">
            <Heart className="h-7 w-7" aria-hidden="true" />
          </div>
          <h2
            id="empty-favorites-heading"
            className="mt-4 font-display text-2xl font-semibold text-heading"
          >
            No favorite dishes yet
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
            Tap the heart icon on any dish on our menu to keep it saved right here.
          </p>
          <div className="mt-8">
            <Link
              href="/menu"
              className="inline-flex min-h-[44px] items-center rounded-full bg-cta px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-cta-dark"
            >
              Explore Ethiopian Dishes
            </Link>
          </div>
        </section>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((dish) => (
            <article
              key={dish.id}
              className="flex flex-col overflow-hidden rounded-2xl bg-card shadow-sm transition hover:shadow-md"
            >
              <div className="relative aspect-4/3 overflow-hidden">
                <Link href={`/menu/${dish.id}`} className="block h-full">
                  <Image
                    src={dish.image}
                    alt={dish.name}
                    width={640}
                    height={480}
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="h-full w-full object-cover"
                  />
                </Link>

                <button
                  type="button"
                  onClick={() => removeFavorite(dish.id)}
                  aria-label={`Remove ${dish.name} from favorites`}
                  className="absolute right-3 top-3 inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-white/90 p-2 text-red-600 shadow-sm backdrop-blur transition hover:bg-white hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <div className="flex grow flex-col gap-4 p-5">
                <div>
                  <Link href={`/menu/${dish.id}`}>
                    <h2 className="font-display text-xl font-bold text-heading hover:text-terracotta">
                      {dish.name}
                    </h2>
                  </Link>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">
                    {dish.description}
                  </p>
                </div>

                <div className="mt-auto flex items-center justify-between gap-4 border-t border-border pt-4">
                  <p className="font-display text-lg font-bold text-heading">
                    {etb(dish.price)}
                  </p>
                  <AddToCartButton
                    dish={dish}
                    className="rounded-full bg-forest px-4 py-2 text-xs font-semibold text-white transition hover:bg-cta"
                  >
                    + Add to Cart
                  </AddToCartButton>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
