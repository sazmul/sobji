"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Heart, Plus, Minus } from "lucide-react";
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
    <article className="group flex flex-col justify-between rounded-lg border border-[#e5e7eb] bg-white overflow-hidden transition hover:border-[#b9c4bc]">
      <div>
        <div className="relative aspect-[4/3] overflow-hidden border-b border-[#f1f3f1] bg-[#fafafa]">
          <Link href={`/products/${product.slug}`} className="block h-full w-full">
            <ProduceArtwork
              visualKey={product.visualKey}
              imageUrl={product.imageUrl}
              alt={product.nameEn}
            />
          </Link>

          {discountPct > 0 && (
            <span className="absolute left-2 top-2 rounded bg-[#dc2626] px-1.5 py-0.5 font-mono text-[10px] font-bold text-white">
              {discountPct}% OFF
            </span>
          )}

          <button
            type="button"
            onClick={() => toggleWishlist(product.id, product.nameEn)}
            aria-label="Save to wishlist"
            className="absolute right-2 top-2 p-1 text-neutral-400 hover:text-[#dc2626] transition cursor-pointer"
          >
            <Heart
              className={`h-4 w-4 ${
                isWishlisted ? "fill-[#dc2626] text-[#dc2626]" : "fill-white/70"
              }`}
            />
          </button>
        </div>

        <div className="p-3.5 pb-2">
          <div className="flex items-center justify-between text-[11px] text-[#666666]">
            <span className="truncate">{product.farmerDistrict}</span>
            {product.isMemberBogo && (
              <span className="font-bold text-[#1b8e3d]">Member BOGO</span>
            )}
          </div>

          <Link href={`/products/${product.slug}`} className="mt-1 block">
            <h3 className="line-clamp-1 text-sm font-semibold text-[#1a1a1a] group-hover:text-[#1b8e3d]">
              {lang === "bn" ? product.nameBn : product.nameEn}
            </h3>
            <p className="line-clamp-1 text-xs text-[#666666]">
              {lang === "bn" ? product.nameEn : product.nameBn}
            </p>
          </Link>

          {/* Weight Options */}
          <div className="mt-2.5 flex flex-wrap gap-1">
            {product.variants.map((variant) => {
              const active = variant.id === activeVariant.id;
              return (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => setSelectedVarId(variant.id)}
                  className={`rounded border px-2 py-0.5 text-[11px] font-medium cursor-pointer ${
                    active
                      ? "border-[#1b8e3d] bg-[#f2f9f4] text-[#1b8e3d] font-semibold"
                      : "border-[#e5e7eb] bg-white text-[#555555] hover:border-[#999999]"
                  }`}
                >
                  {variant.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="p-3.5 pt-2 space-y-2">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-base font-bold text-[#1a1a1a]">
            {formatTaka(activeVariant.priceBdt, lang)}
          </span>
          {activeVariant.compareAtBdt && (
            <span className="font-mono text-xs text-[#888888] line-through">
              {formatTaka(activeVariant.compareAtBdt, lang)}
            </span>
          )}
        </div>

        {activeVariant.stockQty <= 0 ? (
          <div className="w-full rounded border border-[#e5e7eb] bg-[#f7f8f7] py-1.5 text-center text-xs font-semibold text-[#888888]">
            Out of Stock
          </div>
        ) : cartEntry ? (
          <div className="flex w-full items-center justify-between rounded bg-[#1b8e3d] px-2 py-1 text-white">
            <button
              type="button"
              onClick={() => updateQty(activeVariant.id, cartEntry.quantity - 1)}
              className="p-1 hover:bg-[#147230] rounded cursor-pointer"
              aria-label="Decrease"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="font-mono text-xs font-bold">
              {cartEntry.quantity} in Bag
            </span>
            <button
              type="button"
              onClick={() => updateQty(activeVariant.id, cartEntry.quantity + 1)}
              className="p-1 hover:bg-[#147230] rounded cursor-pointer"
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
            className="w-full rounded bg-[#1b8e3d] py-1.5 text-xs font-bold text-white hover:bg-[#147230] transition cursor-pointer"
          >
            {lang === "bn" ? "কার্টে যোগ করুন" : "Add to Bag"}
          </button>
        )}
      </div>
    </article>
  );
}
