import { useSyncExternalStore } from "react";

// false on the server and during hydration, true afterwards. Stops the cart
// (which lives in localStorage) from causing a hydration mismatch.
export default function useHydrated() {
  return useSyncExternalStore(() => () => {}, () => true, () => false);
}
