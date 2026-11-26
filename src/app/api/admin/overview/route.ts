import { NextResponse } from "next/server";
import { asc, desc } from "drizzle-orm";
import { getDb } from "@/db";
import {
  categories,
  coupons,
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
      allUsers,
    ] = await Promise.all([
      db.select().from(orders).orderBy(desc(orders.createdAt)),
      db.select().from(orderItems),
      db.select().from(products).orderBy(asc(products.id)),
      db.select().from(productVariants).orderBy(asc(productVariants.id)),
      db.select().from(categories).orderBy(asc(categories.sortOrder)),
      db.select().from(farmers).orderBy(asc(farmers.id)),
      db.select().from(coupons).orderBy(asc(coupons.id)),
      db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isMember: user.isMember,
          createdAt: user.createdAt,
        })
        .from(user),
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

    const totalRevenueBdt = allOrders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + o.totalBdt, 0);

    const lowStockCount = allVariants.filter((v) => v.stockQty <= 15).length;

    return NextResponse.json({
      stats: {
        totalRevenueBdt,
        totalOrders: allOrders.length,
        activeProducts: allProducts.filter((p) => p.isActive).length,
        totalCustomers: allUsers.length,
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
      categories: allCats,
      farmers: allFarmers,
      coupons: allCoupons,
    });
  } catch (err) {
    console.error("GET /api/admin/overview error:", err);
    return NextResponse.json({ error: "Failed to load admin overview" }, { status: 500 });
  }
}
