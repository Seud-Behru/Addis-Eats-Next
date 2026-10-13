"use client";

import { Download } from "lucide-react";
import { generateOrdersCsv } from "@/lib/csv";

export default function ExportOrdersButton({ orders = [] }) {
  function handleExport() {
    if (!orders || orders.length === 0) return;
    const csvContent = generateOrdersCsv(orders);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `addis-eats-orders-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={orders.length === 0}
      className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-xs font-semibold text-heading shadow-sm transition hover:bg-surface focus:outline-none focus:ring-2 focus:ring-terracotta focus:ring-offset-2 disabled:opacity-40"
      aria-label="Export orders to CSV file"
    >
      <Download className="h-4 w-4 text-forest" aria-hidden="true" />
      <span>Export CSV</span>
    </button>
  );
}
