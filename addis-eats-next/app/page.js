import Hero from "./components/Hero";
import CategoryBrowser from "./components/CategoryBrowser";
import FeaturedDishes from "./components/FeaturedDishes";
export const metadata = {
  // Home uses the root `default` title (no template suffix) via absolute.
  title: { absolute: "Addis Eats — Ethiopian food delivered across Addis Ababa" },
  description:
    "Hungry in Addis? Order doro wat, tibs, pizza and burgers from local kitchens and get it delivered to your door in about 30 minutes.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <>
      <Hero />
      <CategoryBrowser />
      <FeaturedDishes />
    </>
  );
}
