import { useEffect, useState } from "react";
import { MenuContext } from "./MenuContext.js";


function withVisibility(dish) {
    return {
        ...dish,
        visible: dish.visible !== false,
    };
}

function MenuProvider({ children }) {
    const [dishes, setDishes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadMenu() {
            try {
                setLoading(true);
                setError(null);

                const startTime = Date.now();

                const savedMenu = localStorage.getItem("addis-eats-menu");

                if (savedMenu) {
                    const parsedMenu = JSON.parse(savedMenu);

                    if (Array.isArray(parsedMenu) && parsedMenu.length > 0) {
                        setDishes(parsedMenu.map(withVisibility));
                    } else {
                        const response = await fetch("/api/menu");

                        if (!response.ok) {
                            throw new Error("Failed to load menu data.");
                        }

                        const menuData = await response.json();
                        setDishes(menuData.map(withVisibility));
                    }
                } else {
                    const response = await fetch("/api/menu");

                    if (!response.ok) {
                        throw new Error("Failed to load menu data.");
                    }

                    const menuData = await response.json();
                    setDishes(menuData.map(withVisibility));
                }

                // Make sure the loading skeleton stays visible
                // for at least 1.5 seconds.
                const elapsedTime = Date.now() - startTime;
                const remainingTime = 1500 - elapsedTime;

                if (remainingTime > 0) {
                    await new Promise((resolve) =>
                        setTimeout(resolve, remainingTime)
                    );
                }
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err
                        : new Error("Failed to load menu data.")
                );
            } finally {
                setLoading(false);
            }
        }

        loadMenu();
    }, []);

    useEffect(() => {
        if (!loading) {
            localStorage.setItem(
                "addis-eats-menu",
                JSON.stringify(dishes)
            );
        }
    }, [dishes, loading]);

    function addDish(dish) {
        setDishes((currentDishes) => [
            ...currentDishes,
            withVisibility(dish),
        ]);
    }

    function updateDish(updatedDish) {
        setDishes((currentDishes) =>
            currentDishes.map((dish) =>
                dish.id === updatedDish.id
                    ? {
                        ...updatedDish,
                        visible:
                            updatedDish.visible ?? dish.visible !== false,
                    }
                    : dish
            )
        );
    }

    // Show or hide a single dish on the customer-facing menu.
    // The dish stays in the data either way, so hiding is
    // reversible in a way deleting is not.
    function toggleDishVisibility(dishId) {
        setDishes((currentDishes) =>
            currentDishes.map((dish) =>
                dish.id === dishId
                    ? { ...dish, visible: dish.visible === false }
                    : dish
            )
        );
    }

    function deleteDish(dishId) {
        setDishes((currentDishes) =>
            currentDishes.filter((dish) => dish.id !== dishId)
        );
    }

    return (
        <MenuContext.Provider
            value={{
                dishes,
                loading,
                error,
                addDish,
                updateDish,
                deleteDish,
                toggleDishVisibility,

                // Only the dishes customers should actually see.
                visibleDishes: dishes.filter(
                    (dish) => dish.visible !== false
                ),
            }}
        >
            {children}
        </MenuContext.Provider>
    );
}

export default MenuProvider;