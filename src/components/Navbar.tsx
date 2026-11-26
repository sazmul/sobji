"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ShoppingBag,
  User,
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
      document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push(`/?q=${encodeURIComponent(search)}#catalog`);
    }
  };

  const progressToFree = Math.min(100, Math.round((subtotal / FREE_DELIVERY_THRESHOLD) * 100));
  const remainingForFree = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);

  return (
    <>
      {/* Quiet Editorial Utility Bar */}
      <div className="bg-[#143624] text-[#e7efe7] text-[11px] tracking-wide border-b border-[#1d4a32]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 sm:px-6">
          <p className="truncate font-medium">
            {lang === "bn"
              ? "ভোর ৬টা থেকে ঢাকা জুড়ে ডেলিভারি • ৪৯৯৳+ অর্ডারে ফ্রি ডেলিভারি"
              : "Dawn dispatch across Dhaka from 6:00 AM • Complimentary delivery over ৳499"}
          </p>
          <div className="hidden sm:flex items-center gap-5 text-[#c7d7c9]">
            <Link href="/track" className="hover:text-white transition">
              {t(lang, "trackOrder")}
            </Link>
            <Link href="/#traceability" className="hover:text-white transition">
              {lang === "bn" ? "আমাদের কৃষক" : "Growers"}
            </Link>
            <span className="font-mono text-[10px] text-[#e8c6a8]">CODE: SOBJI10</span>
          </div>
        </div>
      </div>

      {/* Main Architectural Header */}
      <header className="sticky top-0 z-40 border-b border-[#e7e2d8] bg-[#fbf9f5]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-8">
            <Link href="/" className="shrink-0">
              <SobjiLogo />
            </Link>
            <nav className="hidden xl:flex items-center gap-6 text-xs font-semibold uppercase tracking-[0.08em] text-[#4c5b51]">
              <Link href="/#catalog" className="hover:text-[#112218] transition">
                {lang === "bn" ? "বাজার" : "Market"}
              </Link>
              <Link href="/#traceability" className="hover:text-[#112218] transition">
                {lang === "bn" ? "উৎস" : "Provenance"}
              </Link>
              <Link href="/#slots" className="hover:text-[#112218] transition">
                {lang === "bn" ? "স্লট" : "Delivery"}
              </Link>
              <Link href="/track" className="hover:text-[#112218] transition">
                {t(lang, "trackOrder")}
              </Link>
            </nav>
          </div>

          {/* Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative hidden md:block flex-1 max-w-md"
          >
            <div className="relative flex items-center">
              <Search className="pointer-events-none absolute left-3.5 h-3.5 w-3.5 text-[#5b695f]" />
              <input
                type="search"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => search.trim() && setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 180)}
                placeholder={t(lang, "searchPlaceholder")}
                className="w-full rounded-lg border border-[#ded8cc] bg-white py-2 pl-9 pr-3.5 text-xs text-[#112218] placeholder:text-[#869289] transition focus:border-[#143624] focus:outline-none"
              />
            </div>

            {showDropdown && filteredQuick.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 overflow-hidden rounded-xl border border-[#e7e2d8] bg-white shadow-lg z-50 divide-y divide-[#f1ede5]">
                {filteredQuick.map((item) => {
                  const defVar =
                    item.variants.find((v) => v.isDefault) ?? item.variants[0];
                  return (
                    <Link
                      key={item.id}
                      href={`/products/${item.slug}`}
                      className="flex items-center justify-between gap-3 px-3.5 py-2.5 hover:bg-[#f8f6f1] transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 overflow-hidden rounded-md shrink-0">
                          <ProduceArtwork
                            visualKey={item.visualKey}
                            imageUrl={item.imageUrl}
                            alt={item.nameEn}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-[#112218]">
                            {lang === "bn" ? item.nameBn : item.nameEn}
                          </p>
                          <p className="text-[11px] text-[#5b695f]">
                            {item.farmerDistrict} · {defVar?.label}
                          </p>
                        </div>
                      </div>
                      <span className="font-mono text-xs font-semibold text-[#143624]">
                        {formatTaka(defVar?.priceBdt ?? 0, lang)}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </form>

          {/* Right Utility Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleLang}
              className="rounded-lg border border-[#ded8cc] bg-white px-2.5 py-2 text-[11px] font-semibold tracking-wide text-[#112218] hover:border-[#143624] transition cursor-pointer"
            >
              {lang === "en" ? "বাংলা" : "EN"}
            </button>

            {userRole === "admin" && (
              <Link
                href="/admin"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-[#d8c4b5] bg-[#f8efe8] px-3 py-2 text-[11px] font-semibold text-[#7d3710] hover:bg-[#f2e2d5] transition"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span>{t(lang, "adminPanel")}</span>
              </Link>
            )}

            <Link
              href={session?.user ? "/account" : "/sign-in"}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#ded8cc] bg-white px-3 py-2 text-xs font-medium text-[#112218] hover:border-[#143624] transition"
            >
              <User className="h-3.5 w-3.5 text-[#5b695f]" />
              <span className="hidden sm:inline">
                {session?.user
                  ? session.user.name.split(" ")[0]
                  : t(lang, "signIn")}
              </span>
            </Link>

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-[#143624] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#1d4a32] transition cursor-pointer"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">
                {lang === "bn" ? "ব্যাগ" : "Bag"}
              </span>
              <span className="font-mono text-[11px] text-[#d5e6d7]">
                ({totalCount})
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="px-4 pb-3 md:hidden">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="pointer-events-none absolute left-3 h-3.5 w-3.5 text-[#5b695f]" />
            <input
              type="search"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={t(lang, "searchPlaceholder")}
              className="w-full rounded-lg border border-[#ded8cc] bg-white py-2 pl-9 pr-3 text-xs text-[#112218] focus:border-[#143624] focus:outline-none"
            />
          </form>
        </div>
      </header>

      {/* Mobile Sticky Bottom Bar */}
      {totalCount > 0 && !isCartOpen && (
        <div className="fixed bottom-3 left-4 right-4 z-40 md:hidden">
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="flex w-full items-center justify-between rounded-xl bg-[#143624] px-4 py-3 text-white shadow-xl"
          >
            <span className="text-xs font-semibold">
              {totalCount} {lang === "bn" ? "টি পণ্য ব্যাগে" : "items in bag"}
            </span>
            <span className="flex items-center gap-1.5 font-mono text-sm font-semibold">
              {formatTaka(subtotal, lang)}
              <ArrowRight className="h-4 w-4" />
            </span>
          </button>
        </div>
      )}

      {/* Architectural Slide-Over Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-[#112218]/40 backdrop-blur-[2px]">
          <div
            className="flex h-full w-full max-w-md flex-col border-l border-[#e7e2d8] bg-[#fbf9f5] shadow-2xl"
            role="dialog"
            aria-label="Bazar Bag"
          >
            <div className="flex items-center justify-between border-b border-[#e7e2d8] bg-white px-6 py-4">
              <div>
                <h2 className="font-display text-xl font-semibold text-[#112218]">
                  {t(lang, "cart")} ({totalCount})
                </h2>
                <p className="text-[11px] text-[#5b695f]">
                  {lang === "bn"
                    ? "ভোর ৬টা থেকে ঢাকা ডেলিভারি"
                    : "Morning & Express slots available"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="rounded-lg p-1.5 text-[#5b695f] hover:bg-[#f5f3ee] cursor-pointer"
                aria-label="Close bag"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="border-b border-[#e7e2d8] bg-[#f5f3ee] px-6 py-3">
              <div className="flex items-center justify-between text-[11px] font-semibold text-[#143624]">
                <span>
                  {remainingForFree === 0
                    ? lang === "bn"
                      ? "ফ্রি ডেলিভারি ও সবজি ক্লাব আনলক হয়েছে"
                      : "Complimentary delivery + Sobji Club unlocked"
                    : lang === "bn"
                      ? `ফ্রি ডেলিভারির জন্য আরও ${formatTaka(remainingForFree, lang)} যোগ করুন`
                      : `Add ${formatTaka(remainingForFree)} more for free delivery`}
                </span>
                <span className="font-mono">{progressToFree}%</span>
              </div>
              <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-[#ded8cc]">
                <div
                  className="h-full bg-[#143624] transition-all duration-300"
                  style={{ width: `${progressToFree}%` }}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-[#e7e2d8]">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <ShoppingBag className="h-8 w-8 text-[#9aa59d] mb-3" strokeWidth={1.5} />
                  <p className="font-display text-lg font-medium text-[#112218]">
                    {lang === "bn"
                      ? "আপনার বাজার ব্যাগ খালি"
                      : "Your bazar bag is empty"}
                  </p>
                  <p className="mt-1 max-w-xs text-xs text-[#5b695f]">
                    {lang === "bn"
                      ? "তাজা সবজি, শাক ও মাছ বেছে নিন।"
                      : "Select fresh farm vegetables, shak, or river fish to begin."}
                  </p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.variantId} className="flex items-center gap-3.5 py-4">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-[#e7e2d8]">
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
                        className="block truncate text-sm font-semibold text-[#112218] hover:underline"
                      >
                        {lang === "bn" ? item.nameBn : item.nameEn}
                      </Link>
                      <p className="text-xs text-[#5b695f]">{item.variantLabel}</p>
                      <p className="mt-1 font-mono text-xs font-semibold text-[#143624]">
                        {formatTaka(item.priceBdt * item.quantity, lang)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button
                        type="button"
                        onClick={() => removeItem(item.variantId)}
                        className="text-[#869289] hover:text-[#a14a18] transition cursor-pointer"
                        aria-label="Remove"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      <div className="flex items-center rounded-md border border-[#ded8cc] bg-white">
                        <button
                          type="button"
                          onClick={() => updateQty(item.variantId, item.quantity - 1)}
                          className="p-1.5 text-[#112218] hover:bg-[#f5f3ee] cursor-pointer"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="min-w-6 text-center font-mono text-xs font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQty(item.variantId, item.quantity + 1)}
                          className="p-1.5 text-[#112218] hover:bg-[#f5f3ee] cursor-pointer"
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
              <div className="border-t border-[#e7e2d8] bg-white p-6 space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs uppercase tracking-wider text-[#5b695f] font-semibold">
                    {lang === "bn" ? "সাবটোটাল" : "Subtotal"}
                  </span>
                  <span className="font-mono text-xl font-bold text-[#112218]">
                    {formatTaka(subtotal, lang)}
                  </span>
                </div>
                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#143624] py-3.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#1d4a32] transition"
                >
                  <span>
                    {lang === "bn" ? "চেকআউট করুন" : "Proceed to Checkout"}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
