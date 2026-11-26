"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ShoppingCart,
  User,
  Heart,
  Phone,
  MapPin,
  X,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  LayoutDashboard,
  Languages,
  Tag,
} from "lucide-react";
import { SobjiLogo } from "./Logo";
import { useApp } from "./Providers";
import { ProduceArtwork } from "./ProduceArtwork";
import { t } from "@/lib/i18n";
import { formatTaka, FREE_DELIVERY_THRESHOLD } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import type { CatalogProduct } from "@/lib/catalog";

interface NavbarProps {
  productsForSearch?: CatalogProduct[];
  selectedCategory?: string;
  onSelectCategory?: (slug: string) => void;
  onSearchQuery?: (q: string) => void;
}

const DEPT_LINKS = [
  { slug: "flash", labelEn: "Weekly Discounts", labelBn: "সাপ্তাহিক ডিসকাউন্ট", hot: true },
  { slug: "fresh-vegetables", labelEn: "Vegetables", labelBn: "সবজি" },
  { slug: "leafy-greens", labelEn: "Leafies (Shak)", labelBn: "শাক-পাতা" },
  { slug: "ready-to-cook", labelEn: "Ready to Cook", labelBn: "রেডি-টু-কুক" },
  { slug: "spices-herbs", labelEn: "Spices", labelBn: "মসলা" },
  { slug: "fresh-fruits", labelEn: "Fruits", labelBn: "ফলমূল" },
  { slug: "river-fish", labelEn: "River Fish", labelBn: "নদীর মাছ" },
  { slug: "meat-eggs", labelEn: "Meat & Eggs", labelBn: "মাংস ও ডিম" },
  { slug: "organic-pantry", labelEn: "Oil & Dal", labelBn: "তেল ও ডাল" },
];

