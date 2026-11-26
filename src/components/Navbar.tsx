"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ShoppingBag,
  User,
  Heart,
  Phone,
  X,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  LayoutDashboard,
  Languages,
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

export function Navbar({
  productsForSearch = [],
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
            return (
              p.nameEn.toLowerCase().includes(q) ||
              p.nameBn.toLowerCase().includes(q) ||
              p.farmerDistrict.toLowerCase().includes(q) ||
              p.categoryNameEn.toLowerCase().includes(q)
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
      onSearchQuery(search);
      document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push(`/?q=${encodeURIComponent(search)}#catalog`);
    }
  };

  const handleNavJump = (slug: string) => {
    if (onSelectCategory) {
      onSelectCategory(slug);
      document
        .getElementById(slug === "flash" ? "flash-deals" : "catalog")
        ?.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push(`/#${slug === "flash" ? "flash-deals" : "catalog"}`);
    }
  };

  const progressToFree = Math.min(100, Math.round((subtotal / FREE_DELIVERY_THRESHOLD) * 100));
  const remainingForFree = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);

  return (
    <>
      {/* Top Bar */}
      <div className="bg-[#0f7b3f] text-white text-xs">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2 sm:px-6">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <Phone className="h-3.5 w-3.5 text-emerald-200" />
              <span>01700-762544</span>
            </span>
            <span className="hidden sm:inline text-emerald-100">
              {lang === "bn"
                ? "ঢাকায় ভোর ৬টা থেকে ডেলিভারি • ৪৯৯৳+ অর্ডারে ফ্রি ডেলিভারি"
                : "6:00 AM Morning Delivery in Dhaka • Free Delivery on ৳499+"}
            </span>
          </div>
          <div className="flex items-center gap-4 text-emerald-50">
            <Link href="/#membership" className="hidden sm:inline hover:text-white">
              {lang === "bn" ? "মেম্বারশিপ" : "Membership"}
            </Link>
            <Link href="/track" className="font-medium hover:text-white">
              {t(lang, "trackOrder")}
            </Link>
            <button
              type="button"
              onClick={toggleLang}
              className="inline-flex items-center gap-1 rounded-md bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold hover:bg-white/25 transition cursor-pointer"
            >
              <Languages className="h-3 w-3" />
              <span>{lang === "en" ? "বাংলা" : "English"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-7">
            <Link href="/" className="shrink-0">
              <SobjiLogo />
            </Link>

            <nav className="hidden xl:flex items-center gap-5 text-[13px] font-medium text-gray-600">
              <button
                type="button"
                onClick={() => handleNavJump("flash")}
                className="text-orange-600 font-semibold hover:text-orange-700 cursor-pointer"
              >
                {lang === "bn" ? "অফার" : "Deals"}
              </button>
              <button
                type="button"
                onClick={() => handleNavJump("fresh-vegetables")}
                className="hover:text-[#0f7b3f] cursor-pointer"
              >
                {lang === "bn" ? "সবজি" : "Vegetables"}
              </button>
              <button
                type="button"
                onClick={() => handleNavJump("leafy-greens")}
                className="hover:text-[#0f7b3f] cursor-pointer"
              >
                {lang === "bn" ? "শাক-পাতা" : "Leafy Greens"}
              </button>
              <button
                type="button"
                onClick={() => handleNavJump("river-fish")}
                className="hover:text-[#0f7b3f] cursor-pointer"
              >
                {lang === "bn" ? "মাছ ও মাংস" : "Fish & Meat"}
              </button>
              <Link href="/#recipes" className="hover:text-[#0f7b3f]">
                {lang === "bn" ? "রেসিপি কম্বো" : "Recipes"}
              </Link>
            </nav>
          </div>

          {/* Clean Search Input */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative hidden md:block flex-1 max-w-md"
          >
            <div className="relative flex items-center">
              <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-gray-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => search.trim() && setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 180)}
                placeholder={t(lang, "searchPlaceholder")}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#0f7b3f] focus:bg-white focus:outline-none transition"
              />
            </div>

            {showDropdown && filteredQuick.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl z-50 divide-y divide-gray-100">
                {filteredQuick.map((item) => {
                  const defVar =
                    item.variants.find((v) => v.isDefault) ?? item.variants[0];
                  return (
                    <Link
                      key={item.id}
                      href={`/products/${item.slug}`}
                      className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 overflow-hidden rounded-lg border border-gray-100 shrink-0">
                          <ProduceArtwork
                            visualKey={item.visualKey}
                            imageUrl={item.imageUrl}
                            alt={item.nameEn}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-900">
                            {lang === "bn" ? item.nameBn : item.nameEn}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.farmerDistrict} · {defVar?.label}
                          </p>
                        </div>
                      </div>
                      <span className="tabular-nums text-sm font-bold text-[#0f7b3f]">
                        {formatTaka(defVar?.priceBdt ?? 0, lang)}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </form>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            {userRole === "admin" && (
              <Link
                href="/admin"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:border-[#0f7b3f] hover:text-[#0f7b3f]"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span>Admin</span>
              </Link>
            )}

            <button
              type="button"
              onClick={() => setIsWishlistOpen(true)}
              className="relative inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white p-2.5 text-gray-700 hover:border-[#0f7b3f] hover:text-[#0f7b3f] transition cursor-pointer"
              aria-label="Wishlist"
            >
              <Heart className="h-4 w-4" />
              {wishlistIds.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-600 px-1 tabular-nums text-[10px] font-bold text-white">
                  {wishlistIds.length}
                </span>
              )}
            </button>

            <Link
              href={session?.user ? "/account" : "/sign-in"}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:border-[#0f7b3f] hover:text-[#0f7b3f] transition"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">
                {session?.user
                  ? session.user.name.split(" ")[0]
                  : t(lang, "signIn")}
              </span>
            </Link>

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0f7b3f] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0b5e30] transition cursor-pointer shadow-xs"
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline tabular-nums">
                {formatTaka(subtotal, lang)}
              </span>
              <span className="rounded-md bg-white/20 px-1.5 py-0.5 tabular-nums text-[11px] font-bold">
                {totalCount}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="px-4 pb-3 md:hidden">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="pointer-events-none absolute left-3 h-4 w-4 text-gray-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={t(lang, "searchPlaceholder")}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-900 focus:border-[#0f7b3f] focus:bg-white focus:outline-none"
            />
          </form>
        </div>
      </header>

      {/* Mobile Bottom Cart Bar */}
      {totalCount > 0 && !isCartOpen && (
        <div className="fixed bottom-3 left-4 right-4 z-40 md:hidden">
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="flex w-full items-center justify-between rounded-xl bg-[#0f7b3f] px-4 py-3 text-white shadow-lg"
          >
            <span className="text-xs font-semibold">
              {totalCount} {lang === "bn" ? "টি পণ্য ব্যাগে" : "Items in Bag"}
            </span>
            <span className="flex items-center gap-1.5 tabular-nums text-sm font-bold">
              {formatTaka(subtotal, lang)}
              <ArrowRight className="h-4 w-4" />
            </span>
          </button>
        </div>
      )}

      {/* Wishlist Drawer */}
      {isWishlistOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-[1px]">
          <div className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <h2 className="text-base font-bold text-gray-900">
                Wishlist ({wishlistIds.length})
              </h2>
              <button
                type="button"
                onClick={() => setIsWishlistOpen(false)}
                className="p-1 text-gray-500 hover:text-gray-900 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 divide-y divide-gray-100">
              {wishlistedProducts.length === 0 ? (
                <p className="py-16 text-center text-sm text-gray-500">
                  No items saved yet.
                </p>
              ) : (
                wishlistedProducts.map((prod) => {
                  const v = prod.variants.find((x) => x.isDefault) ?? prod.variants[0];
                  return (
                    <div key={prod.id} className="flex items-center justify-between gap-3 py-3.5">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-12 w-12 overflow-hidden rounded-lg border border-gray-100 shrink-0">
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
                            className="block truncate text-sm font-semibold text-gray-900"
                          >
                            {lang === "bn" ? prod.nameBn : prod.nameEn}
                          </Link>
                          <p className="text-xs text-gray-500 tabular-nums">
                            {v?.label} · {formatTaka(v?.priceBdt ?? 0, lang)}
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
                            className="rounded-lg bg-[#0f7b3f] px-3 py-1.5 text-xs font-semibold text-white cursor-pointer"
                          >
                            Add
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => toggleWishlist(prod.id, prod.nameEn)}
                          className="text-gray-400 hover:text-red-600 cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-[1px]">
          <div
            className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
            role="dialog"
            aria-label="Shopping Bag"
          >
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  {t(lang, "cart")} ({totalCount})
                </h2>
                <p className="text-xs text-gray-500">
                  Deliveries start at 6:00 AM daily
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="p-1 text-gray-500 hover:text-gray-900 cursor-pointer"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="border-b border-gray-200 bg-emerald-50/70 px-5 py-3">
              <div className="flex items-center justify-between text-xs font-semibold text-[#0f7b3f]">
                <span>
                  {remainingForFree === 0
                    ? "Free Delivery + Free Membership Unlocked"
                    : `Add ${formatTaka(remainingForFree, lang)} more for Free Delivery`}
                </span>
                <span className="tabular-nums">{progressToFree}%</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-emerald-200">
                <div
                  className="h-full bg-[#0f7b3f] transition-all duration-300"
                  style={{ width: `${progressToFree}%` }}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-2 divide-y divide-gray-100">
              {items.length === 0 ? (
                <div className="py-20 text-center">
                  <p className="text-sm font-semibold text-gray-900">
                    {lang === "bn" ? "আপনার কার্ট খালি" : "Your bag is empty"}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Add fresh vegetables, shak, fish, or spices to start.
                  </p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.variantId} className="flex items-center gap-3 py-3.5">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-gray-100">
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
                        className="block truncate text-sm font-semibold text-gray-900 hover:text-[#0f7b3f]"
                      >
                        {lang === "bn" ? item.nameBn : item.nameEn}
                      </Link>
                      <p className="text-xs text-gray-500">{item.variantLabel}</p>
                      <p className="mt-0.5 tabular-nums text-sm font-bold text-[#0f7b3f]">
                        {formatTaka(item.priceBdt * item.quantity, lang)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button
                        type="button"
                        onClick={() => removeItem(item.variantId)}
                        className="text-gray-400 hover:text-red-600 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50">
                        <button
                          type="button"
                          onClick={() => updateQty(item.variantId, item.quantity - 1)}
                          className="px-2 py-1 hover:bg-white rounded-l-lg cursor-pointer"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="min-w-6 text-center tabular-nums text-xs font-bold">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQty(item.variantId, item.quantity + 1)}
                          className="px-2 py-1 hover:bg-white rounded-r-lg cursor-pointer"
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
              <div className="border-t border-gray-200 bg-gray-50 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Subtotal</span>
                  <span className="tabular-nums text-lg font-bold text-gray-900">
                    {formatTaka(subtotal, lang)}
                  </span>
                </div>
                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0f7b3f] py-3 text-sm font-semibold text-white hover:bg-[#0b5e30] transition"
                >
                  <span>Proceed to Checkout</span>
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
