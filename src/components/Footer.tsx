"use client";

import React from "react";
import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Truck,
  ShieldCheck,
  Sprout,
  Clock,
} from "lucide-react";
import { SobjiLogo } from "./Logo";
import { useApp } from "./Providers";
import { t } from "@/lib/i18n";

const SHOP_LINKS = [
  { href: "/#catalog", en: "All Fresh Bazar", bn: "সকল তাজা পণ্য" },
  { href: "/bazar/fresh-vegetables", en: "Fresh Vegetables (Sobji)", bn: "তাজা সবজি" },
  { href: "/bazar/leafy-greens", en: "Leafy Greens (Shak)", bn: "তাজা শাক-পাতা" },
  { href: "/bazar/fresh-fruits", en: "Fresh Fruits", bn: "তাজা ফলমূল" },
  { href: "/bazar/river-fish", en: "Padma River Fish", bn: "তাজা নদীর মাছ" },
  { href: "/bazar/meat-eggs", en: "Deshi Chicken & Eggs", bn: "মুরগি ও হাঁসের ডিম" },
  { href: "/bazar/spices-herbs", en: "Spices (Moshla) & Herbs", bn: "মসলা ও পেঁয়াজ-রসুন" },
  { href: "/bazar/organic-pantry", en: "Ghani Oil & Dal", bn: "ঘানির তেল ও ডাল" },
];

const SERVICE_LINKS = [
  { href: "/#flash-deals", en: "Weekly Flash Deals", bn: "সাপ্তাহিক অফার" },
  { href: "/track", en: "Track Your Order", bn: "অর্ডার ট্র্যাক করুন" },
  { href: "/account", en: "My Account & Reorder", bn: "আমার অ্যাকাউন্ট" },
  { href: "/checkout", en: "Checkout & Bag", bn: "চেকআউট ও ব্যাগ" },
  { href: "/#membership", en: "Sobji Club Membership", bn: "সবজি ক্লাব মেম্বারশিপ" },
  { href: "/#farmers", en: "Our Partner Farmers", bn: "আমাদের কৃষক খামার" },
];

function PaymentBrandLogos() {
  return (
    <div className="flex flex-wrap items-center gap-5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/payments/bkash.png"
        alt="bKash"
        className="h-7 w-auto object-contain"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/payments/nagad.png"
        alt="Nagad"
        className="h-6.5 w-auto object-contain"
      />

      <span title="Visa" className="text-[13px] font-black italic tracking-tight text-[#1A1F71]">
        VISA
      </span>

      <svg viewBox="0 0 36 22" className="h-4.5 w-7" aria-label="Mastercard">
        <circle cx="13" cy="11" r="8.5" fill="#EB001B" />
        <circle cx="23" cy="11" r="8.5" fill="#F79E1B" fillOpacity="0.9" />
      </svg>

      <span className="text-xs font-medium text-gray-500">
        Cash on Delivery
      </span>
    </div>
  );
}

const SERVICE_PROMISES = [
  {
    icon: Sprout,
    enTitle: "5:00 AM Dawn Harvest",
    bnTitle: "ভোর ৫টায় ক্ষেত থেকে সংগ্রহ",
    enSub: "Direct from partner farms",
    bnSub: "বগুড়া ও নরসিংদী থেকে সরাসরি",
  },
  {
    icon: ShieldCheck,
    enTitle: "100% Formalin Free",
    bnTitle: "১০০% ফরমালিন মুক্ত",
    enSub: "Lab-screened fresh batches",
    bnSub: "প্রতিদিন সকালে মান যাচাইকৃত",
  },
  {
    icon: Truck,
    enTitle: "60-Min Dhaka Express",
    bnTitle: "৬০ মিনিট ঢাকা এক্সপ্রেস",
    enSub: "Morning & same-day slots",
    bnSub: "ভোর ৬টা থেকে রাত ১০টা স্লট",
  },
  {
    icon: Clock,
    enTitle: "Instant Replacement",
    bnTitle: "দরজায় দেখে নেওয়ার সুযোগ",
    enSub: "24h doorstep freshness check",
    bnSub: "পছন্দ না হলে সাথে সাথেই পরিবর্তন",
  },
];

