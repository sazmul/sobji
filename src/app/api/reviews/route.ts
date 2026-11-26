import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { products, reviews } from "@/db/schema";
import { getCurrentUser } from "@/lib/session";

const reviewSchema = z.object({
  productId: z.number().int().positive(),
  authorName: z.string().min(2).max(80),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(4).max(500),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Please fill all review fields." }, { status: 400 });
    }

    const db = getDb();
    const currentUser = await getCurrentUser();

    const [created] = await db
      .insert(reviews)
      .values({
        productId: parsed.data.productId,
        userId: currentUser?.id ?? null,
        authorName: currentUser?.name ?? parsed.data.authorName.trim(),
        rating: parsed.data.rating,
        comment: parsed.data.comment.trim(),
        verifiedPurchase: Boolean(currentUser),
      })
      .returning();

    const allReviews = await db
      .select({ rating: reviews.rating })
      .from(reviews)
      .where(eq(reviews.productId, parsed.data.productId));

    const reviewCount = allReviews.length;
    const ratingAvg =
      reviewCount > 0
        ? Number(
            (allReviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount).toFixed(1)
          )
        : 5;

    await db
      .update(products)
      .set({ ratingAvg, reviewCount })
      .where(eq(products.id, parsed.data.productId));

    revalidateTag("catalog", "max");

    return NextResponse.json({ review: created, ratingAvg, reviewCount }, { status: 201 });
  } catch (err) {
    console.error("POST /api/reviews error:", err);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
