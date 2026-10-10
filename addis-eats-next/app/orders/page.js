import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { getOrdersForUser } from "@/lib/orders";

export const metadata = {
  title: "Your orders",
  description: "See your past and current Addis Eats orders.",
  robots: { index: false, follow: false },
};


// Reachable only via middleware's matcher ("/orders/:path*"), which
// already proves *a* valid session exists. getSession() runs again here
// anyway — a session can expire between that redirect and this render,
// and this page still needs the session's own id to scope the query, not
// just proof that one exists.
export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const session = await getSession();
  if (!session) redirect("/signin?next=/orders");

  const orders = getOrdersForUser(session.id);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 md:py-16">
      <h1 className="font-display text-3xl font-semibold text-heading sm:text-5xl">
        Your orders
      </h1>

      {orders.length === 0 ? (
        <p className="mt-6 text-sm text-muted">
          You haven&apos;t placed an order yet.{" "}
          <Link href="/menu" className="font-semibold text-heading underline underline-offset-4">
            Browse the menu
          </Link>
          .
        </p>
      ) : (
        <ul className="mt-8 space-y-3">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/orders/${order.id}`}
                className="flex items-center justify-between gap-4 rounded-xl bg-card p-4 shadow-sm transition hover:bg-surface"
              >
                <div>
                  <p className="text-sm font-semibold text-charcoal">{order.id}</p>
                  <p className="mt-1 text-xs text-muted">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-heading">{order.total} ETB</p>
                  <p className="mt-1 text-xs text-muted">{order.status}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
