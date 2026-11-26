"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Clock,
  Headphones,
  Leaf,
  MapPin,
  ShieldCheck,
  Sparkles,
  Tag,
  TrendingDown,
  Truck,
  Utensils,
} from "lucide-react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { ProductCard } from "./ProductCard";
import { useApp } from "./Providers";
import { formatTaka } from "@/lib/utils";
import type { CatalogProduct } from "@/lib/catalog";

interface CategoryRow {
  id: number;
  slug: string;
  nameEn: string;
  nameBn: string;
  descriptionEn: string;
  descriptionBn: string;
  iconName: string;
  accentColor: string;
}

interface FarmerRow {
  id: number;
  name: string;
  nameBn: string;
  district: string;
  upazila: string;
  specialty: string;
  yearsActive: number;
  verified: boolean;
  storyEn: string;
  storyBn: string;
}

interface SlotRow {
  id: number;
  labelEn: string;
  labelBn: string;
  windowText: string;
  isExpress: boolean;
}

interface StorefrontHomeProps {
  categories: CategoryRow[];
  products: CatalogProduct[];
  farmers: FarmerRow[];
  slots: SlotRow[];
}

const CATEGORY_THUMBS: Record<string, string> = {
  "fresh-vegetables": "/images/products/tomato.jpg",
  "leafy-greens": "/images/products/lal-shak.jpg",
  "ready-to-cook": "/images/products/mix-bhaji.jpg",
  "fresh-fruits": "/images/products/mango.jpg",
  "river-fish": "/images/products/rui-fish.jpg",
  "meat-eggs": "/images/products/sonali-chicken.jpg",
  "spices-herbs": "/images/products/kacha-morich.jpg",
  "organic-pantry": "/images/products/mustard-oil.jpg",
};

const HERO_SLIDES = [
  {
    tagEn: "Straight From The Field • Zero Middleman",
    tagBn: "সরাসরি ক্ষেত থেকে • কোনো ফড়িয়া নেই",
    titleEn: "Fair price for the farmer. Lower price for you.",
    titleBn: "কৃষকের ন্যায্য দাম, আপনার সাশ্রয়ী বাজার।",
    descEn:
      "Dawn-harvested vegetables, crispy shak, and chemical-free produce delivered to your Dhaka kitchen starting 6:00 AM.",
    descBn:
      "ভোরবেলা সংগ্রহ করা তাজা সবজি, শাক ও বিষমুক্ত নিত্যপণ্য সকাল ৬টা থেকেই আপনার ঢাকার বাসায়।",
    ctaEn: "Shop Fresh Vegetables",
    ctaBn: "সবজি বাজার দেখুন",
    img: "/images/hero-basket.jpg",
    targetCat: "fresh-vegetables",
  },
  {
    tagEn: "Freshness Just Landed • 3-Hour Dispatch",
    tagBn: "ভোরের তাজা কালেকশন • দ্রুত ডেলিভারি",
    titleEn: "Your Order, Your Time Slot — From 6:00 AM.",
    titleBn: "আপনার অর্ডার, আপনার পছন্দের ডেলিভারি স্লট।",
    descEn:
      "Pick early morning, afternoon, evening, or 60-minute express windows across Dhanmondi, Gulshan, Uttara & Mirpur.",
    descBn:
      "ধানমন্ডি, গুলশান, উত্তরা ও মিরপুরসহ পুরো ঢাকায় সকাল, দুপুর বা ৬০ মিনিটে এক্সপ্রেস ডেলিভারি।",
    ctaEn: "Explore Morning Slots",
    ctaBn: "স্লট ও বাজার দেখুন",
    img: "/images/farm-origin.jpg",
    targetCat: "leafy-greens",
  },
  {
    tagEn: "Padma River Catch & Pure Spices",
    tagBn: "পদ্মার তাজা মাছ ও খাঁটি মসলা",
    titleEn: "Formalin-Free River Fish & Wooden-Ghani Oil.",
    titleBn: "ফরমালিনমুক্ত নদীর মাছ ও ঘানির সরিষার তেল।",
    descEn:
      "Cleaned & curry-cut Chandpur Rui, Pabna deshi onion, and pure spices — delivered chilled in the same crate.",
    descBn:
      "চাঁদপুরের কাটা রুই মাছ, পাবনার দেশি পেঁয়াজ এবং নিজস্ব মিলে ভাঙানো খাঁটি মসলা একসাথে।",
    ctaEn: "Shop Fish & Spices",
    ctaBn: "মাছ ও মসলা দেখুন",
    img: "/images/fresh-fish-spices.jpg",
    targetCat: "river-fish",
  },
];

