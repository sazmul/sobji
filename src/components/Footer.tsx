"use client";

import React from "react";
import Link from "next/link";
import { SobjiLogo } from "./Logo";
import { useApp } from "./Providers";
import { t } from "@/lib/i18n";

export function Footer() {
  const { lang } = useApp();

  return (
    <footer className="mt-24 border-t border-[#1e3f2d] bg-[#10281b] text-[#e6ece7]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <SobjiLogo light />
            <p className="text-xs leading-relaxed text-[#b9c9bc]">
              {t(lang, "footerTagline")}
            </p>
            <p className="font-mono text-[11px] text-[#d5e0d7]">
              bKash · Nagad · SSLCommerz · Cash on Delivery
            </p>
          </div>

          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#a7c4a5]">
              Market & Services
            </h3>
            <ul className="mt-4 space-y-2.5 text-xs text-[#d5e0d7]">
              <li>
                <Link href="/#catalog" className="hover:text-white transition">
                  Fresh Produce Catalog
                </Link>
              </li>
              <li>
                <Link href="/#traceability" className="hover:text-white transition">
                  Verified Grower Network
                </Link>
              </li>
              <li>
                <Link href="/track" className="hover:text-white transition">
                  Live Order Tracking
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-white transition">
                  Sobji Club & Weekly Auto-Bazar
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-white transition">
                  Operations Console
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#a7c4a5]">
              Dhaka Delivery Zones
            </h3>
            <p className="mt-4 text-xs leading-relaxed text-[#b9c9bc]">
              Dhanmondi, Gulshan, Banani, Baridhara, Uttara, Mirpur, Mohammadpur,
              Bashundhara R/A, Badda, Rampura, Khilgaon & Motijheel.
            </p>
            <div className="mt-4 border-t border-[#214531] pt-3 text-[11px] text-[#d5e0d7]">
              Active codes:{" "}
              <span className="font-mono text-white">SOBJI10</span> ·{" "}
              <span className="font-mono text-white">FRESH50</span>
            </div>
          </div>

          <div className="space-y-2.5 text-xs text-[#d5e0d7]">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#a7c4a5]">
              Dispatch & Care
            </h3>
            <p className="pt-1">WhatsApp & Hotline: +880 1700-762544</p>
            <p>Email: care@sobji.com</p>
            <p className="text-[#b9c9bc]">Kawran Bazar Dawn Hub, Dhaka 1215</p>
            <p className="pt-2 text-[11px] text-[#a7c4a5]">
              24-Hour Freshness Replacement Guarantee
            </p>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-[#214531] pt-6 text-[11px] text-[#9fb3a3] sm:flex-row">
          <p>© 2026 sobji.com — Direct Farm-to-Kitchen Bazar, Bangladesh.</p>
          <p>
            Sample Order Tracker:{" "}
            <Link href="/track?code=SBJ-DEMO01" className="font-mono text-white underline">
              SBJ-DEMO01
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
