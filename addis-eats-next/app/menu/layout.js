import { Suspense } from "react";
import CategorySidebar from "@/app/components/CategorySidebar";

export default function MenuLayout({ children }) {
  return (
    <div className="bg-cream min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Category Sidebar: Preserves its scroll and selected state across navigation */}
          <div className="lg:col-span-3">
            <Suspense
              fallback={
                <div className="h-72 w-full animate-pulse rounded-3xl bg-card" />
              }
            >

            </Suspense>
          </div>

          {/* Main menu content or specific dish view */}
          <div className="lg:col-span-9">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
