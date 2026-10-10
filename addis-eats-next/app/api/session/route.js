import { getSession } from "@/lib/session";

// GET /api/session — the one thing that lets the header show sign-in
// state without every page reading a cookie. Deliberately its own tiny
// endpoint: see lib/useAuth.js and AUTH.md for why Header doesn't call
// getSession() directly.
export async function GET() {
  const session = await getSession();
  return Response.json({ user: session });
}
