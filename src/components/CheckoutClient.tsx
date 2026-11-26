"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  CreditCard,
  MapPin,
  Repeat,
  ShieldCheck,
  Sparkles,
  Tag,
  Truck,
} from "lucide-react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { useApp } from "./Providers";
import { ProduceArtwork } from "./ProduceArtwork";
import {
  calculateDeliveryFee,
  formatTaka,
  FREE_DELIVERY_THRESHOLD,
} from "@/lib/utils";
import { authClient } from "@/lib/auth-client";

interface DeliverySlot {
  id: number;
  labelEn: string;
  labelBn: string;
  windowText: string;
  isExpress: boolean;
}

const DHAKA_AREAS = [
  "Dhanmondi",
  "Gulshan",
  "Banani",
  "Baridhara",
  "Uttara",
  "Mirpur",
  "Mohammadpur",
  "Bashundhara R/A",
  "Badda",
  "Rampura",
  "Khilgaon",
  "Motijheel",
];

export function CheckoutClient({ slots }: { slots: DeliverySlot[] }) {
  const { lang, items, subtotal, clearCart, showToast } = useApp();
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const isMember = Boolean(
    (session?.user as { isMember?: boolean } | undefined)?.isMember ||
      subtotal >= FREE_DELIVERY_THRESHOLD
  );

  const [customerName, setCustomerName] = useState(session?.user?.name ?? "");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState(session?.user?.email ?? "");
  const [deliveryArea, setDeliveryArea] = useState("Dhanmondi");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [slotId, setSlotId] = useState<number>(slots[0]?.id ?? 1);
  const [deliveryDate, setDeliveryDate] = useState("");
  useEffect(() => {
    const t = setTimeout(() => {
      setDeliveryDate(new Date(Date.now() + 86400000).toISOString().slice(0, 10));
    }, 0);
    return () => clearTimeout(t);
  }, []);
  const [paymentMethod, setPaymentMethod] = useState<
    "cod" | "bkash" | "nagad" | "card"
  >("cod");
  const [paymentRef, setPaymentRef] = useState("");
  const [isRecurringWeekly, setIsRecurringWeekly] = useState(false);

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountBdt: number;
    descriptionEn: string;
  } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [placing, setPlacing] = useState(false);

  const activeSlot = slots.find((s) => s.id === slotId) ?? slots[0];
  const deliveryFee = calculateDeliveryFee(
    subtotal,
    Boolean(activeSlot?.isExpress),
    isMember
  );
  const discount = appliedCoupon?.discountBdt ?? 0;
  const finalTotal = Math.max(0, subtotal - discount + deliveryFee);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput, subtotalBdt: subtotal }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Invalid coupon", "error");
        setAppliedCoupon(null);
        return;
      }
      setAppliedCoupon(data.coupon);
      showToast(`Coupon ${data.coupon.code} applied (-৳${data.coupon.discountBdt})`);
    } finally {
      setCouponLoading(false);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setPlacing(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerPhone,
          customerEmail,
          deliveryArea,
          deliveryAddress,
          deliveryNotes,
          slotId: activeSlot?.id ?? 1,
          deliveryDate,
          paymentMethod,
          paymentRef,
          couponCode: appliedCoupon?.code,
          isRecurringWeekly,
          items: items.map((i) => ({
            variantId: i.variantId,
            quantity: i.quantity,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Failed to place order", "error");
        return;
      }
      clearCart();
      showToast("Order confirmed! Redirecting to live tracker...");
      router.push(`/track?code=${data.order.orderCode}&placed=1`);
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6">
        <h1 className="font-display text-3xl font-medium text-[#112218] sm:text-4xl">
          {lang === "bn" ? "চেকআউট ও ডেলিভারি" : "Complete Your Bazar Order"}
        </h1>
        <p className="mt-1 text-sm text-[#526559]">
          {lang === "bn"
            ? "ভোর ৬টা থেকে রাত ৯টার মধ্যে পছন্দের স্লটে তাজা ডেলিভারি নিন"
            : "Select your Dhaka address, morning/express slot & payment method."}
        </p>

        {items.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-[#e4e0d5] bg-white p-12 text-center">
            <p className="text-lg font-bold text-[#111c16]">
              Your bazar bag is currently empty
            </p>
            <Link
              href="/#catalog"
              className="mt-4 inline-flex rounded-full bg-[#14532d] px-6 py-3 text-sm font-bold text-white"
            >
              Browse Fresh Vegetables
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handlePlaceOrder}
            className="mt-8 grid gap-8 lg:grid-cols-12"
          >
            {/* Left Form */}
            <div className="space-y-6 lg:col-span-7">
              {/* Customer & Address */}
              <div className="rounded-3xl border border-[#e4e0d5] bg-white p-6 space-y-4">
                <h2 className="flex items-center gap-2 text-base font-bold text-[#111c16]">
                  <MapPin className="h-4 w-4 text-[#16a34a]" />
                  <span>
                    {lang === "bn" ? "ডেলিভারি ঠিকানা" : "1. Delivery Details"}
                  </span>
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-[#526559]">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Nusrat Jahan"
                      className="mt-1 w-full rounded-xl border border-[#dcd7c9] px-3.5 py-2.5 text-sm focus:border-[#166534] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#526559]">
                      Mobile Number (BD) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="017XX-XXXXXX"
                      className="mt-1 w-full rounded-xl border border-[#dcd7c9] px-3.5 py-2.5 text-sm focus:border-[#166534] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#526559]">
                      Dhaka Area *
                    </label>
                    <select
                      value={deliveryArea}
                      onChange={(e) => setDeliveryArea(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-[#dcd7c9] bg-white px-3.5 py-2.5 text-sm focus:border-[#166534] focus:outline-none"
                    >
                      {DHAKA_AREAS.map((area) => (
                        <option key={area} value={area}>
                          {area}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#526559]">
                      Email (Optional)
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="mt-1 w-full rounded-xl border border-[#dcd7c9] px-3.5 py-2.5 text-sm focus:border-[#166534] focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#526559]">
                    House, Road, Flat No. *
                  </label>
                  <input
                    type="text"
                    required
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="House 14, Road 6, Apt 4B"
                    className="mt-1 w-full rounded-xl border border-[#dcd7c9] px-3.5 py-2.5 text-sm focus:border-[#166534] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#526559]">
                    Rider Note (Optional)
                  </label>
                  <input
                    type="text"
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    placeholder="Ring bell twice or leave with security guard"
                    className="mt-1 w-full rounded-xl border border-[#dcd7c9] px-3.5 py-2.5 text-sm focus:border-[#166534] focus:outline-none"
                  />
                </div>
              </div>

              {/* Delivery Slot */}
              <div className="rounded-3xl border border-[#e4e0d5] bg-white p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="flex items-center gap-2 text-base font-bold text-[#111c16]">
                    <Clock className="h-4 w-4 text-[#d97706]" />
                    <span>
                      {lang === "bn" ? "ডেলিভারি তারিখ ও স্লট" : "2. Delivery Slot"}
                    </span>
                  </h2>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="rounded-xl border border-[#dcd7c9] px-3 py-1.5 text-xs font-semibold text-[#111c16]"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {slots.map((slot) => {
                    const selected = slot.id === activeSlot?.id;
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setSlotId(slot.id)}
                        className={`rounded-2xl border p-3.5 text-left transition cursor-pointer ${
                          selected
                            ? "border-[#14532d] bg-[#ecfdf5] ring-2 ring-[#14532d]/20"
                            : "border-[#e4e0d5] bg-[#faf8f3] hover:border-emerald-300"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-[#111c16]">
                            {lang === "bn" ? slot.labelBn : slot.labelEn}
                          </span>
                          {slot.isExpress && (
                            <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">
                              Fast
                            </span>
                          )}
                        </div>
                        <p className="mt-1 font-mono text-xs font-semibold text-[#14532d]">
                          {slot.windowText}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {/* Weekly Auto-Bazar Toggle */}
                <label className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-3.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isRecurringWeekly}
                    onChange={(e) => setIsRecurringWeekly(e.target.checked)}
                    className="mt-1 h-4 w-4 accent-[#14532d]"
                  />
                  <div className="text-xs">
                    <p className="font-bold text-[#14532d] flex items-center gap-1.5">
                      <Repeat className="h-3.5 w-3.5" />
                      Repeat this bazar weekly (Auto-Schedule)
                    </p>
                    <p className="text-[#526559] mt-0.5">
                      Pause or adjust anytime from your Account dashboard.
                    </p>
                  </div>
                </label>
              </div>

              {/* Payment Method */}
              <div className="rounded-3xl border border-[#e4e0d5] bg-white p-6 space-y-4">
                <h2 className="flex items-center gap-2 text-base font-bold text-[#111c16]">
                  <CreditCard className="h-4 w-4 text-[#16a34a]" />
                  <span>
                    {lang === "bn" ? "পেমেন্ট পদ্ধতি" : "3. Payment Method"}
                  </span>
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      id: "cod" as const,
                      title: "Cash on Delivery",
                      sub: "Pay rider after checking freshness",
                    },
                    {
                      id: "bkash" as const,
                      title: "bKash",
                      sub: "Instant wallet checkout",
                    },
                    {
                      id: "nagad" as const,
                      title: "Nagad",
                      sub: "Zero-fee Nagad mobile pay",
                    },
                    {
                      id: "card" as const,
                      title: "Card / SSLCommerz",
                      sub: "Visa, Mastercard, Nexus",
                    },
                  ].map((pm) => (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPaymentMethod(pm.id)}
                      className={`rounded-2xl border p-3.5 text-left transition cursor-pointer ${
                        paymentMethod === pm.id
                          ? "border-[#14532d] bg-[#ecfdf5] ring-2 ring-[#14532d]/20"
                          : "border-[#e4e0d5] bg-[#faf8f3]"
                      }`}
                    >
                      <p className="text-sm font-bold text-[#111c16]">{pm.title}</p>
                      <p className="text-xs text-[#526559]">{pm.sub}</p>
                    </button>
                  ))}
                </div>

                {paymentMethod !== "cod" && (
                  <div className="rounded-2xl bg-[#faf8f3] p-4 border border-[#e4e0d5]">
                    <label className="block text-xs font-bold text-[#111c16]">
                      Merchant Number: 01700-762544 • Transaction ID (Optional for demo)
                    </label>
                    <input
                      type="text"
                      value={paymentRef}
                      onChange={(e) => setPaymentRef(e.target.value)}
                      placeholder="e.g. BKX928174 (auto-verified if blank)"
                      className="mt-1.5 w-full rounded-xl border border-[#dcd7c9] bg-white px-3.5 py-2 text-sm focus:border-[#166534] focus:outline-none"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Right Summary */}
            <div className="lg:col-span-5">
              <div className="sticky top-24 rounded-3xl border border-[#e4e0d5] bg-white p-6 space-y-5 shadow-sm">
                <h2 className="text-lg font-extrabold text-[#111c16]">
                  Order Summary ({items.length})
                </h2>

                <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div
                      key={item.variantId}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-[#e7e2d8]">
                          <ProduceArtwork
                            visualKey={item.visualKey}
                            imageUrl={item.imageUrl}
                            alt={item.nameEn}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-bold text-[#111c16]">
                            {lang === "bn" ? item.nameBn : item.nameEn}
                          </p>
                          <p className="text-xs text-[#526559]">
                            {item.variantLabel} × {item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-[#14532d]">
                        {formatTaka(item.priceBdt * item.quantity, lang)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Coupon */}
                <div className="border-t border-[#e4e0d5] pt-4">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-[#526559]" />
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        placeholder="Promo code (SOBJI10)"
                        className="w-full rounded-xl border border-[#dcd7c9] py-2 pl-9 pr-3 text-xs font-semibold uppercase focus:border-[#166534] focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      disabled={couponLoading}
                      onClick={handleApplyCoupon}
                      className="rounded-xl bg-[#f3efe6] px-4 py-2 text-xs font-bold text-[#14532d] hover:bg-emerald-100 cursor-pointer"
                    >
                      {couponLoading ? "..." : "Apply"}
                    </button>
                  </div>
                  {appliedCoupon && (
                    <p className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-[#16a34a]">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {appliedCoupon.code}: {appliedCoupon.descriptionEn}
                    </p>
                  )}
                </div>

                {/* Totals */}
                <div className="space-y-2 border-t border-[#e4e0d5] pt-4 text-sm">
                  <div className="flex justify-between text-[#526559]">
                    <span>Bazar Subtotal</span>
                    <span className="font-mono font-semibold text-[#111c16]">
                      {formatTaka(subtotal, lang)}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-[#16a34a]">
                      <span>Coupon Discount</span>
                      <span className="font-mono font-semibold">
                        -{formatTaka(discount, lang)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#526559]">
                    <span className="flex items-center gap-1">
                      <Truck className="h-3.5 w-3.5" />
                      Delivery ({activeSlot?.windowText})
                    </span>
                    <span className="font-mono font-semibold text-[#111c16]">
                      {deliveryFee === 0 ? "FREE" : formatTaka(deliveryFee, lang)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-[#e4e0d5] pt-3 text-base font-extrabold text-[#111c16]">
                    <span>Total Payable</span>
                    <span className="font-mono text-xl text-[#14532d]">
                      {formatTaka(finalTotal, lang)}
                    </span>
                  </div>
                </div>

                {subtotal >= FREE_DELIVERY_THRESHOLD && (
                  <div className="flex items-center gap-2 rounded-2xl bg-amber-50 px-3.5 py-2.5 text-xs font-semibold text-amber-900 ring-1 ring-amber-200">
                    <Sparkles className="h-4 w-4 text-amber-600 shrink-0" />
                    <span>
                      Free delivery + Sobji Club benefits unlocked on this order!
                    </span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={placing}
                  className="w-full rounded-full bg-[#14532d] py-3.5 text-sm font-bold text-white shadow-md hover:bg-[#166534] disabled:opacity-60 transition cursor-pointer"
                >
                  {placing ? "Confirming Order..." : "Confirm Bazar Order"}
                </button>

                <p className="flex items-center justify-center gap-1.5 text-[11px] text-[#526559]">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#16a34a]" />
                  <span>24h Freshness Guarantee • Direct Farm Dispatch</span>
                </p>
              </div>
            </div>
          </form>
        )}
      </main>
      <Footer />
    </div>
  );
}
