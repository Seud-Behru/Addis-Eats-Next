import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { listAllOrders } from "@/lib/orders";

export const metadata = {
  title: "Kitchen",
  description: "Kitchen view of incoming Addis Eats orders (staff only).",
  robots: { index: false, follow: false },
};


// NOT in middleware.js's matcher — this route is protected entirely by
// the checks below, on purpose (see AUTH.md for why).
export const dynamic = "force-dynamic";

export default async function KitchenPage() {
  const session = await getSession();
  if (!session) redirect("/signin?next=/kitchen");

  // Signed in, but not staff: this is a 403, not a 401 — signing in again
  // wouldn't help, so this renders a message instead of redirecting to
  // /signin a second time. The check happens here, in server code, not by
  // leaving a "Kitchen" link out of the header for non-staff — a customer
  // who types this URL in by hand gets this same response.
  if (session.role !== "staff") {
    return (
      <main className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <h1 className="font-display text-3xl font-semibold text-heading">Staff only</h1>
        <p className="mt-4 text-muted">This page is for Addis Eats kitchen staff.</p>
      </main>
    );
  }

  const orders = listAllOrders();

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 md:py-16">
      <h1 className="font-display text-3xl font-semibold text-heading sm:text-5xl">
        Kitchen — all orders
      </h1>

      {orders.length === 0 ? (
        <p className="mt-6 text-sm text-muted">No orders yet.</p>
      ) : (
        <ul className="mt-8 space-y-3">
          {orders.map((order) => (
            <li key={order.id} className="rounded-xl bg-card p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-charcoal">
                  {order.id} · {order.customer.name}
                </p>
                <p className="text-sm font-semibold text-heading">{order.status}</p>
              </div>
              <p className="mt-2 text-xs text-muted">
                {order.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
