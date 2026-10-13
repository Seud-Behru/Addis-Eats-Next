import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";

export const metadata = {
  title: "Page Not Found",
  description: "The page you are looking for does not exist on Addis Eats.",
};

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface text-terracotta">
        <UtensilsCrossed className="h-8 w-8" aria-hidden="true" />
      </div>
      <p className="mt-6 font-body text-xs font-bold uppercase tracking-[0.12em] text-terracotta">
        404 — Not Found
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-heading sm:text-4xl">
        This plate is empty
      </h1>
      <p className="mt-3 text-sm leading-6 text-muted">
        We couldn&apos;t find the dish, order, or page you were looking for. It might have moved or is no longer available on our menu.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link
          href="/menu"
          className="inline-flex min-h-[44px] items-center rounded-full bg-forest px-6 py-3 text-sm font-semibold text-white transition hover:bg-deep-forest focus:outline-none focus:ring-2 focus:ring-terracotta focus:ring-offset-2"
        >
          Browse Our Menu
        </Link>
        <Link
          href="/"
          className="inline-flex min-h-[44px] items-center rounded-full bg-surface px-6 py-3 text-sm font-semibold text-heading transition hover:bg-border focus:outline-none focus:ring-2 focus:ring-terracotta focus:ring-offset-2"
        >
          Return Home
        </Link>
      </div>
    </main>
  );
}
