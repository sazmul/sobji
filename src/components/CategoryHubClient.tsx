"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, Sprout, Truck, ShieldCheck } from "lucide-react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { ProductCard } from "./ProductCard";
import { useApp } from "./Providers";
import { CATEGORY_SEO_META } from "@/lib/seo";
import type { CatalogProduct } from "@/lib/catalog";

interface CategoryItem {
  id: number;
  slug: string;
  nameEn: string;
  nameBn: string;
  descriptionEn: string;
  descriptionBn: string;
}

export function CategoryHubClient({
  category,
  allCategories,
  products,
}: {
  category: CategoryItem;
  allCategories: CategoryItem[];
  products: CatalogProduct[];
}) {
  const { lang } = useApp();
  const seoMeta = CATEGORY_SEO_META[category.slug];

  return (
    <div className="min-h-screen flex flex-col bg-[#f9faf8]">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 space-y-6">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-1.5 text-xs text-gray-500"
        >
          <Link href="/" className="hover:text-[#0f7b3f] transition">
            {lang === "bn" ? "হোম (sobji.com)" : "Home (sobji.com)"}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
          <span className="font-semibold text-gray-900">
            {lang === "bn" ? category.nameBn : category.nameEn}
          </span>
        </nav>

        {/* Category Hero + Direct Answer Summary for AEO / GEO / VSO */}
        <section className="rounded-2xl border border-gray-200/80 bg-white p-6 sm:p-8 space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#0f7b3f]">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1">
              <Sprout className="h-3.5 w-3.5" />
              {lang === "bn" ? "৫:০০ AM ভোরের সংগ্রহ" : "5:00 AM Dawn Harvest"}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              {lang === "bn" ? "১০০% ফরমালিন মুক্ত" : "100% Formalin Free"}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1">
              <Truck className="h-3.5 w-3.5" />
              {lang === "bn" ? "ঢাকা ৬০-মিনিট এক্সপ্রেস" : "Dhaka 60-Min Express"}
            </span>
          </div>

          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
              {lang === "bn"
                ? `${category.nameBn} (${category.nameEn})`
                : `${category.nameEn} (${category.nameBn})`}
            </h1>
            <p
              data-speakable="true"
              className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-600"
            >
              {lang === "bn"
                ? seoMeta?.summaryBn || category.descriptionBn
                : seoMeta?.summaryEn || category.descriptionEn}
            </p>
          </div>

          {/* All Category Hub Pills */}
          <div className="flex flex-wrap gap-2 pt-1">
            {allCategories.map((cat) => {
              const isCurrent = cat.slug === category.slug;
              return (
                <Link
                  key={cat.id}
                  href={`/bazar/${cat.slug}`}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                    isCurrent
                      ? "bg-[#0f7b3f] text-white"
                      : "border border-gray-200 bg-[#f8faf8] text-gray-700 hover:border-[#0f7b3f] hover:text-[#0f7b3f]"
                  }`}
                >
                  {lang === "bn" ? cat.nameBn : cat.nameEn}
                </Link>
              );
            })}
          </div>
        </section>

        {/* Products Grid */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900 sm:text-lg">
              {lang === "bn"
                ? `পাওয়া যাচ্ছে ${products.length}টি তাজা পণ্য`
                : `${products.length} Fresh Items Available`}
            </h2>
            <Link
              href="/#catalog"
              className="text-xs font-semibold text-[#0f7b3f] hover:underline"
            >
              {lang === "bn" ? "সকল ক্যাটাগরি দেখুন →" : "Browse All Bazar →"}
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