export function Navbar({
  productsForSearch = [],
  selectedCategory = "all",
  onSelectCategory,
  onSearchQuery,
}: NavbarProps) {
  const {
    lang,
    toggleLang,
    items,
    wishlistIds,
    toggleWishlist,
    isCartOpen,
    setIsCartOpen,
    updateQty,
    removeItem,
    addItem,
    subtotal,
    totalCount,
  } = useApp();
  const [search, setSearch] = useState("");
  const [searchCat, setSearchCat] = useState("all");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const userRole = (session?.user as { role?: string } | undefined)?.role;

  const filteredQuick =
    search.trim().length > 0
      ? productsForSearch
          .filter((p) => {
            const q = search.toLowerCase();
            const catMatch = searchCat === "all" || p.categorySlug === searchCat;
            return (
              catMatch &&
              (p.nameEn.toLowerCase().includes(q) ||
                p.nameBn.toLowerCase().includes(q) ||
                p.farmerDistrict.toLowerCase().includes(q) ||
                p.categoryNameEn.toLowerCase().includes(q))
            );
          })
          .slice(0, 6)
      : [];

  const wishlistedProducts = productsForSearch.filter((p) =>
    wishlistIds.includes(p.id)
  );

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setShowDropdown(val.trim().length > 0);
    if (onSearchQuery) onSearchQuery(val);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowDropdown(false);
    if (onSearchQuery) {
      if (searchCat !== "all" && onSelectCategory) onSelectCategory(searchCat);
      onSearchQuery(search);
      document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push(`/?q=${encodeURIComponent(search)}#catalog`);
    }
  };

  const handleDeptClick = (slug: string) => {
    if (onSelectCategory) {
      onSelectCategory(slug);
      const targetId = slug === "flash" ? "flash-deals" : "catalog";
      document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push(`/#${slug === "flash" ? "flash-deals" : "catalog"}`);
    }
  };

  const progressToFree = Math.min(100, Math.round((subtotal / FREE_DELIVERY_THRESHOLD) * 100));
  const remainingForFree = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);

  return (
    <>
      {/* Tier 1: Top Hotline & Quick Links Bar */}
      <div className="bg-[#16803c] text-white text-xs">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2 sm:px-6">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 font-semibold">
              <Phone className="h-3.5 w-3.5 text-emerald-200" />
              01700-762544
            </span>
            <span className="hidden sm:inline text-emerald-100">
              {lang === "bn"
                ? "ভোর ৬টা থেকে ঢাকা ডেলিভারি • ৪৯৯৳+ অর্ডারে ফ্রি"
                : "Straight From The Field • Delivery Starts 6:00 AM • Free on ৳499+"}
            </span>
          </div>
          <div className="flex items-center gap-4 text-emerald-50">
            <Link href="/#areas" className="hidden md:inline-flex items-center gap-1 hover:underline">
              <MapPin className="h-3.5 w-3.5" />
              {lang === "bn" ? "ডেলিভারি এলাকা" : "Available Areas"}
            </Link>
            <Link href="/#membership" className="hidden sm:inline hover:underline">
              {lang === "bn" ? "মেম্বারশিপ" : "Membership"}
            </Link>
            <Link href="/track" className="font-semibold hover:underline">
              {t(lang, "trackOrder")}
            </Link>
            <button
              type="button"
              onClick={toggleLang}
              className="inline-flex items-center gap-1 rounded bg-white/15 px-2 py-0.5 font-bold hover:bg-white/25 transition cursor-pointer"
            >
              <Languages className="h-3 w-3" />
              <span>{lang === "en" ? "বাংলা" : "EN"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tier 2: Main Supermarket Header */}
      <header className="sticky top-0 z-40 border-b border-[#e4eae5] bg-white shadow-2xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="shrink-0">
            <SobjiLogo />
          </Link>

          {/* Category-Scoped Search Bar (Sobji.com.bd style) */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative hidden md:flex flex-1 max-w-2xl items-center rounded-xl border-2 border-[#16803c]/80 bg-[#f6f8f6] focus-within:border-[#16803c] focus-within:bg-white transition"
          >
            <select
              value={searchCat}
              onChange={(e) => setSearchCat(e.target.value)}
              className="hidden lg:block border-r border-[#dce4de] bg-transparent px-3 py-2.5 text-xs font-semibold text-[#18231c] focus:outline-none cursor-pointer"
              aria-label="Search category"
            >
              <option value="all">{lang === "bn" ? "সব ক্যাটাগরি" : "All Categories"}</option>
              <option value="fresh-vegetables">Vegetables</option>
              <option value="leafy-greens">Leafies (Shak)</option>
              <option value="ready-to-cook">Ready to Cook</option>
              <option value="spices-herbs">Spices</option>
              <option value="fresh-fruits">Fruits</option>
              <option value="river-fish">River Fish</option>
              <option value="meat-eggs">Meat & Eggs</option>
            </select>
            <input
              type="search"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => search.trim() && setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 180)}
              placeholder={t(lang, "searchPlaceholder")}
              className="flex-1 bg-transparent px-3.5 py-2.5 text-sm text-[#18231c] placeholder:text-[#7a897e] focus:outline-none"
            />
            <button
              type="submit"
              className="m-1 inline-flex items-center gap-1.5 rounded-lg bg-[#16803c] px-4 py-2 text-xs font-bold text-white hover:bg-[#126a31] transition cursor-pointer"
            >
              <Search className="h-3.5 w-3.5" />
              <span>{lang === "bn" ? "খুঁজুন" : "Search"}</span>
            </button>

            {showDropdown && filteredQuick.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-xl border border-[#e4eae5] bg-white shadow-xl z-50 divide-y divide-[#eef2ef]">
                {filteredQuick.map((item) => {
                  const defVar =
                    item.variants.find((v) => v.isDefault) ?? item.variants[0];
                  return (
                    <Link
                      key={item.id}
                      href={`/products/${item.slug}`}
                      className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-[#eef9f1] transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 overflow-hidden rounded-lg border border-[#e4eae5] shrink-0">
                          <ProduceArtwork
                            visualKey={item.visualKey}
                            imageUrl={item.imageUrl}
                            alt={item.nameEn}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-[#18231c]">
                            {lang === "bn" ? item.nameBn : item.nameEn}
                          </p>
                          <p className="text-xs text-[#5f6f64]">
                            {item.farmerDistrict} • {defVar?.label}
                          </p>
                        </div>
                      </div>
                      <span className="font-mono text-sm font-bold text-[#16803c]">
                        {formatTaka(defVar?.priceBdt ?? 0, lang)}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </form>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {userRole === "admin" && (
              <Link
                href="/admin"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-orange-50 px-3 py-2 text-xs font-bold text-orange-700 ring-1 ring-orange-200 hover:bg-orange-100 transition"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span>Admin</span>
              </Link>
            )}

            <button
              type="button"
              onClick={() => setIsWishlistOpen(true)}
              className="relative inline-flex items-center justify-center rounded-lg border border-[#e4eae5] bg-[#f6f8f6] p-2.5 text-[#18231c] hover:border-[#16803c] hover:bg-[#eef9f1] transition cursor-pointer"
              aria-label="Wishlist"
            >
              <Heart className="h-4 w-4 text-[#16803c]" />
              {wishlistIds.length > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#f97316] px-1 font-mono text-[10px] font-bold text-white">
                  {wishlistIds.length}
                </span>
              )}
            </button>

            <Link
              href={session?.user ? "/account" : "/sign-in"}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#e4eae5] bg-[#f6f8f6] px-3 py-2 text-xs font-bold text-[#18231c] hover:border-[#16803c] hover:bg-[#eef9f1] transition"
            >
              <User className="h-4 w-4 text-[#16803c]" />
              <span className="hidden sm:inline">
                {session?.user
                  ? session.user.name.split(" ")[0]
                  : t(lang, "signIn")}
              </span>
            </Link>

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-[#16803c] px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#126a31] transition cursor-pointer"
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline font-mono">
                {formatTaka(subtotal, lang)}
              </span>
              <span className="rounded bg-white px-1.5 py-0.5 font-mono text-[11px] font-extrabold text-[#16803c]">
                {totalCount}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="px-4 pb-3 md:hidden">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="pointer-events-none absolute left-3 h-4 w-4 text-[#5f6f64]" />
            <input
              type="search"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={t(lang, "searchPlaceholder")}
              className="w-full rounded-lg border border-[#dce4de] bg-[#f6f8f6] py-2 pl-9 pr-3 text-sm text-[#18231c] focus:border-[#16803c] focus:bg-white focus:outline-none"
            />
          </form>
        </div>

        {/* Tier 3: Department Navigation Strip (Sobji.com.bd style) */}
        <nav className="border-t border-[#eef2ef] bg-[#f6f8f6]">
          <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4 py-2 sm:px-6">
            <button
              type="button"
              onClick={() => handleDeptClick("all")}
              className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                selectedCategory === "all"
                  ? "bg-[#16803c] text-white"
                  : "text-[#18231c] hover:bg-white hover:text-[#16803c]"
              }`}
            >
              {lang === "bn" ? "সব পণ্য" : "All Products"}
            </button>
            {DEPT_LINKS.map((dept) => {
              const active = selectedCategory === dept.slug;
              return (
                <button
                  key={dept.slug}
                  type="button"
                  onClick={() => handleDeptClick(dept.slug)}
                  className={`shrink-0 inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                    active
                      ? "bg-[#16803c] text-white"
                      : dept.hot
                        ? "bg-orange-50 text-orange-600 hover:bg-orange-100"
                        : "text-[#35443a] hover:bg-white hover:text-[#16803c]"
                  }`}
                >
                  {dept.hot && <Tag className="h-3 w-3" />}
                  <span>{lang === "bn" ? dept.labelBn : dept.labelEn}</span>
                </button>
              );
            })}
            <Link
              href="/#recipes"
              className="shrink-0 rounded-md px-3 py-1.5 text-xs font-bold text-[#35443a] hover:bg-white hover:text-[#16803c] transition"
            >
              {lang === "bn" ? "রেসিপি প্যাক" : "Recipes"}
            </Link>
          </div>
        </nav>
      </header>

      {/* Mobile Sticky Bottom Cart Pill */}
      {totalCount > 0 && !isCartOpen && (
        <div className="fixed bottom-3 left-4 right-4 z-40 md:hidden">
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="flex w-full items-center justify-between rounded-xl bg-[#16803c] px-4 py-3 text-white shadow-xl"
          >
            <span className="text-xs font-bold">
              {totalCount} {lang === "bn" ? "টি পণ্য কার্টে" : "Items in Cart"}
            </span>
            <span className="flex items-center gap-1.5 font-mono text-sm font-extrabold">
              {formatTaka(subtotal, lang)}
              <ArrowRight className="h-4 w-4" />
            </span>
          </button>
        </div>
      )}

      {/* Wishlist Drawer */}
      {isWishlistOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-[2px]">
          <div className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e4eae5] px-5 py-4">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-[#f97316] fill-[#f97316]" />
                <h2 className="text-base font-extrabold text-[#18231c]">
                  {lang === "bn" ? "পছন্দের তালিকা" : "Saved Wishlist"} ({wishlistIds.length})
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsWishlistOpen(false)}
                className="rounded-lg p-1.5 text-[#5f6f64] hover:bg-[#f6f8f6] cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 divide-y divide-[#eef2ef]">
              {wishlistedProducts.length === 0 ? (
                <div className="py-16 text-center text-sm text-[#5f6f64]">
                  No items saved yet. Click the heart icon on any produce item to save it here.
                </div>
              ) : (
                wishlistedProducts.map((prod) => {
                  const v = prod.variants.find((x) => x.isDefault) ?? prod.variants[0];
                  return (
                    <div key={prod.id} className="flex items-center justify-between gap-3 py-3.5">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-14 w-14 overflow-hidden rounded-lg border border-[#e4eae5] shrink-0">
                          <ProduceArtwork
                            visualKey={prod.visualKey}
                            imageUrl={prod.imageUrl}
                            alt={prod.nameEn}
                          />
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/products/${prod.slug}`}
                            onClick={() => setIsWishlistOpen(false)}
                            className="block truncate text-sm font-bold text-[#18231c] hover:text-[#16803c]"
                          >
                            {lang === "bn" ? prod.nameBn : prod.nameEn}
                          </Link>
                          <p className="text-xs text-[#5f6f64]">
                            {v?.label} •{" "}
                            <span className="font-mono font-bold text-[#16803c]">
                              {formatTaka(v?.priceBdt ?? 0, lang)}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {v && (
                          <button
                            type="button"
                            onClick={() =>
                              addItem({
                                productId: prod.id,
                                variantId: v.id,
                                slug: prod.slug,
                                nameEn: prod.nameEn,
                                nameBn: prod.nameBn,
                                variantLabel: v.label,
                                priceBdt: v.priceBdt,
                                compareAtBdt: v.compareAtBdt,
                                visualKey: prod.visualKey,
                                imageUrl: prod.imageUrl,
                                maxStock: v.stockQty,
                              })
                            }
                            className="rounded-lg bg-[#16803c] px-3 py-1.5 text-xs font-bold text-white cursor-pointer"
                          >
                            Add
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => toggleWishlist(prod.id, prod.nameEn)}
                          className="text-stone-400 hover:text-red-600 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Slide-Over Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-[2px]">
          <div
            className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
            role="dialog"
            aria-label="Shopping Cart"
          >
            <div className="flex items-center justify-between border-b border-[#e4eae5] px-5 py-4">
              <div>
                <h2 className="text-lg font-extrabold text-[#18231c]">
                  {t(lang, "cart")} ({totalCount})
                </h2>
                <p className="text-xs text-[#5f6f64]">
                  {lang === "bn"
                    ? "ভোর ৬টা থেকে আপনার পছন্দের স্লটে ডেলিভারি"
                    : "Choose your 6:00 AM – 9:00 PM slot at checkout"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="rounded-lg p-1.5 text-[#5f6f64] hover:bg-[#f6f8f6] cursor-pointer"
                aria-label="Close bag"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="border-b border-[#e4eae5] bg-[#eef9f1] px-5 py-3">
              <div className="flex items-center justify-between text-xs font-bold text-[#16803c]">
                <span>
                  {remainingForFree === 0
                    ? lang === "bn"
                      ? "ফ্রি ডেলিভারি ও ফ্রি মেম্বারশিপ আনলক হয়েছে!"
                      : "Free Delivery + Free Membership Unlocked!"
                    : lang === "bn"
                      ? `আর ${formatTaka(remainingForFree, lang)} যোগ করলে ফ্রি ডেলিভারি!`
                      : `Add ${formatTaka(remainingForFree)} more for Free Delivery + Membership`}
                </span>
                <span className="font-mono">{progressToFree}%</span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-emerald-200">
                <div
                  className="h-full bg-[#16803c] transition-all duration-300"
                  style={{ width: `${progressToFree}%` }}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-3 divide-y divide-[#eef2ef]">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <ShoppingCart className="h-10 w-10 text-emerald-600/40 mb-3" />
                  <p className="text-base font-bold text-[#18231c]">
                    {lang === "bn" ? "আপনার কার্ট খালি" : "Your cart is empty"}
                  </p>
                  <p className="mt-1 max-w-xs text-xs text-[#5f6f64]">
                    {lang === "bn"
                      ? "তাজা সবজি, শাক, মাছ ও মসলা কার্টে যোগ করুন।"
                      : "Add fresh field vegetables, shak, fish, or spices to get started."}
                  </p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.variantId} className="flex items-center gap-3 py-3.5">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-[#e4eae5]">
                      <ProduceArtwork
                        visualKey={item.visualKey}
                        imageUrl={item.imageUrl}
                        alt={item.nameEn}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/products/${item.slug}`}
                        onClick={() => setIsCartOpen(false)}
                        className="block truncate text-sm font-bold text-[#18231c] hover:text-[#16803c]"
                      >
                        {lang === "bn" ? item.nameBn : item.nameEn}
                      </Link>
                      <p className="text-xs text-[#5f6f64]">{item.variantLabel}</p>
                      <p className="mt-1 font-mono text-sm font-extrabold text-[#16803c]">
                        {formatTaka(item.priceBdt * item.quantity, lang)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button
                        type="button"
                        onClick={() => removeItem(item.variantId)}
                        className="text-stone-400 hover:text-red-600 transition cursor-pointer"
                        aria-label="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <div className="flex items-center rounded-lg border border-[#dce4de] bg-[#f6f8f6]">
                        <button
                          type="button"
                          onClick={() => updateQty(item.variantId, item.quantity - 1)}
                          className="p-1.5 text-[#18231c] hover:bg-white cursor-pointer"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="min-w-6 text-center font-mono text-xs font-bold">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQty(item.variantId, item.quantity + 1)}
                          className="p-1.5 text-[#18231c] hover:bg-white cursor-pointer"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-[#e4eae5] bg-[#f6f8f6] p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#5f6f64]">
                    {lang === "bn" ? "সাবটোটাল" : "Cart Subtotal"}
                  </span>
                  <span className="font-mono text-xl font-extrabold text-[#18231c]">
                    {formatTaka(subtotal, lang)}
                  </span>
                </div>
                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#16803c] py-3.5 text-sm font-bold text-white shadow-sm hover:bg-[#126a31] transition"
                >
                  <span>
                    {lang === "bn" ? "চেকআউট করুন" : "Proceed to Checkout"}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