export function StorefrontHome({
  categories,
  products,
  farmers,
  slots,
}: StorefrontHomeProps) {
  const { lang, addItem, setIsCartOpen, showToast } = useApp();
  const [slideIdx, setSlideIdx] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedBadge, setSelectedBadge] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("featured");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const activeSlide = HERO_SLIDES[slideIdx];

  const flashDeals = useMemo(
    () => products.filter((p) => p.isFlashDeal).slice(0, 4),
    [products]
  );

  const filteredProducts = useMemo(() => {
    let list = [...products];
    if (selectedCategory === "flash") {
      list = list.filter((p) => p.isFlashDeal);
    } else if (selectedCategory !== "all") {
      list = list.filter((p) => p.categorySlug === selectedCategory);
    }
    if (selectedBadge !== "all") {
      list = list.filter(
        (p) => p.badge.toLowerCase() === selectedBadge.toLowerCase()
      );
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.nameEn.toLowerCase().includes(q) ||
          p.nameBn.toLowerCase().includes(q) ||
          p.subtitleEn.toLowerCase().includes(q) ||
          p.farmerDistrict.toLowerCase().includes(q) ||
          p.categoryNameEn.toLowerCase().includes(q)
      );
    }

    const priceOf = (p: CatalogProduct) =>
      p.variants.find((v) => v.isDefault)?.priceBdt ?? p.variants[0]?.priceBdt ?? 0;

    if (sortBy === "price-asc") {
      list.sort((a, b) => priceOf(a) - priceOf(b));
    } else if (sortBy === "price-desc") {
      list.sort((a, b) => priceOf(b) - priceOf(a));
    } else if (sortBy === "rating") {
      list.sort((a, b) => b.ratingAvg - a.ratingAvg);
    }
    return list;
  }, [products, selectedCategory, selectedBadge, sortBy, searchQuery]);

  // 1-Click Bengali Meal Recipe Combos
  const recipeCombos = useMemo(() => {
    const findProd = (slug: string) => products.find((p) => p.slug === slug);
    const defs = [
      {
        titleEn: "Deshi Bhorta & Dal Kit",
        titleBn: "দেশি ভর্তা ও ডাল কম্বো",
        descEn: "Tomato, Lal Shak, Deshi Onion, Green Chilli & Moshur Dal",
        slugs: [
          "deshi-vine-tomato",
          "lal-shak-red-amaranth",
          "pabna-deshi-onion",
          "kacha-morich-green-chilli",
          "deshi-moshur-dal",
        ],
      },
      {
        titleEn: "Padma Rui Curry Pack",
        titleBn: "পদ্মার রুই ও সবজি প্যাক",
        descEn: "Cleaned Padma Rui, Potato, Bottle Gourd & Stone-Ground Turmeric",
        slugs: [
          "padma-rui-fish-cut",
          "munshiganj-diamond-potato",
          "kacha-lao-bottle-gourd",
          "bogura-pure-turmeric-powder",
        ],
      },
      {
        titleEn: "Busy Morning Kitchen Box",
        titleBn: "সকালের দ্রুত রান্না বক্স",
        descEn: "Ready-to-Cook Mix Bhaji, Peeled Garlic-Ginger, Eggs & Bananas",
        slugs: [
          "ready-to-cook-mixed-bhaji",
          "ready-to-cook-peeled-garlic-ginger",
          "deshi-duck-farm-eggs",
          "narsingdi-sagar-kola",
        ],
      },
    ];

    return defs
      .map((combo) => {
        const items = combo.slugs
          .map((s) => findProd(s))
          .filter((p): p is CatalogProduct => Boolean(p));
        const total = items.reduce((sum, p) => {
          const v = p.variants.find((x) => x.isDefault) ?? p.variants[0];
          return sum + (v?.priceBdt ?? 0);
        }, 0);
        return { ...combo, items, total };
      })
      .filter((c) => c.items.length > 0);
  }, [products]);

  const handleAddCombo = (combo: (typeof recipeCombos)[number]) => {
    for (const p of combo.items) {
      const v = p.variants.find((x) => x.isDefault) ?? p.variants[0];
      if (!v) continue;
      addItem({
        productId: p.id,
        variantId: v.id,
        slug: p.slug,
        nameEn: p.nameEn,
        nameBn: p.nameBn,
        variantLabel: v.label,
        priceBdt: v.priceBdt,
        compareAtBdt: v.compareAtBdt,
        visualKey: p.visualKey,
        imageUrl: p.imageUrl,
        maxStock: v.stockQty,
      });
    }
    showToast(`${combo.titleEn} added to your cart!`);
    setIsCartOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar
        productsForSearch={products}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onSearchQuery={setSearchQuery}
      />

      <main className="flex-1">
        {/* HERO SECTION: Main Promotional Carousel + Right Quick Action Cards */}
        <section className="bg-[#f6f8f6] border-b border-[#e4eae5]">
          <div className="mx-auto grid max-w-7xl gap-4 px-4 py-5 sm:px-6 lg:grid-cols-12">
            {/* Main Banner Carousel */}
            <div className="relative overflow-hidden rounded-2xl border border-[#dce4de] bg-[#143624] text-white lg:col-span-8 min-h-[340px] sm:min-h-[380px] flex items-center">
              <Image
                src={activeSlide.img}
                alt={activeSlide.titleEn}
                fill
                priority
                className="object-cover opacity-45 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0e2a1b]/95 via-[#0e2a1b]/75 to-transparent" />

              <div className="relative z-10 max-w-xl p-7 sm:p-10 space-y-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-emerald-200 backdrop-blur-xs">
                  <Leaf className="h-3.5 w-3.5 text-emerald-300" />
                  {lang === "bn" ? activeSlide.tagBn : activeSlide.tagEn}
                </span>
                <h1 className="text-2xl font-extrabold leading-tight sm:text-4xl">
                  {lang === "bn" ? activeSlide.titleBn : activeSlide.titleEn}
                </h1>
                <p className="text-sm leading-relaxed text-emerald-100/90">
                  {lang === "bn" ? activeSlide.descBn : activeSlide.descEn}
                </p>
                <div className="flex flex-wrap gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory(activeSlide.targetCat);
                      document
                        .getElementById("catalog")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#16a34a] px-5 py-3 text-xs sm:text-sm font-extrabold text-white shadow-md hover:bg-[#15803d] transition cursor-pointer"
                  >
                    <span>{lang === "bn" ? activeSlide.ctaBn : activeSlide.ctaEn}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <Link
                    href="/track"
                    className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-3 text-xs sm:text-sm font-bold text-white backdrop-blur-xs hover:bg-white/25 transition"
                  >
                    {lang === "bn" ? "অর্ডার ট্র্যাক" : "Track Order"}
                  </Link>
                </div>
              </div>

              {/* Carousel Controls */}
              <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setSlideIdx((s) => (s - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 cursor-pointer"
                  aria-label="Previous banner"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="flex gap-1.5">
                  {HERO_SLIDES.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSlideIdx(i)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        slideIdx === i ? "w-6 bg-white" : "w-2 bg-white/50"
                      }`}
                      aria-label={`Slide ${i + 1}`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setSlideIdx((s) => (s + 1) % HERO_SLIDES.length)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 cursor-pointer"
                  aria-label="Next banner"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Right Stacked Promo Blocks (Iconic Sobji.com.bd UX) */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 lg:col-span-4">
              <div className="flex flex-col justify-between rounded-2xl border border-emerald-200 bg-[#eef9f1] p-5">
                <div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-[#16803c]">
                    <Clock className="h-4 w-4" />
                    {lang === "bn" ? "আপনার সময়, আপনার স্লট" : "Your Order, Your Time Slot"}
                  </span>
                  <h2 className="mt-1.5 text-lg font-extrabold text-[#18231c]">
                    {lang === "bn"
                      ? "সকাল ৬টা থেকে রাত ৯টা ডেলিভারি"
                      : "Early Morning 6:00 AM Slots Live"}
                  </h2>
                  <p className="mt-1 text-xs text-[#4a5b50]">
                    Pick morning, express 60-min, or evening delivery across Dhaka.
                  </p>
                </div>
                <a
                  href="#slots"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-extrabold text-[#16803c] hover:underline"
                >
                  <span>View 5 Delivery Slots</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>

              <div className="flex flex-col justify-between rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-5">
                <div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-orange-600">
                    <Tag className="h-4 w-4" />
                    {lang === "bn" ? "ফ্রি মেম্বারশিপ ও অফার" : "Free Membership + Deals"}
                  </span>
                  <h2 className="mt-1.5 text-lg font-extrabold text-[#18231c]">
                    {lang === "bn"
                      ? "৪৯৯৳+ অর্ডারে ফ্রি ডেলিভারি"
                      : "Free Membership on ৳499+"}
                  </h2>
                  <p className="mt-1 text-xs text-[#5f6f64]">
                    Get Free Delivery, BOGO Shak &{" "}
                    <span className="font-mono font-bold text-orange-700">SOBJI10</span>{" "}
                    10% OFF!
                  </p>
                </div>
                <a
                  href="#flash-deals"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-extrabold text-orange-700 hover:underline"
                >
                  <span>Shop Weekly Discounts</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 4 VALUE PILLARS */}
        <section className="border-b border-[#e4eae5] bg-white">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-5 sm:px-6 lg:grid-cols-4">
            {[
              {
                icon: Leaf,
                title: lang === "bn" ? "প্রতিদিন ভোরের তাজা" : "Fresh Every Morning",
                sub: lang === "bn" ? "সকাল ৪:৩০-এ ক্ষেত থেকে তোলা" : "Harvested pre-dawn daily",
              },
              {
                icon: TrendingDown,
                title: lang === "bn" ? "বাজারের চেয়ে কম দাম" : "Lower Than Bazar Price",
                sub: lang === "bn" ? "সরাসরি কৃষক, কোনো ফড়িয়া নেই" : "No middleman markup",
              },
              {
                icon: Truck,
                title: lang === "bn" ? "সকাল ৬টায় ডেলিভারি" : "6:00 AM Fast Delivery",
                sub: lang === "bn" ? "৩ ঘণ্টার মধ্যে ডেলিভারি শুরু" : "Starts within 3 hours",
              },
              {
                icon: Headphones,
                title: lang === "bn" ? "২৪/৭ লাইভ অ্যাসিস্ট্যান্ট" : "24/7 Live Assistant",
                sub: lang === "bn" ? "হোয়াটসঅ্যাপ ও ২৪ ঘণ্টায় রিটার্ন" : "WhatsApp & 24h replacement",
              },
            ].map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eef9f1] text-[#16803c]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-extrabold text-[#18231c]">
                      {pillar.title}
                    </p>
                    <p className="text-[11px] text-[#5f6f64]">{pillar.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* EXPLORE BY CATEGORIES (Visual Photo Cards) */}
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-extrabold text-[#18231c] sm:text-2xl">
                {lang === "bn" ? "ক্যাটাগরি অনুযায়ী বাজার" : "Explore by Categories"}
              </h2>
              <p className="text-xs text-[#5f6f64]">
                Tap any department to filter fresh produce below
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className="text-xs font-extrabold text-[#16803c] hover:underline cursor-pointer"
            >
              View All ({products.length})
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {categories.map((cat) => {
              const active = selectedCategory === cat.slug;
              const thumb = CATEGORY_THUMBS[cat.slug] || "/images/hero-basket.jpg";
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(active ? "all" : cat.slug);
                    document
                      .getElementById("catalog")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={`group overflow-hidden rounded-xl border text-center transition cursor-pointer ${
                    active
                      ? "border-[#16803c] bg-[#eef9f1] ring-2 ring-[#16803c]/25"
                      : "border-[#e4eae5] bg-white hover:border-[#16803c]/60 hover:shadow-sm"
                  }`}
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#f6f8f6]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={thumb}
                      alt={cat.nameEn}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-2">
                    <p className="line-clamp-1 text-xs font-bold text-[#18231c]">
                      {lang === "bn" ? cat.nameBn : cat.nameEn}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* WEEKLY DISCOUNTS / FLASH DEALS SHELF */}
        {flashDeals.length > 0 && (
          <section id="flash-deals" className="bg-[#f6f8f6] py-10 border-y border-[#e4eae5]">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div>
                  <span className="inline-flex items-center gap-1 rounded bg-orange-100 px-2.5 py-0.5 text-[11px] font-extrabold text-orange-700">
                    <Tag className="h-3 w-3" />
                    WEEKLY DISCOUNTS
                  </span>
                  <h2 className="mt-1.5 text-xl font-extrabold text-[#18231c] sm:text-2xl">
                    {lang === "bn"
                      ? "সাপ্তাহিক ডিসকাউন্ট ও ভোরের অফার"
                      : "Today's Morning Harvest Discounts"}
                  </h2>
                </div>
                <div className="rounded-lg border border-orange-200 bg-white px-3.5 py-2 text-xs font-bold text-[#18231c]">
                  Coupon:{" "}
                  <span className="font-mono text-orange-600">SOBJI10</span> (10% Off)
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {flashDeals.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* COMPLETE BAZAR CATALOG */}
        <section id="catalog" className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h2 className="text-xl font-extrabold text-[#18231c] sm:text-2xl">
                {selectedCategory === "all"
                  ? lang === "bn"
                    ? "সব তাজা বাজার"
                    : "Fresh Produce & Daily Bazar"
                  : categories.find((c) => c.slug === selectedCategory)?.[
                      lang === "bn" ? "nameBn" : "nameEn"
                    ] || "Weekly Discounts"}
              </h2>
              <p className="text-xs text-[#5f6f64]">
                Showing {filteredProducts.length} items • Choose exact pack weights (250g, 500g, 1kg)
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {["all", "Organic", "Deshi", "Farm Direct"].map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setSelectedBadge(b)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                    selectedBadge === b
                      ? "border-[#16803c] bg-[#16803c] text-white"
                      : "border-[#e4eae5] bg-white text-[#4a5b50] hover:border-[#16803c]"
                  }`}
                >
                  {b === "all" ? (lang === "bn" ? "সবগুলো" : "All") : b}
                </button>
              ))}

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-lg border border-[#e4eae5] bg-white px-3 py-1.5 text-xs font-bold text-[#18231c] cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#dce4de] bg-[#f6f8f6] p-12 text-center">
              <p className="text-base font-bold text-[#18231c]">
                No items matched your search or filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("all");
                  setSelectedBadge("all");
                  setSearchQuery("");
                }}
                className="mt-4 rounded-lg bg-[#16803c] px-5 py-2.5 text-xs font-bold text-white cursor-pointer"
              >
                Show All Items
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* RECIPES & MEAL COMBOS (1-Click Add to Bag) */}
        <section id="recipes" className="bg-[#f6f8f6] py-12 border-y border-[#e4eae5]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#16803c]">
              <Utensils className="h-4 w-4" />
              <span>{lang === "bn" ? "রেডি রেসিপি ও কম্বো" : "Recipes & Meal Combos"}</span>
            </div>
            <h2 className="mt-1 text-xl font-extrabold text-[#18231c] sm:text-2xl">
              {lang === "bn"
                ? "এক ক্লিকেই পুরো রান্নার বাজার"
                : "One-Click Bengali Kitchen Combos"}
            </h2>
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {recipeCombos.map((combo, idx) => (
                <div
                  key={idx}
                  className="flex flex-col justify-between rounded-2xl border border-[#e4eae5] bg-white p-5 shadow-2xs"
                >
                  <div>
                    <div className="flex -space-x-2 mb-4">
                      {combo.items.slice(0, 4).map((item) => (
                        <div
                          key={item.id}
                          className="h-12 w-12 overflow-hidden rounded-full border-2 border-white bg-[#f6f8f6] shadow-xs"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.imageUrl || "/images/hero-basket.jpg"}
                            alt={item.nameEn}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                    <h3 className="text-base font-extrabold text-[#18231c]">
                      {lang === "bn" ? combo.titleBn : combo.titleEn}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-[#5f6f64]">
                      {combo.descEn}
                    </p>
                  </div>
                  <div className="mt-5 flex items-center justify-between border-t border-[#eef2ef] pt-3">
                    <div>
                      <p className="text-[11px] text-[#5f6f64]">
                        {combo.items.length} fresh items
                      </p>
                      <p className="font-mono text-base font-extrabold text-[#16803c]">
                        {formatTaka(combo.total, lang)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddCombo(combo)}
                      className="rounded-lg bg-[#16803c] px-4 py-2 text-xs font-bold text-white hover:bg-[#126a31] transition cursor-pointer"
                    >
                      Add All to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FARMERS TRACEABILITY + MEMBERSHIP + SLOTS */}
        <section id="traceability" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 space-y-10">
          <div className="grid items-center gap-8 rounded-2xl border border-[#e4eae5] bg-white p-6 sm:p-8 lg:grid-cols-12">
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl lg:col-span-5">
              <Image
                src="/images/farm-origin.jpg"
                alt="Direct from Bangladeshi farmers"
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-4 lg:col-span-7">
              <span className="inline-flex items-center gap-1.5 rounded bg-[#eef9f1] px-2.5 py-1 text-xs font-extrabold text-[#16803c]">
                <ShieldCheck className="h-3.5 w-3.5" />
                Direct From Farmers • Verified Growers
              </span>
              <h2 className="text-2xl font-extrabold text-[#18231c]">
                {lang === "bn"
                  ? "বগুড়া, নরসিংদী ও মুন্সিগঞ্জের কৃষকদের কাছ থেকে সরাসরি"
                  : "No Middleman. Direct Harvest From 6 Partner Districts."}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {farmers.slice(0, 4).map((f) => (
                  <div
                    key={f.id}
                    className="rounded-xl border border-[#e4eae5] bg-[#f6f8f6] p-3.5"
                  >
                    <p className="flex items-center justify-between text-xs font-bold text-[#16803c]">
                      <span>{lang === "bn" ? f.nameBn : f.name}</span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {f.district}
                      </span>
                    </p>
                    <p className="mt-1 text-xs font-semibold text-[#18231c]">
                      {f.specialty}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div id="membership" className="grid gap-6 lg:grid-cols-12">
            <div
              id="slots"
              className="rounded-2xl border border-[#e4eae5] bg-white p-6 lg:col-span-7"
            >
              <h3 className="text-lg font-extrabold text-[#18231c]">
                {lang === "bn"
                  ? "ডেলিভারি টাইম স্লট (ভোর ৬টা থেকে)"
                  : "Available Dhaka Delivery Time Slots"}
              </h3>
              <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {slots.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between rounded-xl border border-[#e4eae5] bg-[#f6f8f6] px-4 py-3 text-xs"
                  >
                    <span className="font-bold text-[#18231c]">
                      {lang === "bn" ? slot.labelBn : slot.labelEn}
                    </span>
                    <span className="font-mono font-bold text-[#16803c]">
                      {slot.windowText}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-2xl bg-[#16803c] p-6 sm:p-8 text-white lg:col-span-5">
              <div>
                <span className="inline-flex items-center gap-1 rounded bg-white/20 px-2.5 py-1 text-[11px] font-extrabold">
                  <Sparkles className="h-3.5 w-3.5" />
                  FREE MEMBERSHIP
                </span>
                <h3 className="mt-3 text-2xl font-extrabold">
                  Sobji Card & Member Benefits
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-emerald-50/90">
                  Place an order of ৳499+ to unlock complimentary membership: Free Delivery,
                  Buy-1-Get-1 Leafies, and priority WhatsApp & 6:00 AM support.
                </p>
              </div>
              <Link
                href="/account"
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-extrabold text-[#16803c] hover:bg-emerald-50 transition"
              >
                <span>Join Free Membership</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
