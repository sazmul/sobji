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
  MapPin,
  ChevronDown,
  X,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  LayoutDashboard,
  Languages,
  Menu,
} from "lucide-react";
import { SobjiLogo } from "./Logo";
import { DHAKA_AREAS, useApp } from "./Providers";
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
    deliveryArea,
    setDeliveryArea,
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
    showToast,
  } = useApp();
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  // Cart drawer smart essentials cross-sell
  const inCartProductIds = new Set(items.map((i) => i.productId));
  const cartUpsells = productsForSearch
    .filter((p) => !inCartProductIds.has(p.id))
    .slice(0, 3);

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
      <div className="no-print bg-[#0f7b3f] text-white text-xs">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2 sm:px-6">
          <div className="flex items-center gap-4">
            <a
              href="tel:+8801885592511"
              className="inline-flex items-center gap-1.5 font-medium transition hover:text-emerald-100"
            >
              <Phone className="h-3.5 w-3.5 text-emerald-200" />
              <span>01885-592511</span>
            </a>
            <span className="hidden sm:inline text-emerald-100">
              {lang === "bn"
                ? `ঢাকায় ভোর ৬টা থেকে ডেলিভারি • ${formatTaka(FREE_DELIVERY_THRESHOLD, lang)}+ অর্ডারে ফ্রি ডেলিভারি`
                : `6:00 AM Morning Delivery in Dhaka • Free Delivery on ${formatTaka(FREE_DELIVERY_THRESHOLD, "en")}+`}
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
      <header className="no-print sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 sm:gap-3 px-4 py-3 sm:py-3.5 sm:px-6">
          <div className="flex items-center gap-2.5 sm:gap-5 min-w-0">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
              className="xl:hidden inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 hover:border-[#0f7b3f] hover:text-[#0f7b3f] cursor-pointer"
            >
              <Menu className="h-4.5 w-4.5" />
            </button>
            <Link href="/" className="shrink-0">
              <SobjiLogo compactOnMobile />
            </Link>

            {/* Live Dhaka Area Picker */}
            <button
              type="button"
              onClick={() => setIsAreaModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs hover:border-[#0f7b3f] transition cursor-pointer"
            >
              <MapPin className="h-3.5 w-3.5 text-[#0f7b3f]" />
              <span className="text-gray-500 hidden lg:inline">Deliver to</span>
              <span className="font-semibold text-gray-900">{deliveryArea}</span>
              <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
            </button>

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
                {lang === "bn" ? "শাক-পাতা" : "Shak"}
              </button>
              <button
                type="button"
                onClick={() => handleNavJump("river-fish")}
                className="hover:text-[#0f7b3f] cursor-pointer"
              >
                {lang === "bn" ? "মাছ ও মাংস" : "Fish & Meat"}
              </button>
            </nav>
          </div>

          {/* Search Input */}
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
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
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
              className="relative inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white p-2 sm:p-2.5 text-gray-700 hover:border-[#0f7b3f] hover:text-[#0f7b3f] transition cursor-pointer"
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
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white p-2 sm:px-3 sm:py-2 text-xs font-semibold text-gray-700 hover:border-[#0f7b3f] hover:text-[#0f7b3f] transition"
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
              className="inline-flex items-center gap-1.5 sm:gap-2 rounded-xl bg-[#0f7b3f] px-3 py-2 sm:px-4 text-xs font-semibold text-white hover:bg-[#0b5e30] transition cursor-pointer shadow-xs"
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

        {/* Mobile Search & Area */}
        <div className="flex items-center gap-2 px-4 pb-3 md:hidden">
          <button
            type="button"
            onClick={() => setIsAreaModalOpen(true)}
            className="shrink-0 inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-gray-50 px-2.5 py-2 text-xs font-semibold text-gray-800"
          >
            <MapPin className="h-3.5 w-3.5 text-[#0f7b3f]" />
            <span>{deliveryArea}</span>
          </button>
          <form onSubmit={handleSearchSubmit} className="relative flex-1 flex items-center">
            <Search className="pointer-events-none absolute left-3 h-4 w-4 text-gray-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => search.trim() && setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 180)}
              placeholder={t(lang, "searchPlaceholder")}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-900 focus:border-[#0f7b3f] focus:bg-white focus:outline-none"
            />
            {showDropdown && filteredQuick.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl z-50 divide-y divide-gray-100">
                {filteredQuick.map((item) => {
                  const defVar =
                    item.variants.find((v) => v.isDefault) ?? item.variants[0];
                  return (
                    <Link
                      key={item.id}
                      href={`/products/${item.slug}`}
                      className="flex items-center justify-between gap-3 px-3.5 py-2.5 hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="h-9 w-9 overflow-hidden rounded-lg border border-gray-100 shrink-0">
                          <ProduceArtwork
                            visualKey={item.visualKey}
                            imageUrl={item.imageUrl}
                            alt={item.nameEn}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-gray-900">
                            {lang === "bn" ? item.nameBn : item.nameEn}
                          </p>
                          <p className="text-[11px] text-gray-500">
                            {item.farmerDistrict} · {defVar?.label}
                          </p>
                        </div>
                      </div>
                      <span className="tabular-nums text-xs font-bold text-[#0f7b3f]">
                        {formatTaka(defVar?.priceBdt ?? 0, lang)}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </form>
        </div>
      </header>

      {/* Dhaka Delivery Zone Picker Modal */}
      {isAreaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  Select Dhaka Delivery Area
                </h2>
                <p className="text-xs text-gray-500">
                  Morning 6:00 AM & 60-Min Express slots available
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAreaModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-900 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {DHAKA_AREAS.map((area) => {
                const active = area === deliveryArea;
                return (
                  <button
                    key={area}
                    type="button"
                    onClick={() => {
                      setDeliveryArea(area);
                      setIsAreaModalOpen(false);
                      showToast(`Delivery zone set to ${area}`, "info");
                    }}
                    className={`rounded-xl border px-3 py-2.5 text-left text-xs font-semibold transition cursor-pointer ${
                      active
                        ? "border-[#0f7b3f] bg-emerald-50 text-[#0f7b3f]"
                        : "border-gray-200 text-gray-700 hover:border-[#0f7b3f]"
                    }`}
                  >
                    {area}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Cart Bar */}
      {totalCount > 0 && !isCartOpen && (
        <div className="no-print fixed bottom-3 left-4 right-4 z-40 md:hidden">
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="flex w-full items-center justify-between rounded-xl bg-[#0f7b3f] px-4 py-3 text-white shadow-lg"
          >
            <span className="flex items-center gap-2 text-xs font-semibold">
              <ShoppingBag className="h-4 w-4" />
              {totalCount} {lang === "bn" ? "টি পণ্য ব্যাগে" : "Items in Bag"}
            </span>
            <span className="flex items-center gap-1.5 tabular-nums text-sm font-bold">
              {formatTaka(subtotal, lang)} · {lang === "bn" ? "দেখুন" : "View Bag"}
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
                  Delivering to <span className="font-semibold text-gray-800">{deliveryArea}</span>
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
                <div className="py-16 text-center">
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

              {/* Quick Add Essentials Cross-Sell */}
              {cartUpsells.length > 0 && remainingForFree > 0 && (
                <div className="pt-4 pb-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                    Frequently Added Essentials
                  </p>
                  <div className="space-y-2">
                    {cartUpsells.map((u) => {
                      const v = u.variants.find((x) => x.isDefault) ?? u.variants[0];
                      if (!v) return null;
                      return (
                        <div
                          key={u.id}
                          className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-2 text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="relative h-9 w-9 overflow-hidden rounded-lg shrink-0">
                              <ProduceArtwork
                                visualKey={u.visualKey}
                                imageUrl={u.imageUrl}
                                alt={u.nameEn}
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-gray-800">
                                {u.nameEn}
                              </p>
                              <p className="text-[11px] text-gray-500 tabular-nums">
                                {v.label} · {formatTaka(v.priceBdt)}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              addItem({
                                productId: u.id,
                                variantId: v.id,
                                slug: u.slug,
                                nameEn: u.nameEn,
                                nameBn: u.nameBn,
                                variantLabel: v.label,
                                priceBdt: v.priceBdt,
                                compareAtBdt: v.compareAtBdt,
                                visualKey: u.visualKey,
                                imageUrl: u.imageUrl,
                                maxStock: v.stockQty,
                              })
                            }
                            className="rounded-lg border border-[#0f7b3f] px-2.5 py-1 text-[11px] font-semibold text-[#0f7b3f] hover:bg-[#0f7b3f] hover:text-white transition cursor-pointer"
                          >
                            + Add
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
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

      {/* Mobile & Tablet Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="no-print fixed inset-0 z-50 flex xl:hidden bg-black/40 backdrop-blur-[1px]">
          <div className="flex h-full w-72 max-w-[85vw] flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <SobjiLogo />
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close menu"
                className="p-1.5 text-gray-500 hover:text-gray-900 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  {lang === "bn" ? "ক্যাটাগরি" : "Browse Categories"}
                </p>
                <div className="mt-2.5 space-y-1 text-sm font-medium">
                  {[
                    { slug: "flash", en: "Weekly Deals", bn: "সাপ্তাহিক অফার", accent: true },
                    { slug: "fresh-vegetables", en: "Fresh Vegetables", bn: "তাজা সবজি" },
                    { slug: "leafy-greens", en: "Leafy Greens (Shak)", bn: "শাক-পাতা" },
                    { slug: "ready-to-cook", en: "Ready to Cook", bn: "রেডি-টু-কুক" },
                    { slug: "river-fish", en: "Fish & Meat", bn: "মাছ ও মাংস" },
                    { slug: "spices-herbs", en: "Spices & Ghani Oil", bn: "মসলা ও তেল" },
                  ].map((item) => (
                    <button
                      key={item.slug}
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleNavJump(item.slug);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition cursor-pointer ${
                        item.accent
                          ? "bg-orange-50 text-orange-700 font-semibold"
                          : "text-gray-700 hover:bg-gray-50 hover:text-[#0f7b3f]"
                      }`}
                    >
                      <span>{lang === "bn" ? item.bn : item.en}</span>
                      <ArrowRight className="h-3.5 w-3.5 opacity-60" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  {lang === "bn" ? "অ্যাকাউন্ট ও অর্ডার" : "Account & Orders"}
                </p>
                <div className="mt-2.5 space-y-1 text-sm font-medium text-gray-700">
                  <Link
                    href="/track"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block rounded-xl px-3 py-2.5 hover:bg-gray-50 hover:text-[#0f7b3f]"
                  >
                    {t(lang, "trackOrder")}
                  </Link>
                  <Link
                    href={session?.user ? "/account" : "/sign-in"}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block rounded-xl px-3 py-2.5 hover:bg-gray-50 hover:text-[#0f7b3f]"
                  >
                    {session?.user ? t(lang, "myAccount") : t(lang, "signIn")}
                  </Link>
                  <Link
                    href="/checkout"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block rounded-xl px-3 py-2.5 hover:bg-gray-50 hover:text-[#0f7b3f]"
                  >
                    {lang === "bn" ? "চেকআউট ও ব্যাগ" : "Checkout & Bag"}
                  </Link>
                  {userRole === "admin" && (
                    <Link
                      href="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block rounded-xl bg-amber-50 px-3 py-2.5 font-semibold text-amber-900"
                    >
                      {t(lang, "adminPanel")}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
