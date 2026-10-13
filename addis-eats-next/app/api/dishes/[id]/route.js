import { getDish } from "@/lib/menu";

export async function GET(_request, { params }) {
  const { id } = await params;
  const dish = getDish(id);

  if (!dish) {
    return Response.json(
      { error: "Dish not found", message: `No dish found with id ${id}` },
      { status: 404 }
    );
  }

  return Response.json(dish);
}
