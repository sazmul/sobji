"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Heart, Plus, Minus, Eye, X, MapPin, Clock, ShieldCheck } from "lucide-react";
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
  const [quickViewOpen, setQuickViewOpen] = useState(false);

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
    <>
      <article className="group flex flex-col justify-between rounded-2xl border border-gray-200/80 bg-white overflow-hidden transition-all duration-200 hover:border-[#0f7b3f]/40 hover:shadow-[0_10px_28px_rgba(0,0,0,0.06)]">
        <div>
          <div className="relative aspect-[4/3] overflow-hidden bg-[#f5f6f4]">
            <Link href={`/products/${product.slug}`} className="block h-full w-full">
              <ProduceArtwork
                visualKey={product.visualKey}
                imageUrl={product.imageUrl}
                alt={`${product.nameEn} (${product.nameBn}) - fresh ${product.categoryNameEn} from ${product.farmerDistrict} at sobji.com`}
              />
            </Link>

            {discountPct > 0 && (
              <span className="absolute left-3 top-3 rounded-md bg-[#dc2626] px-2 py-0.5 tabular-nums text-[11px] font-bold text-white">
                {discountPct}% OFF
              </span>
            )}

            <div className="absolute right-2.5 top-2.5 flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => toggleWishlist(product.id, product.nameEn)}
                aria-label="Save to wishlist"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-500 hover:text-red-600 shadow-xs transition cursor-pointer"
              >
                <Heart
                  className={`h-4 w-4 ${
                    isWishlisted ? "fill-red-600 text-red-600" : ""
                  }`}
                />
              </button>
              <button
                type="button"
                onClick={() => setQuickViewOpen(true)}
                aria-label="Quick view"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-600 hover:text-[#0f7b3f] shadow-xs opacity-95 sm:opacity-0 sm:group-hover:opacity-100 transition cursor-pointer"
              >
                <Eye className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="p-3 pb-1.5 sm:p-4 sm:pb-2">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="truncate font-medium">{product.farmerDistrict}</span>
              {product.isMemberBogo && (
                <span className="font-semibold text-[#0f7b3f]">Member BOGO</span>
              )}
            </div>

            <Link href={`/products/${product.slug}`} className="mt-1 block">
              <h3 className="line-clamp-1 text-[15px] font-semibold leading-normal text-gray-900 group-hover:text-[#0f7b3f] transition">
                {lang === "bn" ? product.nameBn : product.nameEn}
              </h3>
              <p className="mt-0.5 line-clamp-1 text-[13.5px] leading-normal text-gray-500">
                {lang === "bn" ? product.nameEn : product.nameBn}
              </p>
            </Link>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {product.variants.map((variant) => {
                const active = variant.id === activeVariant.id;
                return (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => setSelectedVarId(variant.id)}
                    className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition cursor-pointer ${
                      active
                        ? "border-[#0f7b3f] bg-emerald-50 text-[#0f7b3f] font-semibold"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {variant.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-1.5 sm:gap-2 p-3 pt-2 sm:p-4 sm:pt-3">
          <div className="flex items-baseline gap-1 min-w-0">
            <span className="tabular-nums text-[15px] sm:text-[17px] font-bold text-gray-900">
              {formatTaka(activeVariant.priceBdt, lang)}
            </span>
            {activeVariant.compareAtBdt && (
              <span className="tabular-nums text-[11px] sm:text-xs text-gray-400 line-through">
                {formatTaka(activeVariant.compareAtBdt, lang)}
              </span>
            )}
          </div>

          {activeVariant.stockQty <= 0 ? (
            <span className="rounded-lg bg-gray-100 px-2.5 py-1.5 text-[11px] sm:text-xs font-medium text-gray-500">
              {lang === "bn" ? "স্টক শেষ" : "Sold Out"}
            </span>
          ) : cartEntry ? (
            <div className="flex items-center rounded-xl bg-[#0f7b3f] px-1 py-0.5 sm:px-1.5 sm:py-1 text-white shrink-0">
              <button
                type="button"
                onClick={() => updateQty(activeVariant.id, cartEntry.quantity - 1)}
                className="p-1 hover:bg-[#0b5e30] rounded-lg cursor-pointer"
                aria-label="Decrease"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="min-w-5 sm:min-w-6 text-center tabular-nums text-xs font-bold">
                {cartEntry.quantity}
              </span>
              <button
                type="button"
                onClick={() => updateQty(activeVariant.id, cartEntry.quantity + 1)}
                className="p-1 hover:bg-[#0b5e30] rounded-lg cursor-pointer"
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
              className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-[#0f7b3f] px-2.5 py-1.5 sm:px-3.5 sm:py-2 text-xs font-semibold text-white hover:bg-[#0b5e30] transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{lang === "bn" ? "যোগ" : "Add"}</span>
            </button>
          )}
        </div>
      </article>

      {/* Instant Quick-View Modal */}
      {quickViewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[1px]">
          <div className="relative grid max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl md:grid-cols-2">
            <button
              type="button"
              onClick={() => setQuickViewOpen(false)}
              className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-1.5 text-gray-500 hover:text-gray-900 shadow cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="aspect-[4/3] md:aspect-square bg-gray-100">
              <ProduceArtwork
                visualKey={product.visualKey}
                imageUrl={product.imageUrl}
                alt={`${product.nameEn} (${product.nameBn}) - fresh ${product.categoryNameEn} from ${product.farmerDistrict} at sobji.com`}
              />
            </div>
            <div className="flex flex-col justify-between p-6 space-y-4">
              <div>
                <p className="text-xs font-semibold text-[#0f7b3f]">
                  {product.categoryNameEn} · {product.badge}
                </p>
                <h2 className="mt-1 text-xl font-bold text-gray-900">
                  {lang === "bn" ? product.nameBn : product.nameEn}
                </h2>
                <p className="mt-1.5 text-xs leading-relaxed text-gray-600">
                  {lang === "bn" ? product.descriptionBn : product.descriptionEn}
                </p>

                <div className="mt-3 space-y-1 text-xs text-gray-500">
                  <p className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-[#0f7b3f]" />
                    Farmer: {product.farmerName} ({product.farmerDistrict})
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-[#0f7b3f]" />
                    {product.harvestTime}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#0f7b3f]" />
                    24h freshness replacement guarantee
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVarId(v.id)}
                      className={`rounded-lg border px-3 py-1 text-xs font-semibold cursor-pointer ${
                        v.id === activeVariant.id
                          ? "border-[#0f7b3f] bg-emerald-50 text-[#0f7b3f]"
                          : "border-gray-200 text-gray-600"
                      }`}
                    >
                      {v.label} · {formatTaka(v.priceBdt)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
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
                    });
                    setQuickViewOpen(false);
                  }}
                  className="flex-1 rounded-xl bg-[#0f7b3f] py-2.5 text-xs font-bold text-white hover:bg-[#0b5e30] cursor-pointer"
                >
                  Add to Bag · {formatTaka(activeVariant.priceBdt)}
                </button>
                <Link
                  href={`/products/${product.slug}`}
                  className="rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs font-semibold text-gray-700 hover:border-[#0f7b3f]"
                >
                  Full Details
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
