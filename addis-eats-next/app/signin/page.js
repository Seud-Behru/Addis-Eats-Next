import SignInForm from "@/app/components/SignInForm";
import { safeNext } from "@/lib/session";

export const metadata = {
  title: "Sign in",
  description: "Sign in to your Addis Eats account to check out and follow your orders.",
  robots: { index: false, follow: false },
};


export default async function SignInPage({ searchParams }) {
  const params = await searchParams;
  const next = safeNext(params?.next);

  return (
    <main className="mx-auto max-w-md px-4 py-16 sm:px-6 md:py-24">
      <h1 className="font-display text-3xl font-semibold text-heading sm:text-4xl">
        Sign in
      </h1>
      <p className="mt-3 text-sm leading-6 text-muted">
        Use one of the demo accounts below — there&apos;s no sign-up yet.
      </p>

      <SignInForm next={next} />

      <div className="mt-8 rounded-xl bg-surface p-4 text-xs leading-6 text-muted">
        <p className="font-semibold text-charcoal">Demo accounts</p>
        <p>almaz@addiseats.com&nbsp;/&nbsp;almaz123 — customer</p>
        <p>bereket@addiseats.com&nbsp;/&nbsp;bereket123 — customer</p>
        <p>staff@addiseats.com&nbsp;/&nbsp;staff123 — staff, can open /kitchen</p>
      </div>
    </main>
  );
}
