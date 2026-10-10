"use client";

// Must be a client component: it needs an onClick to offer a retry.
export default function MenuError({ reset }) {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20 text-center">
      <h1 className="font-display text-3xl font-semibold text-heading">
        The menu couldn&apos;t load.
      </h1>
      <p className="mt-4 text-muted">Check your connection and try again.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 rounded-full bg-forest px-6 py-3 text-sm font-semibold text-white transition hover:bg-deep-forest"
      >
        Try again
      </button>
    </main>
  );
}
