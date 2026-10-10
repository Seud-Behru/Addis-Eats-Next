import { useContext } from "react";

import { FavoritesContext } from "./FavoritesContext";

function useFavorites() {
    const context = useContext(FavoritesContext);

    if (!context) {
        throw new Error(
            "useFavorites must be used inside a FavoritesProvider"
        );
    }

    return context;
}

export default useFavorites;