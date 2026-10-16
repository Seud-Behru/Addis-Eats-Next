"use client";

import { useEffect } from "react";

import useCartStore from "@/lib/cartStore";
import ThemeProvider from "@/lib/context/ThemeProvider";
import FavoritesProvider from "@/lib/context/FavoritesProvider";

// The one client boundary for app-wide state. app/layout.js stays a server
// component and simply passes {children} in, so every page inside is still
// rendered on the server.
//
// MenuProvider was removed: FeaturedDishes is now a server component that
// reads dishes directly, so the client-side fetch + 1.5s artificial skeleton
// delay is gone. This cuts ~40 KB from the initial bundle and eliminates
// 3 cascading re-renders on mount (TBT improvement).
export function Providers({ children }) {
    // Load the saved cart from localStorage after hydration
    // (see skipHydration in lib/cartStore.js).
    useEffect(() => {
        useCartStore.persist.rehydrate();
    }, []);

    return (
        <ThemeProvider>
            <FavoritesProvider>
                {children}
            </FavoritesProvider>
        </ThemeProvider>
    );
}
