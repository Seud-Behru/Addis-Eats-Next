"use client";

import useCartStore from "@/lib/cartStore";

export default function AddToCartButton({ dish, className, children }) {
  const addItem = useCartStore((s) => s.addItem);
  return (
    <button type="button" onClick={() => addItem(dish)} className={className}>
      {children}
    </button>
  );
}
