"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Heart, Plus, Minus, ShoppingCart, MapPin } from "lucide-react";
import { ProduceArtwork } from "./ProduceArtwork";
import { useApp } from "./Providers";
import { formatTaka } from "@/lib/utils";
import type { CatalogProduct } from "@/lib/catalog";

interface ProductCardProps {
  product: CatalogProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const { lang, items, wishlistIds, toggleWishlist, addItem, updateQty } = useApp();
  const defaultVariant =
    product.variants.find((v) => v.isDefault) ?? product.variants[0];
  const [selectedVarId, setSelectedVarId] = useState<number>(
    defaultVariant?.id ?? 0
  );

  const activeVariant =
    product.variants.find((v) => v.id === selectedVarId) ?? defaultVariant;

  if (!activeVariant) return null;

  const cartEntry = items.find((i) => i.variantId === activeVariant.id);
  const isWishlisted = wishlistIds.includes(product.id);
  const discountPct =
    activeVariant.compareAtBdt && activeVariant.compareAtBdt > activeVariant.priceBdt
      ? Math.round(
          ((activeVariant.compareAtBdt - activeVariant.priceBdt) /
            activeVariant.compareAtBdt) *
            100
        )
      : 0;

  return (
    <article className="group flex flex-col justify-between rounded-xl border border-[#e4eae5] bg-white overflow-hidden transition-all duration-200 hover:border-[#16803c]/60 hover:shadow-md">
      <div>
        <div className="relative aspect-[4/3] overflow-hidden bg-[#f6f8f6]">
          <Link href={`/products/${product.slug}`} className="block h-full w-full">
            <ProduceArtwork
              visualKey={product.visualKey}
              imageUrl={product.imageUrl}
              alt={product.nameEn}
            />
          </Link>

          {/* Discount / Offer Badge */}
          <div className="absolute left-2.5 top-2.5 flex flex-col gap-1">
            {discountPct > 0 && (
              <span className="rounded bg-[#f97316] px-2 py-0.5 font-mono text-[11px] font-extrabold text-white shadow-2xs">
                -{discountPct}%
              </span>
            )}
            {product.isMemberBogo && (
              <span className="rounded bg-[#16803c] px-2 py-0.5 text-[10px] font-bold text-white shadow-2xs">
                Member BOGO
              </span>
            )}
          </div>

          {/* Wishlist Heart */}
          <button
            type="button"
            onClick={() => toggleWishlist(product.id, product.nameEn)}
            aria-label="Save to wishlist"
            className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#5f6f64] shadow-xs hover:text-[#f97316] transition cursor-pointer"
          >
            <Heart
              className={`h-4 w-4 ${
                isWishlisted ? "fill-[#f97316] text-[#f97316]" : ""
              }`}
            />
          </button>

          {/* Farmer Origin Strip */}
          <span className="absolute bottom-2 left-2.5 inline-flex items-center gap-1 rounded bg-white/90 px-2 py-0.5 text-[10px] font-bold text-[#16803c] backdrop-blur-xs">
            <MapPin className="h-2.5 w-2.5" />
            {product.farmerDistrict}
          </span>
        </div>

        <div className="p-3.5 pb-2">
          <Link href={`/products/${product.slug}`} className="block">
            <h3 className="line-clamp-1 text-sm font-bold text-[#18231c] group-hover:text-[#16803c] transition">
              {lang === "bn" ? product.nameBn : product.nameEn}
            </h3>
            <p className="mt-0.5 line-clamp-1 text-xs text-[#5f6f64]">
              {lang === "bn" ? product.nameEn : product.nameBn} • {product.badge}
            </p>
          </Link>

          {/* Pack Weight Pills */}
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {product.variants.map((variant) => {
              const active = variant.id === activeVariant.id;
              return (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => setSelectedVarId(variant.id)}
                  className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold transition cursor-pointer ${
                    active
                      ? "border-[#16803c] bg-[#eef9f1] text-[#16803c]"
                      : "border-[#e4eae5] bg-[#f6f8f6] text-[#5f6f64] hover:border-[#16803c]/50"
                  }`}
                >
                  {variant.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Price + Prominent Supermarket Add-to-Cart */}
      <div className="p-3.5 pt-2 space-y-2.5">
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-lg font-extrabold text-[#16803c]">
              {formatTaka(activeVariant.priceBdt, lang)}
            </span>
            {activeVariant.compareAtBdt && (
              <span className="font-mono text-xs text-stone-400 line-through">
                {formatTaka(activeVariant.compareAtBdt, lang)}
              </span>
            )}
          </div>
          <span className="text-[11px] font-semibold text-[#5f6f64]">
            ★ {product.ratingAvg.toFixed(1)}
          </span>
        </div>

        {activeVariant.stockQty <= 0 ? (
          <div className="w-full rounded-lg bg-stone-100 py-2 text-center text-xs font-bold text-stone-500">
            {lang === "bn" ? "স্টক শেষ" : "Out of Stock"}
          </div>
        ) : cartEntry ? (
          <div className="flex w-full items-center justify-between rounded-lg bg-[#16803c] px-2 py-1.5 text-white">
            <button
              type="button"
              onClick={() => updateQty(activeVariant.id, cartEntry.quantity - 1)}
              className="flex h-7 w-7 items-center justify-center rounded hover:bg-[#126a31] cursor-pointer"
              aria-label="Decrease"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="font-mono text-xs font-extrabold">
              {cartEntry.quantity} in Bag
            </span>
            <button
              type="button"
              onClick={() => updateQty(activeVariant.id, cartEntry.quantity + 1)}
              className="flex h-7 w-7 items-center justify-center rounded hover:bg-[#126a31] cursor-pointer"
              aria-label="Increase"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() =>
              addItem({
                productId: product.id,
                variantId: activeVariant.id,
                slug: product.slug,
                nameEn: product.nameEn,
                nameBn: product.nameBn,
                variantLabel: activeVariant.label,
                priceBdt: activeVariant.priceBdt,
                compareAtBdt: activeVariant.compareAtBdt,
                visualKey: product.visualKey,
                imageUrl: product.imageUrl,
                maxStock: activeVariant.stockQty,
                isMemberBogo: product.isMemberBogo,
              })
            }
            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#eef9f1] py-2 text-xs font-extrabold text-[#16803c] ring-1 ring-[#16803c]/25 hover:bg-[#16803c] hover:text-white transition cursor-pointer"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            <span>{lang === "bn" ? "ব্যাগে যোগ করুন" : "Add to Cart"}</span>
          </button>
        )}
      </div>
    </article>
  );
}
