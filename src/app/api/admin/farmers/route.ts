import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { farmers } from "@/db/schema";
import { requireAdmin } from "@/lib/session";

const createFarmerSchema = z.object({
  name: z.string().min(2).max(100),
  nameBn: z.string().min(2).max(100),
  district: z.string().min(2).max(60),
  upazila: z.string().min(2).max(60),
  specialty: z.string().min(2).max(160),
  yearsActive: z.number().int().min(1).max(60).default(5),
  storyEn: z.string().min(4).max(500),
  storyBn: z.string().min(4).max(500),
});

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json();
    const parsed = createFarmerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid farmer details" }, { status: 400 });
    }

    const db = getDb();
    const [created] = await db
      .insert(farmers)
      .values({ ...parsed.data, verified: true })
      .returning();

    revalidateTag("catalog", "max");
    return NextResponse.json({ farmer: created }, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/farmers error:", err);
    return NextResponse.json({ error: "Failed to add farmer" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const body = await request.json();
    const id = Number(body.id);
    if (!id) return NextResponse.json({ error: "Missing farmer id" }, { status: 400 });

    const db = getDb();
    await db
      .update(farmers)
      .set({ verified: Boolean(body.verified) })
      .where(eq(farmers.id, id));
    revalidateTag("catalog", "max");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("PATCH /api/admin/farmers error:", err);
    return NextResponse.json({ error: "Failed to update farmer" }, { status: 500 });
  }
}
