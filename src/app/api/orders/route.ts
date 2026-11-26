import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import {
  coupons,
  deliverySlots,
  orderItems,
  orders,
  products,
  productVariants,
  subscriptions,
  user,
} from "@/db/schema";
import { getCurrentUser } from "@/lib/session";
import { calculateDeliveryFee, generateOrderCode } from "@/lib/utils";

const createOrderSchema = z.object({
  customerName: z.string().min(2).max(100),
  customerPhone: z.string().min(8).max(20),
  customerEmail: z.string().email().optional().or(z.literal("")),
  deliveryArea: z.string().min(2).max(80),
  deliveryAddress: z.string().min(5).max(300),
  deliveryNotes: z.string().max(250).optional(),
  slotId: z.number().int().positive(),
  deliveryDate: z.string().min(8).max(20),
  paymentMethod: z.enum(["cod", "bkash", "nagad", "card"]),
  paymentRef: z.string().max(80).optional(),
  couponCode: z.string().max(30).optional(),
  isRecurringWeekly: z.boolean().optional(),
  items: z
    .array(
      z.object({
        variantId: z.number().int().positive(),
        quantity: z.number().int().min(1).max(50),
      })
    )
    .min(1),
});

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, currentUser.id))
      .orderBy(desc(orders.createdAt));

    const orderIds = userOrders.map((o) => o.id);
    const items =
      orderIds.length > 0
        ? await db.select().from(orderItems).where(inArray(orderItems.orderId, orderIds))
        : [];

    const itemMap = new Map<number, typeof items>();
    for (const item of items) {
      const list = itemMap.get(item.orderId) ?? [];
      list.push(item);
      itemMap.set(item.orderId, list);
    }

    return NextResponse.json({
      orders: userOrders.map((o) => ({
        ...o,
        items: itemMap.get(o.id) ?? [],
      })),
    });
  } catch (err) {
    console.error("GET /api/orders error:", err);
    return NextResponse.json({ error: "Failed to load orders" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please check all checkout fields.", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const db = getDb();
    const currentUser = await getCurrentUser();

    const variantIds = data.items.map((i) => i.variantId);
    const dbVariants = await db
      .select()
      .from(productVariants)
      .where(inArray(productVariants.id, variantIds));

    if (dbVariants.length === 0) {
      return NextResponse.json({ error: "Selected items are no longer available." }, { status: 400 });
    }

    const productIds = [...new Set(dbVariants.map((v) => v.productId))];
    const dbProducts = await db
      .select()
      .from(products)
      .where(inArray(products.id, productIds));

    const variantMap = new Map(dbVariants.map((v) => [v.id, v]));
    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    let subtotalBdt = 0;
    const resolvedItems: Array<{
      productId: number;
      variantId: number;
      productNameEn: string;
      productNameBn: string;
      variantLabel: string;
      visualKey: string;
      unitPriceBdt: number;
      quantity: number;
      lineTotalBdt: number;
      newStock: number;
    }> = [];

    for (const reqItem of data.items) {
      const variant = variantMap.get(reqItem.variantId);
      if (!variant) {
        return NextResponse.json(
          { error: "One of your bag items is unavailable." },
          { status: 400 }
        );
      }
      const product = productMap.get(variant.productId);
      if (!product || !product.isActive) {
        return NextResponse.json(
          { error: "Product is currently out of harvest." },
          { status: 400 }
        );
      }
      if (variant.stockQty < reqItem.quantity) {
        return NextResponse.json(
          {
            error: `Only ${variant.stockQty} left for ${product.nameEn} (${variant.label}).`,
          },
          { status: 400 }
        );
      }

      const lineTotal = variant.priceBdt * reqItem.quantity;
      subtotalBdt += lineTotal;
      resolvedItems.push({
        productId: product.id,
        variantId: variant.id,
        productNameEn: product.nameEn,
        productNameBn: product.nameBn,
        variantLabel: variant.label,
        visualKey: product.visualKey,
        unitPriceBdt: variant.priceBdt,
        quantity: reqItem.quantity,
        lineTotalBdt: lineTotal,
        newStock: Math.max(0, variant.stockQty - reqItem.quantity),
      });
    }

    const [slot] = await db
      .select()
      .from(deliverySlots)
      .where(eq(deliverySlots.id, data.slotId))
      .limit(1);

    if (!slot || !slot.isActive) {
      return NextResponse.json({ error: "Selected delivery slot is unavailable." }, { status: 400 });
    }

    // Validate coupon server-side
    let discountBdt = 0;
    let appliedCoupon: string | null = null;
    if (data.couponCode && data.couponCode.trim()) {
      const code = data.couponCode.trim().toUpperCase();
      const [coupon] = await db
        .select()
        .from(coupons)
        .where(eq(coupons.code, code))
        .limit(1);

      if (coupon && coupon.isActive && subtotalBdt >= coupon.minOrderBdt) {
        discountBdt =
          coupon.discountType === "percent"
            ? Math.round((subtotalBdt * coupon.discountValue) / 100)
            : coupon.discountValue;
        if (coupon.maxDiscountBdt && discountBdt > coupon.maxDiscountBdt) {
          discountBdt = coupon.maxDiscountBdt;
        }
        appliedCoupon = coupon.code;
      }
    }

    const isMember = currentUser?.isMember || subtotalBdt >= 499;
    const deliveryFeeBdt = calculateDeliveryFee(subtotalBdt, slot.isExpress, isMember);
    const totalBdt = Math.max(0, subtotalBdt - discountBdt + deliveryFeeBdt);
    const orderCode = generateOrderCode();
    const paymentStatus = data.paymentMethod === "cod" ? "pending" : "paid";

    const [createdOrder] = await db
      .insert(orders)
      .values({
        orderCode,
        userId: currentUser?.id ?? null,
        customerName: data.customerName.trim(),
        customerPhone: data.customerPhone.trim(),
        customerEmail: data.customerEmail?.trim() || currentUser?.email || null,
        deliveryArea: data.deliveryArea.trim(),
        deliveryAddress: data.deliveryAddress.trim(),
        deliveryNotes: data.deliveryNotes?.trim() || null,
        slotId: slot.id,
        slotLabel: `${slot.labelEn} (${slot.windowText})`,
        deliveryDate: data.deliveryDate,
        paymentMethod: data.paymentMethod,
        paymentStatus,
        paymentRef:
          data.paymentRef?.trim() ||
          (data.paymentMethod !== "cod"
            ? `${data.paymentMethod.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`
            : null),
        status: "confirmed",
        subtotalBdt,
        discountBdt,
        deliveryFeeBdt,
        totalBdt,
        couponCode: appliedCoupon,
        isRecurringWeekly: Boolean(data.isRecurringWeekly),
      })
      .returning();

    await db.insert(orderItems).values(
      resolvedItems.map((item) => ({
        orderId: createdOrder.id,
        productId: item.productId,
        variantId: item.variantId,
        productNameEn: item.productNameEn,
        productNameBn: item.productNameBn,
        variantLabel: item.variantLabel,
        visualKey: item.visualKey,
        unitPriceBdt: item.unitPriceBdt,
        quantity: item.quantity,
        lineTotalBdt: item.lineTotalBdt,
      }))
    );

    // Update stock
    for (const item of resolvedItems) {
      await db
        .update(productVariants)
        .set({ stockQty: item.newStock })
        .where(eq(productVariants.id, item.variantId));
    }

    // Grant free Sobji Club membership on orders >= 499 BDT
    if (currentUser && !currentUser.isMember && subtotalBdt >= 499) {
      await db
        .update(user)
        .set({ isMember: true, memberSince: new Date(), phone: data.customerPhone.trim() })
        .where(eq(user.id, currentUser.id));
    }

    // Create weekly recurring subscription if requested by authenticated user
    if (currentUser && data.isRecurringWeekly) {
      const nextDate = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
      await db.insert(subscriptions).values({
        userId: currentUser.id,
        title: `Weekly ${data.deliveryArea} Bazar (${resolvedItems.length} items)`,
        frequency: "weekly",
        preferredSlot: `${slot.labelEn} (${slot.windowText})`,
        deliveryArea: data.deliveryArea.trim(),
        deliveryAddress: data.deliveryAddress.trim(),
        itemsJson: resolvedItems.map((i) => ({
          variantId: i.variantId,
          productNameEn: i.productNameEn,
          variantLabel: i.variantLabel,
          quantity: i.quantity,
          unitPriceBdt: i.unitPriceBdt,
        })),
        totalBdt,
        status: "active",
        nextDeliveryDate: nextDate,
      });
    }

    revalidateTag("catalog", "max");

    return NextResponse.json(
      {
        order: {
          ...createdOrder,
          items: resolvedItems,
        },
        unlockedMembership: Boolean(currentUser && subtotalBdt >= 499),
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/orders error:", err);
    return NextResponse.json({ error: "Failed to place order" }, { status: 500 });
  }
}
