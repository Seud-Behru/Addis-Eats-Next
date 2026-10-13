"use client";

import { useTransition, useState } from "react";
import { cancelOrder } from "@/app/actions";

export default function CancelOrderButton({ orderId }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleClick(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to cancel this order?")) return;
    setError("");
    startTransition(async () => {
      const res = await cancelOrder(orderId);
      if (!res.ok) {
        setError(res.error || "Could not cancel");
      }
    });
  }

  return (
    <div className="inline-block">
      {error && <span className="mr-2 text-xs text-red-600">{error}</span>}
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="inline-flex min-h-[44px] items-center rounded-full border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 dark:border-red-900/60 dark:text-red-400 dark:hover:bg-red-950/40"
      >
        {isPending ? "Cancelling..." : "Cancel"}
      </button>
    </div>
  );
}
