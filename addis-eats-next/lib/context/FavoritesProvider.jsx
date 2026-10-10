import { useEffect, useState } from "react";
import { FavoritesContext } from "./FavoritesContext";

// Only ever imported by components/Providers.jsx, so it runs in the browser.
function FavoritesProvider({ children }) {
    // Start empty so the server HTML and the first browser render match,
    // then load the saved favorites once the page has hydrated.
    const [favorites, setFavorites] = useState([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        try {
            const saved = localStorage.getItem("addis-eats-favorites");
            if (saved) setFavorites(JSON.parse(saved));
        } catch {
            // Corrupt data: start with an empty list.
        }
        setLoaded(true);
    }, []);

    useEffect(() => {
        // Do not overwrite the saved list before it has been read.
        if (!loaded) return;
        localStorage.setItem("addis-eats-favorites", JSON.stringify(favorites));
    }, [favorites, loaded]);

    function toggleFavorite(dish) {
        setFavorites((current) => {
            if (current.some((item) => item.id === dish.id)) {
                return current.filter((item) => item.id !== dish.id);
            }

            return [
                ...current,
                {
                    id: dish.id,
                    name: dish.name,
                    description: dish.description,
                    price: dish.price,
                    rating: dish.rating,
                    reviews: dish.reviews,
                    badge: dish.badge,
                    image: dish.image,
                },
            ];
        });
    }

    function isFavorite(dishId) {
        return favorites.some((item) => item.id === dishId);
    }

    function removeFavorite(dishId) {
        setFavorites((current) => current.filter((item) => item.id !== dishId));
    }

    return (
        <FavoritesContext.Provider
            value={{ favorites, toggleFavorite, isFavorite, removeFavorite }}
        >
            {children}
        </FavoritesContext.Provider>
    );
}

export default FavoritesProvider;
