"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { submitOrder, cancelOrderInStore, updateOrderStatus } from "@/lib/orders";
import { updateDish } from "@/lib/menu";
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

  // Revalidate order lists to show fresh data
  revalidatePath("/orders");
  revalidatePath("/order-history");
  revalidatePath("/admin/orders");
  revalidatePath("/kitchen");

  return { ok: true, order: { id: result.order.id, total: result.order.total }, values };
}

export async function cancelOrder(orderId) {
  const session = await getSession();
  if (!session) {
    return { ok: false, error: "Please sign in to cancel this order." };
  }

  const result = cancelOrderInStore(orderId, session.id, session.role);
  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  // Revalidate cached and dynamic order routes
  revalidatePath("/orders");
  revalidatePath("/order-history");
  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/admin/orders");
  revalidatePath("/kitchen");

  return { ok: true, order: result.order };
}

export async function adminUpdateDish(dishId, data) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return { ok: false, error: "Admin role required." };
  }

  const updated = updateDish(dishId, data);
  if (!updated) {
    return { ok: false, error: "Dish not found." };
  }

  revalidatePath("/menu");
  revalidatePath(`/menu/${dishId}`);
  revalidatePath("/admin/menu");
  return { ok: true, dish: updated };
}

export async function adminUpdateOrderStatus(orderId, status) {
  const session = await getSession();
  if (!session || (session.role !== "admin" && session.role !== "staff")) {
    return { ok: false, error: "Staff or Admin role required." };
  }

  const updated = updateOrderStatus(orderId, status);
  if (!updated) {
    return { ok: false, error: "Order not found." };
  }

  revalidatePath("/orders");
  revalidatePath("/order-history");
  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/admin/orders");
  revalidatePath("/kitchen");
  return { ok: true, order: updated };
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
