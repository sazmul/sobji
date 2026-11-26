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
  User,
  RotateCcw,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { authClient } from "@/lib/auth-client";
import { DHAKA_AREAS, useApp } from "@/components/Providers";
import { DashboardSkeleton } from "@/components/Skeletons";
import { formatTaka } from "@/lib/utils";

interface AccountOrderItem {
  id: number;
  productId: number | null;
  variantId: number | null;
  productNameEn: string;
  productNameBn: string;
  variantLabel: string;
  visualKey: string;
  unitPriceBdt: number;
  quantity: number;
  slug?: string;
  imageUrl?: string | null;
  stockQty?: number;
}

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
    deliveryArea: string;
    items: AccountOrderItem[];
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
  const { lang, addItem, setIsCartOpen, showToast } = useApp();
  const router = useRouter();
  const [data, setData] = useState<AccountPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "orders" | "subscriptions" | "addresses">(
    "overview"
  );

  // Profile edit
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Address form
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
        const json: AccountPayload = await res.json();
        setData(json);
        setEditName(json.user.name);
        setEditPhone(json.user.phone || "");
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadAccount();
  }, [loadAccount]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, phone: editPhone }),
      });
      if (res.ok) {
        showToast("Profile updated");
        loadAccount();
      }
    } finally {
      setSavingProfile(false);
    }
  };

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

  const handleReorder = (ord: AccountPayload["orders"][number]) => {
    let added = 0;
    for (const item of ord.items) {
      if (!item.productId || !item.variantId) continue;
      addItem(
        {
          productId: item.productId,
          variantId: item.variantId,
          slug: item.slug || "",
          nameEn: item.productNameEn,
          nameBn: item.productNameBn,
          variantLabel: item.variantLabel,
          priceBdt: item.unitPriceBdt,
          visualKey: item.visualKey,
          imageUrl: item.imageUrl,
          maxStock: item.stockQty || 20,
        },
        item.quantity
      );
      added++;
    }
    if (added > 0) {
      showToast(`${added} items from ${ord.orderCode} added to your bag!`);
      setIsCartOpen(true);
    } else {
      showToast("Items from this historical order are no longer linked.", "info");
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

  const handleSubStatus = async (id: number, status: "active" | "paused" | "cancelled") => {
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

  const totalSpent = data
    ? data.orders
        .filter((o) => o.status !== "cancelled")
        .reduce((s, o) => s + o.totalBdt, 0)
    : 0;

  return (
    <div className="min-h-screen flex flex-col bg-[#f9faf8]">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        {loading || !data ? (
          <DashboardSkeleton />
        ) : (
          <div className="space-y-6">
            {/* Header Strip */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-[#0f7b3f] font-bold text-lg">
                  {data.user.name.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{data.user.name}</h1>
                  <p className="text-xs text-gray-500">
                    {data.user.email} {data.user.phone ? `· ${data.user.phone}` : ""}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {data.user.role === "admin" && (
                  <Link
                    href="/admin"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-amber-100 px-4 py-2 text-xs font-bold text-amber-900"
                  >
                    <LayoutDashboard className="h-3.5 w-3.5" />
                    Operations Admin
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex overflow-x-auto pb-2 sm:flex-wrap gap-2 border-b border-gray-200">
              {[
                { id: "overview" as const, label: "Overview & Profile", icon: User },
                { id: "orders" as const, label: `Orders (${data.orders.length})`, icon: Package },
                {
                  id: "subscriptions" as const,
                  label: `Weekly Auto-Bazar (${data.subscriptions.length})`,
                  icon: Repeat,
                },
                {
                  id: "addresses" as const,
                  label: `Addresses (${data.addresses.length})`,
                  icon: MapPin,
                },
              ].map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTab(t.id)}
                    className={`shrink-0 inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition cursor-pointer ${
                      tab === t.id
                        ? "bg-[#0f7b3f] text-white"
                        : "bg-white border border-gray-200 text-gray-600 hover:border-[#0f7b3f]"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* TAB 1: OVERVIEW & PROFILE */}
            {tab === "overview" && (
              <div className="grid gap-6 lg:grid-cols-12">
                <div className="space-y-6 lg:col-span-7">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div className="rounded-2xl border border-gray-200 bg-white p-4">
                      <p className="text-xs text-gray-500">Total Orders</p>
                      <p className="mt-1 tabular-nums text-2xl font-bold text-gray-900">
                        {data.orders.length}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-white p-4">
                      <p className="text-xs text-gray-500">Total Bazar Spend</p>
                      <p className="mt-1 tabular-nums text-2xl font-bold text-[#0f7b3f]">
                        {formatTaka(totalSpent, lang)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-white p-4">
                      <p className="text-xs text-gray-500">Saved Addresses</p>
                      <p className="mt-1 tabular-nums text-2xl font-bold text-gray-900">
                        {data.addresses.length}
                      </p>
                    </div>
                  </div>

                  <form
                    onSubmit={handleSaveProfile}
                    className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4"
                  >
                    <h2 className="text-base font-bold text-gray-900">Profile Details</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600">
                          Full Name
                        </label>
                        <input
                          required
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm focus:border-[#0f7b3f] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600">
                          Mobile Number (BD)
                        </label>
                        <input
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          placeholder="017XX-XXXXXX"
                          className="mt-1 w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm focus:border-[#0f7b3f] focus:outline-none"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="rounded-xl bg-[#0f7b3f] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#0b5e30] cursor-pointer"
                    >
                      {savingProfile ? "Saving..." : "Save Profile"}
                    </button>
                  </form>
                </div>

                <div className="rounded-2xl bg-[#0f7b3f] p-6 text-white lg:col-span-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1 text-xs font-bold">
                        <Sparkles className="h-3.5 w-3.5" />
                        Sobji Club
                      </span>
                      <span className="text-xs font-bold text-emerald-200">
                        {data.user.isMember ? "ACTIVE" : "STANDARD"}
                      </span>
                    </div>
                    <h2 className="mt-4 text-xl font-bold">
                      {data.user.isMember
                        ? "Complimentary Delivery & BOGO Active"
                        : "Unlock Free Delivery on ৳299+"}
                    </h2>
                    <p className="mt-2 text-xs leading-relaxed text-emerald-100">
                      Enjoy zero delivery fees on ৳299+ orders, Buy-1-Get-1 leafy greens,
                      and priority 6:00 AM morning crates.
                    </p>
                  </div>
                  {!data.user.isMember && (
                    <button
                      type="button"
                      onClick={handleActivateClub}
                      className="mt-6 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-[#0f7b3f] hover:bg-emerald-50 cursor-pointer w-fit"
                    >
                      Activate Free Membership Trial
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: ORDERS & 1-CLICK REORDER */}
            {tab === "orders" && (
              <div className="space-y-3">
                {data.orders.length === 0 ? (
                  <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
                    No orders placed yet.{" "}
                    <Link href="/" className="font-semibold text-[#0f7b3f] underline">
                      Browse Fresh Bazar
                    </Link>
                  </div>
                ) : (
                  data.orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="rounded-2xl border border-gray-200 bg-white p-5 space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="tabular-nums text-base font-bold text-[#0f7b3f]">
                            {ord.orderCode}
                          </span>
                          <p className="text-xs text-gray-500">
                            {ord.deliveryDate} · {ord.slotLabel} · {ord.deliveryArea}
                          </p>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold uppercase text-[#0f7b3f]">
                            {ord.status.replaceAll("_", " ")}
                          </span>
                          <span className="tabular-nums text-base font-bold text-gray-900">
                            {formatTaka(ord.totalBdt, lang)}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600">
                        {ord.items
                          .map((i) => `${i.productNameEn} (${i.variantLabel}) ×${i.quantity}`)
                          .join(" · ")}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 pt-1">
                        <button
                          type="button"
                          onClick={() => handleReorder(ord)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f7b3f] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#0b5e30] cursor-pointer"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          Buy Again (Add All)
                        </button>
                        <Link
                          href={`/track?code=${ord.orderCode}`}
                          className="rounded-xl border border-gray-200 px-3.5 py-1.5 text-xs font-semibold text-gray-700 hover:border-[#0f7b3f]"
                        >
                          Live Track →
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 3: WEEKLY AUTO-BAZAR */}
            {tab === "subscriptions" && (
              <div className="grid gap-4 md:grid-cols-2">
                {data.subscriptions.length === 0 ? (
                  <div className="rounded-2xl border border-gray-200 bg-white p-10 text-sm text-gray-500 md:col-span-2">
                    Tick &ldquo;Repeat this bazar weekly&rdquo; during checkout to automate weekly deliveries.
                  </div>
                ) : (
                  data.subscriptions.map((sub) => (
                    <div
                      key={sub.id}
                      className="rounded-2xl border border-gray-200 bg-white p-5 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-gray-900">{sub.title}</h3>
                          <p className="text-xs text-gray-500">
                            Next: {sub.nextDeliveryDate} · {sub.preferredSlot}
                          </p>
                        </div>
                        <span className="tabular-nums font-bold text-[#0f7b3f]">
                          {formatTaka(sub.totalBdt, lang)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-xs">
                        <span className="font-bold uppercase text-[#0f7b3f]">
                          {sub.status}
                        </span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleSubStatus(
                                sub.id,
                                sub.status === "active" ? "paused" : "active"
                              )
                            }
                            className="rounded-lg border border-gray-200 px-3 py-1 font-semibold hover:border-[#0f7b3f] cursor-pointer"
                          >
                            {sub.status === "active" ? "Pause" : "Resume"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSubStatus(sub.id, "cancelled")}
                            className="rounded-lg border border-red-200 px-3 py-1 font-semibold text-red-600 cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 4: SAVED ADDRESSES */}
            {tab === "addresses" && (
              <div className="grid gap-6 lg:grid-cols-12">
                <div className="space-y-3 lg:col-span-7">
                  {data.addresses.length === 0 ? (
                    <div className="rounded-2xl border border-gray-200 bg-white p-8 text-sm text-gray-500">
                      No saved Dhaka addresses yet. Add one on the right for 1-click checkout.
                    </div>
                  ) : (
                    data.addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className="flex items-start justify-between rounded-2xl border border-gray-200 bg-white p-4 text-sm"
                      >
                        <div>
                          <p className="font-bold text-gray-900">
                            {addr.label} · {addr.area}
                          </p>
                          <p className="text-xs text-gray-600 mt-0.5">{addr.fullAddress}</p>
                          <p className="tabular-nums text-xs text-gray-500 mt-0.5">
                            {addr.phone}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="text-gray-400 hover:text-red-600 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <form
                  onSubmit={handleAddAddress}
                  className="rounded-2xl border border-gray-200 bg-white p-5 space-y-3 lg:col-span-5 h-fit"
                >
                  <h2 className="text-base font-bold text-gray-900">Add Dhaka Address</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <input
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
                      placeholder="Label (Home)"
                      className="rounded-xl border border-gray-200 px-3 py-2 text-xs"
                    />
                    <select
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      className="rounded-xl border border-gray-200 px-3 py-2 text-xs"
                    >
                      {DHAKA_AREAS.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                  </div>
                  <input
                    required
                    value={fullAddress}
                    onChange={(e) => setFullAddress(e.target.value)}
                    placeholder="House, Road, Flat"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs"
                  />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="017XX-XXXXXX"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs"
                  />
                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center gap-1 rounded-xl bg-[#0f7b3f] py-2.5 text-xs font-semibold text-white cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Save Address
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
