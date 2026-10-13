"use client";

import { etb } from "@/lib/format";

export default function AdminRevenueChart({ summary, error }) {
  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
        <h3 className="font-bold">Error loading chart data</h3>
        <p className="mt-1 text-xs">Please refresh the dashboard.</p>
      </div>
    );
  }

  if (!summary || summary.totalOrders === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-2xl bg-card p-6 text-center shadow-sm">
        <h3 className="font-display text-lg font-semibold text-heading">Revenue & Orders Distribution</h3>
        <p className="mt-2 text-xs text-muted">Unit: ETB · No orders recorded yet.</p>
        <p className="mt-4 text-xs text-muted">Chart will populate once customers place orders.</p>
      </div>
    );
  }

  const { statusCounts = {}, totalOrders = 1, totalRevenue = 0 } = summary;

  const categories = [
    { label: "Preparing", count: statusCounts["Preparing"] || 0, color: "bg-amber-500" },
    { label: "Out for delivery", count: statusCounts["Out for delivery"] || 0, color: "bg-terracotta" },
    { label: "Delivered", count: statusCounts["Delivered"] || 0, color: "bg-emerald-600" },
    { label: "Cancelled", count: statusCounts["Cancelled"] || 0, color: "bg-red-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Visual Chart with Heading, Unit (ETB), and Fixed Height */}
      <section
        aria-labelledby="chart-heading"
        className="rounded-2xl bg-card p-6 shadow-sm"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4">
          <div>
            <h3 id="chart-heading" className="font-display text-lg font-semibold text-heading">
              Order Stage Volume & Revenue
            </h3>
            <p className="text-xs text-muted">
              Unit: <strong className="text-heading">ETB (Ethiopian Birr)</strong> · Aggregated live server data
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-muted">Total Gross Volume</span>
            <p className="font-display text-xl font-bold text-heading">{etb(totalRevenue)}</p>
          </div>
        </div>

        {/* Fixed height container for chart */}
        <div className="mt-6 flex h-64 items-end gap-6 px-4 pb-4 pt-6" role="img" aria-label="Bar chart showing order counts by stage">
          {categories.map((cat) => {
            const pct = Math.max(8, Math.round((cat.count / Math.max(1, totalOrders)) * 100));
            return (
              <div key={cat.label} className="flex flex-1 flex-col items-center h-full justify-end">
                <span className="mb-2 text-xs font-bold text-heading">{cat.count}</span>
                <div
                  style={{ height: `${pct}%` }}
                  className={`w-full max-w-[56px] rounded-t-lg transition-all duration-500 ${cat.color}`}
                  title={`${cat.label}: ${cat.count} orders (${pct}%)`}
                />
                <span className="mt-2 text-center text-xs font-medium text-muted line-clamp-1">
                  {cat.label}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Accessible semantic HTML table accompanying the chart */}
      <section aria-labelledby="table-accessible-heading" className="overflow-hidden rounded-2xl bg-card shadow-sm">
        <h4 id="table-accessible-heading" className="sr-only">
          Accessible Order Breakdown Data Table
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="border-b border-border p-4 text-left font-display text-base font-semibold text-heading">
              Detailed Order Status Summary Table
            </caption>
            <thead className="bg-surface text-xs font-semibold uppercase text-muted">
              <tr>
                <th scope="col" className="px-6 py-3">Order Status</th>
                <th scope="col" className="px-6 py-3 text-right">Count</th>
                <th scope="col" className="px-6 py-3 text-right">Share (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {categories.map((cat) => {
                const share = totalOrders > 0 ? Math.round((cat.count / totalOrders) * 100) : 0;
                return (
                  <tr key={cat.label} className="hover:bg-surface/50">
                    <th scope="row" className="px-6 py-3.5 font-semibold text-charcoal">
                      <span className="inline-block h-2.5 w-2.5 rounded-full mr-2.5 align-middle" style={{ backgroundColor: cat.color.replace('bg-', '') }} />
                      {cat.label}
                    </th>
                    <td className="px-6 py-3.5 text-right font-medium text-heading">
                      {cat.count}
                    </td>
                    <td className="px-6 py-3.5 text-right text-muted">
                      {share}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="border-t border-border bg-surface font-semibold text-heading">
              <tr>
                <th scope="row" className="px-6 py-3.5">Total Orders</th>
                <td className="px-6 py-3.5 text-right">{totalOrders}</td>
                <td className="px-6 py-3.5 text-right">100%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    </div>
  );
}
