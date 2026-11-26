import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { addresses } from "@/db/schema";
import { getCurrentUser } from "@/lib/session";

const addressSchema = z.object({
  label: z.string().min(1).max(30),
  area: z.string().min(2).max(60),
  fullAddress: z.string().min(5).max(250),
  phone: z.string().min(8).max(20),
});

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = addressSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid address fields" }, { status: 400 });
    }

    const db = getDb();
    const [created] = await db
      .insert(addresses)
      .values({
        userId: currentUser.id,
        label: parsed.data.label.trim(),
        area: parsed.data.area.trim(),
        fullAddress: parsed.data.fullAddress.trim(),
        phone: parsed.data.phone.trim(),
        isDefault: false,
      })
      .returning();

    return NextResponse.json({ address: created }, { status: 201 });
  } catch (err) {
    console.error("POST /api/account/addresses error:", err);
    return NextResponse.json({ error: "Failed to save address" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));
    if (!id) {
      return NextResponse.json({ error: "Missing address id" }, { status: 400 });
    }

    const db = getDb();
    await db
      .delete(addresses)
      .where(and(eq(addresses.id, id), eq(addresses.userId, currentUser.id)));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/account/addresses error:", err);
    return NextResponse.json({ error: "Failed to delete address" }, { status: 500 });
  }
}
