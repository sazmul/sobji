"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  LogOut,
  MapPin,
  Package,
  Repeat,
  Plus,
  Trash2,
  LayoutDashboard,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { authClient } from "@/lib/auth-client";
import { useApp } from "@/components/Providers";
import { formatTaka } from "@/lib/utils";

interface AccountPayload {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    phone: string | null;
    isMember: boolean;
  };
  orders: Array<{
    id: number;
    orderCode: string;
    status: string;
    totalBdt: number;
    deliveryDate: string;
    slotLabel: string;
    items: Array<{
      id: number;
      productNameEn: string;
      variantLabel: string;
      quantity: number;
    }>;
  }>;
  addresses: Array<{
    id: number;
    label: string;
    area: string;
    fullAddress: string;
    phone: string;
  }>;
  subscriptions: Array<{
    id: number;
    title: string;
    frequency: string;
    preferredSlot: string;
    totalBdt: number;
    status: string;
    nextDeliveryDate: string;
  }>;
}

export default function AccountPage() {
  const { lang, showToast } = useApp();
  const router = useRouter();
  const [data, setData] = useState<AccountPayload | null>(null);
  const [loading, setLoading] = useState(true);

  const [label, setLabel] = useState("Home");
  const [area, setArea] = useState("Dhanmondi");
  const [fullAddress, setFullAddress] = useState("");
  const [phone, setPhone] = useState("");

  const loadAccount = useCallback(async () => {
    try {
      const res = await fetch("/api/account");
      if (res.status === 401) {
        router.push("/sign-in?redirect=/account");
        return;
      }
      if (res.ok) {
        setData(await res.json());
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadAccount();
  }, [loadAccount]);

  const handleActivateClub = async () => {
    const res = await fetch("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activateClub: true }),
    });
    if (res.ok) {
      showToast("Sobji Club Membership activated!");
      loadAccount();
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/account/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, area, fullAddress, phone }),
    });
    if (res.ok) {
      setFullAddress("");
      setPhone("");
      showToast("Address saved");
      loadAccount();
    }
  };

  const handleDeleteAddress = async (id: number) => {
    await fetch(`/api/account/addresses?id=${id}`, { method: "DELETE" });
    showToast("Address removed");
    loadAccount();
  };

  const handleSubStatus = async (id: number, status: "active" | "paused") => {
    await fetch("/api/account/subscriptions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    showToast(`Weekly bazar ${status}`);
    loadAccount();
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        {loading || !data ? (
          <div className="rounded-3xl border border-[#e4e0d5] bg-white p-12 text-center text-sm text-[#526559]">
            Loading your Sobji account...
          </div>
        ) : (
          <div className="space-y-8">
            {/* Header & Membership */}
            <div className="grid gap-6 lg:grid-cols-12">
              <div className="flex flex-col justify-between rounded-2xl border border-[#e7e2d8] bg-white p-6 lg:col-span-7">
                <div>
                  <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#143624]">
                    Customer Profile
                  </p>
                  <h1 className="mt-1 font-display text-3xl font-medium text-[#112218]">
                    {data.user.name}
                  </h1>
                  <p className="text-sm text-[#526559]">{data.user.email}</p>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  {data.user.role === "admin" && (
                    <Link
                      href="/admin"
                      className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-4 py-2 text-xs font-extrabold text-[#111c16]"
                    >
                      <LayoutDashboard className="h-3.5 w-3.5" />
                      Open Admin Portal
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#dcd7c9] px-4 py-2 text-xs font-bold text-[#111c16] hover:bg-stone-50 cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign Out
                  </button>
                </div>
              </div>

              <div className="rounded-2xl bg-[#143624] p-6 text-white lg:col-span-5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 px-3 py-1 text-xs font-bold text-amber-300">
                    <Sparkles className="h-3.5 w-3.5" />
                    Sobji Club
                  </span>
                  <span className="text-xs font-bold text-emerald-200">
                    {data.user.isMember ? "ACTIVE MEMBER" : "STANDARD"}
                  </span>
                </div>
                <h2 className="mt-3 text-xl font-extrabold">
                  {data.user.isMember
                    ? "Free Delivery & BOGO Perks Active"
                    : "Unlock Free Delivery on ৳299+"}
                </h2>
                <p className="mt-1 text-xs text-emerald-100/80">
                  {data.user.isMember
                    ? "You enjoy priority 6:00 AM slots and member BOGO leafy greens."
                    : "Activate complimentary Sobji Club trial or place a ৳499+ order."}
                </p>
                {!data.user.isMember && (
                  <button
                    type="button"
                    onClick={handleActivateClub}
                    className="mt-4 rounded-full bg-amber-400 px-4 py-2 text-xs font-extrabold text-[#111c16] hover:bg-amber-300 cursor-pointer"
                  >
                    Activate Free Trial
                  </button>
                )}
              </div>
            </div>

            {/* Orders + Weekly Subscriptions */}
            <div className="grid gap-6 lg:grid-cols-12">
              <div className="rounded-3xl border border-[#e4e0d5] bg-white p-6 lg:col-span-7 space-y-4">
                <h2 className="flex items-center gap-2 text-lg font-extrabold text-[#111c16]">
                  <Package className="h-5 w-5 text-[#16a34a]" />
                  <span>Your Bazar Orders ({data.orders.length})</span>
                </h2>
                {data.orders.length === 0 ? (
                  <p className="text-sm text-[#526559]">
                    No orders yet.{" "}
                    <Link href="/" className="font-bold text-[#14532d] underline">
                      Shop fresh produce
                    </Link>
                  </p>
                ) : (
                  <div className="space-y-3">
                    {data.orders.map((ord) => (
                      <div
                        key={ord.id}
                        className="rounded-2xl border border-[#e4e0d5] bg-[#faf8f3] p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <span className="font-mono text-sm font-extrabold text-[#14532d]">
                              {ord.orderCode}
                            </span>
                            <p className="text-xs text-[#526559]">
                              {ord.deliveryDate} • {ord.slotLabel}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold uppercase text-[#14532d]">
                              {ord.status.replaceAll("_", " ")}
                            </span>
                            <span className="font-mono text-sm font-extrabold text-[#111c16]">
                              {formatTaka(ord.totalBdt, lang)}
                            </span>
                          </div>
                        </div>
                        <p className="mt-2 text-xs text-[#4b5e52]">
                          {ord.items
                            .map((i) => `${i.productNameEn} (${i.variantLabel}) ×${i.quantity}`)
                            .join(", ")}
                        </p>
                        <Link
                          href={`/track?code=${ord.orderCode}`}
                          className="mt-2 inline-block text-xs font-bold text-[#14532d] hover:underline"
                        >
                          Live Track →
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Weekly Subscriptions & Addresses */}
              <div className="space-y-6 lg:col-span-5">
                <div className="rounded-3xl border border-[#e4e0d5] bg-white p-6 space-y-3">
                  <h2 className="flex items-center gap-2 text-base font-extrabold text-[#111c16]">
                    <Repeat className="h-4 w-4 text-[#d97706]" />
                    <span>Weekly Auto-Bazar ({data.subscriptions.length})</span>
                  </h2>
                  {data.subscriptions.length === 0 ? (
                    <p className="text-xs text-[#526559]">
                      Tick &ldquo;Repeat weekly&rdquo; during checkout to automate your weekly kitchen vegetables.
                    </p>
                  ) : (
                    data.subscriptions.map((sub) => (
                      <div
                        key={sub.id}
                        className="rounded-2xl border border-[#e4e0d5] p-3.5 text-xs space-y-2"
                      >
                        <div className="flex justify-between font-bold">
                          <span>{sub.title}</span>
                          <span className="font-mono text-[#14532d]">
                            {formatTaka(sub.totalBdt, lang)}
                          </span>
                        </div>
                        <p className="text-[#526559]">
                          Next: {sub.nextDeliveryDate} • {sub.preferredSlot}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="uppercase font-bold text-[#16a34a]">
                            {sub.status}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleSubStatus(
                                sub.id,
                                sub.status === "active" ? "paused" : "active"
                              )
                            }
                            className="rounded-full bg-[#f3efe6] px-3 py-1 font-bold text-[#111c16] cursor-pointer"
                          >
                            {sub.status === "active" ? "Pause" : "Resume"}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Saved Addresses */}
                <div className="rounded-3xl border border-[#e4e0d5] bg-white p-6 space-y-4">
                  <h2 className="flex items-center gap-2 text-base font-extrabold text-[#111c16]">
                    <MapPin className="h-4 w-4 text-[#16a34a]" />
                    <span>Saved Dhaka Addresses</span>
                  </h2>
                  {data.addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="flex items-start justify-between gap-2 rounded-2xl border border-[#e4e0d5] p-3 text-xs"
                    >
                      <div>
                        <p className="font-bold text-[#111c16]">
                          {addr.label} • {addr.area}
                        </p>
                        <p className="text-[#526559]">{addr.fullAddress}</p>
                        <p className="font-mono text-[#526559]">{addr.phone}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="text-stone-400 hover:text-red-600 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <form onSubmit={handleAddAddress} className="space-y-2 border-t border-[#e4e0d5] pt-3">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        placeholder="Label (Home)"
                        className="rounded-xl border border-[#dcd7c9] px-3 py-2 text-xs"
                      />
                      <input
                        type="text"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        placeholder="Area (Dhanmondi)"
                        className="rounded-xl border border-[#dcd7c9] px-3 py-2 text-xs"
                      />
                    </div>
                    <input
                      type="text"
                      required
                      value={fullAddress}
                      onChange={(e) => setFullAddress(e.target.value)}
                      placeholder="House, Road, Flat"
                      className="w-full rounded-xl border border-[#dcd7c9] px-3 py-2 text-xs"
                    />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="017XX-XXXXXX"
                      className="w-full rounded-xl border border-[#dcd7c9] px-3 py-2 text-xs"
                    />
                    <button
                      type="submit"
                      className="inline-flex w-full items-center justify-center gap-1 rounded-full bg-[#14532d] py-2 text-xs font-bold text-white cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Save Address
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
