import { NextRequest, NextResponse } from "next/server";
import { inArray } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { orders } from "@/db/schema";
import { requireAdmin } from "@/lib/session";

const bulkSchema = z.object({
  orderIds: z.array(z.number().int().positive()).min(1),
  status: z.enum([
    "confirmed",
    "harvesting",
    "packed",
    "out_for_delivery",
    "delivered",
    "cancelled",
  ]),
});

export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json();
    const parsed = bulkSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid bulk update" }, { status: 400 });
    }

    const db = getDb();
    await db
      .update(orders)
      .set({ status: parsed.data.status, updatedAt: new Date() })
      .where(inArray(orders.id, parsed.data.orderIds));

    return NextResponse.json({ ok: true, count: parsed.data.orderIds.length });
  } catch (err) {
    console.error("PATCH /api/admin/orders/bulk error:", err);
    return NextResponse.json({ error: "Bulk update failed" }, { status: 500 });
  }
}
