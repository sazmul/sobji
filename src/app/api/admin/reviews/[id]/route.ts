import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { products, reviews } from "@/db/schema";
import { requireAdmin } from "@/lib/session";

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await context.params;
    const reviewId = Number(id);
    if (!reviewId) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const db = getDb();
    const [deleted] = await db
      .delete(reviews)
      .where(eq(reviews.id, reviewId))
      .returning();

    if (deleted) {
      const remaining = await db
        .select({ rating: reviews.rating })
        .from(reviews)
        .where(eq(reviews.productId, deleted.productId));
      const reviewCount = remaining.length;
      const ratingAvg =
        reviewCount > 0
          ? Number(
              (remaining.reduce((acc, r) => acc + r.rating, 0) / reviewCount).toFixed(1)
            )
          : 5;
      await db
        .update(products)
        .set({ reviewCount, ratingAvg })
        .where(eq(products.id, deleted.productId));
      revalidateTag("catalog", "max");
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/admin/reviews/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}
