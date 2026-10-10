"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { placeOrder } from "@/app/actions";
import useCartStore from "@/lib/cartStore";
import useHydrated from "@/lib/useHydrated";

const inputClass =
  "mt-2 w-full rounded-xl border border-border bg-cream px-4 py-3 text-sm outline-none transition focus:border-heading focus:ring-2 focus:ring-forest/10";

// Same accessible markup as the Vite form: label, aria-invalid, aria-describedby.
function Field({ id, label, error, defaultValue, type = "text", multiline, placeholder, optional }) {
  const Tag = multiline ? "textarea" : "input";
  return (
    <div className="mt-5">
      <label htmlFor={id} className="text-sm font-semibold text-charcoal">
        {label}
        {optional && <span className="ml-2 font-normal text-muted">Optional</span>}
      </label>
      <Tag
        id={id}
        name={id}
        type={multiline ? undefined : type}
        rows={multiline ? 3 : undefined}
        defaultValue={defaultValue}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={multiline ? `${inputClass} resize-none` : inputClass}
      />
      {error && (
        <p id={`${id}-error`} className="mt-2 text-xs font-semibold text-terracotta">
          {error}
        </p>
      )}
    </div>
  );
}

export default function CheckoutForm({ defaults }) {
  const [state, formAction, pending] = useActionState(placeOrder, null);
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const hydrated = useHydrated();
  const ok = state?.ok === true;

  useEffect(() => {
    if (ok) clearCart();
  }, [ok, clearCart]);

  if (ok) {
    return (
      <section className="mx-auto mt-10 max-w-xl rounded-2xl bg-card p-8 text-center shadow-sm">
        <h2 className="font-display text-3xl font-semibold text-heading">Order placed</h2>
        <p className="mt-4 leading-7 text-muted">
          Order {state.order.id} · {state.order.total} ETB. We&apos;re preparing it now.
        </p>

        <Link
          href={`/orders/${state.order.id}`}
          className="mt-6 inline-flex rounded-full bg-cta px-6 py-3 text-sm font-semibold text-white transition hover:bg-cta-dark"
        >
          Track your order
        </Link>
        <Link href="/menu" className="mt-8 inline-flex rounded-full bg-forest px-6 py-3 text-sm font-semibold text-white transition hover:bg-deep-forest">
          Back to menu
        </Link>
      </section>
    );
  }

  if (hydrated && items.length === 0) {
    return (
      <section className="py-16 text-center">
        <p className="text-muted">Your cart is empty. Add something before checking out.</p>
        <Link href="/menu" className="mt-8 inline-flex rounded-full bg-forest px-6 py-3 text-sm font-semibold text-white transition hover:bg-deep-forest">
          Browse menu
        </Link>
      </section>
    );
  }

  const errors = state?.fieldErrors ?? {};
  const v = state?.values ?? defaults;
  const subtotal = items.reduce((t, i) => t + i.price * i.quantity, 0);
  // Only ids and quantities go to the server; it looks the prices up itself.
  const payload = JSON.stringify(items.map(({ id, quantity }) => ({ id, quantity })));

  return (
    <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
      <form action={formAction} noValidate className="rounded-2xl bg-card p-5 shadow-sm sm:p-6 md:p-8">
        <h2 className="font-display text-2xl font-semibold text-heading">Delivery details</h2>
        <input type="hidden" name="items" value={payload} />
        <Field id="name" label="Full name" error={errors.name} defaultValue={v.name} placeholder="Your full name" />
        <Field id="phone" label="Phone number" type="tel" error={errors.phone} defaultValue={v.phone} placeholder="+251 9..." />
        <Field id="address" label="Delivery address" multiline error={errors.address} defaultValue={v.address} placeholder="House number, street, neighborhood..." />
        <Field id="city" label="City" error={errors.city} defaultValue={v.city} />
        <Field id="notes" label="Delivery notes" multiline optional defaultValue={v.notes} placeholder="Anything the delivery person should know?" />
        {errors.items && (
          <p role="alert" className="mt-5 text-sm font-semibold text-terracotta">{errors.items}</p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="mt-8 w-full rounded-full bg-cta px-6 py-4 text-sm font-bold text-white transition hover:bg-cta-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Placing order..." : "Place order"}
        </button>
      </form>

      <aside className="h-fit rounded-2xl bg-card p-6 shadow-sm">
        <h2 className="font-display text-2xl font-semibold text-heading">Your order</h2>
        <div className="mt-6 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-charcoal">{item.name}</p>
                <p className="mt-1 text-xs text-muted">{item.quantity} × {item.price} ETB</p>
              </div>
              <span className="text-sm font-semibold text-heading">{item.price * item.quantity} ETB</span>
            </div>
          ))}
        </div>
        <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
          <span className="text-base font-semibold text-heading">Total</span>
          <span className="font-display text-2xl font-semibold text-heading">{subtotal} ETB</span>
        </div>
      </aside>
    </div>
  );
}
