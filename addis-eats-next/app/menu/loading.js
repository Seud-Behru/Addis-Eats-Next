export default function Loading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6" aria-busy="true">
      <div className="h-12 w-72 animate-pulse rounded-xl bg-surface" />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((n) => (
          <div key={n} className="h-80 animate-pulse rounded-2xl bg-surface" />
        ))}
      </div>
    </main>
  );
}
