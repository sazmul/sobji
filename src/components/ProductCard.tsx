"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, Minus } from "lucide-react";
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
    <article className="group flex flex-col justify-between rounded-xl border border-[#e7e2d8] bg-white overflow-hidden transition-colors hover:border-[#c6bfb0]">
      <div>
        <Link
          href={`/products/${product.slug}`}
          className="relative block aspect-[4/3] overflow-hidden bg-[#f5f3ee]"
        >
          <ProduceArtwork
            visualKey={product.visualKey}
            imageUrl={product.imageUrl}
            alt={product.nameEn}
          />
          {discountPct > 0 && (
            <span className="absolute left-3 top-3 rounded bg-[#a14a18] px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wider text-white">
              -{discountPct}%
            </span>
          )}
        </Link>

        <div className="p-4 pb-3">
          <div className="flex items-center justify-between gap-2 text-[10px] font-semibold uppercase tracking-[0.09em] text-[#5b695f]">
            <span className="truncate">
              {product.farmerDistrict} · {product.badge}
            </span>
            <span className="font-mono text-[#112218]">★ {product.ratingAvg.toFixed(1)}</span>
          </div>

          <Link href={`/products/${product.slug}`} className="mt-1.5 block">
            <h3 className="line-clamp-1 text-[15px] font-semibold text-[#112218] group-hover:underline underline-offset-4">
              {lang === "bn" ? product.nameBn : product.nameEn}
            </h3>
            <p className="mt-0.5 line-clamp-1 text-xs text-[#5b695f]">
              {lang === "bn" ? product.nameEn : product.nameBn}
            </p>
          </Link>

          {/* Clean Inline Weight Selector */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {product.variants.map((variant) => {
              const active = variant.id === activeVariant.id;
              return (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => setSelectedVarId(variant.id)}
                  className={`rounded-md border px-2 py-0.5 text-[11px] font-medium transition cursor-pointer ${
                    active
                      ? "border-[#143624] bg-[#143624] text-white"
                      : "border-[#e7e2d8] bg-[#fbf9f5] text-[#4c5b51] hover:border-[#143624]"
                  }`}
                >
                  {variant.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Price & Minimal Stepper */}
      <div className="flex items-center justify-between gap-2 border-t border-[#f1ede5] px-4 py-3">
        <div className="flex items-baseline gap-1.5">
          <span className="font-mono text-base font-bold text-[#112218]">
            {formatTaka(activeVariant.priceBdt, lang)}
          </span>
          {activeVariant.compareAtBdt && (
            <span className="font-mono text-[11px] text-[#8d968f] line-through">
              {formatTaka(activeVariant.compareAtBdt, lang)}
            </span>
          )}
        </div>

        {activeVariant.stockQty <= 0 ? (
          <span className="text-[11px] font-medium text-[#8d968f]">
            {lang === "bn" ? "স্টক শেষ" : "Sold Out"}
          </span>
        ) : cartEntry ? (
          <div className="flex items-center rounded-md border border-[#143624] bg-[#143624] text-white">
            <button
              type="button"
              onClick={() => updateQty(activeVariant.id, cartEntry.quantity - 1)}
              className="px-2 py-1.5 hover:bg-[#1d4a32] cursor-pointer"
              aria-label="Decrease"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="min-w-5 text-center font-mono text-xs font-semibold">
              {cartEntry.quantity}
            </span>
            <button
              type="button"
              onClick={() => updateQty(activeVariant.id, cartEntry.quantity + 1)}
              className="px-2 py-1.5 hover:bg-[#1d4a32] cursor-pointer"
              aria-label="Increase"
            >
              <Plus className="h-3 w-3" />
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
            className="inline-flex items-center gap-1 rounded-md border border-[#143624] px-3 py-1.5 text-xs font-semibold text-[#143624] hover:bg-[#143624] hover:text-white transition cursor-pointer"
          >
            <Plus className="h-3 w-3" />
            <span>{lang === "bn" ? "যোগ" : "Add"}</span>
          </button>
        )}
      </div>
    </article>
  );
}
