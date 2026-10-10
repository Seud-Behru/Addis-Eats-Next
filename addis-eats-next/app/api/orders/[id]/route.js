import { getSession } from "@/lib/session";
import { getOrder } from "@/lib/orders";

// GET /api/orders/[id] — polled by OrderStatus.jsx every 5 seconds.
// Also not in middleware.js's matcher, so the session check lives here.
//
// A missing order and someone else's order return the exact same 404 —
// so there is no way to tell "that id doesn't exist" apart from "that id
// exists but isn't yours" (staff can see any order).
export async function GET(_request, { params }) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Sign in required" }, { status: 401 });
  }

  const { id } = await params;
  const order = getOrder(id);

  if (!order || (order.userId !== session.id && session.role !== "staff")) {
    return Response.json({ error: "No such order" }, { status: 404 });
  }

  return Response.json(order);
}
