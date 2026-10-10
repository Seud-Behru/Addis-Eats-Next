import { getSession } from "@/lib/session";
import { submitOrder } from "@/lib/orders";

// POST /api/orders — NOT in middleware.js's matcher, so this check is the
// only thing standing between an unauthenticated curl request and placing
// an order. A JSON 401 makes more sense here than an HTML redirect, since
// nothing but code calls a route handler directly.
//
// curl -i -X POST localhost:3000/api/orders -H "Content-Type: application/json" \
//   -d '{"name":"Almaz","phone":"0912"}'   ->  401 (no session cookie sent)
export async function POST(request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Sign in required" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be JSON" }, { status: 400 });
  }

  const result = submitOrder({ ...body, userId: session.id });
  if (!result.ok) {
    return Response.json(
      { error: "Validation failed", fieldErrors: result.fieldErrors },
      { status: 422 }
    );
  }
  const { id, total } = result.order;
  return Response.json({ id, total, currency: "ETB" }, { status: 201 });
}
