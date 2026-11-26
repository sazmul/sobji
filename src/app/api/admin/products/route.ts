import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { getDb } from "@/db";
import { products, productVariants } from "@/db/schema";
import { requireAdmin } from "@/lib/session";

const createProductSchema = z.object({
  nameEn: z.string().min(2).max(120),
  nameBn: z.string().min(2).max(120),
  subtitleEn: z.string().min(2).max(180),
  subtitleBn: z.string().min(2).max(180),
  descriptionEn: z.string().min(5).max(800),
  descriptionBn: z.string().min(5).max(800),
  categoryId: z.number().int().positive(),
  farmerId: z.number().int().positive(),
  visualKey: z.string().min(2).max(40).default("default"),
  badge: z.string().min(2).max(40).default("Farm Direct"),
  harvestTime: z.string().min(2).max(80).default("Today, 5:00 AM"),
  isFeatured: z.boolean().default(false),
  isFlashDeal: z.boolean().default(false),
  variantLabel: z.string().min(1).max(40).default("500g"),
  priceBdt: z.number().int().positive(),
  compareAtBdt: z.number().int().positive().nullable().optional(),
  stockQty: z.number().int().min(0).default(50),
});

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = createProductSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid product details", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const slug = `${d.nameEn
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")}-${Date.now().toString(36).slice(-4)}`;

    const db = getDb();
    const [created] = await db
      .insert(products)
      .values({
        slug,
        categoryId: d.categoryId,
        farmerId: d.farmerId,
        nameEn: d.nameEn.trim(),
        nameBn: d.nameBn.trim(),
        subtitleEn: d.subtitleEn.trim(),
        subtitleBn: d.subtitleBn.trim(),
        descriptionEn: d.descriptionEn.trim(),
        descriptionBn: d.descriptionBn.trim(),
        visualKey: d.visualKey,
        badge: d.badge,
        harvestTime: d.harvestTime,
        isFeatured: d.isFeatured,
        isFlashDeal: d.isFlashDeal,
        isActive: true,
        storageTipEn: "Keep cool and dry; refrigerate leafy items in paper wrap.",
        storageTipBn: "ঠান্ডা ও শুকনো স্থানে বা কাগজে মুড়ে ফ্রিজে রাখুন।",
      })
      .returning();

    const [variant] = await db
      .insert(productVariants)
      .values({
        productId: created.id,
        label: d.variantLabel,
        priceBdt: d.priceBdt,
        compareAtBdt: d.compareAtBdt ?? null,
        stockQty: d.stockQty,
        isDefault: true,
      })
      .returning();

    revalidateTag("catalog", "max");

    return NextResponse.json({ product: { ...created, variants: [variant] } }, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/products error:", err);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
