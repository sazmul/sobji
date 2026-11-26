import { NextRequest, NextResponse } from "next/server";
import { getCatalogProducts } from "@/lib/catalog";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  try {
    const q = (searchParams.get("q") ?? "").trim().toLowerCase();
    const category = (searchParams.get("category") ?? "").trim();
    const badge = (searchParams.get("badge") ?? "").trim();
    const flash = searchParams.get("flash") === "true";
    const sort = searchParams.get("sort") ?? "featured";

    let list = await getCatalogProducts();

    if (category && category !== "all") {
      list = list.filter((p) => p.categorySlug === category);
    }

    if (badge && badge !== "all") {
      list = list.filter((p) => p.badge.toLowerCase() === badge.toLowerCase());
    }

    if (flash) {
      list = list.filter((p) => p.isFlashDeal);
    }

    if (q) {
      list = list.filter(
        (p) =>
          p.nameEn.toLowerCase().includes(q) ||
          p.nameBn.toLowerCase().includes(q) ||
          p.subtitleEn.toLowerCase().includes(q) ||
          p.subtitleBn.toLowerCase().includes(q) ||
          p.categoryNameEn.toLowerCase().includes(q) ||
          p.farmerDistrict.toLowerCase().includes(q) ||
          p.badge.toLowerCase().includes(q)
      );
    }

    const getMinPrice = (p: (typeof list)[number]) =>
      p.variants.find((v) => v.isDefault)?.priceBdt ?? p.variants[0]?.priceBdt ?? 0;

    if (sort === "price-asc") {
      list = [...list].sort((a, b) => getMinPrice(a) - getMinPrice(b));
    } else if (sort === "price-desc") {
      list = [...list].sort((a, b) => getMinPrice(b) - getMinPrice(a));
    } else if (sort === "rating") {
      list = [...list].sort((a, b) => b.ratingAvg - a.ratingAvg);
    }

    return NextResponse.json({ products: list });
  } catch (err) {
    console.error("GET /api/products error:", err);
    return NextResponse.json({ error: "Failed to load products" }, { status: 500 });
  }
}
