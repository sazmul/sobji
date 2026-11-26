"use client";

import React from "react";
import Link from "next/link";
import { PhoneCall, Mail, MapPin, ShieldCheck, Clock } from "lucide-react";
import { SobjiLogo } from "./Logo";
import { useApp } from "./Providers";
import { t } from "@/lib/i18n";

export function Footer() {
  const { lang } = useApp();

  return (
    <footer className="mt-20 border-t border-[#1e3a28] bg-[#102619] text-emerald-50">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <SobjiLogo light />
            <p className="text-sm leading-relaxed text-emerald-200/80">
              {t(lang, "footerTagline")}
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-emerald-900/80 px-3 py-1 text-emerald-200 ring-1 ring-emerald-700/60">
                bKash
              </span>
              <span className="rounded-full bg-emerald-900/80 px-3 py-1 text-emerald-200 ring-1 ring-emerald-700/60">
                Nagad
              </span>
              <span className="rounded-full bg-emerald-900/80 px-3 py-1 text-emerald-200 ring-1 ring-emerald-700/60">
                Cards
              </span>
              <span className="rounded-full bg-emerald-900/80 px-3 py-1 text-emerald-200 ring-1 ring-emerald-700/60">
                Cash on Delivery
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-300">
              {lang === "bn" ? "কুইক লিংক" : "Explore Bazar"}
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-emerald-100/80">
              <li>
                <Link href="/#catalog" className="hover:text-white transition">
                  {lang === "bn" ? "সব তাজা পণ্য" : "All Fresh Produce"}
                </Link>
              </li>
              <li>
                <Link href="/#traceability" className="hover:text-white transition">
                  {lang === "bn" ? "আমাদের কৃষক ও খামার" : "Farmer Traceability"}
                </Link>
              </li>
              <li>
                <Link href="/track" className="hover:text-white transition">
                  {lang === "bn" ? "অর্ডার ট্র্যাক করুন" : "Track Live Order"}
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-white transition">
                  {lang === "bn" ? "সবজি ক্লাব ও অ্যাকাউন্ট" : "Sobji Club & Account"}
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-white transition">
                  {lang === "bn" ? "অপারেশনস অ্যাডমিন" : "Operations Admin"}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-300">
              {lang === "bn" ? "ডেলিভারি এলাকা" : "Dhaka Coverage"}
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-emerald-100/80">
              Dhanmondi, Gulshan, Banani, Baridhara, Uttara, Mirpur, Mohammadpur,
              Bashundhara R/A, Badda, Rampura, Khilgaon & Motijheel.
            </p>
            <div className="mt-4 rounded-2xl bg-emerald-900/50 p-3 text-xs text-emerald-100 ring-1 ring-emerald-800">
              <p className="font-semibold text-amber-300 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {lang === "bn" ? "প্রোমো কোড ব্যবহার করুন" : "Active Promo Codes"}
              </p>
              <p className="mt-1 font-mono">
                SOBJI10 (10% off) • FRESH50 (৳50 off)
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-300">
              {lang === "bn" ? "সাপোর্ট ও যোগাযোগ" : "Care & Dispatch"}
            </h3>
            <div className="space-y-2.5 text-sm text-emerald-100/85">
              <p className="flex items-center gap-2">
                <PhoneCall className="h-4 w-4 text-emerald-400" />
                <span>+880 1700-762544 (WhatsApp & Call)</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-emerald-400" />
                <span>care@sobji.com</span>
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emerald-400" />
                <span>Kawran Bazar Dawn Hub, Dhaka 1215</span>
              </p>
              <p className="flex items-center gap-2 text-xs text-emerald-300 pt-1">
                <ShieldCheck className="h-4 w-4" />
                <span>24-Hour Freshness Replacement Guarantee</span>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-emerald-800/70 pt-6 text-xs text-emerald-300/70 sm:flex-row">
          <p>© 2026 sobji.com — Direct Farm-to-Kitchen Bazar Bangladesh.</p>
          <p>Sample tracking code: <Link href="/track?code=SBJ-DEMO01" className="font-mono text-amber-300 underline">SBJ-DEMO01</Link></p>
        </div>
      </div>
    </footer>
  );
}
