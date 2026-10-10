"use client";

import { useState } from "react";

// Client shell around server-rendered cards (received as children, not imported).
// It only stores the chosen category; globals.css hides the non-matching cards.
export default function FilterShell({ categories, children }) {
  const [active, setActive] = useState("All");
  return (
    <>
      <div className="mt-8 flex flex-wrap gap-3" role="group" aria-label="Filter by category">
        {["All", ...categories].map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setActive(name)}
            aria-pressed={active === name}
            className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
              active === name ? "bg-forest text-white" : "bg-surface text-heading hover:bg-border"
            }`}
          >
            {name}
          </button>
        ))}
      </div>
      <div className="menu-grid mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" data-active={active}>
        {children}
      </div>
    </>
  );
}
