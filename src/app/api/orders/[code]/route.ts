import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { orderItems, orders, productVariants } from "@/db/schema";
import { getCurrentUser } from "@/lib/session";

const patchOrderSchema = z.object({
  action: z.literal("cancel"),
  phoneLast4: z.string().max(20).optional(),
});

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

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await context.params;
    const normalized = code.trim().toUpperCase();
    const body = await request.json();
    const parsed = patchOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    const db = getDb();
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.orderCode, normalized))
      .limit(1);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status !== "confirmed") {
      return NextResponse.json(
        {
          error:
            order.status === "cancelled"
              ? "Order is already cancelled."
              : "Order can only be cancelled before farm harvesting begins.",
        },
        { status: 400 }
      );
    }

    const currentUser = await getCurrentUser();
    const isOwner = Boolean(currentUser && order.userId === currentUser.id);
    const isAdmin = currentUser?.role === "admin";
    const orderDigits = order.customerPhone.replace(/\D/g, "");
    const suppliedDigits = (parsed.data.phoneLast4 ?? "").replace(/\D/g, "");
    const phoneVerified =
      suppliedDigits.length >= 4 &&
      orderDigits.endsWith(suppliedDigits.slice(-4));

    if (!isOwner && !isAdmin && !phoneVerified) {
      return NextResponse.json(
        { error: "Enter the last 4 digits of your order phone number to cancel." },
        { status: 403 }
      );
    }

    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id));

    for (const item of items) {
      if (item.variantId) {
        await db
          .update(productVariants)
          .set({ stockQty: sql`${productVariants.stockQty} + ${item.quantity}` })
          .where(eq(productVariants.id, item.variantId));
      }
    }

    const [updatedOrder] = await db
      .update(orders)
      .set({ status: "cancelled" })
      .where(eq(orders.id, order.id))
      .returning();

    revalidateTag("catalog", "max");

    return NextResponse.json({
      order: {
        ...updatedOrder,
        items,
      },
    });
  } catch (err) {
    console.error("PATCH /api/orders/[code] error:", err);
    return NextResponse.json({ error: "Failed to cancel order" }, { status: 500 });
  }
}
