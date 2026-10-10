import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import AddToCartButton from "@/app/components/AddToCartButton";
import { getDish, getDishes } from "@/lib/menu";
import { dishSummary, dishJsonLd, jsonLdString } from "@/lib/seo";

// Static via params: every dish id is known at build time.
export function generateStaticParams() {
  return getDishes().map((d) => ({ id: d.id }));
}

// Title, description and the social preview come from the dish record.
// The title template in the root layout turns "Doro Wat" into
// "Doro Wat | Addis Eats". The og:image is the opengraph-image.jsx file that
// sits next to this page — Next wires it up on its own.
export async function generateMetadata({ params }) {
  const { id } = await params;
  const dish = getDish(id);
  if (!dish) return { title: "Dish not found", robots: { index: false } };

  const description = dishSummary(dish);
  return {
    title: dish.name,
    description,
    alternates: { canonical: `/menu/${dish.id}` },
    openGraph: {
      type: "website",
      title: dish.name,
      description,
      url: `/menu/${dish.id}`,
    },
    twitter: { card: "summary_large_image", title: dish.name, description },
  };
}

export default async function DishPage({ params }) {
  const { id } = await params;
  const dish = getDish(id);
  if (!dish) notFound();

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-16">
      {/* MenuItem structured data, built from the same `dish` rendered below. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(dishJsonLd(dish)) }}
      />
      <Link href="/menu" className="text-sm font-semibold text-heading transition hover:text-terracotta">
        ← Back to menu
      </Link>
      <div className="mt-8 grid overflow-hidden rounded-3xl bg-card shadow-sm lg:grid-cols-2">
        <Image
          src={dish.image}
          alt={dish.name}
          width={800}
          height={600}
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="aspect-4/3 h-full w-full object-cover"
        />
        <div className="flex flex-col justify-center p-6 sm:p-8 md:p-12">
          <p className="text-sm font-semibold text-terracotta">{dish.category}</p>
          <h1 className="mt-3 font-display text-3xl font-semibold leading-tight text-heading sm:text-5xl">
            {dish.name}
          </h1>
          <p className="mt-5 text-sm text-charcoal" aria-label={`Rated ${dish.rating} out of 5`}>
            ★ {dish.rating} <span className="text-muted">({dish.reviews} reviews)</span>
          </p>
          <p className="mt-6 max-w-xl text-base leading-8 text-muted">{dish.description}</p>
          <p className="mt-8 font-display text-3xl font-semibold text-heading">{dish.price} ETB</p>
          <AddToCartButton
            dish={dish}
            className="mt-8 w-full rounded-full bg-cta px-6 py-4 text-sm font-bold text-white transition hover:bg-cta-dark"
          >
            Add to cart
          </AddToCartButton>
        </div>
      </div>
    </main>
  );
}
