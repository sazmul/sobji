"use client";

import React, { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  MapPin,
  Package,
  Printer,
  Search,
  Sparkles,
  Sprout,
  Truck,
  XCircle,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SobjiLogo } from "@/components/Logo";
import { ProduceArtwork } from "@/components/ProduceArtwork";
import { useApp } from "@/components/Providers";
import { CardRowSkeleton } from "@/components/Skeletons";
import { formatTaka } from "@/lib/utils";

interface TrackedOrder {
  id: number;
  orderCode: string;
  customerName: string;
  customerPhone: string;
  deliveryArea: string;
  deliveryAddress: string;
  slotLabel: string;
  deliveryDate: string;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  subtotalBdt: number;
  discountBdt: number;
  deliveryFeeBdt: number;
  totalBdt: number;
  createdAt: string;
  items: Array<{
    id: number;
    productNameEn: string;
    productNameBn: string;
    variantLabel: string;
    visualKey: string;
    unitPriceBdt: number;
    quantity: number;
    lineTotalBdt: number;
  }>;
}

const STEPS = [
  { key: "confirmed", en: "Order Confirmed", bn: "অর্ডার নিশ্চিত", icon: CheckCircle2 },
  { key: "harvesting", en: "Harvesting at Farm", bn: "ক্ষেত থেকে সংগ্রহ", icon: Sprout },
  { key: "packed", en: "Packed in Dawn Crate", bn: "প্যাকিং সম্পন্ন", icon: Package },
  { key: "out_for_delivery", en: "Out for Delivery", bn: "ডেলিভারির পথে", icon: Truck },
  { key: "delivered", en: "Delivered", bn: "ডেলিভারি সম্পন্ন", icon: Sparkles },
];

