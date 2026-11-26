import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { orderItems, orders } from "@/db/schema";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await context.params;
    const normalized = code.trim().toUpperCase();
    const db = getDb();

    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.orderCode, normalized))
      .limit(1);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id));

    return NextResponse.json({
      order: {
        ...order,
        items,
      },
    });
  } catch (err) {
    console.error("GET /api/orders/[code] error:", err);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}
