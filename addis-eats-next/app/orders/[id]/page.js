import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { getOrder } from "@/lib/orders";
import OrderStatus from "@/app/components/OrderStatus";

export const metadata = {
  title: "Order status",
  description: "Follow your Addis Eats order from the kitchen to your door.",
  robots: { index: false, follow: false },
};


// Dynamic on purpose: order ids are created at runtime (there's no
// generateStaticParams for them) and the status changes by the second,
// so there is nothing here that could safely be cached.
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
  if (!order || (order.userId !== session.id && session.role !== "staff")) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 md:py-16">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-terracotta">
        Order status
      </p>
      <h1 className="mt-3 font-display text-3xl font-semibold text-heading sm:text-5xl">
        {order.id}
      </h1>

      {/* order is rendered on the server, then handed to the client
          component as fallbackData — so the first paint already has
          real data and OrderStatus never shows a loading spinner. */}
      <OrderStatus id={order.id} initialOrder={order} />
    </main>
  );
}
