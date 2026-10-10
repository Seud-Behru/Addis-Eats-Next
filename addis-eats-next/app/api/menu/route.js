import menuData from "@/data/menu-data.json";

// The full dish list for the client-side MenuProvider (home page specials).
// Replaces the old fetch("/menu-data.json"), which pointed at a file that
// does not exist in public/ and returned a 404 on every page load.
// Static: it only changes when the data file changes, i.e. at build time.
export const dynamic = "force-static";

export function GET() {
  return Response.json(menuData);
}
