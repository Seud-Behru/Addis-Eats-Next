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

function deriveStatus(createdAt) {
  const elapsed = Date.now() - new Date(createdAt).getTime();
  let status = STAGES[0].status;
  for (const stage of STAGES) {
    if (elapsed >= stage.after) status = stage.status;
  }
  return status;
}

export function getOrder(id) {
  const order = store.find((o) => o.id === id);
  if (!order) return null;
  return { ...order, status: deriveStatus(order.createdAt) };
}

// ---------------------------------------------------------------------
// Reading orders back, scoped by who's asking.
// ---------------------------------------------------------------------

// Used by /orders — only ever returns orders whose userId matches the
// session's own id. There's no parameter here a caller could widen to
// see someone else's orders; the id comes from getSession(), not from
// a query string.
export function getOrdersForUser(userId) {
  return store
    .filter((o) => o.userId === userId)
    .map((o) => ({ ...o, status: deriveStatus(o.createdAt) }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

// Used by /kitchen only, which checks session.role === "staff" itself
// before ever calling this — see app/kitchen/page.js.
export function listAllOrders() {
  return store
    .map((o) => ({ ...o, status: deriveStatus(o.createdAt) }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
