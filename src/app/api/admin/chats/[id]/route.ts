import { NextRequest, NextResponse } from "next/server";
import { asc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { chatConversations, chatMessages } from "@/db/schema";
import { requireAdmin } from "@/lib/session";

const replySchema = z.object({
  message: z.string().trim().min(1).max(1000),
});

const patchSchema = z.object({
  status: z.enum(["open", "resolved"]).optional(),
  markRead: z.boolean().optional(),
});

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await context.params;
    const convId = Number(id);
    if (!Number.isInteger(convId) || convId <= 0) {
      return NextResponse.json({ error: "Invalid conversation ID" }, { status: 400 });
    }

    const db = getDb();
    let [conversation] = await db
      .select()
      .from(chatConversations)
      .where(eq(chatConversations.id, convId))
      .limit(1);

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    if (conversation.unreadForAdmin > 0) {
      const [updated] = await db
        .update(chatConversations)
        .set({ unreadForAdmin: 0 })
        .where(eq(chatConversations.id, convId))
        .returning();
      if (updated) conversation = updated;
    }

    const messages = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.conversationId, convId))
      .orderBy(asc(chatMessages.id));

    return NextResponse.json({ conversation, messages });
  } catch (err) {
    console.error("GET /api/admin/chats/[id] error:", err);
    return NextResponse.json({ error: "Failed to load thread" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await context.params;
    const convId = Number(id);
    if (!Number.isInteger(convId) || convId <= 0) {
      return NextResponse.json({ error: "Invalid conversation ID" }, { status: 400 });
    }

    const body = await request.json();
    const parsed = replySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const db = getDb();
    const [existing] = await db
      .select()
      .from(chatConversations)
      .where(eq(chatConversations.id, convId))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const now = new Date();
    await db.insert(chatMessages).values({
      conversationId: convId,
      senderRole: "admin",
      senderName: admin.name || "sobji.com Support",
      body: parsed.data.message,
      createdAt: now,
    });

    const [conversation] = await db
      .update(chatConversations)
      .set({
        lastMessageText: parsed.data.message.slice(0, 140),
        lastMessageAt: now,
        unreadForAdmin: 0,
        unreadForCustomer: sql`${chatConversations.unreadForCustomer} + 1`,
      })
      .where(eq(chatConversations.id, convId))
      .returning();

    const messages = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.conversationId, convId))
      .orderBy(asc(chatMessages.id));

    return NextResponse.json({ conversation, messages }, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/chats/[id] error:", err);
    return NextResponse.json({ error: "Failed to send reply" }, { status: 500 });
  }
}

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
    const convId = Number(id);
    if (!Number.isInteger(convId) || convId <= 0) {
      return NextResponse.json({ error: "Invalid conversation ID" }, { status: 400 });
    }

    const body = await request.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid update" }, { status: 400 });
    }

    const db = getDb();
    const updates: Partial<typeof chatConversations.$inferInsert> = {};
    if (parsed.data.status) updates.status = parsed.data.status;
    if (parsed.data.markRead) updates.unreadForAdmin = 0;

    const [updated] = await db
      .update(chatConversations)
      .set(updates)
      .where(eq(chatConversations.id, convId))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    return NextResponse.json({ conversation: updated });
  } catch (err) {
    console.error("PATCH /api/admin/chats/[id] error:", err);
    return NextResponse.json({ error: "Failed to update conversation" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await context.params;
    const convId = Number(id);
    if (!Number.isInteger(convId) || convId <= 0) {
      return NextResponse.json({ error: "Invalid conversation ID" }, { status: 400 });
    }

    const db = getDb();
    const [deleted] = await db
      .delete(chatConversations)
      .where(eq(chatConversations.id, convId))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/admin/chats/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete conversation" }, { status: 500 });
  }
}
