"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ShoppingBag,
  User,
  MapPin,
  X,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Truck,
  Sparkles,
  ShieldCheck,
  Languages,
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
  onSearchQuery?: (q: string) => void;
}

export function Navbar({ productsForSearch = [], onSearchQuery }: NavbarProps) {
  const {
    lang,
    toggleLang,
    items,
    isCartOpen,
    setIsCartOpen,
    updateQty,
    removeItem,
    subtotal,
    totalCount,
  } = useApp();
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
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
      const el = document.getElementById("catalog");
      el?.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push(`/?q=${encodeURIComponent(search)}#catalog`);
    }
  };

  const progressToFree = Math.min(100, Math.round((subtotal / FREE_DELIVERY_THRESHOLD) * 100));
  const remainingForFree = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);

  return (
    <>
      {/* Top announcement bar */}
      <div className="bg-[#14532d] text-emerald-50 text-xs py-2 px-4">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
          <p className="flex items-center gap-2 font-medium">
            <span className="inline-flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span>{t(lang, "topBanner")}</span>
          </p>
          <div className="hidden sm:flex items-center gap-4 text-emerald-200/90">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-amber-300" />
              Dhaka Metro • 6 AM – 9 PM
            </span>
            <Link href="/track" className="hover:text-white underline-offset-2 hover:underline">
              {t(lang, "trackOrder")}
            </Link>
          </div>
        </div>
      </div>

      {/* Main sticky header */}
      <header className="sticky top-0 z-40 border-b border-[#e4e0d5] bg-[#faf8f3]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/" className="shrink-0">
            <SobjiLogo />
          </Link>

          {/* Search bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative hidden md:block flex-1 max-w-xl"
          >
            <div className="relative flex items-center">
              <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-[#526559]" />
              <input
                type="search"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => search.trim() && setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 180)}
                placeholder={t(lang, "searchPlaceholder")}
                className="w-full rounded-full border border-[#dcd7c9] bg-white py-2.5 pl-10 pr-4 text-sm text-[#111c16] placeholder:text-[#7c8c82] shadow-xs transition focus:border-[#166534] focus:outline-none focus:ring-2 focus:ring-[#166534]/15"
              />
            </div>

            {showDropdown && filteredQuick.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-2xl border border-[#e4e0d5] bg-white shadow-xl z-50">
                {filteredQuick.map((item) => {
                  const defVar =
                    item.variants.find((v) => v.isDefault) ?? item.variants[0];
                  return (
                    <Link
                      key={item.id}
                      href={`/products/${item.slug}`}
                      className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-[#f3efe6]/70 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 overflow-hidden rounded-xl shrink-0">
                          <ProduceArtwork visualKey={item.visualKey} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#111c16]">
                            {lang === "bn" ? item.nameBn : item.nameEn}
                          </p>
                          <p className="text-xs text-[#526559]">
                            {item.farmerDistrict} • {defVar?.label}
                          </p>
                        </div>
                      </div>
                      <span className="font-mono text-sm font-bold text-[#14532d]">
                        {formatTaka(defVar?.priceBdt ?? 0, lang)}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <button
              type="button"
              onClick={toggleLang}
              title="Switch English / বাংলা"
              className="inline-flex items-center gap-1.5 rounded-full border border-[#dcd7c9] bg-white px-3 py-2 text-xs font-semibold text-[#111c16] hover:border-[#166534] hover:bg-emerald-50/50 transition cursor-pointer"
            >
              <Languages className="h-3.5 w-3.5 text-[#166534]" />
              <span>{lang === "en" ? "বাংলা" : "EN"}</span>
            </button>

            <Link
              href="/track"
              className="hidden lg:inline-flex items-center gap-1.5 rounded-full border border-[#dcd7c9] bg-white px-3.5 py-2 text-xs font-semibold text-[#111c16] hover:border-[#166534] transition"
            >
              <Truck className="h-3.5 w-3.5 text-[#d97706]" />
              <span>{t(lang, "trackOrder")}</span>
            </Link>

            {userRole === "admin" && (
              <Link
                href="/admin"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3.5 py-2 text-xs font-bold text-amber-900 hover:bg-amber-200 transition"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span>{t(lang, "adminPanel")}</span>
              </Link>
            )}

            <Link
              href={session?.user ? "/account" : "/sign-in"}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#dcd7c9] bg-white px-3.5 py-2 text-xs font-semibold text-[#111c16] hover:border-[#166534] transition"
            >
              <User className="h-3.5 w-3.5 text-[#166534]" />
              <span className="hidden sm:inline">
                {session?.user
                  ? session.user.name.split(" ")[0]
                  : t(lang, "signIn")}
              </span>
            </Link>

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-[#14532d] px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-[#166534] transition cursor-pointer"
            >
              <ShoppingBag className="h-4 w-4 text-emerald-200" />
              <span className="hidden sm:inline">{t(lang, "cart")}</span>
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#f59e0b] px-1.5 font-mono text-[11px] font-bold text-[#111c16]">
                {totalCount}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="px-4 pb-3 md:hidden">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-[#526559]" />
            <input
              type="search"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={t(lang, "searchPlaceholder")}
              className="w-full rounded-full border border-[#dcd7c9] bg-white py-2 pl-10 pr-4 text-sm text-[#111c16] focus:border-[#166534] focus:outline-none"
            />
          </form>
        </div>
      </header>

      {/* Mobile Sticky Bottom Cart Pill */}
      {totalCount > 0 && !isCartOpen && (
        <div className="fixed bottom-3 left-4 right-4 z-40 md:hidden">
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="flex w-full items-center justify-between rounded-2xl bg-[#14532d] px-4 py-3 text-white shadow-xl ring-1 ring-emerald-400/30"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 font-mono text-xs font-bold text-[#111c16]">
                {totalCount}
              </span>
              <span className="text-sm font-semibold">
                {lang === "bn" ? "বাজার ব্যাগ দেখুন" : "View Bazar Bag"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-sm font-bold">
              <span>{formatTaka(subtotal, lang)}</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </button>
        </div>
      )}

      {/* Slide-Over Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/45 backdrop-blur-xs">
          <div
            className="flex h-full w-full max-w-md flex-col bg-[#faf8f3] shadow-2xl"
            role="dialog"
            aria-label="Bazar Bag"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-[#e4e0d5] bg-white px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-[#14532d]">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#111c16]">
                    {t(lang, "cart")} ({totalCount})
                  </h2>
                  <p className="text-xs text-[#526559]">
                    {lang === "bn"
                      ? "ভোর ৬টা থেকে ডেলিভারি"
                      : "Fresh dispatch starting 6:00 AM"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="rounded-full p-2 text-[#526559] hover:bg-[#f3efe6] cursor-pointer"
                aria-label="Close bag"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Free Delivery + Sobji Club Progress */}
            <div className="border-b border-[#e4e0d5] bg-emerald-50/70 px-5 py-3">
              <div className="flex items-center justify-between text-xs font-semibold text-[#14532d]">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                  {remainingForFree === 0
                    ? lang === "bn"
                      ? "ফ্রি ডেলিভারি + সবজি ক্লাব আনলক হয়েছে!"
                      : "Free Delivery + Sobji Club Unlocked!"
                    : lang === "bn"
                      ? `আর ${formatTaka(remainingForFree, lang)} যোগ করলে ফ্রি ডেলিভারি!`
                      : `Add ${formatTaka(remainingForFree)} more for Free Delivery + Club`}
                </span>
                <span>{progressToFree}%</span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-emerald-200/70">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#16a34a] to-[#f59e0b] transition-all duration-300"
                  style={{ width: `${progressToFree}%` }}
                />
              </div>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100/80 text-[#166534]">
                    <ShoppingBag className="h-8 w-8" />
                  </div>
                  <p className="text-base font-bold text-[#111c16]">
                    {lang === "bn"
                      ? "আপনার বাজার ব্যাগ খালি"
                      : "Your bazar bag is empty"}
                  </p>
                  <p className="mt-1 max-w-xs text-xs text-[#526559]">
                    {lang === "bn"
                      ? "তাজা সবজি, শাক, ফল ও মাছ যোগ করে ভোরের ডেলিভারি বুক করুন।"
                      : "Add dawn-harvested vegetables, shak, fruits, or river fish to start."}
                  </p>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.variantId}
                    className="flex items-center gap-3 rounded-2xl border border-[#e4e0d5] bg-white p-3 shadow-2xs"
                  >
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                      <ProduceArtwork visualKey={item.visualKey} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/products/${item.slug}`}
                        onClick={() => setIsCartOpen(false)}
                        className="block truncate text-sm font-bold text-[#111c16] hover:text-[#166534]"
                      >
                        {lang === "bn" ? item.nameBn : item.nameEn}
                      </Link>
                      <p className="text-xs text-[#526559]">{item.variantLabel}</p>
                      <p className="mt-1 font-mono text-sm font-bold text-[#14532d]">
                        {formatTaka(item.priceBdt * item.quantity, lang)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button
                        type="button"
                        onClick={() => removeItem(item.variantId)}
                        className="text-stone-400 hover:text-red-600 transition cursor-pointer"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <div className="flex items-center gap-1.5 rounded-full border border-[#e4e0d5] bg-[#faf8f3] p-0.5">
                        <button
                          type="button"
                          onClick={() => updateQty(item.variantId, item.quantity - 1)}
                          className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-white text-[#111c16] cursor-pointer"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="min-w-5 text-center font-mono text-xs font-bold">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQty(item.variantId, item.quantity + 1)}
                          className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-white text-[#111c16] cursor-pointer"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-[#e4e0d5] bg-white p-5 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#526559]">
                    {lang === "bn" ? "মোট পণ্যের দাম" : "Bazar Subtotal"}
                  </span>
                  <span className="font-mono text-lg font-extrabold text-[#111c16]">
                    {formatTaka(subtotal, lang)}
                  </span>
                </div>
                <p className="flex items-center gap-1.5 text-xs text-[#526559]">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#16a34a]" />
                  <span>
                    {lang === "bn"
                      ? "ডেলিভারি স্লট ও কুপন পরবর্তী ধাপে যোগ করুন"
                      : "Select 6:00 AM slot & apply promo code at checkout"}
                  </span>
                </p>
                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#14532d] py-3.5 text-sm font-bold text-white shadow-md hover:bg-[#166534] transition"
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
