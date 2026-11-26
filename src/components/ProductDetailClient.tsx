"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronRight,
  Clock,
  Heart,
  MapPin,
  Minus,
  Plus,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Sprout,
  Star,
  Truck,
} from "lucide-react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { ProduceArtwork } from "./ProduceArtwork";
import { ProductCard } from "./ProductCard";
import { useApp } from "./Providers";
import { formatTaka, FREE_DELIVERY_THRESHOLD } from "@/lib/utils";
import type { CatalogProduct } from "@/lib/catalog";
import { buildProductFaqs } from "@/lib/seo";

interface ProductVariantData {
  id: number;
  productId: number;
  label: string;
  priceBdt: number;
  compareAtBdt: number | null;
  stockQty: number;
  isDefault: boolean;
}

interface ProductReviewData {
  id: number;
  authorName: string;
  rating: number;
  comment: string;
  verifiedPurchase: boolean;
  createdAt: string | Date;
}

interface ProductDetailData {
  id: number;
  slug: string;
  nameEn: string;
  nameBn: string;
  subtitleEn: string;
  subtitleBn: string;
  descriptionEn: string;
  descriptionBn: string;
  visualKey: string;
  imageUrl?: string | null;
  badge: string;
  isMemberBogo: boolean;
  harvestTime: string;
  storageTipEn: string;
  storageTipBn: string;
  ratingAvg: number;
  reviewCount: number;
  category?: {
    slug: string;
    nameEn: string;
    nameBn: string;
  } | null;
  farmer?: {
    name: string;
    nameBn: string;
    district: string;
    upazila: string;
    specialty: string;
    yearsActive: number;
    storyEn: string;
    storyBn: string;
  } | null;
  variants: ProductVariantData[];
  reviews: ProductReviewData[];
}

function formatReviewDate(value: string | Date): string {
  try {
    const date = typeof value === "string" ? new Date(value) : value;
    if (Number.isNaN(date.getTime())) return "Recent";
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }).format(date);
  } catch {
    return "Recent";
  }
}

