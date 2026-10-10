// Pure token sign/verify helpers — no Next.js-specific APIs, so this file
// can be imported from middleware.js (Edge runtime) *and* from pages,
// actions and route handlers (Node runtime). It uses the Web Crypto API
// (crypto.subtle) rather than Node's `crypto` module, because the Edge
// runtime only has the former.

export const SESSION_COOKIE = "addis_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // seconds — 7 days

const SECRET = process.env.SESSION_SECRET || "dev-only-insecure-secret-change-me";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function toBase64Url(bytes) {
  let binary = "";
  for (const byte of new Uint8Array(bytes)) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function hmacKey() {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

async function sign(payloadB64) {
  const key = await hmacKey();
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payloadB64));
  return toBase64Url(signature);
}

// The cookie value is base64url(payload) + "." + an HMAC signature of that
// string. Nothing here is encrypted — id/email/role are readable if someone
// decodes the cookie by hand, only *unforgeable* without the server's
// secret. That's enough, since the payload holds nothing sensitive (no
// password).
export async function createSessionToken(user) {
  const payload = JSON.stringify({
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    iat: Date.now(),
  });
  const payloadB64 = toBase64Url(encoder.encode(payload));
  const signature = await sign(payloadB64);
  return `${payloadB64}.${signature}`;
}

export async function verifySessionToken(token) {
  if (!token || typeof token !== "string" || !token.includes(".")) return null;

  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) return null;

  const expected = await sign(payloadB64);
  // Equal-length, full-scan comparison rather than `===`, so a mismatch
  // on the first byte doesn't return faster than a mismatch on the last.
  if (expected.length !== signature.length) return null;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  if (mismatch !== 0) return null;

  try {
    const payload = JSON.parse(decoder.decode(fromBase64Url(payloadB64)));
    if (typeof payload.iat !== "number" || Date.now() - payload.iat > SESSION_MAX_AGE * 1000) {
      return null; // expired
    }
    return payload;
  } catch {
    return null; // malformed payload
  }
}
