/**
 * Correctly escapes a field for CSV export according to RFC 4180.
 * Any field containing quotes, commas, or newlines is wrapped in double quotes,
 * and internal double quotes are escaped by doubling them ("").
 */
export function escapeCsvField(val) {
  if (val === null || val === undefined) return "";
  const str = String(val);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function generateOrdersCsv(orders) {
  const headers = [
    "Order ID",
    "Customer Name",
    "Phone",
    "Address",
    "City",
    "Status",
    "Items",
    "Total (ETB)",
    "Created At",
  ];

  const rows = orders.map((order) => {
    const itemsSummary = (order.items || [])
      .map((item) => `${item.quantity}x ${item.name}`)
      .join("; ");

    return [
      escapeCsvField(order.id),
      escapeCsvField(order.customer?.name),
      escapeCsvField(order.customer?.phone),
      escapeCsvField(order.customer?.address),
      escapeCsvField(order.customer?.city),
      escapeCsvField(order.status),
      escapeCsvField(itemsSummary),
      escapeCsvField(order.total),
      escapeCsvField(order.createdAt),
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\r\n");
}
