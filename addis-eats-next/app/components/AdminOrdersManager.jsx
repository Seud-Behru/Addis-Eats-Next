"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { adminUpdateOrderStatus } from "@/app/actions";
import { etb, when, relative } from "@/lib/format";
import ExportOrdersButton from "./ExportOrdersButton";

const STATUSES = ["Preparing", "Out for delivery", "Delivered", "Cancelled"];

export default function AdminOrdersManager({ initialOrders }) {
  const [orders, setOrders] = useState(initialOrders);
  const [filter, setFilter] = useState("All");
  const [isPending, startTransition] = useTransition();

  function handleStatusChange(orderId, newStatus) {
    startTransition(async () => {
      const res = await adminUpdateOrderStatus(orderId, newStatus);
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
      } else {
        alert(res.error || "Failed to update order status");
      }
    });
  }

  const filteredOrders =
    filter === "All" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="space-y-6">
      {/* Controls & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter orders by stage">
          {["All", ...STATUSES].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilter(st)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                filter === st
                  ? "bg-forest text-white"
                  : "bg-surface text-heading hover:bg-border"
              }`}
            >
              {st} ({st === "All" ? orders.length : orders.filter((o) => o.status === st).length})
            </button>
          ))}
        </div>

        <ExportOrdersButton orders={filteredOrders} />
      </div>

      {filteredOrders.length === 0 ? (
        <div className="rounded-2xl bg-card p-12 text-center shadow-sm">
          <p className="text-sm text-muted">No orders match this status filter.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Live Orders Management Table</caption>
              <thead className="bg-surface text-xs font-semibold uppercase text-muted">
                <tr>
                  <th scope="col" className="px-6 py-3">Order</th>
                  <th scope="col" className="px-6 py-3">Customer & Location</th>
                  <th scope="col" className="px-6 py-3">Dishes</th>
                  <th scope="col" className="px-6 py-3 text-right">Total</th>
                  <th scope="col" className="px-6 py-3">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-surface/50">
                    <th scope="row" className="px-6 py-4 font-semibold text-heading">
                      <Link href={`/orders/${order.id}`} className="hover:text-terracotta">
                        {order.id}
                      </Link>
                      <p className="text-xs font-normal text-muted">{relative(order.createdAt)}</p>
                    </th>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-charcoal">{order.customer?.name}</p>
                      <p className="text-xs text-muted">{order.customer?.phone}</p>
                      <p className="mt-1 text-xs text-muted">
                        {order.customer?.address}, {order.customer?.city}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-xs text-charcoal">
                      {order.items?.map((item) => `${item.quantity}× ${item.name}`).join(", ")}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-heading">
                      {etb(order.total)}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        disabled={isPending}
                        className="rounded-xl border border-border bg-cream px-3 py-1.5 text-xs font-semibold text-charcoal outline-none transition focus:border-terracotta"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
