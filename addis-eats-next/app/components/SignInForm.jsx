"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { mutate } from "swr";
import { signIn } from "@/app/actions";

export default function SignInForm({ next }) {
  const [state, formAction, pending] = useActionState(signIn, null);
  const router = useRouter();

  // The action never redirects itself (see app/actions.js for why) — once
  // it reports success, this effect refreshes the header's session check
  // and sends the browser on to `next`.
  useEffect(() => {
    if (state?.ok) {
      mutate("/api/session");
      router.push(state.next);
      router.refresh();
    }
  }, [state, router]);

  return (
    <form action={formAction} noValidate className="mt-8 rounded-2xl bg-card p-6 shadow-sm sm:p-8">
      <input type="hidden" name="next" value={next} />

      <div>
        <label htmlFor="email" className="text-sm font-semibold text-charcoal">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          defaultValue={state?.values?.email}
          aria-invalid={Boolean(state?.fieldErrors?.email)}
          aria-describedby={state?.fieldErrors?.email ? "email-error" : undefined}
          className="mt-2 w-full rounded-xl border border-border bg-cream px-4 py-3 text-sm outline-none transition focus:border-heading focus:ring-2 focus:ring-forest/10"
        />
        {state?.fieldErrors?.email && (
          <p id="email-error" className="mt-2 text-xs font-semibold text-terracotta">
            {state.fieldErrors.email}
          </p>
        )}
      </div>

      <div className="mt-5">
        <label htmlFor="password" className="text-sm font-semibold text-charcoal">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          aria-invalid={Boolean(state?.fieldErrors?.password)}
          aria-describedby={state?.fieldErrors?.password ? "password-error" : undefined}
          className="mt-2 w-full rounded-xl border border-border bg-cream px-4 py-3 text-sm outline-none transition focus:border-heading focus:ring-2 focus:ring-forest/10"
        />
        {state?.fieldErrors?.password && (
          <p id="password-error" className="mt-2 text-xs font-semibold text-terracotta">
            {state.fieldErrors.password}
          </p>
        )}
      </div>

      {state?.formError && (
        <p role="alert" className="mt-5 text-sm font-semibold text-terracotta">
          {state.formError}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-8 w-full rounded-full bg-cta px-6 py-4 text-sm font-bold text-white transition hover:bg-cta-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
