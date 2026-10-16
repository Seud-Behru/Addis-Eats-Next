import { getDish } from "./menu";
import { validateDelivery } from "./validate";

// Baseline seed orders so the restaurant dashboard has realistic operational metrics on start
const INITIAL_ORDERS = [
  {
    id: "ord_addis_89a1",
    userId: "usr_bereket",
    createdAt: new Date(Date.now() - 1000 * 60 * 14).toISOString(), // 14 mins ago
    status: "Preparing",
    manualStatus: true,
    items: [
      { id: "prime-derek-tibs", name: "Prime Derek Tibs", price: 680, quantity: 2 },
      { id: "cold-brew", name: "Cold Brew", price: 180, quantity: 2 },
    ],
    total: 1720,
    customer: {
      name: "Bereket Tesfaye",
      phone: "+251 91 123 4567",
      address: "Bole Medhanialem, House 402",
      city: "Bole",
      notes: "Please pack extra awaze and mitmita.",
    },
  },
  {
    id: "ord_addis_72b3",
    userId: "usr_selam",
    createdAt: new Date(Date.now() - 1000 * 60 * 32).toISOString(), // 32 mins ago
    status: "Out for delivery",
    manualStatus: true,
    items: [
      { id: "doro-wat", name: "Authentic Doro Wat", price: 850, quantity: 1 },
      { id: "addis-dialova-pizza", name: "Addis Diavola Pizza", price: 520, quantity: 1 },
    ],
    total: 1370,
    customer: {
      name: "Selamawit Desta",
      phone: "+251 92 884 9211",
      address: "Kazanchis, UN ECA Gate 3",
      city: "Kazanchis",
      notes: "Call when rider arrives at security gate.",
    },
  },
  {
    id: "ord_addis_54c9",
    userId: "usr_dawit",
    createdAt: new Date(Date.now() - 1000 * 60 * 75).toISOString(), // 75 mins ago
    status: "Delivered",
    manualStatus: true,
    items: [
      { id: "braised-lamb-asta", name: "Braised Lamb Pasta", price: 740, quantity: 2 },
    ],
    total: 1480,
    customer: {
      name: "Dawit Haile",
      phone: "+251 91 445 6789",
      address: "CMC Michael, Block 12",
      city: "CMC",
      notes: "Delivered to reception.",
    },
  },
  {
    id: "ord_addis_31d4",
    userId: "usr_almaz",
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hrs ago
    status: "Delivered",
    manualStatus: true,
    items: [
      { id: "lassic-heeseburger", name: "Classic Cheeseburger", price: 460, quantity: 2 },
      { id: "cold-brew", name: "Cold Brew", price: 180, quantity: 1 },
    ],
    total: 1100,
    customer: {
      name: "Almaz Kebede",
      phone: "+251 93 551 2345",
      address: "Old Airport, Near Golf Club",
      city: "Old Airport",
      notes: "Leave with security.",
    },
  },
];

// In-memory store initialized with baseline operational data
const store = (globalThis.__addisOrders ??= [...INITIAL_ORDERS]);

export function submitOrder(input) {
  const fieldErrors = validateDelivery(input);

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
  store.unshift(order);
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

  const zoneMap = {};
  const dishMap = {};

  all.forEach((o) => {
    if (statusCounts[o.status] !== undefined) {
      statusCounts[o.status]++;
    }
    const zone = o.customer?.city || "Bole";
    zoneMap[zone] = (zoneMap[zone] || 0) + 1;

    if (Array.isArray(o.items)) {
      o.items.forEach((item) => {
        dishMap[item.name] = (dishMap[item.name] || 0) + (item.quantity || 1);
      });
    }
  });

  const topDishes = Object.entries(dishMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  const topZones = Object.entries(zoneMap)
    .map(([zone, count]) => ({ zone, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  return {
    totalRevenue,
    totalOrders: all.length,
    activeOrders: statusCounts.Preparing + statusCounts["Out for delivery"],
    statusCounts,
    averageOrderValue: validOrders.length > 0 ? Math.round(totalRevenue / validOrders.length) : 0,
    topDishes,
    topZones,
    recentOrders: all.slice(0, 6),
  };
}
