"use client";

import { useEffect, useState, useTransition } from "react";
import { cancelOrder } from "@/app/actions";
import { etb, when, relative } from "@/lib/format";
import DeliveryMap from "./DeliveryMap";

const STAGES = ["Preparing", "Out for delivery", "Delivered"];

export default function OrderLiveTracker({ initialOrder, canCancel = true }) {
  const [order, setOrder] = useState(initialOrder);
  const [isPending, startTransition] = useTransition();
  const [cancelError, setCancelError] = useState("");

  // Seeded from server data; updates via Server-Sent Events (SSE) stream
  useEffect(() => {
    if (!order?.id) return;
    if (order.status === "Delivered" || order.status === "Cancelled") return;

    const eventSource = new EventSource(`/api/orders/${order.id}/stream`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data && data.status) {
          setOrder((prev) => ({ ...prev, ...data }));
        }
      } catch {
        // body wasn't JSON
      }
    };

    eventSource.onerror = () => {
      // Stream closed or error
      eventSource.close();
    };

    // Properly closes the connection on unmount
    return () => {
      eventSource.close();
    };
  }, [order?.id, order?.status]);

  const stepIndex = STAGES.indexOf(order?.status);
  const isCancelled = order?.status === "Cancelled";

  function handleCancel() {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    setCancelError("");
    startTransition(async () => {
      const res = await cancelOrder(order.id);
      if (res.ok) {
        setOrder((prev) => ({ ...prev, status: "Cancelled" }));
      } else {
        setCancelError(res.error || "Failed to cancel order.");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-card p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-muted">Order ID</span>
            <h2 className="font-display text-2xl font-bold text-heading">{order.id}</h2>
            <p className="mt-1 text-xs text-muted">
              Placed {when(order.createdAt)} ({relative(order.createdAt)})
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs font-semibold text-muted">Status</span>
            <p
              className={`text-lg font-bold ${
                isCancelled
                  ? "text-red-600"
                  : order.status === "Delivered"
                  ? "text-emerald-700 dark:text-emerald-400"
                  : "text-terracotta"
              }`}
            >
              {order.status}
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted">
              <span className="h-2 w-2 animate-ping rounded-full bg-forest" />
              Live SSE connection
            </span>
          </div>
        </div>

        {/* Step progress bar if not cancelled */}
        {!isCancelled ? (
          <ol className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-0">
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
        ) : (
          <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-300">
            This order was cancelled.
          </div>
        )}

        {/* Order items */}
        <div className="mt-8 border-t border-border pt-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted">Items ordered</h3>
          <ul className="mt-3 divide-y divide-border">
            {order.items?.map((item, idx) => (
              <li key={idx} className="flex items-center justify-between py-3 text-sm">
                <span className="font-semibold text-charcoal">
                  {item.quantity} × {item.name}
                </span>
                <span className="font-semibold text-heading">
                  {etb(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Total & TeleBirr Payment */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5">
          <div>
            <p className="text-xs text-muted">Payment method: <strong className="text-heading">TeleBirr</strong></p>
            <p className="text-xs text-muted">Recipient: {order.customer?.name} ({order.customer?.phone})</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-muted">Total amount</span>
            <p className="font-display text-2xl font-bold text-heading">{etb(order.total)}</p>
          </div>
        </div>

        {/* Cancel order button */}
        {canCancel && !isCancelled && order.status !== "Delivered" && (
          <div className="mt-6 border-t border-border pt-5">
            {cancelError && (
              <p className="mb-3 text-xs font-semibold text-terracotta">{cancelError}</p>
            )}
            <button
              type="button"
              onClick={handleCancel}
              disabled={isPending}
              className="rounded-full border border-red-300 px-5 py-2.5 text-xs font-semibold text-red-700 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
            >
              {isPending ? "Cancelling..." : "Cancel Order"}
            </button>
          </div>
        )}
      </div>

      {/* Real Leaflet Map showing Addis Ababa route */}
      <DeliveryMap
        address={order.customer?.address}
        city={order.customer?.city || "Addis Ababa"}
        status={order.status}
      />
    </div>
  );
}
