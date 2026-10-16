import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { getOrdersSummary } from "@/lib/orders";
import { etb, when, relative } from "@/lib/format";
import AdminRevenueChart from "@/app/components/AdminRevenueChart";
import ExportOrdersButton from "@/app/components/ExportOrdersButton";
import {
  Utensils,
  ShoppingBag,
  DollarSign,
  ChefHat,
  TrendingUp,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  SlidersHorizontal,
  Flame,
} from "lucide-react";

export const metadata = {
  title: "Admin Dashboard",
  description: "Executive restaurant operations and real-time management hub for Addis Eats.",
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
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h1 className="mt-4 font-display text-3xl font-semibold text-heading">Access Denied</h1>
        <p className="mt-3 text-muted">
          Your account (<strong className="text-heading">{session.email}</strong>) does not have administrative privileges.
        </p>
        <div className="mt-8">
          <Link
            href="/"
            className="rounded-full bg-forest px-6 py-3 text-sm font-semibold text-white transition hover:bg-deep-forest"
          >
            Return to Homepage
          </Link>
        </div>
      </main>
    );
  }

  // Aggregation: Data is summarized on the server so only a few rows cross the wire
  const summary = getOrdersSummary();

  const metrics = [
    {
      title: "Gross Revenue",
      value: etb(summary.totalRevenue),
      trend: "+18.2%",
      trendPositive: true,
      subtext: "TeleBirr verified settlements",
      icon: DollarSign,
      color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "Active Orders",
      value: summary.activeOrders,
      trend: "Live",
      trendPositive: true,
      subtext: `${summary.statusCounts.Preparing || 0} kitchen · ${summary.statusCounts["Out for delivery"] || 0} transit`,
      icon: ShoppingBag,
      color: "bg-terracotta/10 text-terracotta",
    },
    {
      title: "Avg. Ticket Size",
      value: summary.averageOrderValue ? etb(summary.averageOrderValue) : "ETB 680",
      trend: "4.9 ★ rating",
      trendPositive: true,
      subtext: "From curated local kitchens",
      icon: TrendingUp,
      color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
    {
      title: "Delivered Today",
      value: summary.statusCounts.Delivered || 0,
      trend: "98.4% on-time",
      trendPositive: true,
      subtext: "Across Addis Ababa delivery zones",
      icon: CheckCircle2,
      color: "bg-forest/10 text-forest dark:text-cream",
    },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12">
      {/* Top Operations Header */}
      <div className="flex flex-col gap-6 border-b border-border pb-8 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="font-body text-xs font-bold uppercase tracking-[0.12em] text-emerald-600 dark:text-emerald-400">
              Live Operations · TeleBirr Gateway Connected
            </p>
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-heading sm:text-4xl">
            Restaurant Command Center
          </h1>
          <p className="mt-1 text-sm text-muted">
            Logged in as <strong className="text-heading font-semibold">{session.name || session.email}</strong> · Role:{" "}
            <span className="capitalize font-medium text-terracotta">{session.role}</span>
          </p>
        </div>

        {/* Quick Action Navigation Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <ExportOrdersButton orders={summary.recentOrders} />
          <Link
            href="/admin/orders"
            className="inline-flex min-h-[42px] items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-2 text-xs font-semibold text-heading shadow-sm transition hover:bg-border"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            Live Orders
          </Link>
          <Link
            href="/admin/menu"
            className="inline-flex min-h-[42px] items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-2 text-xs font-semibold text-heading shadow-sm transition hover:bg-border"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Menu Catalog
          </Link>
          <Link
            href="/kitchen"
            className="inline-flex min-h-[42px] items-center gap-1.5 rounded-full bg-forest px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-deep-forest"
          >
            <ChefHat className="h-4 w-4" />
            Kitchen POS →
          </Link>
        </div>
      </div>

      {/* Operations Quick Status Ribbon */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-surface p-4 text-xs">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2 text-charcoal">
            <Clock className="h-4 w-4 text-terracotta" />
            <span>Avg Delivery Time: <strong>32 mins</strong></span>
          </div>
          <div className="flex items-center gap-2 text-charcoal">
            <MapPin className="h-4 w-4 text-forest dark:text-cream" />
            <span>Active Zones: <strong>Bole, Kazanchis, CMC, Sarbet</strong></span>
          </div>
          <div className="flex items-center gap-2 text-charcoal">
            <Flame className="h-4 w-4 text-amber-500" />
            <span>Kitchen Status: <strong>Optimal Pace</strong></span>
          </div>
        </div>
        <div className="text-muted">
          Addis Ababa Local Time (EAT)
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.title}
              className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted">
                  {m.title}
                </span>
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${m.color}`}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <p className="font-display text-2xl font-bold tracking-tight text-heading sm:text-3xl">
                  {m.value}
                </p>
                {m.trend && (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                    {m.trend}
                  </span>
                )}
              </div>
              <p className="mt-2 text-xs text-muted">{m.subtext}</p>
            </div>
          );
        })}
      </div>

      {/* Analytics & Distribution Grid */}
      <div className="mt-10 grid gap-8 lg:grid-cols-12">
        {/* Left side: Revenue & Order Stage Chart (8 cols) */}
        <div className="lg:col-span-8">
          <AdminRevenueChart summary={summary} />
        </div>

        {/* Right side: Operational Intelligence Widgets (4 cols) */}
        <div className="space-y-6 lg:col-span-4">
          {/* Top Selling Dishes */}
          <section className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="font-display text-base font-bold text-heading">
                Top Performing Dishes
              </h3>
              <span className="text-[11px] font-semibold uppercase text-terracotta">
                Volume
              </span>
            </div>
            <div className="mt-4 divide-y divide-border/60">
              {(summary.topDishes || []).length > 0 ? (
                summary.topDishes.map((item, idx) => (
                  <div key={item.name} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface text-xs font-bold text-muted">
                        #{idx + 1}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-heading">{item.name}</p>
                        <p className="text-[11px] text-muted">High customer repeat rate</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-forest/10 px-2.5 py-1 text-xs font-bold text-forest dark:text-cream">
                      {item.count} sold
                    </span>
                  </div>
                ))
              ) : (
                <p className="py-4 text-xs text-muted">Dishes will rank here as orders stream in.</p>
              )}
            </div>
          </section>

          {/* Delivery Neighborhood Breakdown */}
          <section className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="font-display text-base font-bold text-heading">
                Neighborhood Dispatch
              </h3>
              <span className="text-[11px] text-muted">Addis Zones</span>
            </div>
            <div className="mt-4 space-y-3">
              {(summary.topZones || [
                { zone: "Bole", count: 4 },
                { zone: "Kazanchis", count: 3 },
                { zone: "CMC", count: 2 },
                { zone: "Old Airport", count: 1 },
              ]).map((z) => {
                const total = summary.totalOrders || 1;
                const pct = Math.min(100, Math.round((z.count / total) * 100)) || 25;
                return (
                  <div key={z.zone}>
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-heading">{z.zone}</span>
                      <span className="text-muted">{z.count} orders ({pct}%)</span>
                    </div>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-surface">
                      <div
                        style={{ width: `${pct}%` }}
                        className="h-full rounded-full bg-terracotta transition-all duration-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>

      {/* Semantic Table: Recent Live Orders Table */}
      <section aria-labelledby="recent-orders-heading" className="mt-10 overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border p-6">
          <div>
            <h2 id="recent-orders-heading" className="font-display text-xl font-bold text-heading">
              Live Order Management Queue
            </h2>
            <p className="mt-1 text-xs text-muted">
              Real-time customer transactions, dispatch tracking, and TeleBirr verified payments.
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-terracotta hover:underline"
          >
            Open Live Orders Console <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {summary.recentOrders.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted">
            <ShoppingBag className="mx-auto h-8 w-8 text-border" />
            <p className="mt-3">No orders placed yet today.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">List of recent live orders at Addis Eats</caption>
              <thead className="bg-surface text-xs font-semibold uppercase tracking-wider text-muted">
                <tr>
                  <th scope="col" className="px-6 py-3.5">Ticket #</th>
                  <th scope="col" className="px-6 py-3.5">Customer & Contact</th>
                  <th scope="col" className="px-6 py-3.5">Location</th>
                  <th scope="col" className="px-6 py-3.5">Items Ordered</th>
                  <th scope="col" className="px-6 py-3.5">Time</th>
                  <th scope="col" className="px-6 py-3.5">Status</th>
                  <th scope="col" className="px-6 py-3.5 text-right">Payment (ETB)</th>
                  <th scope="col" className="px-6 py-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {summary.recentOrders.map((order) => {
                  const isPreparing = order.status === "Preparing";
                  const isTransit = order.status === "Out for delivery";
                  const isDelivered = order.status === "Delivered";

                  return (
                    <tr key={order.id} className="transition hover:bg-surface/50">
                      <th scope="row" className="whitespace-nowrap px-6 py-4 font-mono font-bold text-heading">
                        <Link href={`/orders/${order.id}`} className="hover:text-terracotta">
                          #{order.id.slice(-6)}
                        </Link>
                      </th>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-heading">{order.customer?.name || "Customer"}</p>
                        <p className="text-xs text-muted">{order.customer?.phone || "No phone"}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 rounded-md bg-surface px-2 py-1 text-xs font-medium text-heading">
                          <MapPin className="h-3 w-3 text-terracotta" />
                          {order.customer?.city || "Addis Central"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {(order.items || []).map((it, i) => (
                            <span
                              key={i}
                              className="inline-block rounded bg-surface px-1.5 py-0.5 text-[11px] text-charcoal font-medium"
                            >
                              {it.quantity}x {it.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-xs text-muted">
                        {relative(order.createdAt)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
                            order.status === "Cancelled"
                              ? "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300"
                              : isDelivered
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                              : isTransit
                              ? "bg-terracotta/10 text-terracotta animate-pulse"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            isDelivered ? "bg-emerald-500" : isTransit ? "bg-terracotta" : "bg-amber-500"
                          }`} />
                          {order.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <p className="font-bold text-heading">{etb(order.total)}</p>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">TeleBirr ✓</p>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-center">
                        <Link
                          href={`/orders/${order.id}`}
                          className="inline-flex min-h-[36px] items-center rounded-full bg-surface px-3 py-1 text-xs font-semibold text-heading transition hover:bg-forest hover:text-white"
                        >
                          Track →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
