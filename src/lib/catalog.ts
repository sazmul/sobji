import { cacheLife, cacheTag } from "next/cache";
import { asc, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import {
  categories,
  deliverySlots,
  farmers,
  products,
  productVariants,
  reviews,
} from "@/db/schema";

export interface CatalogVariant {
  id: number;
  productId: number;
  label: string;
  priceBdt: number;
  compareAtBdt: number | null;
  stockQty: number;
  isDefault: boolean;
}

export interface CatalogProduct {
  id: number;
  slug: string;
  categoryId: number;
  categorySlug: string;
  categoryNameEn: string;
  categoryNameBn: string;
  farmerId: number;
  farmerName: string;
  farmerNameBn: string;
  farmerDistrict: string;
  farmerUpazila: string;
  nameEn: string;
  nameBn: string;
  subtitleEn: string;
  subtitleBn: string;
  descriptionEn: string;
  descriptionBn: string;
  visualKey: string;
  imageUrl: string | null;
  badge: string;
  isFeatured: boolean;
  isFlashDeal: boolean;
  isMemberBogo: boolean;
  isActive: boolean;
  harvestTime: string;
  storageTipEn: string;
  storageTipBn: string;
  ratingAvg: number;
  reviewCount: number;
  variants: CatalogVariant[];
}

export async function getCategories() {
  "use cache";
  cacheLife("minutes");
  cacheTag("catalog");
  const db = getDb();
  return db.select().from(categories).orderBy(asc(categories.sortOrder));
}

export async function getFarmers() {
  "use cache";
  cacheLife("minutes");
  cacheTag("catalog");
  const db = getDb();
  return db.select().from(farmers).orderBy(asc(farmers.id));
}

export async function getDeliverySlots() {
  "use cache";
  cacheLife("minutes");
  cacheTag("catalog");
  const db = getDb();
  return db
    .select()
    .from(deliverySlots)
    .where(eq(deliverySlots.isActive, true))
    .orderBy(asc(deliverySlots.sortOrder));
}

export async function getCatalogProducts(): Promise<CatalogProduct[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("catalog");
  const db = getDb();

  const [allProds, allCats, allFarmers, allVariants] = await Promise.all([
    db
      .select()
      .from(products)
      .where(eq(products.isActive, true))
      .orderBy(desc(products.isFeatured), asc(products.id)),
    db.select().from(categories),
    db.select().from(farmers),
    db.select().from(productVariants).orderBy(asc(productVariants.id)),
  ]);

  const catMap = new Map(allCats.map((c) => [c.id, c]));
  const farmerMap = new Map(allFarmers.map((f) => [f.id, f]));
  const variantMap = new Map<number, CatalogVariant[]>();
  for (const v of allVariants) {
    const arr = variantMap.get(v.productId) ?? [];
    arr.push(v);
    variantMap.set(v.productId, arr);
  }

  return allProds.map((p) => {
    const cat = catMap.get(p.categoryId);
    const farmer = farmerMap.get(p.farmerId);
    return {
      ...p,
      categorySlug: cat?.slug ?? "fresh-vegetables",
      categoryNameEn: cat?.nameEn ?? "Fresh Vegetables",
      categoryNameBn: cat?.nameBn ?? "তাজা সবজি",
      farmerName: farmer?.name ?? "Partner Farmer",
      farmerNameBn: farmer?.nameBn ?? "পার্টনার কৃষক",
      farmerDistrict: farmer?.district ?? "Bogura",
      farmerUpazila: farmer?.upazila ?? "Sadar",
      variants: variantMap.get(p.id) ?? [],
    };
  });
}

export async function getProductBySlug(slug: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag("catalog");
  const db = getDb();

  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.slug, slug))
    .limit(1);

  if (!product) return null;

  const [[category], [farmer], variants, productReviews] = await Promise.all([
    db.select().from(categories).where(eq(categories.id, product.categoryId)).limit(1),
    db.select().from(farmers).where(eq(farmers.id, product.farmerId)).limit(1),
    db
      .select()
      .from(productVariants)
      .where(eq(productVariants.productId, product.id))
      .orderBy(asc(productVariants.id)),
    db
      .select()
      .from(reviews)
      .where(eq(reviews.productId, product.id))
      .orderBy(desc(reviews.createdAt)),
  ]);

  return {
    ...product,
    category,
    farmer,
    variants,
    reviews: productReviews,
  };
}
