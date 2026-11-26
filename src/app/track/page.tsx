"use client";

import React, { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  MapPin,
  Package,
  Search,
  Sprout,
  Truck,
  Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProduceArtwork } from "@/components/ProduceArtwork";
import { useApp } from "@/components/Providers";
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
  { key: "confirmed", label: "Order Confirmed", icon: CheckCircle2 },
  { key: "harvesting", label: "Harvesting at Farm", icon: Sprout },
  { key: "packed", label: "Packed in Dawn Crate", icon: Package },
  { key: "out_for_delivery", label: "Out for Delivery", icon: Truck },
  { key: "delivered", label: "Delivered", icon: Sparkles },
];

function TrackInner() {
  const { lang } = useApp();
  const searchParams = useSearchParams();
  const initialCode = searchParams.get("code") || "SBJ-DEMO01";
  const justPlaced = searchParams.get("placed") === "1";

  const [code, setCode] = useState(initialCode);
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchOrder = useCallback(async (targetCode: string, showSpinner = true) => {
    if (!targetCode.trim()) return;
    if (showSpinner) setLoading(true);
    setError("");
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

  const currentStepIdx = order
    ? Math.max(
        0,
        STEPS.findIndex((s) => s.key === order.status)
      )
    : 0;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      {justPlaced && (
        <div className="mb-6 flex items-center gap-3 rounded-3xl border border-emerald-300 bg-emerald-50 p-5 text-[#14532d]">
          <CheckCircle2 className="h-6 w-6 shrink-0 text-[#16a34a]" />
          <div>
            <p className="text-base font-extrabold">
              {lang === "bn"
                ? "অর্ডার সফলভাবে গৃহীত হয়েছে!"
                : "Your Bazar Order is Confirmed!"}
            </p>
            <p className="text-xs text-[#4b5e52]">
              Save your tracking code{" "}
              <span className="font-mono font-bold">{order?.orderCode || initialCode}</span>{" "}
              to monitor live farm harvest & rider dispatch.
            </p>
          </div>
        </div>
      )}

      <div className="rounded-[2rem] border border-[#e4e0d5] bg-white p-6 sm:p-8 shadow-sm">
        <h1 className="text-2xl font-extrabold text-[#111c16]">
          {lang === "bn" ? "লাইভ অর্ডার ট্র্যাকার" : "Live Farm-to-Kitchen Order Tracker"}
        </h1>
        <p className="mt-1 text-sm text-[#526559]">
          Enter your sobji.com order code (try{" "}
          <button
            type="button"
            onClick={() => {
              setCode("SBJ-DEMO01");
              fetchOrder("SBJ-DEMO01");
            }}
            className="font-mono font-bold text-[#14532d] underline cursor-pointer"
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
            <Search className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-[#526559]" />
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="SBJ-XXXXXX"
              className="w-full rounded-full border border-[#dcd7c9] py-2.5 pl-10 pr-4 font-mono text-sm font-bold uppercase focus:border-[#166534] focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-[#14532d] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#166534] cursor-pointer"
          >
            {loading ? "..." : "Track"}
          </button>
        </form>

        {error && (
          <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </p>
        )}

        {order && (
          <div className="mt-8 space-y-8">
            {/* Status Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[#faf8f3] p-4 border border-[#e4e0d5]">
              <div>
                <p className="text-xs text-[#526559]">Order Code</p>
                <p className="font-mono text-xl font-extrabold text-[#14532d]">
                  {order.orderCode}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#526559]">Delivery Window</p>
                <p className="flex items-center gap-1.5 text-sm font-bold text-[#111c16]">
                  <Clock className="h-4 w-4 text-[#d97706]" />
                  {order.deliveryDate} • {order.slotLabel}
                </p>
              </div>
              <span className="rounded-full bg-[#14532d] px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-white">
                {order.status.replaceAll("_", " ")}
              </span>
            </div>

            {/* Stepper */}
            {order.status !== "cancelled" && (
              <div className="grid gap-3 sm:grid-cols-5">
                {STEPS.map((step, idx) => {
                  const Icon = step.icon;
                  const done = idx <= currentStepIdx;
                  return (
                    <div
                      key={step.key}
                      className={`rounded-2xl border p-3.5 text-center transition ${
                        done
                          ? "border-emerald-300 bg-emerald-50 text-[#14532d]"
                          : "border-[#e4e0d5] bg-white text-stone-400"
                      }`}
                    >
                      <div
                        className={`mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full ${
                          done ? "bg-[#14532d] text-white" : "bg-stone-100 text-stone-400"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <p className="text-xs font-bold leading-tight">{step.label}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Address & Payment */}
            <div className="grid gap-4 sm:grid-cols-2 text-sm">
              <div className="rounded-2xl border border-[#e4e0d5] p-4 space-y-1">
                <p className="flex items-center gap-1.5 text-xs font-bold uppercase text-[#526559]">
                  <MapPin className="h-3.5 w-3.5 text-[#16a34a]" />
                  Delivery Destination
                </p>
                <p className="font-bold text-[#111c16]">{order.customerName}</p>
                <p className="text-[#4b5e52]">
                  {order.deliveryAddress}, {order.deliveryArea}
                </p>
                <p className="font-mono text-xs text-[#526559]">{order.customerPhone}</p>
              </div>
              <div className="rounded-2xl border border-[#e4e0d5] p-4 space-y-1">
                <p className="text-xs font-bold uppercase text-[#526559]">
                  Payment & Total
                </p>
                <p className="font-bold text-[#111c16] uppercase">
                  {order.paymentMethod} • {order.paymentStatus}
                </p>
                <p className="font-mono text-2xl font-extrabold text-[#14532d]">
                  {formatTaka(order.totalBdt, lang)}
                </p>
              </div>
            </div>

            {/* Items */}
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#526559] mb-3">
                Bazar Crate Items ({order.items.length})
              </h2>
              <div className="divide-y divide-[#e4e0d5] rounded-2xl border border-[#e4e0d5]">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 p-3.5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 overflow-hidden rounded-xl shrink-0">
                        <ProduceArtwork visualKey={item.visualKey} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#111c16]">
                          {lang === "bn" ? item.productNameBn : item.productNameEn}
                        </p>
                        <p className="text-xs text-[#526559]">
                          {item.variantLabel} × {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono text-sm font-bold text-[#14532d]">
                      {formatTaka(item.lineTotalBdt, lang)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Link
                href="/"
                className="rounded-full border border-[#dcd7c9] px-5 py-2.5 text-xs font-bold text-[#111c16] hover:border-[#14532d]"
              >
                Continue Shopping
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
        <Suspense fallback={<div className="p-12 text-center text-sm">Loading tracker...</div>}>
          <TrackInner />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
