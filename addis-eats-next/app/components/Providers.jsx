"use client";

import { useEffect } from "react";

import useCartStore from "@/lib/cartStore";
import ThemeProvider from "@/lib/context/ThemeProvider";
import FavoritesProvider from "@/lib/context/FavoritesProvider";
import MenuProvider from "@/lib/context/MenuProvider";

// The one client boundary for app-wide state. app/layout.js stays a server
// component and simply passes {children} in, so every page inside is still
// rendered on the server.
export function Providers({ children }) {
    // Load the saved cart from localStorage after hydration
    // (see skipHydration in lib/cartStore.js).
    useEffect(() => {
        useCartStore.persist.rehydrate();
    }, []);

    return (
        <ThemeProvider>
            <FavoritesProvider>
                <MenuProvider>
                    {children}
                </MenuProvider>
            </FavoritesProvider>
        </ThemeProvider>
    );
}
