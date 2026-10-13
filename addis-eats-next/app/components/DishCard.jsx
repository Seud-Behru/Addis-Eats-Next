import Link from "next/link";
import Image from "next/image";
import AddToCartButton from "./AddToCartButton";
import FavoriteToggleButton from "./FavoriteToggleButton";

// Server component: markup only. The interactive pieces are client leaf buttons.
export default function DishCard({ dish }) {
  const { id, name, description, price, rating, reviews, badge, image, category } = dish;
  return (
    <article
      data-category={category}
      className="flex flex-col overflow-hidden rounded-2xl bg-card shadow-sm"
    >
      <div className="relative aspect-4/3 overflow-hidden">
        <Link href={`/menu/${id}`} className="block h-full">
          {/* Remote photo, shown in a 4:3 box -> 640x480 is the real aspect
              ratio. sizes matches the grid: 3 cols (lg), 2 cols (sm), 1 col. */}
          <Image
            src={image}
            alt={name}
            width={640}
            height={480}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="h-full w-full object-cover"
          />
        </Link>
        {badge && (
          <span className="absolute left-3 top-3 rounded-md bg-forest px-2 py-1 text-xs font-bold text-white">
            {badge}
          </span>
        )}
        <div className="absolute right-3 top-3 z-10">
          <FavoriteToggleButton dish={dish} />
        </div>
      </div>
      <div className="flex grow flex-col gap-5 p-5">
        <div>
          <p className="text-xs text-muted">
            <span className="font-bold text-terracotta">★ {rating}</span> ({reviews}+ reviews)
          </p>
          <Link href={`/menu/${id}`}>
            <h3 className="mt-2 text-lg font-bold text-charcoal transition hover:text-terracotta">{name}</h3>
          </Link>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">{description}</p>
        </div>
        <div className="mt-auto flex items-center justify-between gap-4">
          <p className="text-lg font-bold text-heading">{price} ETB</p>
          <AddToCartButton
            dish={{ id, name, price, image }}
            className="rounded-full bg-forest px-4 py-2 text-xs font-semibold text-white transition hover:bg-cta"
          >
            + Add
          </AddToCartButton>
        </div>
      </div>
    </article>
  );
}
