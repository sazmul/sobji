import { NextResponse } from "next/server";
import { asc, desc } from "drizzle-orm";
import { getDb } from "@/db";
import {
  categories,
  coupons,
  deliverySlots,
  farmers,
  orderItems,
  orders,
  products,
  productVariants,
  user,
} from "@/db/schema";
import { requireAdmin } from "@/lib/session";

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const db = getDb();
    const [
      allOrders,
      allOrderItems,
      allProducts,
      allVariants,
      allCats,
      allFarmers,
      allCoupons,
      allSlots,
      allUsers,
    ] = await Promise.all([
      db.select().from(orders).orderBy(desc(orders.createdAt)),
      db.select().from(orderItems),
      db.select().from(products).orderBy(desc(products.id)),
      db.select().from(productVariants).orderBy(asc(productVariants.id)),
      db.select().from(categories).orderBy(asc(categories.sortOrder), asc(categories.id)),
      db.select().from(farmers).orderBy(asc(farmers.id)),
      db.select().from(coupons).orderBy(asc(coupons.id)),
      db.select().from(deliverySlots).orderBy(asc(deliverySlots.sortOrder)),
      db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          isMember: user.isMember,
          createdAt: user.createdAt,
        })
        .from(user)
        .orderBy(desc(user.createdAt)),
    ]);

    const itemMap = new Map<number, typeof allOrderItems>();
    for (const item of allOrderItems) {
      const arr = itemMap.get(item.orderId) ?? [];
      arr.push(item);
      itemMap.set(item.orderId, arr);
    }

    const variantMap = new Map<number, typeof allVariants>();
    for (const v of allVariants) {
      const arr = variantMap.get(v.productId) ?? [];
      arr.push(v);
      variantMap.set(v.productId, arr);
    }

    const userStatsMap = new Map<string, { orderCount: number; totalSpentBdt: number }>();
    for (const ord of allOrders) {
      if (!ord.userId || ord.status === "cancelled") continue;
      const cur = userStatsMap.get(ord.userId) ?? { orderCount: 0, totalSpentBdt: 0 };
      cur.orderCount += 1;
      cur.totalSpentBdt += ord.totalBdt;
      userStatsMap.set(ord.userId, cur);
    }

    const catOrderCount = new Map<number, number>();
    for (const p of allProducts) {
      catOrderCount.set(p.categoryId, (catOrderCount.get(p.categoryId) ?? 0) + 1);
    }

    const totalRevenueBdt = allOrders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + o.totalBdt, 0);

    const lowStockCount = allVariants.filter((v) => v.stockQty <= 15).length;
    const pendingOrdersCount = allOrders.filter(
      (o) => !["delivered", "cancelled"].includes(o.status)
    ).length;

    return NextResponse.json({
      currentAdminId: admin.id,
      stats: {
        totalRevenueBdt,
        totalOrders: allOrders.length,
        pendingOrdersCount,
        activeProducts: allProducts.filter((p) => p.isActive).length,
        totalCategories: allCats.length,
        totalCustomers: allUsers.length,
        clubMembers: allUsers.filter((u) => u.isMember).length,
        lowStockCount,
      },
      orders: allOrders.map((o) => ({
        ...o,
        items: itemMap.get(o.id) ?? [],
      })),
      products: allProducts.map((p) => ({
        ...p,
        variants: variantMap.get(p.id) ?? [],
      })),
      categories: allCats.map((c) => ({
        ...c,
        productCount: catOrderCount.get(c.id) ?? 0,
      })),
      farmers: allFarmers,
      coupons: allCoupons,
      slots: allSlots,
      users: allUsers.map((u) => ({
        ...u,
        orderCount: userStatsMap.get(u.id)?.orderCount ?? 0,
        totalSpentBdt: userStatsMap.get(u.id)?.totalSpentBdt ?? 0,
      })),
    });
  } catch (err) {
    console.error("GET /api/admin/overview error:", err);
    return NextResponse.json({ error: "Failed to load admin overview" }, { status: 500 });
  }
}
