import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { products, productVariants } from "@/db/schema";
import { requireAdmin } from "@/lib/session";

const patchSchema = z.object({
  nameEn: z.string().min(2).max(120).optional(),
  nameBn: z.string().min(2).max(120).optional(),
  subtitleEn: z.string().min(2).max(180).optional(),
  subtitleBn: z.string().min(2).max(180).optional(),
  descriptionEn: z.string().min(4).max(1000).optional(),
  descriptionBn: z.string().min(4).max(1000).optional(),
  categoryId: z.number().int().positive().optional(),
  farmerId: z.number().int().positive().optional(),
  imageUrl: z.string().max(400).nullable().optional(),
  badge: z.string().min(1).max(40).optional(),
  harvestTime: z.string().min(2).max(80).optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isFlashDeal: z.boolean().optional(),
  isMemberBogo: z.boolean().optional(),
  variantId: z.number().int().positive().optional(),
  variantLabel: z.string().min(1).max(40).optional(),
  priceBdt: z.number().int().positive().optional(),
  compareAtBdt: z.number().int().positive().nullable().optional(),
  stockQty: z.number().int().min(0).optional(),
  deleteVariantId: z.number().int().positive().optional(),
  newVariant: z
    .object({
      label: z.string().min(1).max(40),
      priceBdt: z.number().int().positive(),
      compareAtBdt: z.number().int().positive().nullable().optional(),
      stockQty: z.number().int().min(0).default(50),
    })
    .optional(),
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
      return NextResponse.json(
        { error: "Invalid update payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const db = getDb();
    const d = parsed.data;
    const prodUpdates: Partial<typeof products.$inferInsert> = {};
    if (d.nameEn !== undefined) prodUpdates.nameEn = d.nameEn.trim();
    if (d.nameBn !== undefined) prodUpdates.nameBn = d.nameBn.trim();
    if (d.subtitleEn !== undefined) prodUpdates.subtitleEn = d.subtitleEn.trim();
    if (d.subtitleBn !== undefined) prodUpdates.subtitleBn = d.subtitleBn.trim();
    if (d.descriptionEn !== undefined) prodUpdates.descriptionEn = d.descriptionEn.trim();
    if (d.descriptionBn !== undefined) prodUpdates.descriptionBn = d.descriptionBn.trim();
    if (d.categoryId !== undefined) prodUpdates.categoryId = d.categoryId;
    if (d.farmerId !== undefined) prodUpdates.farmerId = d.farmerId;
    if (d.imageUrl !== undefined) prodUpdates.imageUrl = d.imageUrl?.trim() || null;
    if (d.badge !== undefined) prodUpdates.badge = d.badge.trim();
    if (d.harvestTime !== undefined) prodUpdates.harvestTime = d.harvestTime.trim();
    if (typeof d.isActive === "boolean") prodUpdates.isActive = d.isActive;
    if (typeof d.isFeatured === "boolean") prodUpdates.isFeatured = d.isFeatured;
    if (typeof d.isFlashDeal === "boolean") prodUpdates.isFlashDeal = d.isFlashDeal;
    if (typeof d.isMemberBogo === "boolean") prodUpdates.isMemberBogo = d.isMemberBogo;

    if (Object.keys(prodUpdates).length > 0) {
      await db.update(products).set(prodUpdates).where(eq(products.id, productId));
    }

    if (d.variantId) {
      const varUpdates: Partial<typeof productVariants.$inferInsert> = {};
      if (d.variantLabel !== undefined) varUpdates.label = d.variantLabel.trim();
      if (typeof d.priceBdt === "number") varUpdates.priceBdt = d.priceBdt;
      if (d.compareAtBdt !== undefined) varUpdates.compareAtBdt = d.compareAtBdt;
      if (typeof d.stockQty === "number") varUpdates.stockQty = d.stockQty;
      if (Object.keys(varUpdates).length > 0) {
        await db
          .update(productVariants)
          .set(varUpdates)
          .where(eq(productVariants.id, d.variantId));
      }
    }

    if (d.deleteVariantId) {
      await db
        .delete(productVariants)
        .where(eq(productVariants.id, d.deleteVariantId));
    }

    if (d.newVariant) {
      await db.insert(productVariants).values({
        productId,
        label: d.newVariant.label.trim(),
        priceBdt: d.newVariant.priceBdt,
        compareAtBdt: d.newVariant.compareAtBdt ?? null,
        stockQty: d.newVariant.stockQty,
        isDefault: false,
      });
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
