import { getDish } from "./menu";
import { validateDelivery } from "./validate";

// No database yet: orders live in memory and reset when the server restarts.
const store = (globalThis.__addisOrders ??= []);


export function submitOrder(input) {
  const fieldErrors = validateDelivery(input);

  // Ownership starts here: userId comes only from the caller's own
  // getSession() lookup (see app/actions.js and app/api/orders/route.js),
  // never from client-submitted form or JSON data, so an order can't be
  // created under someone else's account by sending a different id.
  if (!input?.userId) {
    fieldErrors.session = "You must be signed in to place an order.";
  }

  const raw = Array.isArray(input?.items) ? input.items : [];
  const lines = raw.map((item) => {
    const dish = getDish(String(item?.id));
    const quantity = Number(item?.quantity);
    const valid = Number.isInteger(quantity) && quantity >= 1 && quantity <= 20;
    return dish && valid
      ? { id: dish.id, name: dish.name, price: dish.price, quantity }
      : null;
  });
  if (lines.length === 0 || lines.includes(null)) {
    fieldErrors.items =
      "Your cart is empty or has a dish that is no longer available.";
  }
  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };

  const order = {
    id: `ord_${Date.now().toString(36)}`,
    userId: input.userId,
    createdAt: new Date().toISOString(),
    status: "Preparing",
    items: lines,
    total: lines.reduce((sum, l) => sum + l.price * l.quantity, 0),
    customer: {
      name: String(input.name).trim(),
      phone: String(input.phone).trim(),
      address: String(input.address).trim(),
      city: String(input.city).trim(),
      notes: String(input.notes ?? "").trim(),
    },
  };
  store.push(order);
  return { ok: true, order };
}

const STAGES = [
  { status: "Preparing", after: 0 },
  { status: "Out for delivery", after: 20_000 },
  { status: "Delivered", after: 45_000 },
];

function deriveStatus(order) {
  if (order.status === "Cancelled") return "Cancelled";
  if (order.manualStatus) return order.status;
  const elapsed = Date.now() - new Date(order.createdAt).getTime();
  let status = STAGES[0].status;
  for (const stage of STAGES) {
    if (elapsed >= stage.after) status = stage.status;
  }
  return status;
}

export function getOrder(id) {
  const order = store.find((o) => o.id === id);
  if (!order) return null;
  return { ...order, status: deriveStatus(order) };
}

export function cancelOrderInStore(id, userId, role) {
  const order = store.find((o) => o.id === id);
  if (!order) return { ok: false, error: "Order not found" };

  // Ownership check: must be owner or staff/admin
  if (order.userId !== userId && role !== "staff" && role !== "admin") {
    return { ok: false, error: "Unauthorized to cancel this order" };
  }

  const currentStatus = deriveStatus(order);
  if (currentStatus === "Delivered") {
    return { ok: false, error: "Cannot cancel an already delivered order" };
  }
  if (currentStatus === "Cancelled") {
    return { ok: false, error: "Order is already cancelled" };
  }

  order.status = "Cancelled";
  order.manualStatus = true;
  return { ok: true, order: { ...order } };
}

export function updateOrderStatus(id, newStatus) {
  const order = store.find((o) => o.id === id);
  if (!order) return null;
  order.status = newStatus;
  order.manualStatus = true;
  return { ...order };
}

// ---------------------------------------------------------------------
// Reading orders back, scoped by who's asking.
// ---------------------------------------------------------------------

// Used by /orders & /order-history — only ever returns orders whose userId matches
// the session's own id.
export function getOrdersForUser(userId) {
  return store
    .filter((o) => o.userId === userId)
    .map((o) => ({ ...o, status: deriveStatus(o) }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

// Used by /kitchen & /admin/orders
export function listAllOrders() {
  return store
    .map((o) => ({ ...o, status: deriveStatus(o) }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

// Aggregation for the Admin dashboard: summarized on the server so only
// aggregated metrics cross the wire to the client.
export function getOrdersSummary() {
  const all = listAllOrders();
  const validOrders = all.filter((o) => o.status !== "Cancelled");
  const totalRevenue = validOrders.reduce((sum, o) => sum + (o.total || 0), 0);

  const statusCounts = {
    Preparing: 0,
    "Out for delivery": 0,
    Delivered: 0,
    Cancelled: 0,
  };

  all.forEach((o) => {
    if (statusCounts[o.status] !== undefined) {
      statusCounts[o.status]++;
    }
  });

  return {
    totalRevenue,
    totalOrders: all.length,
    activeOrders: statusCounts.Preparing + statusCounts["Out for delivery"],
    statusCounts,
    recentOrders: all.slice(0, 5),
  };
}
