import { Suspense } from "react";
import Link from "next/link";
import SignInForm from "@/app/components/SignInForm";

export const metadata = {
  title: "Login",
  description: "Sign in to your Addis Eats account to check out and track your orders.",
  robots: { index: false, follow: false },
};

// Static: Just a form. The actual sign-in work happens in a server action,
// not in how the page is rendered.
export const dynamic = "force-static";

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-16 sm:px-6 md:py-24">
      <h1 className="font-display text-3xl font-semibold text-heading sm:text-4xl">
        Sign in to Addis Eats
      </h1>
      <p className="mt-3 text-sm leading-6 text-muted">
        Use one of the demo credentials below to browse, order, or manage dishes.
      </p>

      <Suspense fallback={<div className="mt-8 h-64 animate-pulse rounded-2xl bg-card" />}>
        <SignInForm />
      </Suspense>

      <div className="mt-8 rounded-2xl bg-surface p-5 text-xs leading-6 text-muted">
        <p className="font-bold text-heading">Demo Accounts (Password for all: name123)</p>
        <p><strong className="text-charcoal">almaz@addiseats.com</strong> (Customer)</p>
        <p><strong className="text-charcoal">bereket@addiseats.com</strong> (Customer)</p>
        <p><strong className="text-charcoal">staff@addiseats.com</strong> (Staff - Kitchen access)</p>
        <p><strong className="text-charcoal">admin@addiseats.com</strong> (Admin - Management access)</p>
        <div className="mt-3 border-t border-border pt-3">
          <Link href="/admin/login" className="font-semibold text-terracotta hover:underline">
            Go to Admin Login →
          </Link>
        </div>
      </div>
    </main>
  );
}
