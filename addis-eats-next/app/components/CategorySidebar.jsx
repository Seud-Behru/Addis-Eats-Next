"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { CATEGORIES } from "@/lib/menu";
import { Flame, Pizza, Sandwich, Coffee, Sparkles } from "lucide-react";

const CATEGORY_ICONS = {
  Ethiopian: Flame,
  Pizza: Pizza,
  Burgers: Sandwich,
  Drinks: Coffee,
};

export default function CategorySidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sidebarRef = useRef(null);

  // Preserve selected category state across page transitions
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Sync with searchParams if present, or maintain preserved state
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat && (cat === "All" || CATEGORIES.includes(cat))) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

  // Restore and preserve scroll position of sidebar
  useEffect(() => {
    const savedScroll = sessionStorage.getItem("addis-menu-sidebar-scroll");
    if (savedScroll && sidebarRef.current) {
      sidebarRef.current.scrollTop = Number(savedScroll);
    }

    const currentRef = sidebarRef.current;
    function handleScroll() {
      if (currentRef) {
        sessionStorage.setItem("addis-menu-sidebar-scroll", String(currentRef.scrollTop));
      }
    }

    if (currentRef) {
      currentRef.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (currentRef) {
        currentRef.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  const allCategories = ["All", ...CATEGORIES];

  return (
    <aside
      ref={sidebarRef}
      aria-label="Menu categories sidebar"
      className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-3xl bg-card p-5 shadow-sm sm:p-6"
    >
      <div className="flex items-center gap-2 border-b border-border pb-4">
        <Sparkles className="h-5 w-5 text-terracotta" aria-hidden="true" />
        <h2 className="font-display text-lg font-bold text-heading">Categories</h2>
      </div>

      <nav className="mt-4 space-y-1.5" aria-label="Category navigation">
        {allCategories.map((name) => {
          const Icon = CATEGORY_ICONS[name] || Sparkles;
          const isActive = selectedCategory === name;

          return (
            <Link
              key={name}
              href={name === "All" ? "/menu" : `/menu?category=${encodeURIComponent(name)}`}
              onClick={() => setSelectedCategory(name)}
              className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                isActive
                  ? "bg-forest text-white shadow-sm"
                  : "text-charcoal hover:bg-surface hover:text-heading"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`h-4 w-4 ${isActive ? "text-terracotta-bright" : "text-muted"}`}
                  aria-hidden="true"
                />
                <span>{name}</span>
              </div>
              {isActive && (
                <span className="h-2 w-2 rounded-full bg-terracotta-bright" aria-hidden="true" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Quick context info */}
      <div className="mt-8 rounded-2xl bg-surface p-4 text-xs text-muted">
        <p className="font-bold text-heading">Fresh Delivery</p>
        <p className="mt-1">Dishes prepared fresh to order across central Addis Ababa kitchens.</p>
        <p className="mt-2 font-semibold text-terracotta">30-40 min avg delivery</p>
      </div>
    </aside>
  );
}
