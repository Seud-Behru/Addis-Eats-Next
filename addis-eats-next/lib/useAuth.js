"use client";

import { useRouter } from "next/navigation";
import useSWR, { mutate } from "swr";
import fetcher from "@/lib/fetcher";
import { signOut } from "@/app/actions";

// Session state for the header, fetched client-side on purpose: if the
// (shared) Header called getSession() on the server it would read cookies()
// and force EVERY route dynamic (see AUTH.md and Day 40's STRATEGY.md). The
// only dynamic thing is the tiny /api/session endpoint this hook calls.
//
// `user` is undefined while loading, null when signed out, an object when
// signed in.
export default function useAuth() {
  const { data } = useSWR("/api/session", fetcher);
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    mutate("/api/session");
    router.push("/");
    router.refresh();
  }

  return { user: data ? data.user : undefined, signOut: handleSignOut };
}
