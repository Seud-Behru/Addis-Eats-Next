import CartView from "../components/CartView";

export const metadata = {
  title: "Your cart",
  description: "Review the dishes in your cart before you check out.",
  robots: { index: false, follow: false },
};


// The page shell is static; everything private to the visitor lives in CartView.
export default function CartPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-16">
      <h1 className="font-display text-3xl font-semibold text-heading sm:text-5xl">Your cart</h1>
      <CartView />
    </main>
  );
}
