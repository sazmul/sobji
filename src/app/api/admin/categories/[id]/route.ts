import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { categories } from "@/db/schema";
import { requireAdmin } from "@/lib/session";

const patchCategorySchema = z.object({
  nameEn: z.string().min(2).max(80).optional(),
  nameBn: z.string().min(2).max(80).optional(),
  descriptionEn: z.string().min(2).max(300).optional(),
  descriptionBn: z.string().min(2).max(300).optional(),
  sortOrder: z.number().int().min(0).optional(),
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
    const catId = Number(id);
    if (!catId) {
      return NextResponse.json({ error: "Invalid category id" }, { status: 400 });
    }

    const body = await request.json();
    const parsed = patchCategorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid category payload" }, { status: 400 });
    }

    const db = getDb();
    const updates: Partial<typeof categories.$inferInsert> = {};
    if (parsed.data.nameEn !== undefined) updates.nameEn = parsed.data.nameEn.trim();
    if (parsed.data.nameBn !== undefined) updates.nameBn = parsed.data.nameBn.trim();
    if (parsed.data.descriptionEn !== undefined)
      updates.descriptionEn = parsed.data.descriptionEn.trim();
    if (parsed.data.descriptionBn !== undefined)
      updates.descriptionBn = parsed.data.descriptionBn.trim();
    if (parsed.data.sortOrder !== undefined) updates.sortOrder = parsed.data.sortOrder;

    if (Object.keys(updates).length > 0) {
      await db.update(categories).set(updates).where(eq(categories.id, catId));
    }

    revalidateTag("catalog", "max");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("PATCH /api/admin/categories/[id] error:", err);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
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
    const catId = Number(id);
    if (!catId) {
      return NextResponse.json({ error: "Invalid category id" }, { status: 400 });
    }

    const db = getDb();
    await db.delete(categories).where(eq(categories.id, catId));
    revalidateTag("catalog", "max");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/admin/categories/[id] error:", err);
    return NextResponse.json(
      { error: "Cannot delete category while products reference it." },
      { status: 400 }
    );
  }
}
