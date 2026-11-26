import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { coupons, deliverySlots } from "@/db/schema";
import { requireAdmin } from "@/lib/session";

const couponSchema = z.object({
  code: z.string().min(2).max(25),
  discountType: z.enum(["percent", "fixed"]),
  discountValue: z.number().int().positive(),
  minOrderBdt: z.number().int().min(0).default(0),
  maxDiscountBdt: z.number().int().positive().nullable().optional(),
  descriptionEn: z.string().min(2).max(160),
});

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const body = await request.json();

    if (body.kind === "slot") {
      const db = getDb();
      const [createdSlot] = await db
        .insert(deliverySlots)
        .values({
          labelEn: String(body.labelEn || "").trim(),
          labelBn: String(body.labelBn || body.labelEn || "").trim(),
          windowText: String(body.windowText || "").trim(),
          isExpress: Boolean(body.isExpress),
          capacity: Number(body.capacity || 60),
          sortOrder: Number(body.sortOrder || 10),
          isActive: true,
        })
        .returning();
      revalidateTag("catalog", "max");
      return NextResponse.json({ slot: createdSlot }, { status: 201 });
    }

    const parsed = couponSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid coupon details" }, { status: 400 });
    }

    const db = getDb();
    const [created] = await db
      .insert(coupons)
      .values({
        ...parsed.data,
        code: parsed.data.code.trim().toUpperCase(),
        maxDiscountBdt: parsed.data.maxDiscountBdt ?? null,
        isActive: true,
      })
      .returning();

    return NextResponse.json({ coupon: created }, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/coupons error:", err);
    return NextResponse.json({ error: "Failed to create item" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const body = await request.json();
    const db = getDb();

    if (body.kind === "slot") {
      await db
        .update(deliverySlots)
        .set({ isActive: Boolean(body.isActive) })
        .where(eq(deliverySlots.id, Number(body.id)));
      revalidateTag("catalog", "max");
      return NextResponse.json({ ok: true });
    }

    await db
      .update(coupons)
      .set({ isActive: Boolean(body.isActive) })
      .where(eq(coupons.id, Number(body.id)));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("PATCH /api/admin/coupons error:", err);
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { searchParams } = request.nextUrl;
    const id = Number(searchParams.get("id"));
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const db = getDb();
    await db.delete(coupons).where(eq(coupons.id, id));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/admin/coupons error:", err);
    return NextResponse.json({ error: "Failed to delete coupon" }, { status: 500 });
  }
}
