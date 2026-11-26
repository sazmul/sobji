"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
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
    eyebrowEn: "Direct From Farmers • Zero Middleman",
    eyebrowBn: "সরাসরি কৃষকের ক্ষেত থেকে • কোনো ফড়িয়া নেই",
    titleEn: "Fresh vegetables harvested at dawn, delivered by 6:00 AM.",
    titleBn: "ভোরবেলা তোলা তাজা সবজি, সকাল ৬টা থেকেই আপনার বাসায়।",
    subEn:
      "Fair price for Bangladeshi farmers and lower daily bazar prices for your home.",
    subBn:
      "কৃষকের ন্যায্য দাম ও আপনার প্রতিদিনের বাজারে সাশ্রয়ী এবং খাঁটি পণ্যের নিশ্চয়তা।",
    ctaEn: "Shop Fresh Vegetables",
    ctaBn: "তাজা সবজি দেখুন",
    img: "/images/hero-basket.jpg",
    targetCat: "fresh-vegetables",
  },
  {
    eyebrowEn: "Flexible Dhaka Delivery Slots",
    eyebrowBn: "ঢাকা জুড়ে সহজ ডেলিভারি স্লট",
    titleEn: "Your order, your preferred time slot across Dhaka.",
    titleBn: "আপনার অর্ডার, আপনার সুবিধামতো ডেলিভারি স্লট।",
    subEn:
      "Choose early morning, afternoon, evening, or 60-minute express delivery.",
    subBn:
      "সকাল, দুপুর, সন্ধ্যা অথবা ৬০ মিনিটে এক্সপ্রেস ডেলিভারি বেছে নিন সহজেই।",
    ctaEn: "View Weekly Deals",
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
    <div className="min-h-screen flex flex-col bg-[#f9faf8]">
      <Navbar
        productsForSearch={products}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onSearchQuery={setSearchQuery}
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 space-y-10">
        {/* CLEAN FULL-WIDTH HERO BANNER */}
        <section className="relative overflow-hidden rounded-2xl border border-gray-200/80 bg-[#edf5ef]">
          <div className="grid md:grid-cols-12 items-center">
            <div className="p-7 sm:p-10 md:col-span-6 space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#0f7b3f]">
                {lang === "bn" ? activeSlide.eyebrowBn : activeSlide.eyebrowEn}
              </p>
              <h1 className="text-2xl font-bold leading-tight text-gray-900 sm:text-4xl">
                {lang === "bn" ? activeSlide.titleBn : activeSlide.titleEn}
              </h1>
              <p className="text-sm leading-relaxed text-gray-600 sm:text-base">
                {lang === "bn" ? activeSlide.subBn : activeSlide.subEn}
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory(activeSlide.targetCat);
                    document
                      .getElementById("catalog")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0f7b3f] px-5 py-3 text-sm font-semibold text-white hover:bg-[#0b5e30] transition cursor-pointer"
                >
                  <span>{lang === "bn" ? activeSlide.ctaBn : activeSlide.ctaEn}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <a
                  href="#slots"
                  className="inline-flex items-center rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-800 hover:border-[#0f7b3f] transition"
                >
                  {lang === "bn" ? "ডেলিভারি স্লট" : "Delivery Slots"}
                </a>
              </div>
            </div>

            <div className="relative h-60 sm:h-72 md:h-96 md:col-span-6">
              <Image
                src={activeSlide.img}
                alt={activeSlide.titleEn}
                fill
                priority
                className="object-cover"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              setSlideIdx((s) => (s - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)
            }
            aria-label="Previous slide"
            className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-sm hover:bg-white cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setSlideIdx((s) => (s + 1) % HERO_SLIDES.length)}
            aria-label="Next slide"
            className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-sm hover:bg-white cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
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
                      ? "border-[#0f7b3f] ring-2 ring-[#0f7b3f]/20"
                      : "border-gray-200/80 hover:border-[#0f7b3f]/40 hover:shadow-sm"
                  }`}
                >
                  <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={thumb}
                      alt={cat.nameEn}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
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
                {filteredProducts.length} items available • Choose pack weight directly
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
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
                  {b === "all" ? "All" : b}
                </button>
              ))}

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-800 cursor-pointer focus:outline-none"
              >
                <option value="featured">Sort: Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
              <p className="text-sm font-semibold text-gray-900">
                No items found for this filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("all");
                  setSelectedBadge("all");
                  setSearchQuery("");
                }}
                className="mt-3 rounded-xl bg-[#0f7b3f] px-4 py-2 text-xs font-semibold text-white cursor-pointer"
              >
                Reset Filters
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

        {/* WEEKLY DISCOUNTS */}
        {selectedCategory === "all" && flashDeals.length > 0 && (
          <section id="flash-deals" className="rounded-2xl border border-gray-200/80 bg-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
                  {lang === "bn" ? "সাপ্তাহিক ডিসকাউন্ট" : "Weekly Discounts"}
                </h2>
                <p className="text-xs text-gray-500">
                  Fresh morning batch savings straight from partner farms
                </p>
              </div>
              <span className="rounded-lg bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700">
                Use Code: SOBJI10 (10% Off)
              </span>
            </div>
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
              {flashDeals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* RECIPE COMBO PACKS */}
        <section id="recipes">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
              {lang === "bn" ? "এক ক্লিকে রান্নার কম্বো" : "Recipes & Ready Bazar Kits"}
            </h2>
            <p className="text-xs text-gray-500">
              Add all ingredients for a complete Bengali meal in one tap
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {recipeCombos.map((combo, idx) => (
              <div
                key={idx}
                className="flex flex-col justify-between rounded-2xl border border-gray-200/80 bg-white p-5"
              >
                <div>
                  <h3 className="text-[15px] font-semibold text-gray-900">
                    {lang === "bn" ? combo.titleBn : combo.titleEn}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-gray-500">
                    {combo.descEn}
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
                    Add Pack
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
            id="membership"
            className="flex flex-col justify-between rounded-2xl border border-gray-200/80 bg-[#0f7b3f] p-6 text-white"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-200">
                Sobji Membership
              </p>
              <h3 className="mt-1.5 text-xl font-bold">
                Free Membership on ৳499+ Orders
              </h3>
              <ul className="mt-3 space-y-1.5 text-sm text-emerald-50">
                <li>• Free Delivery for Members on ৳299+</li>
                <li>• Member Buy-1-Get-1 Leafy Greens</li>
                <li>• Priority 6:00 AM Dispatch & WhatsApp Support</li>
              </ul>
              <p className="mt-4 text-xs text-emerald-100/80">
                Direct growers:{" "}
                {farmers
                  .slice(0, 4)
                  .map((f) => `${f.name} (${f.district})`)
                  .join(" · ")}
              </p>
            </div>
            <Link
              href="/account"
              className="mt-5 inline-block w-fit rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-[#0f7b3f] hover:bg-emerald-50 transition"
            >
              Manage Membership →
            </Link>
          </div>
        </section>
      </main>

      {/* Clean Trust Strip */}
      <section className="mt-8 border-t border-gray-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-6 text-xs sm:px-6 md:grid-cols-4">
          <div>
            <p className="font-semibold text-gray-900 text-sm">Fresh Every Morning</p>
            <p className="mt-0.5 text-gray-500">Harvested straight from fields</p>
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Lower Than Bazar Price</p>
            <p className="mt-0.5 text-gray-500">Direct sourcing, zero middlemen</p>
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">6:00 AM Delivery Slots</p>
            <p className="mt-0.5 text-gray-500">COD, bKash, Nagad & Cards</p>
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">24h Freshness Guarantee</p>
            <p className="mt-0.5 text-gray-500">Instant replacement if not crisp</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
