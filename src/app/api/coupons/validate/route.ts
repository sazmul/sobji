import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { coupons } from "@/db/schema";

const schema = z.object({
  code: z.string().min(2).max(30),
  subtotalBdt: z.number().nonnegative(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid coupon request" }, { status: 400 });
    }

    const code = parsed.data.code.trim().toUpperCase();
    const db = getDb();
    const [coupon] = await db
      .select()
      .from(coupons)
      .where(eq(coupons.code, code))
      .limit(1);

    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ error: "Coupon code is invalid or expired" }, { status: 404 });
    }

    if (parsed.data.subtotalBdt < coupon.minOrderBdt) {
      return NextResponse.json(
        {
          error: `Minimum order of ৳${coupon.minOrderBdt} required for ${coupon.code}`,
        },
        { status: 400 }
      );
    }

    let discountBdt =
      coupon.discountType === "percent"
        ? Math.round((parsed.data.subtotalBdt * coupon.discountValue) / 100)
        : coupon.discountValue;

    if (coupon.maxDiscountBdt && discountBdt > coupon.maxDiscountBdt) {
      discountBdt = coupon.maxDiscountBdt;
    }

    return NextResponse.json({
      coupon: {
        code: coupon.code,
        discountBdt,
        descriptionEn: coupon.descriptionEn,
      },
    });
  } catch (err) {
    console.error("POST /api/coupons/validate error:", err);
    return NextResponse.json({ error: "Coupon validation failed" }, { status: 500 });
  }
}
