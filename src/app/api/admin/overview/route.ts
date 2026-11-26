import { NextResponse } from "next/server";
import { asc, desc } from "drizzle-orm";
import { getDb } from "@/db";
import {
  categories,
  chatConversations,
  coupons,
  deliverySlots,
  farmers,
  orderItems,
  orders,
  products,
  productVariants,
  reviews,
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
      allReviews,
      allChatConvs,
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
      db.select().from(reviews).orderBy(desc(reviews.createdAt)),
      db
        .select({
          id: chatConversations.id,
          unreadForAdmin: chatConversations.unreadForAdmin,
          status: chatConversations.status,
        })
        .from(chatConversations),
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

    // 7-day daily revenue & order count series
    const today = new Date();
    const dailyMap = new Map<string, { date: string; label: string; revenueBdt: number; orders: number }>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today.getTime() - i * 86400000);
      const iso = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString("en-US", { weekday: "short" });
      dailyMap.set(iso, { date: iso, label, revenueBdt: 0, orders: 0 });
    }
    for (const ord of allOrders) {
      if (ord.status === "cancelled") continue;
      const iso = new Date(ord.createdAt).toISOString().slice(0, 10);
      const bucket = dailyMap.get(iso);
      if (bucket) {
        bucket.revenueBdt += ord.totalBdt;
        bucket.orders += 1;
      }
    }

    // Top selling products
    const salesByProduct = new Map<
      string,
      { nameEn: string; units: number; revenueBdt: number }
    >();
    const cancelledOrderIds = new Set(
      allOrders.filter((o) => o.status === "cancelled").map((o) => o.id)
    );
    for (const item of allOrderItems) {
      if (cancelledOrderIds.has(item.orderId)) continue;
      const cur = salesByProduct.get(item.productNameEn) ?? {
        nameEn: item.productNameEn,
        units: 0,
        revenueBdt: 0,
      };
      cur.units += item.quantity;
      cur.revenueBdt += item.lineTotalBdt;
      salesByProduct.set(item.productNameEn, cur);
    }
    const topProducts = [...salesByProduct.values()]
      .sort((a, b) => b.revenueBdt - a.revenueBdt)
      .slice(0, 5);

    // Status breakdown
    const statusCounts: Record<string, number> = {};
    for (const o of allOrders) {
      statusCounts[o.status] = (statusCounts[o.status] ?? 0) + 1;
    }

    const totalRevenueBdt = allOrders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + o.totalBdt, 0);

    const avgOrderValueBdt =
      allOrders.filter((o) => o.status !== "cancelled").length > 0
        ? Math.round(
            totalRevenueBdt /
              allOrders.filter((o) => o.status !== "cancelled").length
          )
        : 0;

    const prodNameMap = new Map(allProducts.map((p) => [p.id, p.nameEn]));

    return NextResponse.json({
      currentAdminId: admin.id,
      stats: {
        totalRevenueBdt,
        avgOrderValueBdt,
        totalOrders: allOrders.length,
        pendingOrdersCount: allOrders.filter(
          (o) => !["delivered", "cancelled"].includes(o.status)
        ).length,
        activeProducts: allProducts.filter((p) => p.isActive).length,
        totalCategories: allCats.length,
        totalCustomers: allUsers.length,
        clubMembers: allUsers.filter((u) => u.isMember).length,
        lowStockCount: allVariants.filter((v) => v.stockQty <= 15).length,
        unreadChatsCount: allChatConvs.reduce((sum, c) => sum + (c.unreadForAdmin || 0), 0),
        openChatsCount: allChatConvs.filter((c) => c.status === "open").length,
      },
      dailySeries: [...dailyMap.values()],
      topProducts,
      statusCounts,
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
      reviews: allReviews.map((r) => ({
        ...r,
        productNameEn: prodNameMap.get(r.productId) ?? "Product",
      })),
    });
  } catch (err) {
    console.error("GET /api/admin/overview error:", err);
    return NextResponse.json({ error: "Failed to load admin overview" }, { status: 500 });
  }
}
