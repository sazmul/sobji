import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { subscriptions } from "@/db/schema";
import { getCurrentUser } from "@/lib/session";

const patchSchema = z.object({
  id: z.number().int().positive(),
  status: z.enum(["active", "paused", "cancelled"]),
});

export async function PATCH(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const db = getDb();
    await db
      .update(subscriptions)
      .set({ status: parsed.data.status })
      .where(
        and(
          eq(subscriptions.id, parsed.data.id),
          eq(subscriptions.userId, currentUser.id)
        )
      );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("PATCH /api/account/subscriptions error:", err);
    return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 });
  }
}
