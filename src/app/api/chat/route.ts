import { NextRequest, NextResponse } from "next/server";
import { asc, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { chatConversations, chatMessages } from "@/db/schema";
import { getCurrentUser } from "@/lib/session";

const postChatSchema = z.object({
  sessionKey: z.string().trim().min(12).max(120),
  name: z.string().trim().max(80).optional(),
  phone: z.string().trim().max(30).optional(),
  area: z.string().trim().max(60).optional(),
  message: z.string().trim().min(1).max(1000),
});

async function resolveConversation(sessionKey: string, userId?: string | null) {
  const db = getDb();
  const [bySession] = await db
    .select()
    .from(chatConversations)
    .where(eq(chatConversations.sessionKey, sessionKey))
    .limit(1);

  if (bySession) {
    if (userId && !bySession.userId) {
      const [linked] = await db
        .update(chatConversations)
        .set({ userId })
        .where(eq(chatConversations.id, bySession.id))
        .returning();
      return linked ?? bySession;
    }
    return bySession;
  }

  if (userId) {
    const [byUser] = await db
      .select()
      .from(chatConversations)
      .where(eq(chatConversations.userId, userId))
      .orderBy(desc(chatConversations.lastMessageAt))
      .limit(1);
    if (byUser) return byUser;
  }

  return null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionKey = searchParams.get("sessionKey")?.trim() || "";
    const markRead = searchParams.get("markRead") === "1";

    if (sessionKey.length < 12) {
      return NextResponse.json({ conversation: null, messages: [] });
    }

    const currentUser = await getCurrentUser();
    let conversation = await resolveConversation(sessionKey, currentUser?.id);

    if (!conversation) {
      return NextResponse.json({ conversation: null, messages: [] });
    }

    const db = getDb();
    if (markRead && conversation.unreadForCustomer > 0) {
      const [updated] = await db
        .update(chatConversations)
        .set({ unreadForCustomer: 0 })
        .where(eq(chatConversations.id, conversation.id))
        .returning();
      if (updated) conversation = updated;
    }

    const messages = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.conversationId, conversation.id))
      .orderBy(asc(chatMessages.id));

    return NextResponse.json({ conversation, messages });
  } catch (err) {
    console.error("GET /api/chat error:", err);
    return NextResponse.json({ error: "Failed to load chat" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = postChatSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please enter a valid message." },
        { status: 400 }
      );
    }

    const currentUser = await getCurrentUser();
    const db = getDb();
    const { sessionKey, message } = parsed.data;
    const customerName =
      currentUser?.name ||
      parsed.data.name?.trim() ||
      "Guest Customer";
    const customerPhone =
      parsed.data.phone?.trim() || currentUser?.phone || null;
    const customerArea = parsed.data.area?.trim() || "Dhaka";

    let conversation = await resolveConversation(sessionKey, currentUser?.id);
    const now = new Date();

    if (!conversation) {
      const [created] = await db
        .insert(chatConversations)
        .values({
          sessionKey,
          userId: currentUser?.id ?? null,
          customerName,
          customerPhone,
          customerArea,
          status: "open",
          unreadForAdmin: 1,
          unreadForCustomer: 0,
          lastMessageText: message.slice(0, 140),
          lastMessageAt: now,
          createdAt: now,
        })
        .returning();
      conversation = created;
    } else {
      const nextName =
        parsed.data.name?.trim() ||
        currentUser?.name ||
        conversation.customerName;
      const nextPhone =
        parsed.data.phone?.trim() ||
        currentUser?.phone ||
        conversation.customerPhone;
      const [updated] = await db
        .update(chatConversations)
        .set({
          userId: currentUser?.id ?? conversation.userId,
          customerName: nextName,
          customerPhone: nextPhone,
          customerArea: parsed.data.area?.trim() || conversation.customerArea,
          status: "open",
          lastMessageText: message.slice(0, 140),
          lastMessageAt: now,
          unreadForAdmin: sql`${chatConversations.unreadForAdmin} + 1`,
        })
        .where(eq(chatConversations.id, conversation.id))
        .returning();
      if (updated) conversation = updated;
    }

    await db.insert(chatMessages).values({
      conversationId: conversation.id,
      senderRole: "customer",
      senderName: conversation.customerName,
      body: message,
      createdAt: now,
    });

    const messages = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.conversationId, conversation.id))
      .orderBy(asc(chatMessages.id));

    return NextResponse.json({ conversation, messages }, { status: 201 });
  } catch (err) {
    console.error("POST /api/chat error:", err);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
