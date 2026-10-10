import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session-token";

// Runs before /checkout and /orders/* (see the matcher below). It only
// proves "a validly-signed session cookie is present" — it does not know
// *whose* order this is, so it can't do ownership checks. Those happen
// further in, on each page and route handler (see AUTH.md).
export async function middleware(request) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);

  if (!session) {
    const signInUrl = new URL("/signin", request.url);
    signInUrl.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

// Narrow on purpose: /api/orders and /api/orders/[id] are deliberately
// NOT matched here. A route handler can be called directly with curl,
// bypassing this redirect entirely, so it has to check getSession() for
// itself rather than depend on ever being reached through this file.
export const config = {
  matcher: ["/checkout", "/orders/:path*"],
};
