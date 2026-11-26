"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sprout,
  Clock,
  ShieldCheck,
  FlaskConical,
  ArrowRight,
  Sparkles,
  MapPin,
  CheckCircle2,
  SlidersHorizontal,
  Flame,
  Carrot,
  Leaf,
  Utensils,
  Apple,
  Fish,
  Egg,
  Package,
} from "lucide-react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { ProductCard } from "./ProductCard";
import { useApp } from "./Providers";
import { t } from "@/lib/i18n";
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

function getCategoryIcon(iconName: string) {
  switch (iconName) {
    case "carrot":
      return Carrot;
    case "leaf":
      return Leaf;
    case "utensils":
      return Utensils;
    case "apple":
      return Apple;
    case "fish":
      return Fish;
    case "egg":
      return Egg;
    case "flame":
      return Flame;
    default:
      return Package;
  }
}

export function StorefrontHome({
  categories,
  products,
  farmers,
  slots,
}: StorefrontHomeProps) {
  const { lang } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedBadge, setSelectedBadge] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("featured");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const flashDeals = useMemo(
    () => products.filter((p) => p.isFlashDeal).slice(0, 4),
    [products]
  );

  const filteredProducts = useMemo(() => {
    let list = [...products];
    if (selectedCategory !== "all") {
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

  const badges = ["all", "Organic", "Deshi", "Farm Direct", "Morning Catch"];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar productsForSearch={products} onSearchQuery={setSearchQuery} />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden border-b border-[#e4e0d5] bg-gradient-to-br from-[#faf8f3] via-[#f2f7f0] to-[#fdf6e9]">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-12 lg:py-16">
            <div className="space-y-6 lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-[#14532d]">
                <Sprout className="h-3.5 w-3.5 text-[#16a34a]" />
                <span>{t(lang, "heroBadge")}</span>
              </div>

              <h1 className="text-3xl font-extrabold leading-[1.12] tracking-tight text-[#111c16] sm:text-5xl lg:text-[3.25rem]">
                {t(lang, "heroTitle")}
              </h1>

              <p className="max-w-2xl text-base leading-relaxed text-[#4b5e52] sm:text-lg">
                {t(lang, "heroSubtitle")}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <a
                  href="#catalog"
                  className="inline-flex items-center gap-2 rounded-full bg-[#14532d] px-6 py-3.5 text-sm font-bold text-white shadow-md hover:bg-[#166534] transition"
                >
                  <span>{t(lang, "shopNow")}</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="#slots"
                  className="inline-flex items-center gap-2 rounded-full border border-[#dcd7c9] bg-white px-5 py-3.5 text-sm font-bold text-[#111c16] hover:border-[#166534] transition"
                >
                  <Clock className="h-4 w-4 text-[#d97706]" />
                  <span>{t(lang, "exploreSlots")}</span>
                </a>
              </div>

              {/* Quick Live Metrics */}
              <div className="grid grid-cols-3 gap-4 border-t border-[#e4e0d5] pt-6 max-w-lg">
                <div>
                  <p className="font-mono text-2xl font-extrabold text-[#14532d]">
                    6:00 AM
                  </p>
                  <p className="text-xs text-[#526559]">
                    {lang === "bn" ? "ভোরের ডেলিভারি শুরু" : "First Dhaka Dispatch"}
                  </p>
                </div>
                <div>
                  <p className="font-mono text-2xl font-extrabold text-[#14532d]">
                    0%
                  </p>
                  <p className="text-xs text-[#526559]">
                    {lang === "bn" ? "মধ্যস্বত্বভোগী" : "Middlemen Markup"}
                  </p>
                </div>
                <div>
                  <p className="font-mono text-2xl font-extrabold text-[#14532d]">
                    ৳499+
                  </p>
                  <p className="text-xs text-[#526559]">
                    {lang === "bn" ? "ফ্রি ডেলিভারি ও ক্লাব" : "Free Delivery & Club"}
                  </p>
                </div>
              </div>
            </div>

            {/* Hero Editorial Visual */}
            <div className="relative lg:col-span-5">
              <div className="relative aspect-[4/3] lg:aspect-[5/4] overflow-hidden rounded-[2rem] border-4 border-white shadow-2xl">
                <Image
                  src="/images/hero-basket.jpg"
                  alt="Fresh farm-harvested Bangladeshi vegetables in bamboo basket"
                  fill
                  priority
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3 rounded-2xl bg-white/95 p-3.5 shadow-lg backdrop-blur-md">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#16a34a]">
                      {lang === "bn" ? "লাইভ সকালের ব্যাচ" : "Today's Dawn Batch"}
                    </p>
                    <p className="text-sm font-bold text-[#111c16]">
                      Bogura • Narsingdi • Munshiganj
                    </p>
                  </div>
                  <span className="rounded-xl bg-[#ecfdf5] px-3 py-1.5 font-mono text-xs font-bold text-[#14532d]">
                    5:15 AM
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TRUST PILLARS */}
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Sprout,
                title: t(lang, "trust1Title"),
                desc: t(lang, "trust1Desc"),
                bg: "bg-emerald-50 text-emerald-700",
              },
              {
                icon: Clock,
                title: t(lang, "trust2Title"),
                desc: t(lang, "trust2Desc"),
                bg: "bg-amber-50 text-amber-700",
              },
              {
                icon: ShieldCheck,
                title: t(lang, "trust3Title"),
                desc: t(lang, "trust3Desc"),
                bg: "bg-teal-50 text-teal-700",
              },
              {
                icon: FlaskConical,
                title: t(lang, "trust4Title"),
                desc: t(lang, "trust4Desc"),
                bg: "bg-lime-50 text-lime-700",
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="flex items-start gap-3.5 rounded-2xl border border-[#e4e0d5] bg-white p-4 shadow-2xs"
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.bg}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#111c16]">{item.title}</h2>
                    <p className="mt-0.5 text-xs leading-relaxed text-[#526559]">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* CATEGORY GRID */}
        <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-[#111c16] sm:text-3xl">
                {t(lang, "shopByCategory")}
              </h2>
              <p className="mt-1 text-sm text-[#526559]">
                {t(lang, "shopByCategorySub")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className="text-xs font-bold text-[#14532d] hover:underline cursor-pointer"
            >
              {t(lang, "viewAll")} ({products.length})
            </button>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {categories.map((cat) => {
              const Icon = getCategoryIcon(cat.iconName);
              const isSelected = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(isSelected ? "all" : cat.slug);
                    document
                      .getElementById("catalog")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={`group flex flex-col items-center rounded-2xl border p-3.5 text-center transition cursor-pointer ${
                    isSelected
                      ? "border-[#14532d] bg-[#14532d] text-white shadow-md"
                      : "border-[#e4e0d5] bg-white text-[#111c16] hover:border-emerald-300 hover:bg-emerald-50/40"
                  }`}
                >
                  <div
                    className={`mb-2.5 flex h-11 w-11 items-center justify-center rounded-2xl transition ${
                      isSelected
                        ? "bg-white/15 text-amber-300"
                        : "bg-[#f3efe6] text-[#14532d] group-hover:bg-emerald-100"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold leading-tight">
                    {lang === "bn" ? cat.nameBn : cat.nameEn}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* DAWN FLASH DEALS */}
        {flashDeals.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
            <div className="rounded-[2rem] border border-amber-200/80 bg-gradient-to-br from-amber-50/90 via-[#faf8f3] to-emerald-50/70 p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-800">
                    <Flame className="h-3.5 w-3.5 text-amber-600" />
                    {lang === "bn" ? "সীমিত সকালের ব্যাচ" : "Morning Harvest Drop"}
                  </span>
                  <h2 className="mt-2 text-2xl font-extrabold text-[#111c16]">
                    {t(lang, "flashDeals")}
                  </h2>
                  <p className="text-sm text-[#526559]">{t(lang, "flashDealsSub")}</p>
                </div>
                <div className="rounded-2xl bg-white px-4 py-2.5 text-xs font-semibold text-[#111c16] ring-1 ring-amber-200">
                  {lang === "bn" ? "প্রোমো কোড:" : "Use code:"}{" "}
                  <span className="font-mono font-bold text-[#ea580c]">SOBJI10</span>
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {flashDeals.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* FULL BAZAR CATALOG */}
        <section id="catalog" className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-[#111c16] sm:text-3xl">
                {t(lang, "featuredProduce")}
              </h2>
              <p className="mt-1 text-sm text-[#526559]">
                {t(lang, "featuredProduceSub")}
              </p>
            </div>

            {/* Filter & Sort Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-full border border-[#e4e0d5] bg-white px-3 py-1.5 text-xs">
                <SlidersHorizontal className="h-3.5 w-3.5 text-[#526559]" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent font-semibold text-[#111c16] focus:outline-none cursor-pointer"
                  aria-label="Sort products"
                >
                  <option value="featured">
                    {lang === "bn" ? "জনপ্রিয়" : "Featured First"}
                  </option>
                  <option value="price-asc">
                    {lang === "bn" ? "কম দাম থেকে বেশি" : "Price: Low to High"}
                  </option>
                  <option value="price-desc">
                    {lang === "bn" ? "বেশি দাম থেকে কম" : "Price: High to Low"}
                  </option>
                  <option value="rating">
                    {lang === "bn" ? "সেরা রেটিং" : "Highest Rated"}
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                selectedCategory === "all"
                  ? "bg-[#14532d] text-white"
                  : "bg-white border border-[#e4e0d5] text-[#526559] hover:border-[#14532d]"
              }`}
            >
              {t(lang, "allCategories")}
            </button>
            {badges.slice(1).map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setSelectedBadge(selectedBadge === b ? "all" : b)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                  selectedBadge === b
                    ? "bg-amber-500 text-white"
                    : "bg-white border border-[#e4e0d5] text-[#526559] hover:border-amber-400"
                }`}
              >
                {b}
              </button>
            ))}
            {(selectedCategory !== "all" || selectedBadge !== "all" || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("all");
                  setSelectedBadge("all");
                  setSearchQuery("");
                }}
                className="text-xs font-semibold text-rose-700 hover:underline ml-2 cursor-pointer"
              >
                {lang === "bn" ? "ফিল্টার রিসেট" : "Reset Filters"}
              </button>
            )}
          </div>

          {filteredProducts.length === 0 ? (
            <div className="mt-10 rounded-3xl border border-dashed border-[#dcd7c9] bg-white p-12 text-center">
              <p className="text-base font-bold text-[#111c16]">
                {lang === "bn"
                  ? "কোনো পণ্য পাওয়া যায়নি"
                  : "No matching harvest items found"}
              </p>
              <p className="mt-1 text-sm text-[#526559]">
                {lang === "bn"
                  ? "অন্য নাম বা ক্যাটাগরি দিয়ে চেষ্টা করুন।"
                  : "Try clearing filters or searching another vegetable, fish, or spice."}
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* FARMER TRACEABILITY SHOWCASE */}
        <section
          id="traceability"
          className="border-y border-[#e4e0d5] bg-[#f3efe6]/70 py-14"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid items-center gap-10 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border-4 border-white shadow-xl">
                  <Image
                    src="/images/farm-origin.jpg"
                    alt="Bangladeshi farmers harvesting fresh vegetables at golden hour"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="space-y-5 lg:col-span-7">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-[#14532d]">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#16a34a]" />
                  {lang === "bn" ? "ভেরিফাইড ফার্ম নেটওয়ার্ক" : "Verified Grower Network"}
                </span>
                <h2 className="text-2xl font-extrabold text-[#111c16] sm:text-3xl">
                  {t(lang, "traceabilityTitle")}
                </h2>
                <p className="text-sm leading-relaxed text-[#526559] sm:text-base">
                  {t(lang, "traceabilitySub")}
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  {farmers.slice(0, 4).map((farmer) => (
                    <div
                      key={farmer.id}
                      className="rounded-2xl border border-[#e4e0d5] bg-white p-4 shadow-2xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-bold text-[#111c16]">
                          {lang === "bn" ? farmer.nameBn : farmer.name}
                        </p>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-[#14532d]">
                          <MapPin className="h-2.5 w-2.5" />
                          {farmer.district}
                        </span>
                      </div>
                      <p className="mt-1 text-xs font-semibold text-[#166534]">
                        {farmer.specialty}
                      </p>
                      <p className="mt-1.5 text-xs leading-relaxed text-[#526559] line-clamp-2">
                        {lang === "bn" ? farmer.storyBn : farmer.storyEn}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* RIVER FISH & SPICES SPOTLIGHT + DELIVERY SLOTS & CLUB */}
        <section id="slots" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 space-y-10">
          {/* River Fish & Spices Banner */}
          <div className="grid overflow-hidden rounded-[2rem] border border-[#e4e0d5] bg-white shadow-sm lg:grid-cols-12">
            <div className="relative min-h-[260px] lg:col-span-5">
              <Image
                src="/images/fresh-fish-spices.jpg"
                alt="Fresh Padma river fish and authentic Bangladeshi spices"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-col justify-center space-y-4 p-7 sm:p-10 lg:col-span-7">
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-800">
                {lang === "bn"
                  ? "নদীর মাছ ও খাঁটি মসলা"
                  : "Morning River Catch & Pure Spices"}
              </span>
              <h2 className="text-2xl font-extrabold text-[#111c16] sm:text-3xl">
                {lang === "bn"
                  ? "পদ্মার তাজা মাছ, ঘানির তেল ও বগুড়ার মসলা — একই ব্যাগে"
                  : "Padma River Fish, Ghani Mustard Oil & Stone-Ground Spices"}
              </h2>
              <p className="text-sm leading-relaxed text-[#526559]">
                {lang === "bn"
                  ? "ফরমালিন ছাড়া বরফে সংরক্ষিত নদীর মাছ, নিজস্ব মিলে ভাঙানো হলুদ-মরিচ এবং কাঠের ঘানির সরিষার তেল অর্ডার করুন।"
                  : "Pair your daily vegetables with descaled Chandpur river Rui, Pabna wooden-ghani mustard oil, and lab-tested stone-ground turmeric."}
              </p>
              <div className="flex flex-wrap gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory("river-fish");
                    document
                      .getElementById("catalog")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="rounded-full bg-[#14532d] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#166534] transition cursor-pointer"
                >
                  {lang === "bn" ? "মাছ ও প্রোটিন দেখুন" : "Browse River Fish"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory("spices-herbs");
                    document
                      .getElementById("catalog")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="rounded-full border border-[#dcd7c9] px-5 py-2.5 text-xs font-bold text-[#111c16] hover:border-[#14532d] transition cursor-pointer"
                >
                  {lang === "bn" ? "মসলা ও তেল দেখুন" : "Shop Spices & Oil"}
                </button>
              </div>
            </div>
          </div>

          {/* Delivery Slots + Sobji Club */}
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="rounded-3xl border border-[#e4e0d5] bg-white p-6 sm:p-8 lg:col-span-7">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#166534]">
                <Clock className="h-4 w-4" />
                <span>
                  {lang === "bn" ? "ঢাকা ডেলিভারি সময়সূচি" : "Dhaka Delivery Windows"}
                </span>
              </div>
              <h3 className="mt-2 text-xl font-extrabold text-[#111c16]">
                {lang === "bn"
                  ? "আপনার সুবিধামতো স্লট বেছে নিন"
                  : "Flexible Slots Starting 6:00 AM"}
              </h3>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {slots.map((slot) => (
                  <div
                    key={slot.id}
                    className={`rounded-2xl border p-3.5 ${
                      slot.isExpress
                        ? "border-amber-300 bg-amber-50/70"
                        : "border-[#e4e0d5] bg-[#faf8f3]"
                    }`}
                  >
                    <p className="text-sm font-bold text-[#111c16]">
                      {lang === "bn" ? slot.labelBn : slot.labelEn}
                    </p>
                    <p className="mt-0.5 font-mono text-xs font-semibold text-[#14532d]">
                      {slot.windowText}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-3xl bg-gradient-to-br from-[#14532d] via-[#166534] to-[#0f3f22] p-6 sm:p-8 text-white lg:col-span-5 shadow-lg">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 px-3 py-1 text-xs font-bold text-amber-300 ring-1 ring-amber-300/30">
                  <Sparkles className="h-3.5 w-3.5" />
                  {t(lang, "sobjiClub")}
                </span>
                <h3 className="mt-4 text-2xl font-extrabold">{t(lang, "clubTitle")}</h3>
                <p className="mt-2 text-sm leading-relaxed text-emerald-100/90">
                  {t(lang, "clubSub")}
                </p>
                <ul className="mt-4 space-y-2 text-xs text-emerald-100">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-300" />
                    Free delivery on orders ৳299+
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-300" />
                    Weekly automated family bazar schedule
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-300" />
                    Priority 6:00 AM morning crate reservation
                  </li>
                </ul>
              </div>
              <Link
                href="/account"
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-amber-400 px-5 py-3 text-sm font-extrabold text-[#111c16] hover:bg-amber-300 transition"
              >
                <span>{t(lang, "joinClub")}</span>
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
