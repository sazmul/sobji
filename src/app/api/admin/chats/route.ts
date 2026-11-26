import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { getDb } from "@/db";
import { chatConversations } from "@/db/schema";
import { requireAdmin } from "@/lib/session";

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const db = getDb();
    const conversations = await db
      .select()
      .from(chatConversations)
      .orderBy(desc(chatConversations.lastMessageAt), desc(chatConversations.id));

    const unreadTotal = conversations.reduce(
      (sum, c) => sum + (c.unreadForAdmin || 0),
      0
    );

    return NextResponse.json({ conversations, unreadTotal });
  } catch (err) {
    console.error("GET /api/admin/chats error:", err);
    return NextResponse.json({ error: "Failed to load chats" }, { status: 500 });
  }
}
