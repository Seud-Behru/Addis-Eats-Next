"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { adminUpdateDish } from "@/app/actions";
import { etb } from "@/lib/format";
import { Eye, EyeOff, Edit3, Check, X } from "lucide-react";

export default function AdminMenuManager({ initialDishes }) {
  const [dishes, setDishes] = useState(initialDishes);
  const [editingId, setEditingId] = useState(null);
  const [editPrice, setEditPrice] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  function startEdit(dish) {
    setEditingId(dish.id);
    setEditPrice(String(dish.price));
    setEditDesc(dish.description);
    setMessage("");
  }

  function cancelEdit() {
    setEditingId(null);
  }

  function handleSave(dishId) {
    const numPrice = Number(editPrice);
    if (isNaN(numPrice) || numPrice <= 0) {
      alert("Please enter a valid price");
      return;
    }

    startTransition(async () => {
      const res = await adminUpdateDish(dishId, {
        price: numPrice,
        description: editDesc,
      });

      if (res.ok) {
        setDishes((prev) =>
          prev.map((d) => (d.id === dishId ? { ...d, price: numPrice, description: editDesc } : d))
        );
        setEditingId(null);
        setMessage("Dish updated successfully! Changes revalidated across the site.");
      } else {
        alert(res.error || "Failed to update dish.");
      }
    });
  }

  function handleToggleVisibility(dish) {
    const nextVisible = dish.visible === false ? true : false;
    startTransition(async () => {
      const res = await adminUpdateDish(dish.id, { visible: nextVisible });
      if (res.ok) {
        setDishes((prev) =>
          prev.map((d) => (d.id === dish.id ? { ...d, visible: nextVisible } : d))
        );
        setMessage(`Dish "${dish.name}" is now ${nextVisible ? "Visible" : "Hidden"} to customers.`);
      }
    });
  }

  return (
    <div className="space-y-6">
      {message && (
        <div className="rounded-xl bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
          {message}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {dishes.map((dish) => {
          const isHidden = dish.visible === false;
          const isEditing = editingId === dish.id;

          return (
            <div
              key={dish.id}
              className={`flex flex-col overflow-hidden rounded-2xl bg-card shadow-sm transition ${
                isHidden ? "opacity-60 border-2 border-dashed border-border" : ""
              }`}
            >
              <div className="relative aspect-4/3 overflow-hidden bg-surface">
                <Image
                  src={dish.image}
                  alt={dish.name}
                  width={640}
                  height={480}
                  sizes="(min-width: 1024px) 33vw, 100vw"
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleToggleVisibility(dish)}
                  disabled={isPending}
                  className={`absolute right-3 top-3 inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full p-2.5 text-xs font-bold shadow backdrop-blur transition ${
                    isHidden
                      ? "bg-red-600 text-white"
                      : "bg-forest/90 text-white hover:bg-forest"
                  }`}
                  title={isHidden ? "Click to show to customers" : "Click to hide from customers"}
                >
                  {isHidden ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>

              <div className="flex grow flex-col p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-semibold text-terracotta">{dish.category}</span>
                    <h3 className="font-display text-lg font-bold text-heading">{dish.name}</h3>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      isHidden
                        ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                        : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                    }`}
                  >
                    {isHidden ? "Hidden" : "Live"}
                  </span>
                </div>

                {isEditing ? (
                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-charcoal">Price (ETB)</label>
                      <input
                        type="number"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-border bg-cream px-3 py-2 text-sm outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-charcoal">Description</label>
                      <textarea
                        rows={3}
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-border bg-cream px-3 py-2 text-xs outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSave(dish.id)}
                        disabled={isPending}
                        className="inline-flex min-h-[44px] items-center gap-1 rounded-full bg-forest px-4 py-2 text-xs font-semibold text-white"
                      >
                        <Check className="h-3.5 w-3.5" /> Save
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="inline-flex min-h-[44px] items-center gap-1 rounded-full bg-surface px-4 py-2 text-xs font-semibold text-muted"
                      >
                        <X className="h-3.5 w-3.5" /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="mt-2 line-clamp-2 text-xs text-muted">{dish.description}</p>
                    <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
                      <p className="font-display text-lg font-bold text-heading">{etb(dish.price)}</p>
                      <button
                        type="button"
                        onClick={() => startEdit(dish)}
                        className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-xs font-semibold text-heading transition hover:bg-border"
                      >
                        <Edit3 className="h-3.5 w-3.5" /> Edit
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