function TrackInner() {
  const { lang, showToast } = useApp();
  const searchParams = useSearchParams();
  const initialCode = searchParams.get("code") || "SBJ-DEMO01";
  const justPlaced = searchParams.get("placed") === "1";

  const [code, setCode] = useState(initialCode);
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showCancelBox, setShowCancelBox] = useState(false);
  const [phoneLast4, setPhoneLast4] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const fetchOrder = useCallback(async (targetCode: string, showSpinner = true) => {
    if (!targetCode.trim()) return;
    if (showSpinner) setLoading(true);
    setError("");
    setShowCancelBox(false);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(targetCode.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        setOrder(null);
        setError(data.error || "Order not found");
        return;
      }
      setOrder(data.order);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialCode) return;
    let active = true;
    fetch(`/api/orders/${encodeURIComponent(initialCode.trim())}`)
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!active) return;
        if (!ok) {
          setOrder(null);
          setError(data.error || "Order not found");
        } else {
          setOrder(data.order);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [initialCode]);

  async function handleCancelOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!order) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(order.orderCode)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel", phoneLast4: phoneLast4.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Could not cancel order", "error");
        return;
      }
      setOrder(data.order);
      setShowCancelBox(false);
      setPhoneLast4("");
      showToast(
        lang === "bn" ? "অর্ডারটি বাতিল করা হয়েছে" : "Order cancelled successfully",
        "info"
      );
    } finally {
      setCancelling(false);
    }
  }

  const currentStepIdx = order
    ? Math.max(
        0,
        STEPS.findIndex((s) => s.key === order.status)
      )
    : 0;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      {justPlaced && (
        <div className="no-print mb-6 flex items-center gap-3 rounded-2xl border border-emerald-300 bg-emerald-50 p-5 text-[#0f7b3f]">
          <CheckCircle2 className="h-6 w-6 shrink-0 text-[#0f7b3f]" />
          <div>
            <p className="text-base font-extrabold">
              {lang === "bn"
                ? "অর্ডার সফলভাবে গৃহীত হয়েছে!"
                : "Your Bazar Order is Confirmed!"}
            </p>
            <p className="text-xs text-[#4b5563]">
              {lang === "bn" ? "আপনার ট্র্যাকিং কোডটি সংরক্ষণ করুন: " : "Save your tracking code "}
              <span className="tabular-nums font-bold">{order?.orderCode || initialCode}</span>
              {lang === "bn" ? "" : " to monitor live farm harvest & rider dispatch."}
            </p>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-[#e5e7eb] bg-white p-6 sm:p-8 print:border-none print:p-0">
        {/* Print-only Brand Header */}
        <div className="hidden print:flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
          <SobjiLogo />
          <div className="text-right text-xs text-gray-600">
            <p className="font-bold text-gray-900 text-sm">CUSTOMER INVOICE</p>
            <p>Hotline: +880 1885-592511</p>
            <p>care@sobji.com</p>
          </div>
        </div>

        <div className="no-print">
          <h1 className="text-2xl font-semibold text-[#111827] sm:text-3xl">
            {lang === "bn" ? "লাইভ অর্ডার ট্র্যাকার" : "Live Farm-to-Kitchen Order Tracker"}
          </h1>
          <p className="mt-1 text-sm text-[#6b7280]">
            {lang === "bn" ? "আপনার sobji.com অর্ডার কোড দিন (উদাহরণ: " : "Enter your sobji.com order code (try "}
            <button
              type="button"
              onClick={() => {
                setCode("SBJ-DEMO01");
                fetchOrder("SBJ-DEMO01");
              }}
              className="tabular-nums font-bold text-[#0f7b3f] underline cursor-pointer"
            >
              SBJ-DEMO01
            </button>
            ).
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchOrder(code);
            }}
            className="mt-4 flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-[#6b7280]" />
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="SBJ-XXXXXX"
                className="w-full rounded-xl border border-[#d1d5db] py-2.5 pl-10 pr-4 tabular-nums text-sm font-bold uppercase focus:border-[#0b5e30] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-[#0f7b3f] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#0b5e30] cursor-pointer"
            >
              {loading ? "..." : lang === "bn" ? "ট্র্যাক" : "Track"}
            </button>
          </form>
        </div>

        {error && (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </p>
        )}

        {order && (
          <div className="mt-8 space-y-7 print:mt-0">
            {/* Status Header + Print / Cancel Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[#f9faf8] p-4 border border-[#e5e7eb]">
              <div>
                <p className="text-xs text-[#6b7280]">
                  {lang === "bn" ? "অর্ডার কোড" : "Order Code"}
                </p>
                <p className="tabular-nums text-xl font-extrabold text-[#0f7b3f]">
                  {order.orderCode}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#6b7280]">
                  {lang === "bn" ? "ডেলিভারি সময়" : "Delivery Window"}
                </p>
                <p className="flex items-center gap-1.5 text-sm font-bold text-[#111827]">
                  <Clock className="h-4 w-4 text-[#d97706]" />
                  {order.deliveryDate} • {order.slotLabel}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide ${
                    order.status === "cancelled"
                      ? "bg-red-100 text-red-700"
                      : "bg-[#0f7b3f] text-white"
                  }`}
                >
                  {order.status.replaceAll("_", " ")}
                </span>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="no-print inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:border-[#0f7b3f] hover:text-[#0f7b3f] cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>{lang === "bn" ? "ইনভয়েস" : "Print Invoice"}</span>
                </button>
              </div>
            </div>

            {/* Cancelled Notice or Live Stepper */}
            {order.status === "cancelled" ? (
              <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                <XCircle className="h-5 w-5 shrink-0 text-red-600" />
                <span>
                  {lang === "bn"
                    ? "এই অর্ডারটি বাতিল করা হয়েছে এবং পণ্যের স্টক পুনরুদ্ধার করা হয়েছে।"
                    : "This order has been cancelled and reserved stock has been released."}
                </span>
              </div>
            ) : (
              <div className="no-print grid gap-3 sm:grid-cols-5">
                {STEPS.map((step, idx) => {
                  const Icon = step.icon;
                  const done = idx <= currentStepIdx;
                  return (
                    <div
                      key={step.key}
                      className={`rounded-xl border p-3.5 text-center transition ${
                        done
                          ? "border-emerald-300 bg-emerald-50 text-[#0f7b3f]"
                          : "border-[#e5e7eb] bg-white text-stone-400"
                      }`}
                    >
                      <div
                        className={`mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full ${
                          done ? "bg-[#0f7b3f] text-white" : "bg-stone-100 text-stone-400"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <p className="text-xs font-bold leading-tight">
                        {lang === "bn" ? step.bn : step.en}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Self-Cancel Box when order is still "confirmed" */}
            {order.status === "confirmed" && (
              <div className="no-print rounded-2xl border border-amber-200 bg-amber-50/50 p-4">
                {!showCancelBox ? (
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-gray-700">
                      {lang === "bn"
                        ? "খামার থেকে সংগ্রহ শুরুর আগে পর্যন্ত আপনি এই অর্ডারটি বাতিল করতে পারবেন।"
                        : "Changed your mind? You can cancel before morning harvesting starts."}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowCancelBox(true)}
                      className="rounded-lg border border-red-200 bg-white px-3 py-1.5 font-semibold text-red-600 hover:bg-red-50 cursor-pointer"
                    >
                      {lang === "bn" ? "অর্ডার বাতিল করুন" : "Cancel Order"}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleCancelOrder} className="flex flex-wrap items-center gap-2 text-xs">
                    <input
                      type="text"
                      maxLength={11}
                      value={phoneLast4}
                      onChange={(e) => setPhoneLast4(e.target.value)}
                      placeholder={
                        lang === "bn"
                          ? "অর্ডার ফোনের শেষ ৪ ডিজিট (সাইন-ইন না থাকলে)"
                          : "Last 4 digits of order phone (if guest)"
                      }
                      className="h-9 flex-1 min-w-[200px] rounded-lg border border-gray-300 bg-white px-3 text-xs focus:border-[#0f7b3f] focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={cancelling}
                      className="h-9 rounded-lg bg-red-600 px-4 font-semibold text-white hover:bg-red-700 disabled:opacity-60 cursor-pointer"
                    >
                      {cancelling
                        ? "..."
                        : lang === "bn"
                          ? "নিশ্চিত বাতিল"
                          : "Confirm Cancel"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCancelBox(false)}
                      className="h-9 rounded-lg border border-gray-200 bg-white px-3 font-semibold text-gray-600 cursor-pointer"
                    >
                      {lang === "bn" ? "থাক" : "Keep"}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Address & Payment */}
            <div className="grid gap-4 sm:grid-cols-2 text-sm">
              <div className="rounded-2xl border border-[#e5e7eb] p-4 space-y-1">
                <p className="flex items-center gap-1.5 text-xs font-bold uppercase text-[#6b7280]">
                  <MapPin className="h-3.5 w-3.5 text-[#0f7b3f]" />
                  {lang === "bn" ? "ডেলিভারি ঠিকানা" : "Delivery Destination"}
                </p>
                <p className="font-bold text-[#111827]">{order.customerName}</p>
                <p className="text-[#4b5563]">
                  {order.deliveryAddress}, {order.deliveryArea}
                </p>
                <p className="tabular-nums text-xs text-[#6b7280]">{order.customerPhone}</p>
              </div>
              <div className="rounded-2xl border border-[#e5e7eb] p-4 space-y-1">
                <p className="text-xs font-bold uppercase text-[#6b7280]">
                  {lang === "bn" ? "পেমেন্ট ও মোট বিল" : "Payment & Total"}
                </p>
                <p className="font-bold text-[#111827] uppercase">
                  {order.paymentMethod} • {order.paymentStatus}
                </p>
                <div className="text-xs text-gray-500 space-y-0.5 pt-1">
                  <div className="flex justify-between">
                    <span>{lang === "bn" ? "সাবটোটাল:" : "Subtotal:"}</span>
                    <span className="tabular-nums">{formatTaka(order.subtotalBdt, lang)}</span>
                  </div>
                  {order.discountBdt > 0 && (
                    <div className="flex justify-between text-[#0f7b3f]">
                      <span>{lang === "bn" ? "ডিসকাউন্ট:" : "Discount:"}</span>
                      <span className="tabular-nums">-{formatTaka(order.discountBdt, lang)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>{lang === "bn" ? "ডেলিভারি ফি:" : "Delivery Fee:"}</span>
                    <span className="tabular-nums">
                      {order.deliveryFeeBdt === 0 ? "FREE" : formatTaka(order.deliveryFeeBdt, lang)}
                    </span>
                  </div>
                </div>
                <p className="tabular-nums text-xl font-extrabold text-[#0f7b3f] pt-1">
                  {formatTaka(order.totalBdt, lang)}
                </p>
              </div>
            </div>

            {/* Items */}
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#6b7280] mb-3">
                {lang === "bn" ? "অর্ডারকৃত পণ্য" : "Bazar Crate Items"} ({order.items.length})
              </h2>
              <div className="divide-y divide-[#e5e7eb] rounded-2xl border border-[#e5e7eb]">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 p-3.5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 overflow-hidden rounded-xl shrink-0">
                        <ProduceArtwork visualKey={item.visualKey} alt={item.productNameEn} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#111827]">
                          {lang === "bn" ? item.productNameBn : item.productNameEn}
                        </p>
                        <p className="text-xs text-[#6b7280]">
                          {item.variantLabel} × {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="tabular-nums text-sm font-bold text-[#0f7b3f]">
                      {formatTaka(item.lineTotalBdt, lang)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="no-print flex justify-end">
              <Link
                href="/"
                className="rounded-xl border border-[#d1d5db] px-5 py-2.5 text-xs font-bold text-[#111827] hover:border-[#0f7b3f]"
              >
                {lang === "bn" ? "কেনাকাটা চালিয়ে যান" : "Continue Shopping"}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
              <CardRowSkeleton rows={3} />
            </div>
          }
        >
          <TrackInner />
        </Suspense>
      </main>
      <div className="no-print">
        <Footer />
      </div>
    </div>
  );
}
