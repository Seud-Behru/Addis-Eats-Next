import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import CheckoutForm from "../components/CheckoutForm";

export const metadata = {
  title: "Checkout",
  description: "Enter your delivery details to place your Addis Eats order.",
  robots: { index: false, follow: false },
};

// Forced dynamic because it reads a session cookie (who's ordering)
// and reflects the live cart total — neither can be known at build time.
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const session = await getSession();
  if (!session) {
    redirect("/signin?next=/checkout");
  }

  const jar = await cookies();
  let saved = {};
  try {
    saved = JSON.parse(jar.get("addis-delivery")?.value ?? "{}");
  } catch { }

  const text = (value) => (typeof value === "string" ? value : "");
  const defaults = {
    name: text(saved.name) || session.name || "",
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
        Tell us where to deliver your meal in Addis Ababa and we&apos;ll take care of the rest.
      </p>
      <CheckoutForm defaults={defaults} />
    </main>
  );
}
