"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, Minus, Star, MapPin, Sprout, ShoppingBag } from "lucide-react";
import { ProduceArtwork } from "./ProduceArtwork";
import { useApp } from "./Providers";
import { formatTaka } from "@/lib/utils";
import type { CatalogProduct } from "@/lib/catalog";

interface ProductCardProps {
  product: CatalogProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const { lang, items, addItem, updateQty } = useApp();
  const defaultVariant =
    product.variants.find((v) => v.isDefault) ?? product.variants[0];
  const [selectedVarId, setSelectedVarId] = useState<number>(
    defaultVariant?.id ?? 0
  );

  const activeVariant =
    product.variants.find((v) => v.id === selectedVarId) ?? defaultVariant;

  if (!activeVariant) return null;

  const cartEntry = items.find((i) => i.variantId === activeVariant.id);
  const discountPct =
    activeVariant.compareAtBdt && activeVariant.compareAtBdt > activeVariant.priceBdt
      ? Math.round(
          ((activeVariant.compareAtBdt - activeVariant.priceBdt) /
            activeVariant.compareAtBdt) *
            100
        )
      : 0;

  return (
    <article className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-[#e4e0d5] bg-white transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-[0_18px_40px_-15px_rgba(20,83,45,0.16)]">
      {/* Visual & Badges */}
      <div>
        <Link
          href={`/products/${product.slug}`}
          className="relative block aspect-[4/3] overflow-hidden"
        >
          <ProduceArtwork visualKey={product.visualKey} />

          {/* Top Left Badges */}
          <div className="absolute left-3 top-3 z-20 flex flex-wrap gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-[#14532d] shadow-xs ring-1 ring-black/5 backdrop-blur-sm">
              <Sprout className="h-3 w-3 text-[#16a34a]" />
              {product.badge}
            </span>
            {product.isMemberBogo && (
              <span className="rounded-full bg-amber-500 px-2.5 py-1 text-[10px] font-extrabold text-white shadow-xs">
                Club BOGO
              </span>
            )}
          </div>

          {/* Discount Badge */}
          {discountPct > 0 && (
            <span className="absolute right-3 top-3 z-20 rounded-full bg-[#ea580c] px-2.5 py-1 font-mono text-[11px] font-bold text-white shadow-xs">
              -{discountPct}%
            </span>
          )}

          {/* Origin Pill */}
          <div className="absolute bottom-2.5 left-3 z-20 inline-flex items-center gap-1 rounded-full bg-[#111c16]/75 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
            <MapPin className="h-2.5 w-2.5 text-emerald-300" />
            <span>{product.farmerDistrict}</span>
          </div>
        </Link>

        {/* Body */}
        <div className="p-4 pb-2">
          <div className="flex items-center justify-between gap-2 text-[11px] text-[#526559]">
            <span className="truncate font-medium">
              {lang === "bn" ? product.categoryNameBn : product.categoryNameEn}
            </span>
            <span className="inline-flex items-center gap-1 font-semibold text-[#111c16] shrink-0">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {product.ratingAvg.toFixed(1)}
            </span>
          </div>

          <Link href={`/products/${product.slug}`} className="mt-1 block">
            <h3 className="line-clamp-1 text-base font-bold text-[#111c16] group-hover:text-[#14532d] transition">
              {lang === "bn" ? product.nameBn : product.nameEn}
            </h3>
            <p className="mt-0.5 line-clamp-1 text-xs text-[#526559]">
              {lang === "bn" ? product.subtitleBn : product.subtitleEn}
            </p>
          </Link>

          {/* Weight / Unit Quick Selector */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {product.variants.map((variant) => {
              const active = variant.id === activeVariant.id;
              return (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => setSelectedVarId(variant.id)}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition cursor-pointer ${
                    active
                      ? "bg-[#14532d] text-white shadow-2xs"
                      : "bg-[#f3efe6] text-[#4b5e52] hover:bg-emerald-50 hover:text-[#14532d]"
                  }`}
                >
                  {variant.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Price & Add to Bag */}
      <div className="flex items-center justify-between gap-2 px-4 pb-4 pt-2">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-lg font-extrabold text-[#14532d]">
              {formatTaka(activeVariant.priceBdt, lang)}
            </span>
            {activeVariant.compareAtBdt && (
              <span className="font-mono text-xs text-stone-400 line-through">
                {formatTaka(activeVariant.compareAtBdt, lang)}
              </span>
            )}
          </div>
          <p className="text-[10px] text-[#526559]">
            {activeVariant.stockQty > 0
              ? lang === "bn"
                ? `স্টক: ${activeVariant.stockQty} টি`
                : `${activeVariant.stockQty} in dawn batch`
              : lang === "bn"
                ? "স্টক শেষ"
                : "Sold out"}
          </p>
        </div>

        {activeVariant.stockQty <= 0 ? (
          <span className="rounded-full bg-stone-100 px-3 py-2 text-xs font-semibold text-stone-500">
            {lang === "bn" ? "স্টক শেষ" : "Sold Out"}
          </span>
        ) : cartEntry ? (
          <div className="flex items-center gap-1.5 rounded-full bg-[#14532d] px-2 py-1 text-white shadow-sm">
            <button
              type="button"
              onClick={() => updateQty(activeVariant.id, cartEntry.quantity - 1)}
              className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-emerald-700 cursor-pointer"
              aria-label="Decrease quantity"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="min-w-5 text-center font-mono text-xs font-bold">
              {cartEntry.quantity}
            </span>
            <button
              type="button"
              onClick={() => updateQty(activeVariant.id, cartEntry.quantity + 1)}
              className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-emerald-700 cursor-pointer"
              aria-label="Increase quantity"
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
            className="inline-flex items-center gap-1.5 rounded-full bg-[#ecfdf5] px-3.5 py-2 text-xs font-bold text-[#14532d] ring-1 ring-emerald-600/20 hover:bg-[#14532d] hover:text-white transition cursor-pointer"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>{lang === "bn" ? "যোগ করুন" : "Add"}</span>
          </button>
        )}
      </div>
    </article>
  );
}
