import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { products, productVariants } from "@/db/schema";
import { requireAdmin } from "@/lib/session";

const patchSchema = z.object({
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isFlashDeal: z.boolean().optional(),
  variantId: z.number().int().positive().optional(),
  priceBdt: z.number().int().positive().optional(),
  stockQty: z.number().int().min(0).optional(),
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
    const productId = Number(id);
    if (!productId) {
      return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
    }

    const body = await request.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid update payload" }, { status: 400 });
    }

    const db = getDb();
    const d = parsed.data;
    const prodUpdates: Partial<typeof products.$inferInsert> = {};
    if (typeof d.isActive === "boolean") prodUpdates.isActive = d.isActive;
    if (typeof d.isFeatured === "boolean") prodUpdates.isFeatured = d.isFeatured;
    if (typeof d.isFlashDeal === "boolean") prodUpdates.isFlashDeal = d.isFlashDeal;

    if (Object.keys(prodUpdates).length > 0) {
      await db.update(products).set(prodUpdates).where(eq(products.id, productId));
    }

    if (d.variantId) {
      const varUpdates: Partial<typeof productVariants.$inferInsert> = {};
      if (typeof d.priceBdt === "number") varUpdates.priceBdt = d.priceBdt;
      if (typeof d.stockQty === "number") varUpdates.stockQty = d.stockQty;
      if (Object.keys(varUpdates).length > 0) {
        await db
          .update(productVariants)
          .set(varUpdates)
          .where(eq(productVariants.id, d.variantId));
      }
    }

    revalidateTag("catalog", "max");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("PATCH /api/admin/products/[id] error:", err);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { id } = await context.params;
    const productId = Number(id);
    if (!productId) {
      return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
    }

    const db = getDb();
    await db.delete(products).where(eq(products.id, productId));
    revalidateTag("catalog", "max");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/admin/products/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
