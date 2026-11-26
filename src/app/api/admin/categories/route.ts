import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { getDb } from "@/db";
import { categories } from "@/db/schema";
import { requireAdmin } from "@/lib/session";

const createCategorySchema = z.object({
  nameEn: z.string().min(2).max(80),
  nameBn: z.string().min(2).max(80),
  descriptionEn: z.string().min(2).max(300),
  descriptionBn: z.string().min(2).max(300),
  iconName: z.string().min(1).max(30).default("leaf"),
  sortOrder: z.number().int().min(0).default(10),
});

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = createCategorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid category details" }, { status: 400 });
    }

    const d = parsed.data;
    const slug = d.nameEn
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const db = getDb();
    const [created] = await db
      .insert(categories)
      .values({
        slug: `${slug}-${Date.now().toString(36).slice(-3)}`,
        nameEn: d.nameEn.trim(),
        nameBn: d.nameBn.trim(),
        descriptionEn: d.descriptionEn.trim(),
        descriptionBn: d.descriptionBn.trim(),
        iconName: d.iconName,
        sortOrder: d.sortOrder,
      })
      .returning();

    revalidateTag("catalog", "max");
    return NextResponse.json({ category: created }, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/categories error:", err);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
