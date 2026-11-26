"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Clock,
  Sparkles,
  Plus,
  ShieldCheck,
  Sprout,
  Truck,
  Headphones,
} from "lucide-react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { ProductCard } from "./ProductCard";
import { useApp } from "./Providers";
import { formatTaka, FREE_DELIVERY_THRESHOLD } from "@/lib/utils";
import type { CatalogProduct } from "@/lib/catalog";

function StorefrontUrlSync({
  onCategory,
  onSearch,
}: {
  onCategory: (cat: string) => void;
  onSearch: (q: string) => void;
}) {
  const searchParams = useSearchParams();
  const catParam = searchParams.get("category");
  const qParam = searchParams.get("q");

  useEffect(() => {
    if (!catParam && !qParam) return;
    const timer = setTimeout(() => {
      if (catParam) onCategory(catParam);
      if (qParam) onSearch(qParam);
    }, 0);
    return () => clearTimeout(timer);
  }, [catParam, qParam, onCategory, onSearch]);

  return null;
}

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
    eyebrowEn: "Direct From Farmers • Zero Middleman",
    eyebrowBn: "সরাসরি কৃষকের ক্ষেত থেকে • কোনো ফড়িয়া নেই",
    titleEn: "Dawn-harvested produce, straight to your Dhaka kitchen.",
    titleBn: "ভোরবেলা তোলা তাজা সবজি, সকাল ৬টা থেকেই আপনার বাসায়।",
    subEn:
      "Fair price for Bangladeshi farmers and fresher, lower-cost bazar for your family every morning.",
    subBn:
      "কৃষকের ন্যায্য দাম ও আপনার প্রতিদিনের বাজারে সাশ্রয়ী এবং খাঁটি পণ্যের নিশ্চয়তা।",
    ctaEn: "Shop Fresh Harvest",
    ctaBn: "তাজা সবজি দেখুন",
    img: "/images/hero-basket.jpg",
    targetCat: "fresh-vegetables",
  },
  {
    eyebrowEn: "Flexible Dhaka Delivery Slots",
    eyebrowBn: "ঢাকা জুড়ে সহজ ডেলিভারি স্লট",
    titleEn: "Your order, your preferred time slot, starting 6:00 AM.",
    titleBn: "আপনার অর্ডার, আপনার সুবিধামতো ডেলিভারি স্লট।",
    subEn:
      "Choose morning, afternoon, evening, or 60-minute express delivery across Dhaka Metro.",
    subBn:
      "সকাল, দুপুর, সন্ধ্যা অথবা ৬০ মিনিটে এক্সপ্রেস ডেলিভারি বেছে নিন সহজেই।",
    ctaEn: "Explore Morning Deals",
    ctaBn: "সাপ্তাহিক অফার দেখুন",
    img: "/images/farm-origin.jpg",
    targetCat: "flash",
  },
  {
    eyebrowEn: "Formalin-Free Catch & Cold-Pressed Oil",
    eyebrowBn: "ফরমালিনমুক্ত নদীর মাছ ও ঘানির তেল",
    titleEn: "Padma River Rui, Deshi Chicken & Pure Ghani Spices.",
    titleBn: "পদ্মার তাজা রুই, দেশি মুরগি ও কাঠের ঘানির খাঁটি মসলা।",
    subEn:
      "Cleaned, cut to order, and packed hygienically with zero chemical preservatives.",
    subBn:
      "পরিষ্কার করে কেটে কোনো প্রিজারভেটিভ ছাড়াই আপনার রান্নাঘরে পৌঁছে যায়।",
    ctaEn: "Shop Fish & Meat",
    ctaBn: "মাছ ও মাংস দেখুন",
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
  const { lang, deliveryArea, addItem, setIsCartOpen, showToast } = useApp();
  const [slideIdx, setSlideIdx] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedBadge, setSelectedBadge] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<"all" | "under50" | "50to150" | "over150">("all");
  const [sortBy, setSortBy] = useState<string>("featured");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const activeSlide = HERO_SLIDES[slideIdx];

  const flashDeals = useMemo(
    () => products.filter((p) => p.isFlashDeal).slice(0, 4),
    [products]
  );

  const heroDropProduct = flashDeals[0] ?? products[0];
  const heroDropVariant =
    heroDropProduct?.variants.find((v) => v.isDefault) ?? heroDropProduct?.variants[0];

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

    if (priceRange === "under50") {
      list = list.filter((p) => priceOf(p) <= 50);
    } else if (priceRange === "50to150") {
      list = list.filter((p) => priceOf(p) > 50 && priceOf(p) <= 150);
    } else if (priceRange === "over150") {
      list = list.filter((p) => priceOf(p) > 150);
    }

    if (sortBy === "price-asc") {
      list.sort((a, b) => priceOf(a) - priceOf(b));
    } else if (sortBy === "price-desc") {
      list.sort((a, b) => priceOf(b) - priceOf(a));
    } else if (sortBy === "rating") {
      list.sort((a, b) => b.ratingAvg - a.ratingAvg);
    }
    return list;
  }, [products, selectedCategory, selectedBadge, priceRange, sortBy, searchQuery]);

  const recipeCombos = useMemo(() => {
    const findProd = (slug: string) => products.find((p) => p.slug === slug);
    const defs = [
      {
        titleEn: "Deshi Bhorta & Dal Kit",
        titleBn: "দেশি ভর্তা ও ডাল প্যাক",
        descEn: "Tomato, Lal Shak, Deshi Onion, Green Chilli & Moshur Dal",
        descBn: "টমেটো, লাল শাক, দেশি পেঁয়াজ, কাঁচামরিচ ও মসুর ডাল",
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
        descEn: "Padma Rui Steaks, Diamond Potato, Bottle Gourd & Turmeric",
        descBn: "পদ্মার রুই মাছের পিস, ডায়মন্ড আলু, লাউ ও হলুদের গুঁড়া",
        slugs: [
          "padma-rui-fish-cut",
          "munshiganj-diamond-potato",
          "kacha-lao-bottle-gourd",
          "bogura-pure-turmeric-powder",
        ],
      },
      {
        titleEn: "Weekday Quick Kitchen Box",
        titleBn: "সকালের দ্রুত রান্না বক্স",
        descEn: "Ready Mix Bhaji, Peeled Garlic-Ginger, Eggs & Sagar Kola",
        descBn: "মিক্স ভাজি, ছোলানো রসুন-আদা, দেশি ডিম ও সাগর কলা",
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
    showToast(
      lang === "bn"
        ? `${combo.titleBn} ব্যাগে যোগ করা হয়েছে!`
        : `${combo.titleEn} added to bag!`
    );
    setIsCartOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f9faf8]">
      <Suspense fallback={null}>
        <StorefrontUrlSync
          onCategory={setSelectedCategory}
          onSearch={setSearchQuery}
        />
      </Suspense>
      <Navbar
        productsForSearch={products}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onSearchQuery={setSearchQuery}
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 space-y-12">
        {/* MODERN BENTO HERO SHOWCASE */}
        <section className="grid gap-4 lg:grid-cols-12">
          {/* Primary Interactive Showcase */}
          <div className="relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white lg:col-span-8 min-h-[340px] sm:min-h-[380px] flex items-center">
            <Image
              src={activeSlide.img}
              alt={activeSlide.titleEn}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 66vw"
              className="object-cover object-right"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/90 to-white/55 md:via-white/92 md:to-transparent" />

            <div className="relative z-10 max-w-lg p-5 pb-14 sm:p-10 space-y-3.5 sm:space-y-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-[#0f7b3f] ring-1 ring-[#0f7b3f]/15">
                <Sprout className="h-3.5 w-3.5" />
                {lang === "bn" ? activeSlide.eyebrowBn : activeSlide.eyebrowEn}
              </span>
              <h1 className="text-2xl font-extrabold tracking-tight leading-[1.14] text-gray-900 sm:text-4xl">
                {lang === "bn" ? activeSlide.titleBn : activeSlide.titleEn}
              </h1>
              <p className="text-sm leading-relaxed text-gray-600 sm:text-[15px]">
                {lang === "bn" ? activeSlide.subBn : activeSlide.subEn}
              </p>
              <div className="flex flex-wrap gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory(activeSlide.targetCat);
                    document
                      .getElementById("catalog")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0f7b3f] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#0b5e30] transition cursor-pointer"
                >
                  <span>{lang === "bn" ? activeSlide.ctaBn : activeSlide.ctaEn}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <a
                  href="#slots"
                  className="inline-flex items-center rounded-xl border border-gray-200 bg-white/90 px-4 py-3 text-sm font-semibold text-gray-800 hover:border-[#0f7b3f] transition"
                >
                  {lang === "bn" ? "ডেলিভারি স্লট" : "6:00 AM Slots"}
                </a>
              </div>
            </div>

            {/* Minimal Slider Controls */}
            <div className="absolute bottom-4 left-7 z-10 flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setSlideIdx((s) => (s - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)
                }
                aria-label="Previous slide"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-xs hover:bg-white cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="flex gap-1.5">
                {HERO_SLIDES.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSlideIdx(i)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      slideIdx === i ? "w-6 bg-[#0f7b3f]" : "w-2 bg-gray-300"
                    }`}
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => setSlideIdx((s) => (s + 1) % HERO_SLIDES.length)}
                aria-label="Next slide"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-xs hover:bg-white cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Right Bento Column */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 lg:col-span-4">
            {/* Tile 1: Live Dispatch Window */}
            <div className="flex flex-col justify-between rounded-2xl bg-[#0b2a18] p-6 text-white">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
                  <Clock className="h-3.5 w-3.5" />
                  {lang === "bn" ? `পরবর্তী স্লট · ${deliveryArea}` : `Next Dispatch · ${deliveryArea}`}
                </span>
                <span className="rounded-full bg-emerald-400/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-200">
                  {lang === "bn" ? "চালু" : "Open"}
                </span>
              </div>
              <div className="my-2">
                <p className="text-2xl font-bold tracking-tight tabular-nums">
                  {lang === "bn" ? "সকাল ৬:০০ - ৮:০০" : "6:00 AM - 8:00 AM"}
                </p>
                <p className="mt-1 text-xs text-emerald-100/80">
                  {lang === "bn"
                    ? `${formatTaka(FREE_DELIVERY_THRESHOLD, lang)}+ অর্ডারে ফ্রি ডেলিভারি · ৬০ মিনিট এক্সপ্রেস চালু`
                    : `Free delivery on orders ${formatTaka(FREE_DELIVERY_THRESHOLD, "en")}+ · Express 60-min available`}
                </p>
              </div>
              <Link
                href="/track?code=SBJ-DEMO01"
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-300 hover:text-white"
              >
                {lang === "bn"
                  ? "লাইভ ডিসপ্যাচ ট্র্যাক (SBJ-DEMO01) →"
                  : "Track live dispatch (SBJ-DEMO01) →"}
              </Link>
            </div>

            {/* Tile 2: Today's Farm Pick Quick Add */}
            {heroDropProduct && heroDropVariant && (
              <div className="flex items-center gap-4 rounded-2xl border border-gray-200/80 bg-white p-4">
                <Link
                  href={`/products/${heroDropProduct.slug}`}
                  className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-100"
                >
                  <Image
                    src={heroDropProduct.imageUrl || "/images/products/tomato.jpg"}
                    alt={heroDropProduct.nameEn}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-orange-600">
                    <Sparkles className="h-3 w-3" />
                    {lang === "bn" ? "ভোরের সেরা সংগ্রহ" : "Dawn Harvest Pick"}
                  </span>
                  <Link
                    href={`/products/${heroDropProduct.slug}`}
                    className="mt-0.5 block truncate text-sm font-bold text-gray-900 hover:text-[#0f7b3f]"
                  >
                    {lang === "bn" ? heroDropProduct.nameBn : heroDropProduct.nameEn}
                  </Link>
                  <p className="text-xs text-gray-500">
                    {heroDropVariant.label} · {heroDropProduct.farmerDistrict}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="tabular-nums text-base font-bold text-gray-900">
                      {formatTaka(heroDropVariant.priceBdt, lang)}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        addItem({
                          productId: heroDropProduct.id,
                          variantId: heroDropVariant.id,
                          slug: heroDropProduct.slug,
                          nameEn: heroDropProduct.nameEn,
                          nameBn: heroDropProduct.nameBn,
                          variantLabel: heroDropVariant.label,
                          priceBdt: heroDropVariant.priceBdt,
                          compareAtBdt: heroDropVariant.compareAtBdt,
                          visualKey: heroDropProduct.visualKey,
                          imageUrl: heroDropProduct.imageUrl,
                          maxStock: heroDropVariant.stockQty,
                        })
                      }
                      className="inline-flex items-center gap-1 rounded-xl bg-[#0f7b3f] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0b5e30] cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {lang === "bn" ? "যোগ" : "Add"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* MINIMALIST TRUST BAR */}
        <section className="grid grid-cols-2 gap-4 rounded-2xl border border-gray-200/80 bg-white px-5 py-4 lg:grid-cols-4">
          {[
            {
              icon: Sprout,
              title: lang === "bn" ? "সরাসরি কৃষক থেকে" : "Farm-Direct Sourcing",
              sub: lang === "bn" ? "কোনো মধ্যস্বত্বভোগী নেই" : "Zero middleman markup",
            },
            {
              icon: Truck,
              title: lang === "bn" ? "সকাল ৬টা থেকে ডেলিভারি" : "6:00 AM Dawn Slots",
              sub: lang === "bn" ? "ঢাকা জুড়ে দ্রুত ডেলিভারি" : "Morning & 60-min express",
            },
            {
              icon: ShieldCheck,
              title: lang === "bn" ? "২৪ ঘণ্টায় রিপ্লেসমেন্ট" : "24h Freshness Promise",
              sub: lang === "bn" ? "পছন্দ না হলে তাৎক্ষণিক বদল" : "Instant free replacement",
            },
            {
              icon: Headphones,
              title: lang === "bn" ? "লাইভ চ্যাট ও সাপোর্ট" : "24/7 Live Support",
              sub: lang === "bn" ? "০১৮৮৫-৫৯২৫১১ · লাইভ চ্যাট" : "01885-592511 · Live Chat",
              isChat: true,
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            const inner = (
              <>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[#0f7b3f]">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-gray-900">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-gray-500">{item.sub}</p>
                </div>
              </>
            );
            if ("isChat" in item && item.isChat) {
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => window.dispatchEvent(new Event("sobji:open-chat"))}
                  className="flex items-center gap-3 text-left rounded-xl transition hover:bg-emerald-50/50 cursor-pointer"
                >
                  {inner}
                </button>
              );
            }
            return (
              <div key={idx} className="flex items-center gap-3">
                {inner}
              </div>
            );
          })}
        </section>

        {/* SHOP BY CATEGORY */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
              {lang === "bn" ? "ক্যাটাগরি অনুযায়ী বাজার" : "Shop by Category"}
            </h2>
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className="text-xs font-semibold text-[#0f7b3f] hover:underline cursor-pointer"
            >
              {lang === "bn" ? "সব দেখুন" : "View All"} ({products.length})
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
                  className={`group overflow-hidden rounded-2xl border bg-white text-center transition-all cursor-pointer ${
                    active
                      ? "border-[#0f7b3f] ring-2 ring-[#0f7b3f]/20 shadow-sm"
                      : "border-gray-200/80 hover:-translate-y-0.5 hover:border-[#0f7b3f]/40 hover:shadow-sm"
                  }`}
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                    <Image
                      src={thumb}
                      alt={cat.nameEn}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 12vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <p className="truncate px-2 py-2.5 text-xs font-semibold text-gray-800">
                    {lang === "bn" ? cat.nameBn : cat.nameEn}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* FRESH PRODUCE CATALOG */}
        <section id="catalog">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
                {selectedCategory === "all"
                  ? lang === "bn"
                    ? "তাজা সবজি ও দৈনন্দিন বাজার"
                    : "Fresh Produce & Daily Bazar"
                  : selectedCategory === "flash"
                    ? lang === "bn"
                      ? "সাপ্তাহিক ডিসকাউন্ট"
                      : "Weekly Discounts"
                    : categories.find((c) => c.slug === selectedCategory)?.[
                        lang === "bn" ? "nameBn" : "nameEn"
                      ]}
              </h2>
              <p className="text-xs text-gray-500">
                {lang === "bn"
                  ? `${filteredProducts.length}টি পণ্য রয়েছে · প্যাকেটের পরিমাণ বেছে নিন`
                  : `${filteredProducts.length} items available • Choose pack weight directly`}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {["all", "Organic", "Deshi", "Farm Direct"].map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setSelectedBadge(b)}
                  className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
                    selectedBadge === b
                      ? "border-[#0f7b3f] bg-[#0f7b3f] text-white"
                      : "border-gray-200 bg-white text-gray-600 hover:border-[#0f7b3f]"
                  }`}
                >
                  {b === "all" ? (lang === "bn" ? "সব" : "All") : b}
                </button>
              ))}

              <div className="flex flex-1 sm:flex-none gap-2 min-w-[220px] sm:min-w-0">
                <select
                  value={priceRange}
                  onChange={(e) =>
                    setPriceRange(
                      e.target.value as "all" | "under50" | "50to150" | "over150"
                    )
                  }
                  className="flex-1 sm:flex-none rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-800 cursor-pointer focus:outline-none"
                >
                  <option value="all">{lang === "bn" ? "সব দাম" : "All Prices"}</option>
                  <option value="under50">{lang === "bn" ? "৳৫০ এর নিচে" : "Under ৳50"}</option>
                  <option value="50to150">{lang === "bn" ? "৳৫০ - ৳১৫০" : "৳50 - ৳150"}</option>
                  <option value="over150">{lang === "bn" ? "৳১৫০+" : "৳150+"}</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 sm:flex-none rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-800 cursor-pointer focus:outline-none"
                >
                  <option value="featured">{lang === "bn" ? "সাজান: বাছাইকৃত" : "Sort: Featured"}</option>
                  <option value="price-asc">{lang === "bn" ? "দাম: কম থেকে বেশি" : "Price: Low to High"}</option>
                  <option value="price-desc">{lang === "bn" ? "দাম: বেশি থেকে কম" : "Price: High to Low"}</option>
                  <option value="rating">{lang === "bn" ? "সর্বোচ্চ রেটিং" : "Top Rated"}</option>
                </select>
              </div>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
              <p className="text-sm font-semibold text-gray-900">
                {lang === "bn"
                  ? "এই ফিল্টারে কোনো পণ্য পাওয়া যায়নি।"
                  : "No items found for this filter."}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("all");
                  setSelectedBadge("all");
                  setPriceRange("all");
                  setSearchQuery("");
                }}
                className="mt-3 rounded-xl bg-[#0f7b3f] px-4 py-2 text-xs font-semibold text-white cursor-pointer"
              >
                {lang === "bn" ? "ফিল্টার রিসেট করুন" : "Reset Filters"}
              </button>
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* HIGH-CONTRAST WEEKLY DEALS SPOTLIGHT BAND */}
        {selectedCategory === "all" && flashDeals.length > 0 && (
          <section id="flash-deals" className="rounded-2xl bg-[#0b2a18] p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                  {lang === "bn" ? "ভোরের স্পেশাল কালেকশন" : "Morning Harvest Drops"}
                </span>
                <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">
                  {lang === "bn" ? "সাপ্তাহিক ডিসকাউন্ট" : "Weekly Harvest Discounts"}
                </h2>
              </div>
              <span className="rounded-xl bg-white/10 px-3.5 py-2 text-xs font-semibold text-emerald-100 ring-1 ring-white/15">
                {lang === "bn" ? "কুপন কোড:" : "Use Code:"}{" "}
                <strong className="text-amber-300">SOBJI10</strong>{" "}
                {lang === "bn" ? "(১০% ছাড়)" : "(10% Off)"}
              </span>
            </div>
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
              {flashDeals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* RECIPE COMBO PACKS WITH STACKED IMAGERY */}
        <section id="recipes">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
              {lang === "bn" ? "এক ক্লিকে রান্নার কম্বো" : "Recipes & Ready Bazar Kits"}
            </h2>
            <p className="text-xs text-gray-500">
              {lang === "bn"
                ? "এক ক্লিকেই প্রতিদিনের রান্নার সম্পূর্ণ বাজার ব্যাগে যোগ করুন"
                : "Add all ingredients for a complete Bengali meal in one tap"}
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {recipeCombos.map((combo, idx) => (
              <div
                key={idx}
                className="flex flex-col justify-between rounded-2xl border border-gray-200/80 bg-white p-5 hover:border-[#0f7b3f]/40 transition"
              >
                <div>
                  <div className="flex -space-x-2.5 mb-3">
                    {combo.items.slice(0, 4).map((item) => (
                      <div
                        key={item.id}
                        className="relative h-11 w-11 overflow-hidden rounded-full border-2 border-white bg-gray-100 shadow-xs"
                      >
                        <Image
                          src={item.imageUrl || "/images/hero-basket.jpg"}
                          alt={item.nameEn}
                          fill
                          sizes="44px"
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  <h3 className="text-[15px] font-bold text-gray-900">
                    {lang === "bn" ? combo.titleBn : combo.titleEn}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-gray-500">
                    {lang === "bn" ? combo.descBn : combo.descEn}
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3.5">
                  <span className="tabular-nums text-base font-bold text-[#0f7b3f]">
                    {formatTaka(combo.total, lang)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAddCombo(combo)}
                    className="rounded-xl bg-[#0f7b3f] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0b5e30] transition cursor-pointer"
                  >
                    {lang === "bn" ? "প্যাক যোগ করুন" : "Add Pack"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* DELIVERY SLOTS & SOBJI MEMBERSHIP */}
        <section id="slots" className="grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-200/80 bg-white p-6">
            <h3 className="text-base font-bold text-gray-900 mb-3">
              {lang === "bn"
                ? "ঢাকা ডেলিভারি টাইম স্লট"
                : "Dhaka Delivery Time Slots (Starts 6:00 AM)"}
            </h3>
            <div className="divide-y divide-gray-100 text-sm">
              {slots.map((slot) => (
                <div key={slot.id} className="flex justify-between py-2.5">
                  <span className="text-gray-700">
                    {lang === "bn" ? slot.labelBn : slot.labelEn}
                  </span>
                  <span className="tabular-nums font-semibold text-[#0f7b3f]">
                    {slot.windowText}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div
            id="farmers"
            className="flex flex-col justify-between rounded-2xl bg-[#0f7b3f] p-6 text-white"
          >
            <div id="membership">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-200">
                {lang === "bn" ? "সবজি মেম্বারশিপ" : "Sobji Membership"}
              </p>
              <h3 className="mt-1.5 text-xl font-bold">
                {lang === "bn"
                  ? `${formatTaka(FREE_DELIVERY_THRESHOLD, lang)}+ অর্ডারে ফ্রি মেম্বারশিপ`
                  : `Free Membership on ${formatTaka(FREE_DELIVERY_THRESHOLD, "en")}+ Orders`}
              </h3>
              <ul className="mt-3 space-y-1.5 text-sm text-emerald-50">
                <li>
                  {lang === "bn"
                    ? "• মেম্বারদের জন্য ২৯৯৳+ অর্ডারে ফ্রি ডেলিভারি"
                    : "• Free Delivery for Members on ৳299+"}
                </li>
                <li>
                  {lang === "bn"
                    ? "• তাজা শাক-সবজিতে মেম্বার Buy-1-Get-1 অফার"
                    : "• Member Buy-1-Get-1 Leafy Greens"}
                </li>
                <li>
                  {lang === "bn"
                    ? "• সকাল ৬টা প্রায়োরিটি ডিসপ্যাচ ও WhatsApp সাপোর্ট"
                    : "• Priority 6:00 AM Dispatch & WhatsApp Support"}
                </li>
              </ul>
              <p className="mt-4 text-xs text-emerald-100/80">
                {lang === "bn" ? "সরাসরি কৃষক:" : "Direct growers:"}{" "}
                {farmers
                  .slice(0, 4)
                  .map((f) => `${lang === "bn" ? f.nameBn : f.name} (${f.district})`)
                  .join(" · ")}
              </p>
            </div>
            <Link
              href="/account"
              className="mt-5 inline-block w-fit rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-[#0f7b3f] hover:bg-emerald-50 transition"
            >
              {lang === "bn" ? "মেম্বারশিপ দেখুন →" : "Manage Membership →"}
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
