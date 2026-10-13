import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getOrder } from "@/lib/orders";
import OrderLiveTracker from "@/app/components/OrderLiveTracker";
import { CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Order Success",
  description: "Your Addis Eats order has been successfully placed.",
  robots: { index: false, follow: false },
};

// Dynamic: Displays the order that was just placed, which only exists after
// checkout — there's nothing to prerender.
export const dynamic = "force-dynamic";

export default async function OrderSuccessPage({ searchParams }) {
  const session = await getSession();
  if (!session) {
    redirect("/signin?next=/order-success");
  }

  const params = await searchParams;
  const orderId = params?.orderId;
  const order = orderId ? getOrder(orderId) : null;

  if (!order || (order.userId !== session.id && session.role !== "staff" && session.role !== "admin")) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <h1 className="font-display text-3xl font-semibold text-heading">Order Placed</h1>
        <p className="mt-4 text-muted">
          Your order was placed successfully! You can track all your orders in your history.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/order-history"
            className="rounded-full bg-forest px-6 py-3 text-sm font-semibold text-white transition hover:bg-deep-forest"
          >
            View Order History
          </Link>
          <Link
            href="/menu"
            className="rounded-full bg-surface px-6 py-3 text-sm font-semibold text-heading transition hover:bg-border"
          >
            Back to Menu
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 md:py-16">
      {/* Success banner */}
      <div className="mb-8 rounded-3xl bg-forest p-6 text-center text-white shadow-md sm:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-emerald-400">
          <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
        </div>
        <h1 className="mt-4 font-display text-3xl font-semibold sm:text-4xl">
          Order Successfully Placed!
        </h1>
        <p className="mx-auto mt-2 max-w-lg text-sm text-white/80">
          Ameseginalew! We have received your TeleBirr payment and our kitchen is preparing your dishes.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/order-history"
            className="rounded-full bg-cta px-6 py-2.5 text-xs font-bold text-white shadow transition hover:bg-cta-dark"
          >
            All Past Orders
          </Link>
          <Link
            href="/menu"
            className="rounded-full bg-white/10 px-6 py-2.5 text-xs font-semibold text-white transition hover:bg-white/20"
          >
            Explore More Food
          </Link>
        </div>
      </div>

      <OrderLiveTracker initialOrder={order} />
    </main>
  );
}
