import { cookies } from "next/headers";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  createSessionToken,
  verifySessionToken,
} from "./session-token";

// getSession() is the one function pages, server actions and route
// handlers all call to find out who's asking. It never throws for a
// missing or invalid session — it resolves to null, so every caller gets
// a plain value to check rather than a try/catch to write.
export async function getSession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}

export async function setSessionCookie(user) {
  const token = await createSessionToken(user);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

// Only an internal path is ever a valid `next`: it must start with exactly
// one "/". "//evil.com" starts with a slash too, but a browser reads a
// leading "//" as protocol-relative — i.e. still an external redirect —
// so that's rejected as well. Anything that fails falls back to "/".
export function safeNext(value) {
  if (typeof value !== "string" || value.length === 0) return "/";
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\") || value.includes("\\")) return "/";
  try {
    const url = new URL(value, "http://localhost");
    if (url.origin !== "http://localhost") return "/";
    return url.pathname + url.search;
  } catch {
    return "/";
  }
}
