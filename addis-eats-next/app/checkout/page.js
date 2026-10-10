import { cookies } from "next/headers";
import CheckoutForm from "../components/CheckoutForm";

export const metadata = {
  title: "Checkout",
  description: "Enter your delivery details to place your Addis Eats order.",
  robots: { index: false, follow: false },
};


// Dynamic on purpose: cookies() below reads the saved delivery details,
// so the page depends on who is asking and can't be built ahead of time.
export default async function CheckoutPage() {
  const jar = await cookies();
  let saved = {};
  try {
    saved = JSON.parse(jar.get("addis-delivery")?.value ?? "{}");
  } catch { }
  const text = (value) => (typeof value === "string" ? value : "");
  const defaults = {
    name: text(saved.name),
    phone: text(saved.phone),
    address: text(saved.address),
    city: text(saved.city) || "Addis Ababa",
    notes: "",
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-16">
      <h1 className="font-display text-3xl font-semibold text-heading sm:text-5xl">
        Complete your order
      </h1>
      <p className="mt-4 max-w-2xl leading-7 text-muted">
        Tell us where to deliver your meal and we&apos;ll take care of the rest.
      </p>
      <CheckoutForm defaults={defaults} />
    </main>
  );
}
