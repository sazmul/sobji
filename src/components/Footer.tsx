"use client";

import React from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { SobjiLogo } from "./Logo";
import { useApp } from "./Providers";
import { t } from "@/lib/i18n";

export function Footer() {
  const { lang } = useApp();

  return (
    <footer className="border-t border-gray-200 bg-[#111827] text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <SobjiLogo light />
            <p className="text-xs leading-relaxed text-gray-400">
              {t(lang, "footerTagline")}
            </p>
            <div className="flex flex-wrap gap-1.5 text-[11px] font-medium text-gray-200">
              <span className="rounded bg-white/10 px-2.5 py-1">bKash</span>
              <span className="rounded bg-white/10 px-2.5 py-1">Nagad</span>
              <span className="rounded bg-white/10 px-2.5 py-1">SSLCommerz</span>
              <span className="rounded bg-white/10 px-2.5 py-1">Cash on Delivery</span>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              {lang === "bn" ? "কুইক লিংক" : "Categories & Links"}
            </h3>
            <ul className="mt-4 space-y-2.5 text-xs text-gray-400">
              <li>
                <Link href="/#flash-deals" className="hover:text-white transition">
                  Weekly Discounts
                </Link>
              </li>
              <li>
                <Link href="/#catalog" className="hover:text-white transition">
                  Fresh Vegetables & Leafies
                </Link>
              </li>
              <li>
                <Link href="/#recipes" className="hover:text-white transition">
                  Recipe Combos & Kits
                </Link>
              </li>
              <li>
                <Link href="/track" className="hover:text-white transition">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-white transition">
                  Sobji Membership
                </Link>
              </li>
            </ul>
          </div>

          <div id="areas">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              {lang === "bn" ? "ডেলিভারি এলাকা" : "Dhaka Available Areas"}
            </h3>
            <p className="mt-4 text-xs leading-relaxed text-gray-400">
              Dhanmondi, Gulshan, Banani, Baridhara, Uttara, Mirpur, Mohammadpur,
              Bashundhara R/A, Badda, Rampura, Khilgaon & Motijheel.
            </p>
            <p className="mt-3 text-xs text-emerald-400 font-medium">
              Promo Codes: SOBJI10 · FRESH50
            </p>
          </div>

          <div className="space-y-2.5 text-xs text-gray-400">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              {lang === "bn" ? "২৪/৭ সাপোর্ট" : "Customer Care"}
            </h3>
            <p className="flex items-center gap-2 pt-1">
              <Phone className="h-3.5 w-3.5 text-emerald-400" />
              <span>Hotline: +880 1700-762544</span>
            </p>
            <p className="flex items-center gap-2">
              <MessageCircle className="h-3.5 w-3.5 text-emerald-400" />
              <span>WhatsApp Order: 01700-762544</span>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-emerald-400" />
              <span>care@sobji.com</span>
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-emerald-400" />
              <span>Kawran Bazar Hub, Dhaka 1215</span>
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-gray-400 sm:flex-row">
          <p>© 2026 sobji.com — Straight From The Field, Bangladesh.</p>
          <p>
            Demo Order Code:{" "}
            <Link href="/track?code=SBJ-DEMO01" className="text-emerald-400 underline font-medium">
              SBJ-DEMO01
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
