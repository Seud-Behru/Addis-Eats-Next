import { create } from "zustand";
import { persist } from "zustand/middleware";

// Same store as the Vite app. Client-only: the cart never leaves the browser
// until checkout.
const useCartStore = create(
  persist(
    (set) => ({
      items: [],
      addItem: (dish) =>
        set((state) => {
          const found = state.items.find((i) => i.id === dish.id);
          if (found) {
            return {
              items: state.items.map((i) =>
                i.id === dish.id ? { ...i, quantity: i.quantity + 1 } : i
              ),
            };
          }
          const { id, name, price, image } = dish;
          return { items: [...state.items, { id, name, price, image, quantity: 1 }] };
        }),
      increaseQuantity: (id) =>
        set((s) => ({
          items: s.items.map((i) => (i.id === id ? { ...i, quantity: i.quantity + 1 } : i)),
        })),
      decreaseQuantity: (id) =>
        set((s) => ({
          items: s.items
            .map((i) => (i.id === id ? { ...i, quantity: i.quantity - 1 } : i))
            .filter((i) => i.quantity > 0),
        })),
      removeItem: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      clearCart: () => set({ items: [] }),
    }),
    { name: "addis-eats-cart" }
  )
);

export default useCartStore;
