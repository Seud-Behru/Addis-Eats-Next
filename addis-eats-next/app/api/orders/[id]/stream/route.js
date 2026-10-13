import { getSession } from "@/lib/session";
import { getOrder } from "@/lib/orders";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  const session = await getSession();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const initialOrder = getOrder(id);
  if (!initialOrder || (initialOrder.userId !== session.id && session.role !== "staff" && session.role !== "admin")) {
    return new Response("Not found", { status: 404 });
  }

  const encoder = new TextEncoder();
  let intervalId;

  const stream = new ReadableStream({
    start(controller) {
      // Send initial data immediately
      const current = getOrder(id);
      if (current) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(current)}\n\n`));
      }

      // Periodically push updates
      intervalId = setInterval(() => {
        try {
          const order = getOrder(id);
          if (!order) {
            clearInterval(intervalId);
            controller.close();
            return;
          }

          controller.enqueue(encoder.encode(`data: ${JSON.stringify(order)}\n\n`));

          if (order.status === "Delivered" || order.status === "Cancelled") {
            clearInterval(intervalId);
            controller.close();
          }
        } catch {
          clearInterval(intervalId);
          controller.close();
        }
      }, 3000);
    },
    cancel() {
      if (intervalId) clearInterval(intervalId);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
