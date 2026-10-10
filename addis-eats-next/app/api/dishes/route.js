import { searchDishes } from "@/lib/menu";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const page = Number(searchParams.get("page")) || 1;

  return Response.json(searchDishes({ q, page }));
}
