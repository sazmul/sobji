import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { user } from "@/db/schema";
import { requireAdmin } from "@/lib/session";

const patchUserSchema = z.object({
  role: z.enum(["customer", "admin"]).optional(),
  isMember: z.boolean().optional(),
  phone: z.string().max(30).optional(),
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
    const body = await request.json();
    const parsed = patchUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid user update" }, { status: 400 });
    }

    if (id === admin.id && parsed.data.role === "customer") {
      return NextResponse.json(
        { error: "You cannot remove your own admin access." },
        { status: 400 }
      );
    }

    const db = getDb();
    const updates: Partial<typeof user.$inferInsert> = { updatedAt: new Date() };
    if (parsed.data.role !== undefined) updates.role = parsed.data.role;
    if (typeof parsed.data.isMember === "boolean") {
      updates.isMember = parsed.data.isMember;
      if (parsed.data.isMember) updates.memberSince = new Date();
    }
    if (parsed.data.phone !== undefined) updates.phone = parsed.data.phone.trim();

    await db.update(user).set(updates).where(eq(user.id, id));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("PATCH /api/admin/users/[id] error:", err);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
