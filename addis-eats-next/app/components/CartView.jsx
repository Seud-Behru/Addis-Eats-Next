"use client";

import Link from "next/link";
import Image from "next/image";
import useCartStore from "@/lib/cartStore";
import useHydrated from "@/lib/useHydrated";

export default function CartView() {
  const items = useCartStore((s) => s.items);
  const increaseQuantity = useCartStore((s) => s.increaseQuantity);
  const decreaseQuantity = useCartStore((s) => s.decreaseQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const hydrated = useHydrated();

  if (!hydrated) return <div className="mt-10 h-64" aria-hidden="true" />;

  if (items.length === 0) {
    return (
      <section className="py-16 text-center">
        <p className="mx-auto max-w-xl leading-7 text-muted">
          Your cart is empty. Add something delicious from our local kitchens.
        </p>
        <Link href="/menu" className="mt-8 inline-flex rounded-full bg-forest px-6 py-3 text-sm font-semibold text-white transition hover:bg-deep-forest">
          Browse menu
        </Link>
      </section>
    );
  }

  const subtotal = items.reduce((t, i) => t + i.price * i.quantity, 0);
  const qtyBtn = "flex h-9 w-9 items-center justify-center rounded-full text-lg text-heading transition hover:bg-surface-container-low";

  return (
    <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
      <section aria-label="Cart items" className="space-y-4">
        {items.map((item) => (
          <article key={item.id} className="flex gap-3 rounded-2xl bg-card p-3 shadow-sm sm:gap-4 sm:p-5">
            <Image
              src={item.image}
              alt={item.name}
              width={128}
              height={128}
              sizes="(min-width: 640px) 128px, 80px"
              className="h-20 w-20 shrink-0 rounded-xl object-cover sm:h-32 sm:w-32"
            />
            <div className="flex min-w-0 flex-1 flex-col">
              <h2 className="font-display text-lg font-semibold text-heading sm:text-xl">{item.name}</h2>
              <p className="mt-1 text-sm text-muted">{item.price} ETB each</p>
              <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-4">
                <div className="flex items-center rounded-full border border-border">
                  <button type="button" onClick={() => decreaseQuantity(item.id)} aria-label={`Decrease ${item.name} quantity`} className={qtyBtn}>-</button>
                  <span className="min-w-8 text-center text-sm font-semibold text-charcoal" aria-label={`Quantity ${item.quantity}`}>{item.quantity}</span>
                  <button type="button" onClick={() => increaseQuantity(item.id)} aria-label={`Increase ${item.name} quantity`} className={qtyBtn}>+</button>
                </div>
                <p className="text-sm font-bold text-heading">{item.price * item.quantity} ETB</p>
              </div>
              <button type="button" onClick={() => removeItem(item.id)} className="mt-3 self-start text-xs font-semibold text-muted underline underline-offset-4 transition hover:text-terracotta">
                Remove
              </button>
            </div>
          </article>
        ))}
      </section>

      <aside className="h-fit rounded-2xl bg-card p-6 shadow-sm">
        <h2 className="font-display text-2xl font-semibold text-heading">Order summary</h2>
        <div className="mt-6 flex items-center justify-between border-b border-border pb-4">
          <span className="text-sm text-muted">Subtotal</span>
          <span className="text-sm font-semibold text-charcoal">{subtotal} ETB</span>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-base font-semibold text-heading">Total</span>
          <span className="font-display text-2xl font-semibold text-heading">{subtotal} ETB</span>
        </div>
        <Link href="/checkout" className="mt-6 flex w-full items-center justify-center rounded-full bg-cta px-6 py-4 text-sm font-bold text-white transition hover:bg-cta-dark">
          Proceed to checkout
        </Link>
        <Link href="/menu" className="mt-3 flex w-full items-center justify-center rounded-full border border-heading px-6 py-3 text-sm font-semibold text-heading transition hover:bg-surface-container-low">
          Continue shopping
        </Link>
      </aside>
    </div>
  );
}
