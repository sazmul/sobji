import { NextRequest, NextResponse } from "next/server";
import { desc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import {
  addresses,
  orderItems,
  orders,
  products,
  productVariants,
  subscriptions,
  user,
} from "@/db/schema";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const [userOrders, userAddresses, userSubs] = await Promise.all([
      db
        .select()
        .from(orders)
        .where(eq(orders.userId, currentUser.id))
        .orderBy(desc(orders.createdAt)),
      db.select().from(addresses).where(eq(addresses.userId, currentUser.id)),
      db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, currentUser.id))
        .orderBy(desc(subscriptions.createdAt)),
    ]);

    const orderIds = userOrders.map((o) => o.id);
    const items =
      orderIds.length > 0
        ? await db.select().from(orderItems).where(inArray(orderItems.orderId, orderIds))
        : [];

    const productIds = [
      ...new Set(items.map((i) => i.productId).filter((id): id is number => Boolean(id))),
    ];
    const variantIds = [
      ...new Set(items.map((i) => i.variantId).filter((id): id is number => Boolean(id))),
    ];

    const [prodRows, varRows] = await Promise.all([
      productIds.length > 0
        ? db.select().from(products).where(inArray(products.id, productIds))
        : Promise.resolve([]),
      variantIds.length > 0
        ? db.select().from(productVariants).where(inArray(productVariants.id, variantIds))
        : Promise.resolve([]),
    ]);

    const prodMap = new Map(prodRows.map((p) => [p.id, p]));
    const varMap = new Map(varRows.map((v) => [v.id, v]));

    const itemMap = new Map<number, Array<(typeof items)[number] & { slug?: string; imageUrl?: string | null; stockQty?: number }>>();
    for (const item of items) {
      const arr = itemMap.get(item.orderId) ?? [];
      const p = item.productId ? prodMap.get(item.productId) : undefined;
      const v = item.variantId ? varMap.get(item.variantId) : undefined;
      arr.push({
        ...item,
        slug: p?.slug,
        imageUrl: p?.imageUrl,
        stockQty: v?.stockQty ?? 20,
      });
      itemMap.set(item.orderId, arr);
    }

    return NextResponse.json({
      user: currentUser,
      orders: userOrders.map((o) => ({ ...o, items: itemMap.get(o.id) ?? [] })),
      addresses: userAddresses,
      subscriptions: userSubs,
    });
  } catch (err) {
    console.error("GET /api/account error:", err);
    return NextResponse.json({ error: "Failed to load account" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const db = getDb();
    const updates: Partial<typeof user.$inferInsert> = {};
    if (typeof body.name === "string" && body.name.trim().length >= 2) {
      updates.name = body.name.trim();
    }
    if (typeof body.phone === "string") {
      updates.phone = body.phone.trim();
    }
    if (body.activateClub === true) {
      updates.isMember = true;
      updates.memberSince = new Date();
    }

    if (Object.keys(updates).length > 0) {
      await db.update(user).set(updates).where(eq(user.id, currentUser.id));
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("PATCH /api/account error:", err);
    return NextResponse.json({ error: "Failed to update account" }, { status: 500 });
  }
}
