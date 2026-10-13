"use client";

import useSWR from "swr";
import fetcher from "@/lib/fetcher";

const STAGES = ["Preparing", "Out for delivery", "Delivered"];


export default function OrderStatus({ id, initialOrder }) {
  const { data: order } = useSWR(`/api/orders/${id}`, fetcher, {
    fallbackData: initialOrder,
    refreshInterval: 5000,
  });

  const stepIndex = STAGES.indexOf(order.status);

  return (
    <div className="mt-8 rounded-2xl bg-card p-6 shadow-sm sm:p-8">
      <p className="text-sm text-muted">
        Placed {new Date(order.createdAt).toLocaleTimeString()}
      </p>

      <ol className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-0">
        {STAGES.map((stage, i) => (
          <li key={stage} className="flex items-center gap-3 sm:flex-1">
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                i <= stepIndex ? "bg-forest text-white" : "bg-surface text-muted"
              }`}
            >
              {i + 1}
            </span>
            <span
              className={`text-sm font-semibold ${
                i <= stepIndex ? "text-heading" : "text-muted"
              }`}
            >
              {stage}
            </span>
            {i < STAGES.length - 1 && (
              <span className="hidden h-px flex-1 bg-border sm:mx-3 sm:block" aria-hidden="true" />
            )}
          </li>
        ))}
      </ol>

      <p className="mt-6 text-sm text-muted">
        This page checks for updates automatically every 5 seconds.
      </p>

      <div className="mt-6 border-t border-border pt-5">
        <p className="text-sm font-semibold text-heading">
          Total: {order.total} ETB
        </p>
      </div>
    </div>
  );
}
