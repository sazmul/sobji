import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getDb } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getCurrentUser() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) return null;

    const db = getDb();
    const [dbUser] = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        isMember: user.isMember,
        memberSince: user.memberSince,
      })
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    return dbUser ?? null;
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const current = await getCurrentUser();
  if (!current || current.role !== "admin") {
    return null;
  }
  return current;
}
