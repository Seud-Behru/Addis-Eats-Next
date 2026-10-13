import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { getOrdersSummary } from "@/lib/orders";
import { etb, when, relative } from "@/lib/format";
import AdminRevenueChart from "@/app/components/AdminRevenueChart";
import ExportOrdersButton from "@/app/components/ExportOrdersButton";
import { Utensils, ShoppingBag, DollarSign, ChefHat } from "lucide-react";

export const metadata = {
  title: "Admin Dashboard",
  description: "Executive and operational dashboard for Addis Eats restaurant management.",
  robots: { index: false, follow: false },
};

// Dynamic: Reads the session cookie and checks the admin role before showing anything.
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await getSession();

  // Redirect unauthenticated visitors to login with safe next parameter
  if (!session) {
    redirect("/admin/login?next=/admin");
  }

  // Enforce staff/admin role check on server
  if (session.role !== "admin" && session.role !== "staff") {
    return (
      <main className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <h1 className="font-display text-3xl font-semibold text-heading">Access Denied</h1>
        <p className="mt-4 text-muted">
          Your account ({session.email}) does not have administrative privileges.
        </p>
        <div className="mt-8">
          <Link
            href="/"
            className="rounded-full bg-forest px-6 py-3 text-sm font-semibold text-white transition hover:bg-deep-forest"
          >
            Return Home
          </Link>
        </div>
      </main>
    );
  }

  // Aggregation: Data is summarized on the server. Only a few rows cross the boundary to the client.
  const summary = getOrdersSummary();

  const metrics = [
    {
      title: "Total Sales",
      value: etb(summary.totalRevenue),
      subtext: "Gross revenue collected via TeleBirr",
      icon: DollarSign,
      color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    },
    {
      title: "Total Orders",
      value: summary.totalOrders,
      subtext: `${summary.activeOrders} active in kitchen/delivery`,
      icon: ShoppingBag,
      color: "bg-terracotta/10 text-terracotta",
    },
    {
      title: "In Kitchen",
      value: summary.statusCounts.Preparing,
      subtext: "Meals currently on the stove",
      icon: ChefHat,
      color: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    },
    {
      title: "Delivered",
      value: summary.statusCounts.Delivered,
      subtext: "Successfully completed orders",
      icon: Utensils,
      color: "bg-forest/10 text-forest dark:text-cream",
    },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-16">
      {/* Header and Quick Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <p className="font-body text-xs font-bold uppercase tracking-[0.12em] text-terracotta">
            Restaurant Operations
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-heading sm:text-4xl">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted">
            Signed in as <strong className="text-heading">{session.name || session.email}</strong> ({session.role})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ExportOrdersButton orders={summary.recentOrders} />
          <Link
            href="/admin/menu"
            className="inline-flex min-h-[44px] items-center rounded-full bg-surface px-4 py-2 text-xs font-semibold text-heading transition hover:bg-border"
          >
            Manage Menu
          </Link>
          <Link
            href="/admin/orders"
            className="inline-flex min-h-[44px] items-center rounded-full bg-surface px-4 py-2 text-xs font-semibold text-heading transition hover:bg-border"
          >
            Manage Orders
          </Link>
          <Link
            href="/kitchen"
            className="inline-flex min-h-[44px] items-center rounded-full bg-forest px-4 py-2 text-xs font-bold text-white transition hover:bg-deep-forest"
          >
            Kitchen View →
          </Link>
        </div>
      </div>

      {/* Aggregated KPI Metric Cards */}
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.title} className="rounded-2xl bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted">
                  {m.title}
                </span>
                <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${m.color}`}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
              </div>
              <p className="mt-3 font-display text-2xl font-bold text-heading">{m.value}</p>
              <p className="mt-1 text-xs text-muted">{m.subtext}</p>
            </div>
          );
        })}
      </div>

      {/* Chart: Client Component on a Server Page */}
      <div className="mt-10">
        <AdminRevenueChart summary={summary} />
      </div>

      {/* Semantic Table: Recent Orders */}
      <section aria-labelledby="recent-orders-heading" className="mt-10 overflow-hidden rounded-2xl bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border p-6">
          <h2 id="recent-orders-heading" className="font-display text-xl font-semibold text-heading">
            Recent Orders
          </h2>
          <Link
            href="/admin/orders"
            className="text-xs font-semibold text-terracotta hover:underline"
          >
            View all orders →
          </Link>
        </div>

        {summary.recentOrders.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted">
            No orders placed yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">List of recent orders at Addis Eats</caption>
              <thead className="bg-surface text-xs font-semibold uppercase text-muted">
                <tr>
                  <th scope="col" className="px-6 py-3">Order ID</th>
                  <th scope="col" className="px-6 py-3">Customer</th>
                  <th scope="col" className="px-6 py-3">Placed</th>
                  <th scope="col" className="px-6 py-3">Status</th>
                  <th scope="col" className="px-6 py-3 text-right">Total (ETB)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {summary.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-surface/50">
                    <th scope="row" className="px-6 py-4 font-semibold text-heading">
                      <Link href={`/orders/${order.id}`} className="hover:text-terracotta">
                        {order.id}
                      </Link>
                    </th>
                    <td className="px-6 py-4 text-charcoal">
                      {order.customer?.name} ({order.customer?.city})
                    </td>
                    <td className="px-6 py-4 text-muted">
                      {relative(order.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          order.status === "Cancelled"
                            ? "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300"
                            : order.status === "Delivered"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-heading">
                      {etb(order.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