export function ProductDetailClient({
  product,
  relatedProducts,
}: {
  product: ProductDetailData;
  relatedProducts: CatalogProduct[];
}) {
  const router = useRouter();
  const {
    lang,
    deliveryArea,
    wishlistIds,
    toggleWishlist,
    items,
    addItem,
    showToast,
  } = useApp();

  const defaultVar =
    product.variants.find((v) => v.isDefault) ?? product.variants[0];
  const [selectedVarId, setSelectedVarId] = useState<number>(
    defaultVar?.id ?? 0
  );
  const [qty, setQty] = useState(1);

  const [reviewsList, setReviewsList] = useState<ProductReviewData[]>(
    product.reviews
  );
  const [ratingAvg, setRatingAvg] = useState<number>(product.ratingAvg);
  const [reviewCount, setReviewCount] = useState<number>(product.reviewCount);

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const activeVariant =
    product.variants.find((v) => v.id === selectedVarId) ?? defaultVar;

  const isWishlisted = wishlistIds.includes(product.id);
  const cartEntry = activeVariant
    ? items.find((item) => item.variantId === activeVariant.id)
    : undefined;

  const discountPct =
    activeVariant?.compareAtBdt &&
      activeVariant.compareAtBdt > activeVariant.priceBdt
      ? Math.round(
        ((activeVariant.compareAtBdt - activeVariant.priceBdt) /
          activeVariant.compareAtBdt) *
        100
      )
      : 0;

  const savingsPerUnit =
    activeVariant?.compareAtBdt &&
      activeVariant.compareAtBdt > activeVariant.priceBdt
      ? activeVariant.compareAtBdt - activeVariant.priceBdt
      : 0;

  const ratingBreakdown = useMemo(() => {
    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    for (const r of reviewsList) {
      const clamped = Math.min(5, Math.max(1, Math.round(r.rating)));
      counts[clamped] = (counts[clamped] ?? 0) + 1;
    }
    const total = reviewsList.length;
    return [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: counts[star] ?? 0,
      pct: total > 0 ? Math.round(((counts[star] ?? 0) / total) * 100) : 0,
    }));
  }, [reviewsList]);

  function buildCartPayload() {
    if (!activeVariant) return null;
    return {
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
    };
  }

  function handleAddToBag() {
    const payload = buildCartPayload();
    if (!payload || !activeVariant || activeVariant.stockQty <= 0) return;
    addItem(payload, qty);
  }

  function handleBuyNow() {
    const payload = buildCartPayload();
    if (!payload || !activeVariant || activeVariant.stockQty <= 0) return;
    addItem(payload, qty);
    router.push("/checkout");
  }

  async function handleShare() {
    try {
      const shareUrl = window.location.href;
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        showToast(
          lang === "bn"
            ? "পণ্যের লিংক কপি করা হয়েছে"
            : "Product link copied to clipboard",
          "info"
        );
      }
    } catch {
      showToast("Copy the address bar URL to share", "info");
    }
  }

  async function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (reviewName.trim().length < 2 || reviewComment.trim().length < 4) {
      showToast(
        lang === "bn"
          ? "নাম এবং কমপক্ষে ৪ অক্ষরের মতামত লিখুন"
          : "Enter your name and a brief review (4+ chars)",
        "error"
      );
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          authorName: reviewName.trim(),
          rating: reviewRating,
          comment: reviewComment.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Could not post review", "error");
        return;
      }
      setReviewsList((prev) => [data.review, ...prev]);
      setRatingAvg(data.ratingAvg);
      setReviewCount(data.reviewCount);
      setReviewName("");
      setReviewComment("");
      setReviewRating(5);
      setShowReviewForm(false);
      showToast(
        lang === "bn"
          ? "আপনার মতামত যুক্ত হয়েছে!"
          : "Thank you, your review is published!",
        "success"
      );
    } catch {
      showToast("Network error posting review", "error");
    } finally {
      setSubmittingReview(false);
    }
  }

  const categoryTitle =
    lang === "bn"
      ? product.category?.nameBn ?? "তাজা বাজার"
      : product.category?.nameEn ?? "Fresh Bazar";

  const productTitle = lang === "bn" ? product.nameBn : product.nameEn;
  const secondaryTitle = lang === "bn" ? product.nameEn : product.nameBn;
  const productSubtitle =
    lang === "bn" ? product.subtitleBn : product.subtitleEn;
  const productDescription =
    lang === "bn" ? product.descriptionBn : product.descriptionEn;
  const storageTip =
    lang === "bn" ? product.storageTipBn : product.storageTipEn;

  const isOutOfStock = !activeVariant || activeVariant.stockQty <= 0;

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa]">
      <Navbar />

      {/* Clean White Upper Product Sheet */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="mb-6 flex flex-wrap items-center gap-1.5 text-[13px] text-gray-500"
          >
            <Link href="/" className="hover:text-[#0f7b3f] transition">
              {lang === "bn" ? "হোম" : "Home"}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
            <Link
              href={
                product.category?.slug
                  ? `/bazar/${product.category.slug}`
                  : "/"
              }
              className="hover:text-[#0f7b3f] transition"
            >
              {categoryTitle}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
            <span className="truncate max-w-[220px] sm:max-w-sm font-medium text-gray-900">
              {productTitle}
            </span>
          </nav>

          {/* Main 2-Column Product Showcase */}
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-12 items-start">
            {/* Left Sticky Photo Column */}
            <div className="lg:col-span-5 lg:sticky lg:top-24">
              <div className="relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-[#f8f9fa]">
                <ProduceArtwork
                  visualKey={product.visualKey}
                  imageUrl={product.imageUrl}
                  alt={`${product.nameEn} (${product.nameBn}) - fresh ${product.category?.nameEn || "produce"} from ${product.farmer?.district || "Bangladesh"} at sobji.com`}
                  className="h-full w-full"
                  priority
                />

                {discountPct > 0 && (
                  <span className="absolute left-3.5 top-3.5 rounded-md bg-[#dc2626] px-2.5 py-1 text-xs font-semibold text-white tabular-nums shadow-xs">
                    {discountPct}% OFF
                  </span>
                )}
              </div>

              {/* Clean Subtle Key Attributes Under Photo */}
              <div className="mt-3 grid grid-cols-3 divide-x divide-gray-200 rounded-xl border border-gray-200 bg-[#fafafa] py-3 text-center">
                <div className="px-2">
                  <p className="text-[11px] text-gray-500">
                    {lang === "bn" ? "সংগ্রহের সময়" : "Harvested"}
                  </p>
                  <p className="mt-0.5 truncate text-xs font-semibold text-gray-900">
                    {product.harvestTime || "5:00 AM"}
                  </p>
                </div>
                <div className="px-2">
                  <p className="text-[11px] text-gray-500">
                    {lang === "bn" ? "উৎপত্তি" : "Origin"}
                  </p>
                  <p className="mt-0.5 truncate text-xs font-semibold text-gray-900">
                    {product.farmer?.district ?? "Bogura"}
                  </p>
                </div>
                <div className="px-2">
                  <p className="text-[11px] text-gray-500">
                    {lang === "bn" ? "মান পরীক্ষা" : "Safety"}
                  </p>
                  <p className="mt-0.5 truncate text-xs font-semibold text-[#0f7b3f]">
                    {lang === "bn" ? "ফরমালিন মুক্ত" : "Formalin Free"}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Clean E-commerce Buy Column (No Outer Floating Card) */}
            <div className="lg:col-span-7">
              {/* Top Meta: Category + Stock */}
              <div className="flex flex-wrap items-center gap-2.5 text-xs">
                <Link
                  href={
                    product.category?.slug
                      ? `/?category=${product.category.slug}`
                      : "/"
                  }
                  className="font-semibold text-[#0f7b3f] hover:underline"
                >
                  {categoryTitle}
                </Link>
                <span className="text-gray-300">•</span>
                <span className="text-gray-500">
                  {product.farmer?.district ?? "Bogura"}{" "}
                  {lang === "bn" ? "খামার" : "Farm"}
                </span>
                {product.isMemberBogo && (
                  <>
                    <span className="text-gray-300">•</span>
                    <span className="rounded bg-emerald-50 px-2 py-0.5 font-semibold text-[#0f7b3f]">
                      Member BOGO
                    </span>
                  </>
                )}
              </div>

              {/* Product Title & Secondary Name */}
              <h1 className="mt-2 text-2xl sm:text-[30px] font-semibold tracking-tight text-gray-900 leading-snug">
                {productTitle}
              </h1>
              <p className="mt-1 text-sm sm:text-[15px] text-gray-500">
                {secondaryTitle}
                {productSubtitle ? `, ${productSubtitle}` : ""}
              </p>

              {/* Inline Rating & Stock Status */}
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                <a
                  href="#reviews"
                  className="inline-flex items-center gap-1.5 hover:opacity-80 transition"
                >
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${star <= Math.round(ratingAvg)
                          ? "fill-amber-400 text-amber-400"
                          : "text-gray-200"
                          }`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold text-gray-900 tabular-nums">
                    {ratingAvg.toFixed(1)}
                  </span>
                  <span className="text-gray-500 tabular-nums">
                    ({reviewCount} {lang === "bn" ? "রিভিউ" : "reviews"})
                  </span>
                </a>

                <span className="text-gray-300">|</span>

                {isOutOfStock ? (
                  <span className="text-xs font-semibold text-rose-600">
                    {lang === "bn" ? "স্টক শেষ" : "Out of stock"}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0f7b3f] tabular-nums">
                    <span className="h-2 w-2 rounded-full bg-[#0f7b3f]" />
                    {activeVariant.stockQty <= 12
                      ? lang === "bn"
                        ? `মাত্র ${activeVariant.stockQty} প্যাক বাকি`
                        : `Only ${activeVariant.stockQty} packs left today`
                      : lang === "bn"
                        ? `স্টকে আছে (${activeVariant.stockQty} প্যাক)`
                        : `In stock (${activeVariant.stockQty} packs ready)`}
                  </span>
                )}
              </div>

              {/* Clean Price Row */}
              {activeVariant && (
                <div className="mt-5 border-t border-gray-100 pt-5">
                  <div className="flex flex-wrap items-baseline gap-3">
                    <span className="tabular-nums text-3xl font-bold tracking-tight text-gray-900">
                      {formatTaka(activeVariant.priceBdt)}
                    </span>
                    {activeVariant.compareAtBdt &&
                      activeVariant.compareAtBdt > activeVariant.priceBdt && (
                        <span className="tabular-nums text-lg text-gray-400 line-through">
                          {formatTaka(activeVariant.compareAtBdt)}
                        </span>
                      )}
                    {savingsPerUnit > 0 && (
                      <span className="rounded bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-[#0f7b3f] tabular-nums">
                        {lang === "bn" ? "সাশ্রয় " : "Save "}
                        {formatTaka(savingsPerUnit)} ({discountPct}%)
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {lang === "bn"
                      ? `প্যাক: ${activeVariant.label} · সরাসরি কৃষক পর্যায়ে নির্ধারিত মূল্য`
                      : `Pack size: ${activeVariant.label} · Inclusive of VAT & direct farm sourcing`}
                  </p>
                </div>
              )}

              {/* Pack Size Selector */}
              <div className="mt-5">
                <p className="mb-2.5 text-xs font-semibold text-gray-700">
                  {lang === "bn" ? "পরিমাণ / প্যাক বাছাই করুন" : "Choose Pack Size"}
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {product.variants.map((variant) => {
                    const isSelected = variant.id === activeVariant?.id;
                    const variantOut = variant.stockQty <= 0;
                    return (
                      <button
                        key={variant.id}
                        type="button"
                        disabled={variantOut}
                        onClick={() => {
                          setSelectedVarId(variant.id);
                          setQty(1);
                        }}
                        className={`min-w-[112px] rounded-lg border px-4 py-2.5 text-left transition cursor-pointer ${variantOut
                          ? "cursor-not-allowed border-gray-200 bg-gray-50 opacity-50"
                          : isSelected
                            ? "border-[#0f7b3f] bg-emerald-50/50 ring-1 ring-[#0f7b3f]"
                            : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                      >
                        <div className="text-sm font-semibold text-gray-900">
                          {variant.label}
                        </div>
                        <div className="mt-0.5 flex items-center gap-1.5 text-xs tabular-nums">
                          <span className="font-semibold text-[#0f7b3f]">
                            {formatTaka(variant.priceBdt)}
                          </span>
                          {variant.compareAtBdt &&
                            variant.compareAtBdt > variant.priceBdt && (
                              <span className="text-gray-400 line-through">
                                {formatTaka(variant.compareAtBdt)}
                              </span>
                            )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Controls: Qty + Add to Bag + Buy Now + Save + Share */}
              {activeVariant && (
                <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-2.5 sm:flex-1">
                    <div className="inline-flex h-11 shrink-0 items-center rounded-lg border border-gray-300 bg-white">
                      <button
                        type="button"
                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                        aria-label="Decrease quantity"
                        className="flex h-full w-10 items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-l-lg cursor-pointer"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-9 text-center tabular-nums text-sm font-semibold text-gray-900">
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setQty((q) =>
                            Math.min(Math.max(1, activeVariant.stockQty), q + 1)
                          )
                        }
                        aria-label="Increase quantity"
                        className="flex h-full w-10 items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-r-lg cursor-pointer"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <button
                      type="button"
                      disabled={isOutOfStock}
                      onClick={handleAddToBag}
                      className="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-[#0f7b3f] px-4 sm:px-5 text-sm font-semibold text-white transition hover:bg-[#0b5e30] disabled:cursor-not-allowed disabled:bg-gray-300 cursor-pointer"
                    >
                      <ShoppingBag className="h-4 w-4 shrink-0" />
                      <span className="tabular-nums truncate">
                        {isOutOfStock
                          ? lang === "bn"
                            ? "স্টক শেষ"
                            : "Out of Stock"
                          : `${lang === "bn" ? "ব্যাগে যোগ করুন" : "Add to Bag"} · ${formatTaka(
                            activeVariant.priceBdt * qty
                          )}`}
                      </span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isOutOfStock}
                      onClick={handleBuyNow}
                      className="flex h-11 flex-1 sm:flex-none items-center justify-center rounded-lg border border-gray-900 bg-gray-900 px-5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-300 cursor-pointer"
                    >
                      {lang === "bn" ? "এখনই কিনুন" : "Buy Now"}
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleWishlist(product.id, product.nameEn)}
                      aria-label="Toggle wishlist"
                      title={isWishlisted ? "Remove from saved" : "Save item"}
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border transition cursor-pointer ${isWishlisted
                        ? "border-rose-200 bg-rose-50 text-rose-600"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-rose-600"
                        }`}
                    >
                      <Heart
                        className={`h-4.5 w-4.5 ${isWishlisted ? "fill-rose-500 text-rose-500" : ""
                          }`}
                      />
                    </button>

                    <button
                      type="button"
                      onClick={handleShare}
                      aria-label="Share product"
                      title="Copy link"
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:border-gray-300 hover:text-[#0f7b3f] cursor-pointer"
                    >
                      <Share2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </div>
              )}

              {cartEntry && (
                <div className="mt-3 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50/70 px-3.5 py-2 text-xs text-[#0f7b3f]">
                  <span>
                    {lang === "bn"
                      ? `ব্যাগে ইতিমধ্যেই ${cartEntry.quantity} × ${cartEntry.variantLabel} আছে`
                      : `In your bag: ${cartEntry.quantity} × ${cartEntry.variantLabel}`}
                  </span>
                  <Link
                    href="/checkout"
                    className="font-semibold underline underline-offset-2 hover:text-[#09532a]"
                  >
                    {lang === "bn" ? "চেকআউট →" : "Checkout →"}
                  </Link>
                </div>
              )}

              {/* Description */}
              <p className="mt-6 text-sm leading-relaxed text-gray-600">
                {productDescription}
              </p>

              {/* Clean Hairline Delivery & Policy Rows */}
              <div className="mt-6 divide-y divide-gray-100 border-t border-b border-gray-100 text-[13px]">
                <div className="flex items-start gap-3 py-3.5">
                  <Truck className="mt-0.5 h-4 w-4 shrink-0 text-[#0f7b3f]" />
                  <div>
                    <span className="font-semibold text-gray-900">
                      {lang === "bn"
                        ? `${deliveryArea}-তে ডেলিভারি`
                        : `Delivery to ${deliveryArea}`}
                    </span>
                    <span className="text-gray-500">
                      {": "}
                      {lang === "bn"
                        ? `সকাল ৬টা স্লট অথবা ৬০ মিনিট এক্সপ্রেস। ${formatTaka(
                            FREE_DELIVERY_THRESHOLD,
                            lang
                          )}+ অর্ডারে ফ্রি ডেলিভারি।`
                        : `6:00 AM Dawn slot or 60-min Express. Free over ${formatTaka(
                            FREE_DELIVERY_THRESHOLD
                          )}.`}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 py-3.5">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#0f7b3f]" />
                  <div>
                    <span className="font-semibold text-gray-900">
                      {lang === "bn"
                        ? "ডেলিভারির সময় দেখে নেওয়ার সুযোগ"
                        : "Doorstep Freshness Guarantee"}
                    </span>
                    <span className="text-gray-500">
                      {": "}
                      {lang === "bn"
                        ? "মান ভালো না লাগলে সাথে সাথেই ফ্রি রিপ্লেসমেন্ট। বিকাশ, নগদ, কার্ড ও ক্যাশ অন ডেলিভারি।"
                        : "Inspect before accepting. Instant replacement guarantee. bKash, Nagad, Cards & COD."}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Lower Content */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 space-y-8">
        {/* Unified Product Specifications & Farmer Story Card */}
        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="grid divide-y divide-gray-200 lg:grid-cols-12 lg:divide-x lg:divide-y-0">
            {/* Left Spec Table */}
            <div className="p-6 sm:p-7 lg:col-span-7">
              <h2 className="text-base font-semibold text-gray-900">
                {lang === "bn"
                  ? "পণ্যের বিবরণ ও সংরক্ষণ"
                  : "Product Details & Storage"}
              </h2>

              <dl className="mt-4 divide-y divide-gray-100 text-sm">
                <div className="grid grid-cols-3 gap-4 py-3">
                  <dt className="text-gray-500">
                    {lang === "bn" ? "ক্যাটাগরি" : "Category"}
                  </dt>
                  <dd className="col-span-2 font-medium text-gray-900">
                    {categoryTitle}
                  </dd>
                </div>
                <div className="grid grid-cols-3 gap-4 py-3">
                  <dt className="text-gray-500">
                    {lang === "bn" ? "উৎপত্তি এলাকা" : "Farm Origin"}
                  </dt>
                  <dd className="col-span-2 font-medium text-gray-900">
                    {product.farmer
                      ? `${product.farmer.upazila}, ${product.farmer.district}`
                      : "Bogura, Bangladesh"}
                  </dd>
                </div>
                <div className="grid grid-cols-3 gap-4 py-3">
                  <dt className="text-gray-500">
                    {lang === "bn" ? "সংগ্রহ সময়" : "Harvest Time"}
                  </dt>
                  <dd className="col-span-2 font-medium text-gray-900">
                    {product.harvestTime || "5:00 AM Dawn Harvest"}
                  </dd>
                </div>
                <div className="grid grid-cols-3 gap-4 py-3">
                  <dt className="text-gray-500">
                    {lang === "bn" ? "সংরক্ষণ পদ্ধতি" : "Storage Tip"}
                  </dt>
                  <dd className="col-span-2 text-gray-700 leading-relaxed">
                    {storageTip ||
                      "Keep inside a breathable vegetable bag in the refrigerator crisper drawer (4°C to 6°C)."}
                  </dd>
                </div>
                <div className="grid grid-cols-3 gap-4 py-3">
                  <dt className="text-gray-500">
                    {lang === "bn" ? "প্যাকেজিং ও মান" : "Quality Check"}
                  </dt>
                  <dd className="col-span-2 text-gray-700">
                    {lang === "bn"
                      ? "ফুড-গ্রেড ব্রেদেবল প্যাক · ফরমালিন ও ক্ষতিকর রঙ মুক্ত"
                      : "Breathable food-grade kraft pouch · Hand-sorted & formalin-free"}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Right Farmer Origin Panel */}
            <div className="bg-[#fcfdfc] p-6 sm:p-7 lg:col-span-5">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-base font-semibold text-gray-900">
                  {lang === "bn" ? "কৃষক পরিচিতি" : "About the Grower"}
                </h2>
                <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-[#0f7b3f]">
                  <Sprout className="h-3.5 w-3.5" />
                  {lang === "bn" ? "সরাসরি সোর্সিং" : "Direct Farm"}
                </span>
              </div>

              {product.farmer && (
                <div className="mt-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-[#0f7b3f]">
                      {product.farmer.name.slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {lang === "bn"
                          ? product.farmer.nameBn
                          : product.farmer.name}
                      </p>
                      <p className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="h-3 w-3 text-[#0f7b3f]" />
                        {product.farmer.upazila}, {product.farmer.district} ·{" "}
                        <span className="tabular-nums">
                          {product.farmer.yearsActive}+ yrs
                        </span>
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-gray-600">
                    {lang === "bn"
                      ? product.farmer.storyBn
                      : product.farmer.storyEn}
                  </p>
                </div>
              )}

              <ul className="mt-5 space-y-2 border-t border-gray-200 pt-4 text-xs text-gray-600">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-[#0f7b3f]" />
                  <span>
                    {lang === "bn"
                      ? "কোনো মধ্যস্বত্বভোগী ছাড়াই ন্যায্য মূল্যে সংগ্রহ"
                      : "Fair farm-gate pricing with zero middlemen"}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-[#0f7b3f]" />
                  <span>
                    {lang === "bn"
                      ? "তোলার ২৪ ঘণ্টার মধ্যেই ঢাকার রান্নাঘরে"
                      : "Delivered within hours of morning harvest"}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Unified Ratings & Reviews Card */}
        <section
          id="reviews"
          className="scroll-mt-24 rounded-xl border border-gray-200 bg-white p-6 sm:p-7"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-5">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                {lang === "bn"
                  ? "ক্রেতাদের রেটিং ও রিভিউ"
                  : "Ratings & Customer Reviews"}
              </h2>
              <p className="mt-0.5 text-xs text-gray-500">
                {lang === "bn"
                  ? "ঢাকার ক্রেতাদের প্রকৃত অভিজ্ঞতা"
                  : "Verified feedback from kitchens across Dhaka"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowReviewForm((prev) => !prev)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-800 transition hover:bg-gray-50 cursor-pointer"
            >
              {showReviewForm
                ? lang === "bn"
                  ? "বন্ধ করুন"
                  : "Close Form"
                : lang === "bn"
                  ? "রিভিউ লিখুন"
                  : "Write a Review"}
            </button>
          </div>

          <div className="mt-6 grid gap-8 lg:grid-cols-12">
            {/* Rating Summary Bars */}
            <div className="lg:col-span-4 space-y-5">
              <div className="flex items-center gap-4">
                <div className="tabular-nums text-4xl font-bold text-gray-900">
                  {ratingAvg.toFixed(1)}
                </div>
                <div>
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${star <= Math.round(ratingAvg)
                          ? "fill-amber-400 text-amber-400"
                          : "text-gray-200"
                          }`}
                      />
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-gray-500 tabular-nums">
                    {reviewCount}{" "}
                    {lang === "bn" ? "টি রিভিউ" : "verified reviews"}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {ratingBreakdown.map((row) => (
                  <div key={row.star} className="flex items-center gap-2.5 text-xs">
                    <span className="w-6 shrink-0 font-medium text-gray-600 tabular-nums">
                      {row.star}★
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-amber-400"
                        style={{ width: `${row.pct}%` }}
                      />
                    </div>
                    <span className="w-7 shrink-0 text-right text-gray-500 tabular-nums">
                      {row.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Review Form & List */}
            <div className="lg:col-span-8">
              {showReviewForm && (
                <form
                  onSubmit={handleReviewSubmit}
                  className="mb-6 rounded-lg border border-gray-200 bg-[#fafafa] p-4 sm:p-5 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-700">
                      {lang === "bn" ? "আপনার রেটিং দিন" : "Your Rating"}
                    </span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          aria-label={`Rate ${star} stars`}
                          className="p-0.5 cursor-pointer"
                        >
                          <Star
                            className={`h-4.5 w-4.5 ${star <= reviewRating
                              ? "fill-amber-400 text-amber-400"
                              : "text-gray-300"
                              }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder={lang === "bn" ? "আপনার নাম" : "Your name"}
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#0f7b3f] focus:outline-none"
                  />

                  <textarea
                    rows={3}
                    placeholder={
                      lang === "bn"
                        ? "সবজির সতেজতা ও প্যাকিং কেমন ছিল?"
                        : "Share your feedback on freshness, taste, and packaging..."
                    }
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#0f7b3f] focus:outline-none"
                  />

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="h-10 rounded-lg bg-[#0f7b3f] px-5 text-xs font-semibold text-white transition hover:bg-[#0b5e30] disabled:opacity-60 cursor-pointer"
                  >
                    {submittingReview
                      ? lang === "bn"
                        ? "জমা হচ্ছে..."
                        : "Submitting..."
                      : lang === "bn"
                        ? "রিভিউ জমা দিন"
                        : "Submit Review"}
                  </button>
                </form>
              )}

              {reviewsList.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-200 py-10 text-center">
                  <p className="text-sm font-medium text-gray-900">
                    {lang === "bn"
                      ? "এখনো কোনো রিভিউ নেই"
                      : "No reviews yet for this item"}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {lang === "bn"
                      ? "প্রথম ক্রেতা হিসেবে আপনার অভিজ্ঞতা লিখুন।"
                      : "Click Write a Review above to share your kitchen experience."}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {reviewsList.map((rev) => (
                    <article key={rev.id} className="py-4 first:pt-0 last:pb-0">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900">
                            {rev.authorName}
                          </span>
                          {rev.verifiedPurchase && (
                            <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5 text-[11px] font-medium text-[#0f7b3f]">
                              <BadgeCheck className="h-3 w-3" />
                              {lang === "bn" ? "ভেরিফায়েড" : "Verified"}
                            </span>
                          )}
                          <span className="text-xs text-gray-400">
                            · {formatReviewDate(rev.createdAt)}
                          </span>
                        </div>

                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3.5 w-3.5 ${star <= rev.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-gray-200"
                                }`}
                            />
                          ))}
                        </div>
                      </div>

                      <p className="mt-2 text-sm leading-relaxed text-gray-700">
                        {rev.comment}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Product AEO Frequently Asked Questions */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 sm:p-7 space-y-4">
          <h2 className="text-base font-semibold text-gray-900 sm:text-lg">
            {lang === "bn"
              ? `${productTitle} সম্পর্কে সাধারণ প্রশ্ন ও উত্তর`
              : `Frequently Asked Questions: ${productTitle}`}
          </h2>
          <div className="grid gap-3 md:grid-cols-3">
            {buildProductFaqs(product).map((faq) => (
              <div
                key={faq.questionEn}
                className="rounded-xl border border-gray-100 bg-[#f9faf9] p-4"
              >
                <h3 className="text-xs font-bold text-gray-900 sm:text-sm">
                  {lang === "bn" ? faq.questionBn : faq.questionEn}
                </h3>
                <p
                  data-speakable="true"
                  className="mt-1.5 text-xs leading-relaxed text-gray-600"
                >
                  {lang === "bn" ? faq.answerBn : faq.answerEn}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="pt-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {lang === "bn" ? "আরও তাজা বাজার" : "Related Fresh Products"}
              </h2>
              <Link
                href="/"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#0f7b3f] hover:underline"
              >
                <span>{lang === "bn" ? "সব পণ্য" : "All Products"}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
