import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { listAllOrders } from "@/lib/orders";
import AdminOrdersManager from "@/app/components/AdminOrdersManager";

export const metadata = {
  title: "Admin Orders Management",
  description: "Monitor and update all live customer orders across Addis Ababa.",
  robots: { index: false, follow: false },
};

// Dynamic: Reads and writes live order data, and — like the dashboard — is
// gated behind the session cookie.
export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login?next=/admin/orders");
  }

  if (session.role !== "admin" && session.role !== "staff") {
    redirect("/");
  }

  const orders = listAllOrders();

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-16">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <Link
            href="/admin"
            className="text-xs font-semibold text-terracotta hover:underline"
          >
            ← Back to Admin Dashboard
          </Link>
          <h1 className="mt-2 font-display text-3xl font-semibold text-heading sm:text-4xl">
            Live Orders Management
          </h1>
          <p className="mt-1 text-sm text-muted">
            Manage preparation, delivery stages, and customer dispatches in real time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/kitchen"
            className="inline-flex min-h-[44px] items-center rounded-full bg-forest px-4 py-2 text-xs font-bold text-white transition hover:bg-deep-forest"
          >
            Kitchen Staff View →
          </Link>
        </div>
      </div>

      <div className="mt-8">
        <AdminOrdersManager initialOrders={orders} />
      </div>
    </main>
  );
}