export function Footer() {
  const { lang } = useApp();

  return (
    <footer className="mt-auto border-t border-emerald-950/10 bg-gradient-to-b from-[#f8fbf9] to-white text-gray-600">
      {/* Crisp Elevated Service Promise Strip */}
      <div className="border-b border-emerald-950/5 bg-[#f3f7f4]/80">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-3 px-4 py-6 sm:grid-cols-2 sm:gap-4 sm:px-6 lg:grid-cols-4">
          {SERVICE_PROMISES.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.enTitle}
                className="flex items-center gap-3.5 rounded-2xl border border-emerald-900/10 bg-white/95 p-3.5 shadow-[0_1px_3px_rgba(15,123,63,0.04)] transition hover:border-emerald-700/20 hover:shadow-[0_4px_12px_-4px_rgba(15,123,63,0.1)]"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50/90 text-[#0f7b3f]">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold leading-snug text-gray-900">
                    {lang === "bn" ? item.bnTitle : item.enTitle}
                  </p>
                  <p className="mt-0.5 text-xs leading-snug text-gray-500">
                    {lang === "bn" ? item.bnSub : item.enSub}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Clean 4-Column Architectural Footer */}
      <div className="mx-auto max-w-7xl px-4 py-11 sm:px-6 lg:py-13">
        <div className="grid gap-9 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* Brand Summary */}
          <div className="space-y-4 lg:col-span-4 lg:pr-4">
            <SobjiLogo />
            <p className="max-w-sm text-[13px] leading-relaxed text-gray-500">
              {t(lang, "footerTagline")}
            </p>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50/80 px-3 py-1.5 text-xs font-medium text-[#0f7b3f]">
              <span className="h-2 w-2 rounded-full bg-[#16a34a]" />
              <span>
                {lang === "bn"
                  ? "ডেলিভারি চালু: প্রতিদিন ভোর ৬টা থেকে রাত ১০টা"
                  : "Daily Dhaka deliveries: 6:00 AM to 10:00 PM"}
              </span>
            </div>
          </div>

          {/* Shop Categories */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">
              {lang === "bn" ? "তাজা বাজার" : "Shop Bazar"}
            </h3>
            <div className="mt-2 h-0.5 w-6 rounded-full bg-[#0f7b3f]/75" />
            <ul className="mt-4 space-y-2.5 text-[13px]">
              {SHOP_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex items-center text-gray-600 transition hover:translate-x-0.5 hover:text-[#0f7b3f]"
                  >
                    {lang === "bn" ? item.bn : item.en}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div className="lg:col-span-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">
              {lang === "bn" ? "কাস্টমার সেবা" : "Customer Care"}
            </h3>
            <div className="mt-2 h-0.5 w-6 rounded-full bg-[#0f7b3f]/75" />
            <ul className="mt-4 space-y-2.5 text-[13px]">
              {SERVICE_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex items-center text-gray-600 transition hover:translate-x-0.5 hover:text-[#0f7b3f]"
                  >
                    {lang === "bn" ? item.bn : item.en}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Direct Contact & Hub */}
          <div className="lg:col-span-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">
              {lang === "bn" ? "যোগাযোগ ও সহায়তা" : "Contact & Support"}
            </h3>
            <div className="mt-2 h-0.5 w-6 rounded-full bg-[#0f7b3f]/75" />
            <div className="mt-4 space-y-2.5 rounded-2xl border border-gray-200/80 bg-white p-4 text-[13px] text-gray-600 shadow-[0_2px_10px_-4px_rgba(15,23,42,0.06)]">
              <a
                href="tel:+8801885592511"
                className="group flex items-center gap-3 rounded-lg p-1 -mx-1 transition hover:bg-emerald-50/70 hover:text-[#0f7b3f]"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-[#0f7b3f] transition group-hover:bg-[#0f7b3f] group-hover:text-white">
                  <Phone className="h-3.5 w-3.5" />
                </span>
                <span className="font-semibold text-gray-900 tabular-nums group-hover:text-[#0f7b3f]">
                  +880 1885-592511
                </span>
              </a>
              <a
                href="https://wa.me/8801885592511"
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-3 rounded-lg p-1 -mx-1 transition hover:bg-emerald-50/70 hover:text-[#0f7b3f]"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-[#0f7b3f] transition group-hover:bg-[#0f7b3f] group-hover:text-white">
                  <MessageCircle className="h-3.5 w-3.5" />
                </span>
                <span className="font-medium">
                  {lang === "bn" ? "হোয়াটসঅ্যাপ অর্ডার: 01885-592511" : "WhatsApp: 01885-592511"}
                </span>
              </a>
              <a
                href="mailto:care@sobji.com"
                className="group flex items-center gap-3 rounded-lg p-1 -mx-1 transition hover:bg-emerald-50/70 hover:text-[#0f7b3f]"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-[#0f7b3f] transition group-hover:bg-[#0f7b3f] group-hover:text-white">
                  <Mail className="h-3.5 w-3.5" />
                </span>
                <span>care@sobji.com</span>
              </a>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new Event("sobji:open-chat"))}
                className="group flex w-full items-center gap-3 rounded-lg p-1 -mx-1 text-left transition hover:bg-emerald-50/70 hover:text-[#0f7b3f] cursor-pointer"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-[#0f7b3f] transition group-hover:bg-[#0f7b3f] group-hover:text-white">
                  <MessageCircle className="h-3.5 w-3.5" />
                </span>
                <span className="font-semibold text-[#0f7b3f]">
                  {lang === "bn" ? "লাইভ চ্যাট শুরু করুন" : "Start Live Chat Support"}
                </span>
              </button>
              <div className="flex items-start gap-3 border-t border-gray-100 pt-2.5 text-xs text-gray-500">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                  <MapPin className="h-3.5 w-3.5" />
                </span>
                <span className="pt-1 leading-snug">
                  {lang === "bn" ? "কারওয়ান বাজার হাব, ঢাকা ১২১৫" : "Kawran Bazar Hub, Dhaka 1215"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legal & Payment Logos Bar */}
      <div className="border-t border-gray-200/80 bg-[#f4f6f5]">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-4 pt-5 pb-24 sm:px-6 md:py-5 lg:flex-row lg:items-center">
          <p className="text-xs text-gray-500">
            © 2026 sobji.com. All rights reserved.
          </p>

          <PaymentBrandLogos />
        </div>
      </div>
    </footer>
  );
}
