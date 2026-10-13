import { Suspense } from "react";
import Link from "next/link";
import SignInForm from "@/app/components/SignInForm";
import { ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Admin Login",
  description: "Sign in to the Addis Eats administrative dashboard.",
  robots: { index: false, follow: false },
};

// Static: Just a form, same as customer login.
export const dynamic = "force-static";

export default function AdminLoginPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-16 sm:px-6 md:py-24">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest text-white">
          <ShieldCheck className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-heading sm:text-3xl">
            Staff & Admin Sign In
          </h1>
          <p className="text-xs text-muted">Authorized restaurant personnel only</p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-muted">
        Enter your administrative credentials to manage live dishes, incoming kitchen orders, and sales analytics.
      </p>

      <Suspense fallback={<div className="mt-8 h-64 animate-pulse rounded-2xl bg-card" />}>
        <SignInForm next="/admin" defaultEmail="admin@addiseats.com" />
      </Suspense>

      <div className="mt-8 rounded-2xl bg-surface p-5 text-xs leading-6 text-muted">
        <p className="font-bold text-heading">Demo Staff / Admin Credentials</p>
        <p><strong>admin@addiseats.com</strong> / admin123 (Full Admin: Menu & Analytics)</p>
        <p><strong>staff@addiseats.com</strong> / staff123 (Kitchen Staff: Live Orders)</p>
        <div className="mt-3 border-t border-border pt-3">
          <Link href="/login" className="font-semibold text-terracotta hover:underline">
            ← Switch to Customer Login
          </Link>
        </div>
      </div>
    </main>
  );
}
