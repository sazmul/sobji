"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  ShoppingBag,
  Sprout,
  Star,
  ThermometerSnowflake,
  Plus,
  Minus,
} from "lucide-react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { ProduceArtwork } from "./ProduceArtwork";
import { ProductCard } from "./ProductCard";
import { useApp } from "./Providers";
import { formatTaka } from "@/lib/utils";
import type { CatalogProduct } from "@/lib/catalog";

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
  imageUrl: string | null;
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
  };
  farmer?: {
    name: string;
    nameBn: string;
    district: string;
    upazila: string;
    specialty: string;
    yearsActive: number;
    storyEn: string;
    storyBn: string;
  };
  variants: Array<{
    id: number;
    productId: number;
    label: string;
    priceBdt: number;
    compareAtBdt: number | null;
    stockQty: number;
    isDefault: boolean;
  }>;
  reviews: Array<{
    id: number;
    authorName: string;
    rating: number;
    comment: string;
    verifiedPurchase: boolean;
    createdAt: string | Date;
  }>;
}

export function ProductDetailClient({
  product,
  relatedProducts,
}: {
  product: ProductDetailData;
  relatedProducts: CatalogProduct[];
}) {
  const { lang, addItem, showToast } = useApp();
  const defaultVar =
    product.variants.find((v) => v.isDefault) ?? product.variants[0];
  const [selectedVarId, setSelectedVarId] = useState(defaultVar?.id ?? 0);
  const [qty, setQty] = useState(1);

  const [reviewsList, setReviewsList] = useState(product.reviews);
  const [ratingAvg, setRatingAvg] = useState(product.ratingAvg);
  const [reviewCount, setReviewCount] = useState(product.reviewCount);
  const [authorName, setAuthorName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const activeVariant =
    product.variants.find((v) => v.id === selectedVarId) ?? defaultVar;

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !comment.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          authorName,
          rating,
          comment,
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
      setAuthorName("");
      setComment("");
      showToast(
        lang === "bn"
          ? "আপনার রিভিউ যুক্ত হয়েছে!"
          : "Thank you! Review published."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#14532d] hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>{lang === "bn" ? "সব বাজারে ফিরে যান" : "Back to Fresh Bazar"}</span>
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-12">
          {/* Left Visual */}
          <div className="lg:col-span-5">
            <div className="relative aspect-square overflow-hidden rounded-2xl border border-[#e7e2d8] bg-[#f5f3ee]">
              <ProduceArtwork
                visualKey={product.visualKey}
                imageUrl={product.imageUrl}
                alt={product.nameEn}
              />
              <div className="absolute left-4 top-4 flex gap-2">
                <span className="inline-flex items-center gap-1 rounded bg-white/95 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#143624] border border-[#e7e2d8]">
                  <Sprout className="h-3 w-3 text-[#143624]" />
                  {product.badge}
                </span>
              </div>
            </div>
          </div>

          {/* Right Info */}
          <div className="space-y-6 lg:col-span-7">
            <div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-[#526559]">
                <span className="rounded-full bg-[#f3efe6] px-3 py-1 font-bold text-[#14532d]">
                  {lang === "bn"
                    ? product.category?.nameBn
                    : product.category?.nameEn}
                </span>
                <span className="inline-flex items-center gap-1 font-bold text-[#111c16]">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  {ratingAvg.toFixed(1)} ({reviewCount}{" "}
                  {lang === "bn" ? "রিভিউ" : "reviews"})
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-[#16a34a]" />
                  {product.harvestTime}
                </span>
              </div>

              <h1 className="mt-3 font-display text-3xl font-medium text-[#112218] sm:text-4xl">
                {lang === "bn" ? product.nameBn : product.nameEn}
              </h1>
              <p className="mt-1 text-base font-medium text-[#526559]">
                {lang === "bn" ? product.nameEn : product.nameBn} •{" "}
                {lang === "bn" ? product.subtitleBn : product.subtitleEn}
              </p>
            </div>

            <p className="text-sm leading-relaxed text-[#4b5e52] sm:text-base">
              {lang === "bn" ? product.descriptionBn : product.descriptionEn}
            </p>

            {/* Variant Selector */}
            <div className="space-y-2.5">
              <p className="text-xs font-bold uppercase tracking-wider text-[#526559]">
                {lang === "bn" ? "পরিমাণ বেছে নিন" : "Select Pack Size / Weight"}
              </p>
              <div className="flex flex-wrap gap-2.5">
                {product.variants.map((v) => {
                  const active = v.id === activeVariant?.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVarId(v.id)}
                      className={`rounded-2xl border px-4 py-2.5 text-left transition cursor-pointer ${
                        active
                          ? "border-[#14532d] bg-[#ecfdf5] ring-2 ring-[#14532d]/20"
                          : "border-[#e4e0d5] bg-white hover:border-emerald-300"
                      }`}
                    >
                      <p className="text-xs font-bold text-[#111c16]">{v.label}</p>
                      <p className="font-mono text-sm font-extrabold text-[#14532d]">
                        {formatTaka(v.priceBdt, lang)}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price + Add to Cart */}
            {activeVariant && (
              <div className="flex flex-wrap items-center gap-4 rounded-3xl border border-[#e4e0d5] bg-white p-5">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-3xl font-extrabold text-[#14532d]">
                      {formatTaka(activeVariant.priceBdt * qty, lang)}
                    </span>
                    {activeVariant.compareAtBdt && (
                      <span className="font-mono text-sm text-stone-400 line-through">
                        {formatTaka(activeVariant.compareAtBdt * qty, lang)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#526559]">
                    {activeVariant.stockQty} available in today&apos;s batch
                  </p>
                </div>

                <div className="ml-auto flex items-center gap-3">
                  <div className="flex items-center gap-2 rounded-full border border-[#e4e0d5] bg-[#faf8f3] px-2 py-1.5">
                    <button
                      type="button"
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white cursor-pointer"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="min-w-6 text-center font-mono text-sm font-bold">
                      {qty}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setQty((q) => Math.min(activeVariant.stockQty, q + 1))
                      }
                      className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    disabled={activeVariant.stockQty <= 0}
                    onClick={() =>
                      addItem(
                        {
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
                        },
                        qty
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-full bg-[#14532d] px-6 py-3.5 text-sm font-bold text-white shadow-md hover:bg-[#166534] disabled:opacity-50 transition cursor-pointer"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    <span>{lang === "bn" ? "ব্যাগে যোগ করুন" : "Add to Bazar Bag"}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Farm Traceability & Storage Cards */}
            <div className="grid gap-4 sm:grid-cols-2">
              {product.farmer && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[#14532d]">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#16a34a]" />
                      {lang === "bn" ? "কৃষকের তথ্য" : "Farm Traceability"}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#166534]">
                      <MapPin className="h-3 w-3" />
                      {product.farmer.upazila}, {product.farmer.district}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-[#111c16]">
                    {lang === "bn" ? product.farmer.nameBn : product.farmer.name}
                  </p>
                  <p className="text-xs leading-relaxed text-[#4b5e52]">
                    {lang === "bn" ? product.farmer.storyBn : product.farmer.storyEn}
                  </p>
                </div>
              )}

              <div className="rounded-2xl border border-[#e4e0d5] bg-white p-4 space-y-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#111c16]">
                  <ThermometerSnowflake className="h-4 w-4 text-sky-600" />
                  {lang === "bn" ? "সংরক্ষণ পরামর্শ" : "Storage & Freshness"}
                </span>
                <p className="text-xs leading-relaxed text-[#526559]">
                  {lang === "bn" ? product.storageTipBn : product.storageTipEn}
                </p>
                <p className="flex items-center gap-1.5 text-[11px] font-semibold text-[#16a34a]">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  24-hour free replacement if bruised or not crisp
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <section className="mt-14 grid gap-8 lg:grid-cols-12 border-t border-[#e4e0d5] pt-10">
          <div className="lg:col-span-5">
            <h2 className="text-xl font-extrabold text-[#111c16]">
              {lang === "bn" ? "ক্রেতাদের অভিজ্ঞতা লিখুন" : "Share Your Harvest Review"}
            </h2>
            <p className="mt-1 text-xs text-[#526559]">
              Help Dhaka families shop with confidence.
            </p>
            <form
              onSubmit={handleSubmitReview}
              className="mt-4 space-y-3 rounded-3xl border border-[#e4e0d5] bg-white p-5"
            >
              <div>
                <label className="block text-xs font-bold text-[#111c16]">
                  Your Name & Area
                </label>
                <input
                  type="text"
                  required
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="e.g. Tasnim (Banani)"
                  className="mt-1 w-full rounded-xl border border-[#dcd7c9] px-3 py-2 text-sm focus:border-[#166534] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#111c16]">
                  Freshness Rating
                </label>
                <div className="mt-1 flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setRating(num)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-bold cursor-pointer ${
                        rating >= num
                          ? "bg-amber-400 text-[#111c16]"
                          : "bg-[#f3efe6] text-[#526559]"
                      }`}
                    >
                      {num} ★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#111c16]">
                  Review
                </label>
                <textarea
                  required
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="How fresh was the produce and delivery slot?"
                  className="mt-1 w-full rounded-xl border border-[#dcd7c9] px-3 py-2 text-sm focus:border-[#166534] focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full bg-[#14532d] py-2.5 text-sm font-bold text-white hover:bg-[#166534] disabled:opacity-50 cursor-pointer"
              >
                {submitting ? "Submitting..." : "Publish Review"}
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 space-y-3">
            <h2 className="text-xl font-extrabold text-[#111c16]">
              Customer Reviews ({reviewCount})
            </h2>
            {reviewsList.map((rev) => (
              <div
                key={rev.id}
                className="rounded-2xl border border-[#e4e0d5] bg-white p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold text-[#111c16]">
                    {rev.authorName}
                  </p>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700">
                    {rev.rating}.0 ★
                  </span>
                </div>
                <p className="mt-2 text-sm text-[#4b5e52]">{rev.comment}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Related */}
        {relatedProducts.length > 0 && (
          <section className="mt-14 border-t border-[#e4e0d5] pt-10">
            <h2 className="text-xl font-extrabold text-[#111c16] mb-5">
              {lang === "bn" ? "আরও তাজা পণ্য" : "Pair With Your Kitchen Bazar"}
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
