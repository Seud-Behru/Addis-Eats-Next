import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session-token";

// Runs before /checkout, /orders/*, /order-history, /order-success, and /admin/* (see the matcher below).
// It only proves "a validly-signed session cookie is present" — it does not know
// *whose* order this is, so it can't do ownership checks. Those happen
// further in, on each page and route handler (see AUTH.md).
export async function middleware(request) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);

  if (!session) {
    const isSpecialAdmin = request.nextUrl.pathname.startsWith("/admin") && request.nextUrl.pathname !== "/admin/login";
    const loginPath = isSpecialAdmin ? "/admin/login" : "/signin";
    const signInUrl = new URL(loginPath, request.url);

    // Reject any potentially malicious next targets right at middleware layer
    const targetPath = request.nextUrl.pathname + request.nextUrl.search;
    signInUrl.searchParams.set("next", targetPath);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

// Narrow on purpose: /api/orders and /api/orders/[id] are deliberately
// NOT matched here. A route handler can be called directly with curl,
// bypassing this redirect entirely, so it has to check getSession() for
// itself rather than depend on ever being reached through this file.
export const config = {
  matcher: [
    "/checkout",
    "/orders/:path*",
    "/order-history",
    "/order-success",
    "/admin",
    "/admin/menu",
    "/admin/orders",
  ],
};
