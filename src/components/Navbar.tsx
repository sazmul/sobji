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
  X,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  LayoutDashboard,
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

  const progressToFree = Math.min(100, Math.round((subtotal / FREE_DELIVERY_THRESHOLD) * 100));
  const remainingForFree = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);

  return (
    <>
      {/* Top Bar */}
      <div className="border-b border-[#e5e7eb] bg-[#f7f8f7] text-[12px] text-[#444444]">
        <div className="mx-auto flex max-w-[1360px] flex-wrap items-center justify-between gap-2 px-4 py-1.5 sm:px-6">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 font-semibold text-[#1b8e3d]">
              <Phone className="h-3.5 w-3.5" />
              01700-762544
            </span>
            <span className="hidden sm:inline text-[#666666]">
              {lang === "bn"
                ? "ঢাকায় সকাল ৬টা থেকে ডেলিভারি • ৪৯৯৳+ অর্ডারে ফ্রি ডেলিভারি"
                : "Dhaka Delivery from 6:00 AM • Free Delivery on Orders ৳499+"}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/#areas" className="hidden md:inline hover:text-[#1b8e3d]">
              {lang === "bn" ? "ডেলিভারি এলাকা" : "Available Areas"}
            </Link>
            <Link href="/#membership" className="hidden sm:inline hover:text-[#1b8e3d]">
              {lang === "bn" ? "মেম্বারশিপ" : "Membership"}
            </Link>
            <Link href="/track" className="font-semibold text-[#1a1a1a] hover:text-[#1b8e3d]">
              {t(lang, "trackOrder")}
            </Link>
            <button
              type="button"
              onClick={toggleLang}
              className="border border-[#d1d5db] bg-white px-2 py-0.5 text-[11px] font-bold text-[#1a1a1a] rounded hover:border-[#1b8e3d] cursor-pointer"
            >
              {lang === "en" ? "বাংলা" : "English"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Retail Header */}
      <header className="sticky top-0 z-40 border-b border-[#e5e7eb] bg-white">
        <div className="mx-auto flex max-w-[1360px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="shrink-0">
            <SobjiLogo />
          </Link>

          {/* Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative hidden md:flex flex-1 max-w-2xl items-center rounded-md border border-[#cccccc] bg-white focus-within:border-[#1b8e3d]"
          >
            <select
              value={searchCat}
              onChange={(e) => setSearchCat(e.target.value)}
              className="hidden lg:block border-r border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5 text-xs font-medium text-[#333333] rounded-l-md focus:outline-none cursor-pointer"
              aria-label="Category"
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
              className="flex-1 bg-transparent px-3.5 py-2 text-sm text-[#1a1a1a] placeholder:text-[#888888] focus:outline-none"
            />
            <button
              type="submit"
              className="bg-[#1b8e3d] px-4 py-2.5 text-white hover:bg-[#147230] rounded-r-md transition cursor-pointer"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>

            {showDropdown && filteredQuick.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 overflow-hidden rounded-md border border-[#d1d5db] bg-white shadow-lg z-50 divide-y divide-[#f3f4f6]">
                {filteredQuick.map((item) => {
                  const defVar =
                    item.variants.find((v) => v.isDefault) ?? item.variants[0];
                  return (
                    <Link
                      key={item.id}
                      href={`/products/${item.slug}`}
                      className="flex items-center justify-between gap-3 px-3.5 py-2.5 hover:bg-[#f7f8f7]"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 overflow-hidden rounded border border-[#e5e7eb] shrink-0">
                          <ProduceArtwork
                            visualKey={item.visualKey}
                            imageUrl={item.imageUrl}
                            alt={item.nameEn}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#1a1a1a]">
                            {lang === "bn" ? item.nameBn : item.nameEn}
                          </p>
                          <p className="text-xs text-[#666666]">
                            {item.farmerDistrict} · {defVar?.label}
                          </p>
                        </div>
                      </div>
                      <span className="font-mono text-sm font-bold text-[#1b8e3d]">
                        {formatTaka(defVar?.priceBdt ?? 0, lang)}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {userRole === "admin" && (
              <Link
                href="/admin"
                className="hidden sm:inline-flex items-center gap-1 rounded-md border border-[#d1d5db] bg-[#f9fafb] px-2.5 py-2 text-xs font-semibold text-[#1a1a1a] hover:border-[#1b8e3d]"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span>Admin</span>
              </Link>
            )}

            <button
              type="button"
              onClick={() => setIsWishlistOpen(true)}
              className="relative inline-flex items-center gap-1.5 rounded-md border border-[#e5e7eb] bg-white px-2.5 py-2 text-xs font-semibold text-[#333333] hover:border-[#1b8e3d] cursor-pointer"
              aria-label="Wishlist"
            >
              <Heart className="h-4 w-4 text-[#555555]" />
              <span className="hidden lg:inline">
                {lang === "bn" ? "পছন্দ" : "Wishlist"}
              </span>
              {wishlistIds.length > 0 && (
                <span className="rounded bg-[#dc2626] px-1.5 py-0.2 font-mono text-[10px] font-bold text-white">
                  {wishlistIds.length}
                </span>
              )}
            </button>

            <Link
              href={session?.user ? "/account" : "/sign-in"}
              className="inline-flex items-center gap-1.5 rounded-md border border-[#e5e7eb] bg-white px-3 py-2 text-xs font-semibold text-[#333333] hover:border-[#1b8e3d]"
            >
              <User className="h-4 w-4 text-[#555555]" />
              <span className="hidden sm:inline">
                {session?.user
                  ? session.user.name.split(" ")[0]
                  : t(lang, "signIn")}
              </span>
            </Link>

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="inline-flex items-center gap-2 rounded-md bg-[#1b8e3d] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#147230] transition cursor-pointer"
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline font-mono">
                {formatTaka(subtotal, lang)}
              </span>
              <span className="rounded bg-white px-1.5 py-0.5 font-mono text-[11px] font-bold text-[#1b8e3d]">
                {totalCount}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="px-4 pb-3 md:hidden">
          <form onSubmit={handleSearchSubmit} className="flex rounded-md border border-[#cccccc]">
            <input
              type="search"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={t(lang, "searchPlaceholder")}
              className="flex-1 bg-transparent px-3 py-2 text-sm text-[#1a1a1a] focus:outline-none"
            />
            <button type="submit" className="bg-[#1b8e3d] px-3 text-white rounded-r">
              <Search className="h-4 w-4" />
            </button>
          </form>
        </div>
      </header>

      {/* Mobile Bottom Cart Bar */}
      {totalCount > 0 && !isCartOpen && (
        <div className="fixed bottom-3 left-4 right-4 z-40 md:hidden">
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="flex w-full items-center justify-between rounded-md bg-[#1b8e3d] px-4 py-3 text-white shadow-lg"
          >
            <span className="text-xs font-bold">
              {totalCount} {lang === "bn" ? "টি পণ্য কার্টে" : "Items in Bag"}
            </span>
            <span className="flex items-center gap-1.5 font-mono text-sm font-bold">
              {formatTaka(subtotal, lang)}
              <ArrowRight className="h-4 w-4" />
            </span>
          </button>
        </div>
      )}

      {/* Wishlist Drawer */}
      {isWishlistOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
          <div className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e5e7eb] px-5 py-4">
              <h2 className="text-base font-bold text-[#1a1a1a]">
                Saved Wishlist ({wishlistIds.length})
              </h2>
              <button
                type="button"
                onClick={() => setIsWishlistOpen(false)}
                className="p-1 text-[#666666] hover:text-[#1a1a1a] cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 divide-y divide-[#f3f4f6]">
              {wishlistedProducts.length === 0 ? (
                <p className="py-16 text-center text-sm text-[#666666]">
                  No items saved yet.
                </p>
              ) : (
                wishlistedProducts.map((prod) => {
                  const v = prod.variants.find((x) => x.isDefault) ?? prod.variants[0];
                  return (
                    <div key={prod.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-12 w-12 overflow-hidden rounded border border-[#e5e7eb] shrink-0">
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
                            className="block truncate text-sm font-semibold text-[#1a1a1a]"
                          >
                            {lang === "bn" ? prod.nameBn : prod.nameEn}
                          </Link>
                          <p className="text-xs text-[#666666]">
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
                            className="rounded bg-[#1b8e3d] px-2.5 py-1.5 text-xs font-bold text-white cursor-pointer"
                          >
                            Add
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => toggleWishlist(prod.id, prod.nameEn)}
                          className="text-neutral-400 hover:text-red-600 cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
          <div
            className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
            role="dialog"
            aria-label="Shopping Bag"
          >
            <div className="flex items-center justify-between border-b border-[#e5e7eb] px-5 py-4">
              <div>
                <h2 className="text-base font-bold text-[#1a1a1a]">
                  {t(lang, "cart")} ({totalCount})
                </h2>
                <p className="text-xs text-[#666666]">
                  Deliveries start at 6:00 AM daily
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="p-1 text-[#666666] hover:text-[#1a1a1a] cursor-pointer"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="border-b border-[#e5e7eb] bg-[#f7f8f7] px-5 py-2.5">
              <div className="flex items-center justify-between text-xs font-semibold text-[#1b8e3d]">
                <span>
                  {remainingForFree === 0
                    ? "Free Delivery + Free Membership Unlocked"
                    : `Add ${formatTaka(remainingForFree, lang)} more for Free Delivery`}
                </span>
                <span className="font-mono">{progressToFree}%</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#e5e7eb]">
                <div
                  className="h-full bg-[#1b8e3d] transition-all duration-300"
                  style={{ width: `${progressToFree}%` }}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-2 divide-y divide-[#f3f4f6]">
              {items.length === 0 ? (
                <div className="py-20 text-center">
                  <p className="text-sm font-semibold text-[#1a1a1a]">
                    {lang === "bn" ? "আপনার কার্ট খালি" : "Your bag is empty"}
                  </p>
                  <p className="mt-1 text-xs text-[#666666]">
                    Add fresh vegetables, shak, fish, or spices to start.
                  </p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.variantId} className="flex items-center gap-3 py-3.5">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded border border-[#e5e7eb]">
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
                        className="block truncate text-sm font-semibold text-[#1a1a1a] hover:text-[#1b8e3d]"
                      >
                        {lang === "bn" ? item.nameBn : item.nameEn}
                      </Link>
                      <p className="text-xs text-[#666666]">{item.variantLabel}</p>
                      <p className="mt-0.5 font-mono text-sm font-bold text-[#1b8e3d]">
                        {formatTaka(item.priceBdt * item.quantity, lang)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button
                        type="button"
                        onClick={() => removeItem(item.variantId)}
                        className="text-neutral-400 hover:text-red-600 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <div className="flex items-center rounded border border-[#d1d5db]">
                        <button
                          type="button"
                          onClick={() => updateQty(item.variantId, item.quantity - 1)}
                          className="px-2 py-1 hover:bg-[#f3f4f6] cursor-pointer"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="min-w-6 text-center font-mono text-xs font-bold">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQty(item.variantId, item.quantity + 1)}
                          className="px-2 py-1 hover:bg-[#f3f4f6] cursor-pointer"
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
              <div className="border-t border-[#e5e7eb] bg-[#f9fafb] p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#555555]">Subtotal</span>
                  <span className="font-mono text-lg font-bold text-[#1a1a1a]">
                    {formatTaka(subtotal, lang)}
                  </span>
                </div>
                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-[#1b8e3d] py-3 text-sm font-bold text-white hover:bg-[#147230] transition"
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
