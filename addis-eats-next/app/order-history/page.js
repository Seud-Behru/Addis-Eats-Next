import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { getOrdersForUser } from "@/lib/orders";
import { etb, when, relative } from "@/lib/format";
import ExportOrdersButton from "@/app/components/ExportOrdersButton";
import CancelOrderButton from "@/app/components/CancelOrderButton";

export const metadata = {
  title: "Order History",
  description: "View all your past and active orders at Addis Eats.",
  robots: { index: false, follow: false },
};

// Dynamic: Has to read the session cookie to know whose orders to show —
// the response depends on who's asking.
export const dynamic = "force-dynamic";

export default async function OrderHistoryPage() {
  const session = await getSession();
  if (!session) {
    redirect("/signin?next=/order-history");
  }

  const orders = getOrdersForUser(session.id);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 md:py-16">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <p className="font-body text-xs font-bold uppercase tracking-[0.12em] text-terracotta">
            Your Account
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-heading sm:text-4xl">
            Order History
          </h1>
          <p className="mt-1 text-sm text-muted">
            Signed in as <strong className="text-heading">{session.name || session.email}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ExportOrdersButton orders={orders} />
          <Link
            href="/menu"
            className="inline-flex min-h-11 items-center rounded-full bg-cta px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-cta-dark"
          >
            Order Food
          </Link>
        </div>
      </div>

      {orders.length === 0 ? (
        <section aria-labelledby="empty-history-heading" className="mt-12 rounded-3xl bg-card p-12 text-center shadow-sm">
          <h2 id="empty-history-heading" className="font-display text-2xl font-semibold text-heading">
            No orders found
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">
            You haven&apos;t placed any food orders yet. Explore our delicious menu of Ethiopian classics, fresh pizza, and burgers.
          </p>
          <div className="mt-8">
            <Link
              href="/menu"
              className="inline-flex min-h-11 items-center rounded-full bg-forest px-6 py-3 text-sm font-semibold text-white transition hover:bg-deep-forest"
            >
              Browse Addis Eats Menu
            </Link>
          </div>
        </section>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((order) => {
            const isCancelled = order.status === "Cancelled";
            const isDelivered = order.status === "Delivered";
            const canCancel = !isCancelled && !isDelivered;

            return (
              <article
                key={order.id}
                className="overflow-hidden rounded-2xl bg-card p-5 shadow-sm transition hover:shadow-md sm:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/orders/${order.id}`}
                        className="font-display text-xl font-bold text-heading hover:text-terracotta"
                      >
                        {order.id}
                      </Link>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${isCancelled
                            ? "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300"
                            : isDelivered
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                          }`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-muted">
                      Placed on {when(order.createdAt)} · {relative(order.createdAt)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-display text-2xl font-bold text-heading">
                      {etb(order.total)}
                    </p>
                    <p className="text-xs text-muted">TeleBirr Payment</p>
                  </div>
                </div>

                <div className="mt-4 border-t border-border pt-4">
                  <p className="text-xs font-semibold text-muted">Dishes:</p>
                  <p className="mt-1 text-sm text-charcoal">
                    {order.items?.map((item) => `${item.quantity}× ${item.name}`).join(", ")}
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                  <div className="text-xs text-muted">
                    <span>Delivered to: </span>
                    <strong className="text-heading">
                      {order.customer?.address}, {order.customer?.city}
                    </strong>
                  </div>

                  <div className="flex items-center gap-3">
                    {canCancel && <CancelOrderButton orderId={order.id} />}
                    <Link
                      href={`/orders/${order.id}`}
                      className="inline-flex min-h-11 items-center rounded-full bg-surface px-4 py-2 text-xs font-semibold text-heading transition hover:bg-border"
                    >
                      Track Order →
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
