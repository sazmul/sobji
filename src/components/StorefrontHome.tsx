"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ChevronRight as ArrowSmall,
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
    eyebrowEn: "STRAIGHT FROM THE FIELD",
    eyebrowBn: "সরাসরি কৃষকের ক্ষেত থেকে",
    titleEn: "No Middleman. Fair price for the farmer, lower price for you.",
    titleBn: "কোনো ফড়িয়া নেই। কৃষকের ন্যায্য দাম, আপনার সাশ্রয়।",
    subEn: "Morning-fresh vegetables, shak, river fish & pure spices delivered from 6:00 AM.",
    subBn: "ভোর ৬টা থেকেই ঢাকায় তাজা সবজি, শাক, নদীর মাছ ও খাঁটি মসলা ডেলিভারি।",
    ctaEn: "Shop Vegetables",
    ctaBn: "সবজি দেখুন",
    img: "/images/hero-basket.jpg",
    targetCat: "fresh-vegetables",
  },
  {
    eyebrowEn: "6:00 AM EARLY BIRD DELIVERY",
    eyebrowBn: "সকাল ৬টা থেকে ডেলিভারি",
    titleEn: "Freshness Just Landed. Choose Your Own Delivery Slot.",
    titleBn: "ভোরের তাজা সংগ্রহ — আপনার সুবিধামতো স্লট বেছে নিন।",
    subEn: "Same-day morning, afternoon, evening, or 60-minute express delivery across Dhaka.",
    subBn: "সকাল, দুপুর, সন্ধ্যা বা ৬০ মিনিটে এক্সপ্রেস ডেলিভারি পুরো ঢাকায়।",
    ctaEn: "View Weekly Deals",
    ctaBn: "অফার দেখুন",
    img: "/images/farm-origin.jpg",
    targetCat: "flash",
  },
  {
    eyebrowEn: "FORMALIN-FREE RIVER FISH & GHANI OIL",
    eyebrowBn: "ফরমালিনমুক্ত নদীর মাছ ও ঘানির তেল",
    titleEn: "Chandpur Padma Rui, Deshi Sonali & Cold-Pressed Oil.",
    titleBn: "চাঁদপুরের পদ্মার রুই, দেশি মুরগি ও কাঠের ঘানির সরিষার তেল।",
    subEn: "Cleaned, cut, and packed fresh with zero chemical preservatives.",
    subBn: "পরিষ্কার করে কেটে কোনো প্রিজারভেটিভ ছাড়াই আপনার দরজায়।",
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

  const recipeCombos = useMemo(() => {
    const findProd = (slug: string) => products.find((p) => p.slug === slug);
    const defs = [
      {
        titleEn: "Deshi Bhorta & Dal Kit",
        titleBn: "দেশি ভর্তা ও ডাল প্যাক",
        descEn: "Tomato, Lal Shak, Deshi Onion, Green Chilli, Moshur Dal",
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
        descEn: "Padma Rui Steaks, Diamond Potato, Bottle Gourd, Turmeric",
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
        descEn: "Ready Mix Bhaji, Peeled Garlic-Ginger, Farm Eggs, Sagar Kola",
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
    showToast(`${combo.titleEn} added to bag!`);
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

      {/* Main Storefront Grid: Real Bangladeshi Supermarket Sidebar + Content */}
      <div className="mx-auto w-full max-w-[1360px] flex-1 px-4 py-5 sm:px-6">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* LEFT DEPARTMENT SIDEBAR (Desktop Sticky — Real Chaldal/Sobji Supermarket Pattern) */}
          <aside className="hidden lg:block w-60 shrink-0">
            <div className="sticky top-20 rounded-lg border border-[#e5e7eb] bg-white overflow-hidden">
              <div className="border-b border-[#e5e7eb] bg-[#f7f8f7] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#333333]">
                {lang === "bn" ? "ক্যাটাগরি" : "Categories"}
              </div>
              <nav className="divide-y divide-[#f3f4f6] text-[13px]">
                <button
                  type="button"
                  onClick={() => setSelectedCategory("all")}
                  className={`flex w-full items-center justify-between px-4 py-2.5 text-left transition cursor-pointer ${
                    selectedCategory === "all"
                      ? "bg-[#eef7f0] font-bold text-[#1b8e3d]"
                      : "text-[#333333] hover:bg-[#f9fafb]"
                  }`}
                >
                  <span>{lang === "bn" ? "সব পণ্য" : "All Products"}</span>
                  <span className="font-mono text-[11px] text-[#888888]">
                    {products.length}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory("flash")}
                  className={`flex w-full items-center justify-between px-4 py-2.5 text-left transition cursor-pointer ${
                    selectedCategory === "flash"
                      ? "bg-[#fef2f2] font-bold text-[#dc2626]"
                      : "text-[#dc2626] font-semibold hover:bg-[#fff5f5]"
                  }`}
                >
                  <span>{lang === "bn" ? "সাপ্তাহিক ডিসকাউন্ট" : "Weekly Discounts"}</span>
                  <ArrowSmall className="h-3.5 w-3.5" />
                </button>
                {categories.map((cat) => {
                  const active = selectedCategory === cat.slug;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.slug)}
                      className={`flex w-full items-center justify-between px-4 py-2.5 text-left transition cursor-pointer ${
                        active
                          ? "bg-[#eef7f0] font-bold text-[#1b8e3d]"
                          : "text-[#333333] hover:bg-[#f9fafb]"
                      }`}
                    >
                      <span className="truncate">
                        {lang === "bn" ? cat.nameBn : cat.nameEn}
                      </span>
                      <ArrowSmall className="h-3.5 w-3.5 text-[#9ca3af] shrink-0" />
                    </button>
                  );
                })}
              </nav>

              <div className="border-t border-[#e5e7eb] bg-[#f7f8f7] p-4 space-y-2 text-xs">
                <p className="font-bold text-[#1a1a1a]">Promo Codes</p>
                <p className="font-mono text-[11px] text-[#1b8e3d]">
                  SOBJI10 · FRESH50
                </p>
                <Link
                  href="/track?code=SBJ-DEMO01"
                  className="block pt-1 font-semibold text-[#333333] underline hover:text-[#1b8e3d]"
                >
                  Track Order (SBJ-DEMO01)
                </Link>
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT COLUMN */}
          <main className="min-w-0 flex-1 space-y-8">
            {/* BRIGHT, UN-DARKENED RETAIL HERO BANNER */}
            <section className="relative overflow-hidden rounded-lg border border-[#e5e7eb] bg-[#f4f7f4]">
              <div className="grid md:grid-cols-12 items-center">
                <div className="p-6 sm:p-8 md:col-span-6 space-y-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#1b8e3d]">
                    {lang === "bn" ? activeSlide.eyebrowBn : activeSlide.eyebrowEn}
                  </p>
                  <h1 className="text-2xl font-extrabold leading-snug text-[#1a1a1a] sm:text-3xl">
                    {lang === "bn" ? activeSlide.titleBn : activeSlide.titleEn}
                  </h1>
                  <p className="text-sm text-[#555555]">
                    {lang === "bn" ? activeSlide.subBn : activeSlide.subEn}
                  </p>
                  <div className="flex flex-wrap gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory(activeSlide.targetCat);
                        document
                          .getElementById("catalog")
                          ?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="rounded bg-[#1b8e3d] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#147230] transition cursor-pointer"
                    >
                      {lang === "bn" ? activeSlide.ctaBn : activeSlide.ctaEn}
                    </button>
                    <a
                      href="#slots"
                      className="rounded border border-[#d1d5db] bg-white px-4 py-2.5 text-xs font-bold text-[#1a1a1a] hover:border-[#1b8e3d]"
                    >
                      {lang === "bn" ? "ডেলিভারি স্লট" : "Delivery Slots"}
                    </a>
                  </div>
                </div>

                <div className="relative h-56 sm:h-72 md:h-80 md:col-span-6">
                  <Image
                    src={activeSlide.img}
                    alt={activeSlide.titleEn}
                    fill
                    priority
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Subtle Slider Arrows */}
              <button
                type="button"
                onClick={() =>
                  setSlideIdx((s) => (s - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)
                }
                aria-label="Previous slide"
                className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#1a1a1a] shadow hover:bg-white cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setSlideIdx((s) => (s + 1) % HERO_SLIDES.length)}
                aria-label="Next slide"
                className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#1a1a1a] shadow hover:bg-white cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </section>

            {/* VISUAL CATEGORY TILES (Mobile + Desktop Quick Browse) */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-[#1a1a1a]">
                  {lang === "bn" ? "ক্যাটাগরি অনুযায়ী বাজার" : "Explore by Categories"}
                </h2>
                <button
                  type="button"
                  onClick={() => setSelectedCategory("all")}
                  className="text-xs font-bold text-[#1b8e3d] hover:underline cursor-pointer"
                >
                  View All
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-8">
                {categories.map((cat) => {
                  const active = selectedCategory === cat.slug;
                  const thumb = CATEGORY_THUMBS[cat.slug] || "/images/hero-basket.jpg";
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(active ? "all" : cat.slug)}
                      className={`overflow-hidden rounded-lg border text-center transition cursor-pointer ${
                        active
                          ? "border-[#1b8e3d] ring-1 ring-[#1b8e3d]"
                          : "border-[#e5e7eb] bg-white hover:border-[#b9c4bc]"
                      }`}
                    >
                      <div className="aspect-[4/3] w-full overflow-hidden bg-[#f7f8f7]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={thumb}
                          alt={cat.nameEn}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <p className="truncate px-1.5 py-1.5 text-[11px] font-semibold text-[#1a1a1a]">
                        {lang === "bn" ? cat.nameBn : cat.nameEn}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* MAIN PRODUCT CATALOG (Right Up Front!) */}
            <section id="catalog">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e5e7eb] pb-3 mb-4">
                <div>
                  <h2 className="text-lg font-bold text-[#1a1a1a]">
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
                  <p className="text-xs text-[#666666]">
                    {filteredProducts.length} items available
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {["all", "Organic", "Deshi", "Farm Direct"].map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setSelectedBadge(b)}
                      className={`rounded border px-2.5 py-1 text-xs font-medium cursor-pointer ${
                        selectedBadge === b
                          ? "border-[#1b8e3d] bg-[#1b8e3d] text-white"
                          : "border-[#e5e7eb] bg-white text-[#444444] hover:border-[#1b8e3d]"
                      }`}
                    >
                      {b === "all" ? "All" : b}
                    </button>
                  ))}

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="rounded border border-[#e5e7eb] bg-white px-2.5 py-1 text-xs font-medium text-[#1a1a1a] cursor-pointer"
                  >
                    <option value="featured">Sort: Featured</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                  </select>
                </div>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="rounded-lg border border-[#e5e7eb] bg-[#f7f8f7] p-10 text-center">
                  <p className="text-sm font-semibold text-[#1a1a1a]">
                    No items found for this filter.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory("all");
                      setSelectedBadge("all");
                      setSearchQuery("");
                    }}
                    className="mt-3 rounded bg-[#1b8e3d] px-4 py-2 text-xs font-bold text-white cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid gap-3.5 grid-cols-2 sm:grid-cols-3 xl:grid-cols-4">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </section>

            {/* WEEKLY DISCOUNTS ROW (When viewing All) */}
            {selectedCategory === "all" && flashDeals.length > 0 && (
              <section id="flash-deals" className="pt-2">
                <div className="flex items-center justify-between border-b border-[#e5e7eb] pb-2.5 mb-4">
                  <h2 className="text-base font-bold text-[#1a1a1a]">
                    {lang === "bn" ? "সাপ্তাহিক ডিসকাউন্ট" : "Weekly Discounts"}
                  </h2>
                  <span className="font-mono text-xs font-semibold text-[#dc2626]">
                    Extra 10% off: SOBJI10
                  </span>
                </div>
                <div className="grid gap-3.5 grid-cols-2 sm:grid-cols-3 xl:grid-cols-4">
                  {flashDeals.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            )}

            {/* RECIPE COMBO PACKS */}
            <section id="recipes" className="pt-2">
              <div className="border-b border-[#e5e7eb] pb-2.5 mb-4">
                <h2 className="text-base font-bold text-[#1a1a1a]">
                  {lang === "bn" ? "এক ক্লিকে রান্নার কম্বো" : "Recipes & Ready Bazar Kits"}
                </h2>
              </div>
              <div className="grid gap-3.5 md:grid-cols-3">
                {recipeCombos.map((combo, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col justify-between rounded-lg border border-[#e5e7eb] bg-[#f9fafb] p-4"
                  >
                    <div>
                      <h3 className="text-sm font-bold text-[#1a1a1a]">
                        {lang === "bn" ? combo.titleBn : combo.titleEn}
                      </h3>
                      <p className="mt-1 text-xs text-[#666666]">{combo.descEn}</p>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-[#e5e7eb] pt-3">
                      <span className="font-mono text-sm font-bold text-[#1b8e3d]">
                        {formatTaka(combo.total, lang)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAddCombo(combo)}
                        className="rounded bg-[#1b8e3d] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#147230] cursor-pointer"
                      >
                        Add Pack
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* COMPACT DELIVERY SLOTS, FARMERS & MEMBERSHIP INFO TABLES */}
            <section id="slots" className="grid gap-4 md:grid-cols-2 pt-2">
              <div className="rounded-lg border border-[#e5e7eb] bg-white p-5">
                <h3 className="text-sm font-bold text-[#1a1a1a] mb-3">
                  {lang === "bn"
                    ? "ঢাকা ডেলিভারি টাইম স্লট"
                    : "Dhaka Delivery Time Slots (Starts 6:00 AM)"}
                </h3>
                <div className="divide-y divide-[#f3f4f6] text-xs">
                  {slots.map((slot) => (
                    <div key={slot.id} className="flex justify-between py-2">
                      <span className="text-[#333333]">
                        {lang === "bn" ? slot.labelBn : slot.labelEn}
                      </span>
                      <span className="font-mono font-semibold text-[#1b8e3d]">
                        {slot.windowText}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div
                id="membership"
                className="flex flex-col justify-between rounded-lg border border-[#e5e7eb] bg-[#f7f8f7] p-5"
              >
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#1b8e3d]">
                    Sobji Membership
                  </p>
                  <h3 className="mt-1 text-base font-bold text-[#1a1a1a]">
                    Free Membership on ৳499+ Orders
                  </h3>
                  <ul className="mt-2.5 space-y-1 text-xs text-[#555555]">
                    <li>• Free Delivery for Members on ৳299+</li>
                    <li>• Member Buy-1-Get-1 Leafy Greens</li>
                    <li>• Direct WhatsApp Ordering & Priority Support</li>
                  </ul>
                  <p className="mt-3 text-xs text-[#666666]">
                    Direct growers:{" "}
                    {farmers
                      .slice(0, 4)
                      .map((f) => `${f.name} (${f.district})`)
                      .join(" · ")}
                  </p>
                </div>
                <Link
                  href="/account"
                  className="mt-4 inline-block w-fit rounded bg-[#1b8e3d] px-4 py-2 text-xs font-bold text-white hover:bg-[#147230]"
                >
                  Manage Membership →
                </Link>
              </div>
            </section>
          </main>
        </div>
      </div>

      {/* Simple Commercial Trust Strip Before Footer */}
      <section className="border-t border-[#e5e7eb] bg-[#f7f8f7]">
        <div className="mx-auto grid max-w-[1360px] grid-cols-2 gap-4 px-4 py-5 text-xs sm:px-6 md:grid-cols-4">
          <div>
            <p className="font-bold text-[#1a1a1a]">Fresh Every Morning</p>
            <p className="text-[#666666]">Harvested straight from fields</p>
          </div>
          <div>
            <p className="font-bold text-[#1a1a1a]">Lower Than Bazar Price</p>
            <p className="text-[#666666]">Direct sourcing, zero middlemen</p>
          </div>
          <div>
            <p className="font-bold text-[#1a1a1a]">6:00 AM Delivery Slots</p>
            <p className="text-[#666666]">Cash on delivery, bKash & Nagad</p>
          </div>
          <div>
            <p className="font-bold text-[#1a1a1a]">24h Freshness Guarantee</p>
            <p className="text-[#666666]">Instant replacement if not crisp</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
