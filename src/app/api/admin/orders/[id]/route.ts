import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { orders } from "@/db/schema";
import { requireAdmin } from "@/lib/session";

const patchOrderSchema = z.object({
  status: z
    .enum([
      "pending",
      "confirmed",
      "harvesting",
      "packed",
      "out_for_delivery",
      "delivered",
      "cancelled",
    ])
    .optional(),
  paymentStatus: z.enum(["pending", "paid"]).optional(),
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await context.params;
    const orderId = Number(id);
    if (!orderId) {
      return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
    }

    const body = await request.json();
    const parsed = patchOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid order status" }, { status: 400 });
    }

    const db = getDb();
    const updates: Partial<typeof orders.$inferInsert> = {
      updatedAt: new Date(),
    };
    if (parsed.data.status) updates.status = parsed.data.status;
    if (parsed.data.paymentStatus) updates.paymentStatus = parsed.data.paymentStatus;

    await db.update(orders).set(updates).where(eq(orders.id, orderId));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("PATCH /api/admin/orders/[id] error:", err);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
