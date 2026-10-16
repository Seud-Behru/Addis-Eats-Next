"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu as MenuIcon, Moon, ShoppingCart, Sun, X, Heart } from "lucide-react";

import useCartStore from "@/lib/cartStore";
import useHydrated from "@/lib/useHydrated";
import useTheme from "@/lib/context/useTheme";
import useAuth from "@/lib/useAuth";
import useFavorites from "@/lib/context/useFavorites";

// A client component, but still server-rendered for the first paint, and it
// reads no cookies: session state comes from useAuth() (see lib/useAuth.js),
// so pages like "/" and "/menu" stay static.

// The pill used for Sign in / Sign out (same look on desktop and mobile).
const pillClass =
  "inline-flex min-w-28 items-center justify-center rounded-full bg-forest px-5 py-2.5 font-body text-sm font-semibold text-white transition hover:bg-deep-forest focus:outline-none focus:ring-2 focus:ring-terracotta focus:ring-offset-2";

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { favorites } = useFavorites();
  const pathname = usePathname();

  // The cart lives in localStorage, so show 0 until the client has hydrated
  // (otherwise server and browser would disagree about the badge).
  // Also hide badges entirely when the user is not signed in: guests should
  // not see counts because the cart/favorites belong to a session.
  const hydrated = useHydrated();
  const items = useCartStore((state) => state.items);
  const loggedIn = hydrated && !!user; // user===undefined (loading) or null (signed out) → false
  const cartCount = loggedIn ? items.reduce((total, item) => total + item.quantity, 0) : 0;
  const favCount = loggedIn ? favorites.length : 0;

  // Controls the slide-down navigation on small screens.
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  async function handleSignOut() {
    closeMenu();
    await signOut();
  }

  // Orders needs an account; Admin and Kitchen are role-based.
  const navLinks = [
    { href: "/", label: "Home", exact: true },
    { href: "/menu", label: "Menu" },
    ...(user ? [{ href: "/order-history", label: "Orders" }] : []),
    ...(user?.role === "admin" || user?.role === "staff" ? [{ href: "/admin", label: "Admin" }] : []),
    ...(user?.role === "staff" ? [{ href: "/kitchen", label: "Kitchen" }] : []),
  ];

  function isActive(link) {
    return link.exact
      ? pathname === link.href
      : pathname === link.href || pathname.startsWith(`${link.href}/`);
  }

  const navLinkClass = (active) =>
    [
      "font-body text-sm font-medium transition",
      active ? "text-terracotta" : "text-charcoal hover:text-terracotta",
    ].join(" ");

  const mobileLinkClass = (active) =>
    [
      "block rounded-xl px-4 py-3 font-body text-base font-semibold transition",
      active
        ? "bg-surface-container-low text-terracotta"
        : "text-charcoal hover:bg-surface-container-low",
    ].join(" ");

  const themeLabel = theme === "light" ? "Switch to dark mode" : "Switch to light mode";

  // Sign in / Sign out pill. While the session is still loading, reserve the
  // same space so the bar doesn't jump when it resolves.
  function authControl(onNavigate) {
    if (user === undefined) {
      return <span aria-hidden="true" className="inline-block h-10 min-w-28" />;
    }
    if (user === null) {
      return (
        <Link href="/signin" onClick={onNavigate} className={pillClass}>
          Sign in
        </Link>
      );
    }
    return (
      <button type="button" onClick={handleSignOut} className={pillClass}>
        Sign out
      </button>
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-5">
        <Link
          href="/"
          className="font-display text-xl font-semibold tracking-tight text-heading sm:text-2xl"
        >
          Addis Eats
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {navLinks.map((link) => {
            const active = isActive(link);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={navLinkClass(active)}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={themeLabel}
            title={themeLabel}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border text-heading transition hover:bg-surface-container-low hover:text-terracotta"
          >
            {theme === "light" ? (
              <Moon size={19} strokeWidth={1.8} aria-hidden="true" />
            ) : (
              <Sun size={19} strokeWidth={1.8} aria-hidden="true" />
            )}
          </button>

          {/* Favorites */}
          <Link
            href="/favorites"
            className="relative flex items-center gap-1.5 px-1 text-charcoal transition hover:text-terracotta"
            aria-label={`Favorites with ${favCount} items`}
          >
            <Heart size={21} strokeWidth={1.8} aria-hidden="true" />
            <span className="hidden sm:inline">Favorites</span>
            {favCount > 0 && (
              <span
                className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-forest px-1 text-xs font-bold text-white sm:-right-2.5"
                aria-hidden="true"
              >
                {favCount}
              </span>
            )}
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            className="relative flex items-center gap-2 px-1 text-charcoal transition hover:text-terracotta"
            aria-label={`Cart with ${cartCount} items`}
          >
            <ShoppingCart size={22} strokeWidth={1.8} aria-hidden="true" />

            <span className="hidden sm:inline">Cart</span>

            {cartCount > 0 && (
              <span
                className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-cta px-1 text-xs font-bold text-white sm:-right-3"
                aria-hidden="true"
              >
                {cartCount}
              </span>
            )}
          </Link>

          {/* Sign in / Sign out — desktop only; the mobile menu carries it
              instead so the bar stays uncluttered. */}
          <div className="hidden md:block">{authControl()}</div>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border text-heading transition hover:bg-surface-container-low md:hidden"
          >
            {menuOpen ? (
              <X size={20} strokeWidth={1.8} aria-hidden="true" />
            ) : (
              <MenuIcon size={20} strokeWidth={1.8} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile navigation */}
      {menuOpen && (
        <nav
          id="mobile-nav"
          aria-label="Mobile navigation"
          className="border-t border-border bg-cream px-4 pb-5 pt-3 md:hidden"
        >
          <div className="space-y-1">
            {navLinks.map((link) => {
              const active = isActive(link);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  aria-current={active ? "page" : undefined}
                  className={mobileLinkClass(active)}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="mt-4 flex [&>*]:w-full">{authControl(closeMenu)}</div>
        </nav>
      )}
    </header>
  );
}
