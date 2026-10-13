import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { getAllDishesAdmin } from "@/lib/menu";
import AdminMenuManager from "@/app/components/AdminMenuManager";

export const metadata = {
  title: "Admin Menu Management",
  description: "Manage live dish prices, descriptions, and catalog visibility.",
  robots: { index: false, follow: false },
};

// Dynamic: Reads and writes live menu data; an admin edit must show up
// immediately, not after an hour.
export const dynamic = "force-dynamic";

export default async function AdminMenuPage() {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login?next=/admin/menu");
  }

  if (session.role !== "admin" && session.role !== "staff") {
    redirect("/");
  }

  const dishes = getAllDishesAdmin();

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
            Live Menu Management
          </h1>
          <p className="mt-1 text-sm text-muted">
            Toggle visibility or adjust ETB pricing. Edits take effect immediately.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/menu"
            target="_blank"
            className="inline-flex min-h-[44px] items-center rounded-full bg-surface px-4 py-2 text-xs font-semibold text-heading transition hover:bg-border"
          >
            View Public Menu ↗
          </Link>
        </div>
      </div>

      <div className="mt-8">
        <AdminMenuManager initialDishes={dishes} />
      </div>
    </main>
  );
}
