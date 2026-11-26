"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
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
        {/* EDITORIAL HERO */}
        <section className="border-b border-[#e7e2d8] bg-[#fbf9f5]">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-12 lg:py-20">
            <div className="space-y-6 lg:col-span-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#a14a18]">
                {lang === "bn"
                  ? "বগুড়া ও নরসিংদী • সরাসরি খামার থেকে"
                  : "Farm-to-Kitchen • Dhaka Metro"}
              </p>

              <h1 className="font-display text-4xl font-medium leading-[1.06] text-[#112218] sm:text-5xl lg:text-[3.75rem]">
                {lang === "bn" ? (
                  "ভোরের তাজা বাজার, সরাসরি কৃষকের ক্ষেত থেকে।"
                ) : (
                  <>
                    Morning-fresh bazar,{" "}
                    <em className="font-normal italic text-[#143624]">
                      straight from the field.
                    </em>
                  </>
                )}
              </h1>

              <p className="max-w-xl text-sm leading-relaxed text-[#4c5b51] sm:text-base">
                {t(lang, "heroSubtitle")}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href="#catalog"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#143624] px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#1d4a32] transition"
                >
                  <span>{t(lang, "shopNow")}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
                <a
                  href="#traceability"
                  className="inline-flex items-center gap-2 rounded-lg border border-[#d5cfc2] bg-white px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-[#112218] hover:border-[#143624] transition"
                >
                  <span>{lang === "bn" ? "খামারের উৎস দেখুন" : "Inspect Farm Origins"}</span>
                </a>
              </div>

              <div className="grid grid-cols-3 gap-6 border-t border-[#e7e2d8] pt-6 max-w-md text-xs">
                <div>
                  <p className="font-mono text-base font-bold text-[#112218]">06:00 AM</p>
                  <p className="mt-0.5 text-[#5b695f]">First Dhaka dispatch</p>
                </div>
                <div>
                  <p className="font-mono text-base font-bold text-[#112218]">0% Formalin</p>
                  <p className="mt-0.5 text-[#5b695f]">Batch screened daily</p>
                </div>
                <div>
                  <p className="font-mono text-base font-bold text-[#112218]">24 Hours</p>
                  <p className="mt-0.5 text-[#5b695f]">Crispness guarantee</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="overflow-hidden rounded-2xl border border-[#e7e2d8] bg-white">
                <div className="relative aspect-[4/3]">
                  <Image
                    src="/images/hero-basket.jpg"
                    alt="Fresh Bangladeshi farm harvest basket"
                    fill
                    priority
                    className="object-cover"
                  />
                </div>
                <div className="flex items-center justify-between border-t border-[#e7e2d8] px-5 py-3 text-xs">
                  <span className="font-medium text-[#112218]">
                    Batch #042 — Bogura, Narsingdi & Munshiganj
                  </span>
                  <span className="font-mono text-[11px] text-[#5b695f]">
                    Harvested 04:45 AM
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CATEGORY INDEX STRIP */}
        <section className="border-b border-[#e7e2d8] bg-white">
          <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-4 py-4 sm:px-6">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`shrink-0 rounded-lg px-4 py-2 text-xs font-semibold transition cursor-pointer ${
                selectedCategory === "all"
                  ? "bg-[#143624] text-white"
                  : "bg-[#f5f3ee] text-[#4c5b51] hover:text-[#112218]"
              }`}
            >
              {t(lang, "allCategories")} ({products.length})
            </button>
            {categories.map((cat) => {
              const active = selectedCategory === cat.slug;
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
                  className={`shrink-0 rounded-lg px-4 py-2 text-xs font-semibold transition cursor-pointer ${
                    active
                      ? "bg-[#143624] text-white"
                      : "bg-[#f5f3ee] text-[#4c5b51] hover:text-[#112218]"
                  }`}
                >
                  {lang === "bn" ? cat.nameBn : cat.nameEn}
                </button>
              );
            })}
          </div>
        </section>

        {/* SECTION 01: DAWN HARVEST SPECIALS */}
        {flashDeals.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 pt-14 pb-6 sm:px-6">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#e7e2d8] pb-4 mb-8">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#a14a18]">
                  01 / Morning Harvest Drops
                </p>
                <h2 className="mt-1 font-display text-3xl font-medium text-[#112218]">
                  {t(lang, "flashDeals")}
                </h2>
              </div>
              <p className="text-xs text-[#5b695f]">
                Extra 10% off ৳350+ with code{" "}
                <span className="font-mono font-semibold text-[#112218]">SOBJI10</span>
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {flashDeals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* SECTION 02: COMPLETE BAZAR CATALOG */}
        <section id="catalog" className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="flex flex-col gap-4 border-b border-[#e7e2d8] pb-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#5b695f]">
                02 / Daily Market
              </p>
              <h2 className="mt-1 font-display text-3xl font-medium text-[#112218]">
                {t(lang, "featuredProduce")}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {badges.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setSelectedBadge(b)}
                  className={`rounded-md border px-3 py-1.5 text-[11px] font-semibold transition cursor-pointer ${
                    selectedBadge === b
                      ? "border-[#143624] bg-[#143624] text-white"
                      : "border-[#e7e2d8] bg-white text-[#4c5b51] hover:border-[#143624]"
                  }`}
                >
                  {b === "all" ? (lang === "bn" ? "সব মান" : "All Grades") : b}
                </button>
              ))}

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-md border border-[#e7e2d8] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#112218] focus:outline-none cursor-pointer"
                aria-label="Sort produce"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="mt-10 rounded-xl border border-[#e7e2d8] bg-white p-14 text-center">
              <p className="font-display text-xl text-[#112218]">
                No produce matches your current filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("all");
                  setSelectedBadge("all");
                  setSearchQuery("");
                }}
                className="mt-4 rounded-lg bg-[#143624] px-5 py-2.5 text-xs font-semibold text-white cursor-pointer"
              >
                Show All Harvest Items
              </button>
            </div>
          ) : (
            <div className="mt-8 grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* SECTION 03: EDITORIAL PROVENANCE & GROWERS */}
        <section
          id="traceability"
          className="border-y border-[#e7e2d8] bg-[#f5f3ee] py-16"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid items-center gap-12 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <div className="overflow-hidden rounded-2xl border border-[#ded8cc] bg-white">
                  <div className="relative aspect-[4/3]">
                    <Image
                      src="/images/farm-origin.jpg"
                      alt="Bangladeshi partner farmers harvesting vegetables"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6 lg:col-span-7">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#a14a18]">
                    03 / Farm Traceability
                  </p>
                  <h2 className="mt-1 font-display text-3xl font-medium text-[#112218] sm:text-4xl">
                    {t(lang, "traceabilityTitle")}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-[#4c5b51]">
                    {t(lang, "traceabilitySub")}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {farmers.slice(0, 4).map((farmer) => (
                    <div
                      key={farmer.id}
                      className="rounded-xl border border-[#e7e2d8] bg-white p-4"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="inline-flex items-center gap-1 font-mono font-semibold text-[#143624]">
                          <MapPin className="h-3 w-3" />
                          {farmer.upazila}, {farmer.district}
                        </span>
                        <span className="text-[#5b695f]">{farmer.yearsActive} yrs</span>
                      </div>
                      <h3 className="mt-1.5 text-sm font-semibold text-[#112218]">
                        {lang === "bn" ? farmer.nameBn : farmer.name}
                      </h3>
                      <p className="text-xs font-medium text-[#a14a18]">
                        {farmer.specialty}
                      </p>
                      <p className="mt-1.5 text-xs leading-relaxed text-[#5b695f] line-clamp-2">
                        {lang === "bn" ? farmer.storyBn : farmer.storyEn}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 04: RIVER FISH & SPICE ATELIER + LOGISTICS & CLUB */}
        <section id="slots" className="mx-auto max-w-7xl px-4 pt-16 sm:px-6 space-y-12">
          <div className="grid overflow-hidden rounded-2xl border border-[#e7e2d8] bg-white lg:grid-cols-12">
            <div className="relative min-h-[280px] lg:col-span-5">
              <Image
                src="/images/fresh-fish-spices.jpg"
                alt="Fresh Padma river fish and stone-ground spices"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-col justify-center space-y-4 p-8 sm:p-12 lg:col-span-7">
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#a14a18]">
                04 / Cold Chain & Pantry
              </p>
              <h2 className="font-display text-3xl font-medium text-[#112218]">
                {lang === "bn"
                  ? "পদ্মার তাজা মাছ, ঘানির তেল ও খাঁটি মসলা"
                  : "Chandpur River Catch & Wooden-Ghani Pantry"}
              </h2>
              <p className="text-sm leading-relaxed text-[#4c5b51]">
                {lang === "bn"
                  ? "ফরমালিন ছাড়া বরফে সংরক্ষিত নদীর মাছ, নিজস্ব মিলে ভাঙানো হলুদ-মরিচ ও কাঠের ঘানির সরিষার তেল।"
                  : "Formalin-free morning Padma Rui cut to order, paired with unpolished deshi moshur dal, cold-pressed mustard oil, and single-origin spices."}
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory("river-fish");
                    document
                      .getElementById("catalog")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="rounded-lg bg-[#143624] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#1d4a32] transition cursor-pointer"
                >
                  Shop River Fish
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory("organic-pantry");
                    document
                      .getElementById("catalog")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="rounded-lg border border-[#d5cfc2] px-5 py-2.5 text-xs font-semibold text-[#112218] hover:border-[#143624] transition cursor-pointer"
                >
                  Explore Pure Oils & Dal
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-12">
            <div className="rounded-2xl border border-[#e7e2d8] bg-white p-7 lg:col-span-7">
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#5b695f]">
                Dhaka Delivery Schedule
              </p>
              <h3 className="mt-1 font-display text-2xl font-medium text-[#112218]">
                Five daily dispatch windows starting 6:00 AM
              </h3>
              <div className="mt-6 divide-y divide-[#e7e2d8] border-y border-[#e7e2d8]">
                {slots.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between py-3 text-sm"
                  >
                    <span className="font-medium text-[#112218]">
                      {lang === "bn" ? slot.labelBn : slot.labelEn}
                    </span>
                    <span className="font-mono text-xs font-semibold text-[#143624]">
                      {slot.windowText}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-2xl bg-[#143624] p-8 text-white lg:col-span-5">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#a7c4a5]">
                  Sobji Club Membership
                </p>
                <h3 className="mt-2 font-display text-3xl font-medium">
                  {t(lang, "clubTitle")}
                </h3>
                <p className="mt-3 text-xs leading-relaxed text-[#d2e0d4]">
                  {t(lang, "clubSub")}
                </p>
                <ul className="mt-5 space-y-2 border-t border-[#26533a] pt-4 text-xs text-[#e6efe7]">
                  <li>• Free delivery on orders ৳299+</li>
                  <li>• Weekly automated family bazar scheduling</li>
                  <li>• Priority 6:00 AM dawn crate reservation</li>
                </ul>
              </div>
              <Link
                href="/account"
                className="mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#143624] hover:bg-[#f5f3ee] transition"
              >
                <span>{t(lang, "joinClub")}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
