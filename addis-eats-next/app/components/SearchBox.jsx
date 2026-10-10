"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import fetcher from "@/lib/fetcher";

function useDebouncedValue(value, delayMs) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

// A second, independent way to browse the menu: a *live* search that talks
// to /api/dishes, separate from the category buttons above (MenuFilter),
// which filter the already-rendered server cards with no network request.
export default function SearchBox() {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;

  const [input, setInput] = useState(searchParams.get("q") ?? "");
  const term = useDebouncedValue(input.trim(), 400);

  function setUrl(nextTerm, nextPage) {
    const url = nextTerm
      ? `/menu?q=${encodeURIComponent(nextTerm)}&page=${nextPage}`
      : "/menu";
    // Same trick MenuFilter uses: Next.js patches history.replaceState, so
    // useSearchParams picks this up without a server round-trip.
    window.history.replaceState(null, "", url);
  }

  // Typing a new term always restarts at page 1.
  useEffect(() => {
    setUrl(term, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term]);

  // Null key: an empty term has nothing to look up, so SWR fires no
  // request at all and `data` stays undefined until there's something
  // to search for.
  const key = term ? `/api/dishes?q=${encodeURIComponent(term)}&page=${page}` : null;

  const { data, isLoading } = useSWR(key, fetcher, {
    // Keeps last search's results on screen while the next page or term
    // loads, instead of the grid flashing empty between every request.
    keepPreviousData: true,
  });

  return (
    <div className="mt-10">
      <label htmlFor="live-search" className="text-sm font-semibold text-heading">
        Live search
      </label>

      <div className="relative mt-2 max-w-2xl">
        <input
          id="live-search"
          type="search"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Try 'chicken', 'cheese', 'mango'..."
          className="w-full rounded-full border border-border bg-card px-5 py-3.5 text-sm text-charcoal outline-none transition placeholder:text-muted focus:border-terracotta focus:ring-2 focus:ring-terracotta/20"
        />
      </div>

      {term && (
        <div className="mt-6 max-w-2xl">
          {isLoading && !data && <p className="text-sm text-muted">Searching…</p>}

          {data && data.items.length === 0 && (
            <p className="text-sm text-muted">No dishes match &ldquo;{term}&rdquo;.</p>
          )}

          {data && data.items.length > 0 && (
            <>
              <ul className="space-y-2">
                {data.items.map((dish) => (
                  <li key={dish.id}>
                    <Link
                      href={`/menu/${dish.id}`}
                      className="flex items-center gap-3 rounded-xl bg-card p-3 shadow-sm transition hover:bg-surface"
                    >
                      <Image
                        src={dish.image}
                        alt=""
                        width={48}
                        height={48}
                        sizes="48px"
                        className="h-12 w-12 shrink-0 rounded-lg object-cover"
                      />
                      <span className="flex-1 text-sm font-semibold text-charcoal">
                        {dish.name}
                      </span>
                      <span className="text-sm text-muted">{dish.price} ETB</span>
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex items-center justify-between">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setUrl(term, page - 1)}
                  className="text-sm font-semibold text-heading transition disabled:opacity-40"
                >
                  ← Previous
                </button>

                <span className="text-xs text-muted">
                  Page {data.page} of {Math.max(1, Math.ceil(data.total / data.pageSize))}
                </span>

                <button
                  type="button"
                  disabled={!data.hasMore}
                  onClick={() => setUrl(term, page + 1)}
                  className="text-sm font-semibold text-heading transition disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
