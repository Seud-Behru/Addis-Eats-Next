"use server";

import { cookies } from "next/headers";
import { submitOrder } from "@/lib/orders";
import { findUserByCredentials } from "@/lib/users";
import { getSession, setSessionCookie, clearSessionCookie, safeNext } from "@/lib/session";

export async function placeOrder(_previous, formData) {
  // Belt and braces: /checkout is already behind middleware.js, but this
  // action checks again rather than trusting that it was only ever
  // reached through that redirect (see AUTH.md, "/checkout").
  const session = await getSession();
  if (!session) {
    return { ok: false, fieldErrors: { session: "Please sign in before placing an order." } };
  }

  const values = {
    name: String(formData.get("name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    address: String(formData.get("address") ?? ""),
    city: String(formData.get("city") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  };

  let items = [];
  try {
    items = JSON.parse(String(formData.get("items") ?? "[]"));
  } catch { }

  // userId comes from the session, never from the form — see lib/orders.js.
  const result = submitOrder({ ...values, items, userId: session.id });
  if (!result.ok) return { ok: false, fieldErrors: result.fieldErrors, values };

  // Remember the delivery details so /checkout can prefill them next time.
  const { name, phone, address, city } = values;
  (await cookies()).set("addis-delivery", JSON.stringify({ name, phone, address, city }), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return { ok: true, order: { id: result.order.id, total: result.order.total }, values };
}

export async function signIn(_previous, formData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = safeNext(String(formData.get("next") ?? "/"));

  const fieldErrors = {};
  if (!email.trim()) fieldErrors.email = "Please enter your email.";
  if (!password) fieldErrors.password = "Please enter your password.";
  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors, values: { email } };
  }

  const user = findUserByCredentials(email, password);
  if (!user) {
    return { formError: "That email and password don't match an account.", values: { email } };
  }

  await setSessionCookie(user);

  // Deliberately NOT calling redirect() here. redirect() from inside a
  // server action short-circuits before the client ever sees a resolved
  // state, which would skip SignInForm's chance to also refresh the
  // header's separate /api/session check (see lib/useAuth.js). Returning
  // { ok, next } and letting the client navigate keeps both in sync.
  return { ok: true, next };
}

export async function signOut() {
  await clearSessionCookie();
}
