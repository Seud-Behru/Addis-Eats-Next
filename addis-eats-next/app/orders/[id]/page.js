import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { getOrder } from "@/lib/orders";
import OrderLiveTracker from "@/app/components/OrderLiveTracker";

export const metadata = {
  title: "Order status",
  description: "Follow your Addis Eats order from the kitchen to your door.",
  robots: { index: false, follow: false },
};

// Dynamic on purpose: order ids are created at runtime and the status changes
// by the second, so there is nothing here that could safely be cached.
export const dynamic = "force-dynamic";

export default async function OrderPage({ params }) {
  const { id } = await params;

  // middleware.js already proves a session exists for this path, but it
  // can't tell whose order this is — that check happens here.
  const session = await getSession();
  if (!session) redirect(`/signin?next=/orders/${id}`);

  const order = getOrder(id);

  // Someone else's order looks exactly like an order that doesn't exist —
  // see app/api/orders/[id]/route.js for the same rule applied to polling.
  if (!order || (order.userId !== session.id && session.role !== "staff" && session.role !== "admin")) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 md:py-16">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/order-history"
          className="text-sm font-semibold text-heading transition hover:text-terracotta"
        >
          ← Back to your orders
        </Link>
        <Link
          href="/menu"
          className="text-sm font-semibold text-muted transition hover:text-heading"
        >
          Browse menu
        </Link>
      </div>

      <p className="font-body text-xs font-bold uppercase tracking-[0.12em] text-terracotta">
        Order tracking
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-heading sm:text-5xl">
        Live Order Status
      </h1>

      <div className="mt-8">
        <OrderLiveTracker initialOrder={order} />
      </div>
    </main>
  );
}
