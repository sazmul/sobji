"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Plus,
  ShoppingBag,
  TrendingUp,
  Users,
  AlertTriangle,
  Trash2,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useApp } from "@/components/Providers";
import { formatTaka } from "@/lib/utils";

interface AdminOverview {
  stats: {
    totalRevenueBdt: number;
    totalOrders: number;
    activeProducts: number;
    totalCustomers: number;
    lowStockCount: number;
  };
  orders: Array<{
    id: number;
    orderCode: string;
    customerName: string;
    customerPhone: string;
    deliveryArea: string;
    slotLabel: string;
    paymentMethod: string;
    paymentStatus: string;
    status: string;
    totalBdt: number;
    items: Array<{ id: number; productNameEn: string; variantLabel: string; quantity: number }>;
  }>;
  products: Array<{
    id: number;
    nameEn: string;
    nameBn: string;
    badge: string;
    isActive: boolean;
    isFlashDeal: boolean;
    variants: Array<{
      id: number;
      label: string;
      priceBdt: number;
      stockQty: number;
    }>;
  }>;
  categories: Array<{ id: number; nameEn: string }>;
  farmers: Array<{ id: number; name: string; district: string }>;
}

const ORDER_STATUSES = [
  "confirmed",
  "harvesting",
  "packed",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

export default function AdminPage() {
  const { showToast } = useApp();
  const router = useRouter();
  const [data, setData] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"orders" | "products" | "add">("orders");

  // New Product Form
  const [nameEn, setNameEn] = useState("");
  const [nameBn, setNameBn] = useState("");
  const [subtitleEn, setSubtitleEn] = useState("");
  const [subtitleBn, setSubtitleBn] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [descriptionBn, setDescriptionBn] = useState("");
  const [categoryId, setCategoryId] = useState(1);
  const [farmerId, setFarmerId] = useState(1);
  const [visualKey, setVisualKey] = useState("default");
  const [badge, setBadge] = useState("Organic");
  const [variantLabel, setVariantLabel] = useState("500g");
  const [priceBdt, setPriceBdt] = useState(55);
  const [stockQty, setStockQty] = useState(60);

  const loadOverview = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/overview");
      if (res.status === 401 || res.status === 403) {
        router.push("/sign-in?redirect=/admin");
        return;
      }
      if (res.ok) {
        const json: AdminOverview = await res.json();
        setData(json);
        if (json.categories[0]) setCategoryId(json.categories[0].id);
        if (json.farmers[0]) setFarmerId(json.farmers[0].id);
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  const updateOrderStatus = async (orderId: number, status: string) => {
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      showToast(`Order status updated to ${status}`);
      loadOverview();
    }
  };

  const updateVariantStock = async (
    productId: number,
    variantId: number,
    stockQty: number,
    priceBdt: number
  ) => {
    const res = await fetch(`/api/admin/products/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variantId, stockQty, priceBdt }),
    });
    if (res.ok) {
      showToast("Inventory & price updated");
      loadOverview();
    }
  };

  const toggleProductFlag = async (
    productId: number,
    field: "isActive" | "isFlashDeal",
    val: boolean
  ) => {
    const res = await fetch(`/api/admin/products/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: val }),
    });
    if (res.ok) {
      showToast("Product updated");
      loadOverview();
    }
  };

  const deleteProduct = async (productId: number) => {
    const res = await fetch(`/api/admin/products/${productId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      showToast("Product deleted");
      loadOverview();
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nameEn,
        nameBn,
        subtitleEn,
        subtitleBn,
        descriptionEn,
        descriptionBn,
        categoryId,
        farmerId,
        visualKey,
        badge,
        variantLabel,
        priceBdt: Number(priceBdt),
        stockQty: Number(stockQty),
        isFeatured: true,
      }),
    });
    if (res.ok) {
      showToast("New produce added to live storefront!");
      setNameEn("");
      setNameBn("");
      setSubtitleEn("");
      setSubtitleBn("");
      setDescriptionEn("");
      setDescriptionBn("");
      setTab("products");
      loadOverview();
    } else {
      const err = await res.json();
      showToast(err.error || "Could not create product", "error");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded border border-[#e5e7eb] bg-white px-3 py-1 tabular-nums text-[11px] font-semibold uppercase tracking-wider text-[#a14a18]">
              <LayoutDashboard className="h-3.5 w-3.5" />
              Sobji Operations Console
            </span>
            <h1 className="mt-2 text-3xl font-medium text-[#111827] sm:text-4xl">
              Admin Command Center
            </h1>
          </div>
          <Link
            href="/"
            className="rounded-full border border-[#d1d5db] bg-white px-4 py-2 text-xs font-bold text-[#111827]"
          >
            View Live Storefront →
          </Link>
        </div>

        {loading || !data ? (
          <div className="mt-8 rounded-3xl border border-[#e5e7eb] bg-white p-12 text-center text-sm text-[#6b7280]">
            Loading operations metrics...
          </div>
        ) : (
          <div className="mt-8 space-y-8">
            {/* KPI Strip */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {[
                {
                  label: "Gross Bazar Revenue",
                  value: formatTaka(data.stats.totalRevenueBdt),
                  icon: TrendingUp,
                },
                {
                  label: "Total Orders",
                  value: String(data.stats.totalOrders),
                  icon: ShoppingBag,
                },
                {
                  label: "Active SKUs",
                  value: String(data.stats.activeProducts),
                  icon: Package,
                },
                {
                  label: "Registered Accounts",
                  value: String(data.stats.totalCustomers),
                  icon: Users,
                },
                {
                  label: "Low Stock Alerts",
                  value: String(data.stats.lowStockCount),
                  icon: AlertTriangle,
                },
              ].map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={idx}
                    className="rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-2xs"
                  >
                    <div className="flex items-center justify-between text-xs text-[#6b7280]">
                      <span className="font-semibold">{stat.label}</span>
                      <Icon className="h-4 w-4 text-[#0f7b3f]" />
                    </div>
                    <p className="mt-2 tabular-nums text-2xl font-extrabold text-[#111827]">
                      {stat.value}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: "orders" as const, label: `Order Dispatch (${data.orders.length})` },
                { id: "products" as const, label: `Catalog & Stock (${data.products.length})` },
                { id: "add" as const, label: "+ Add New Produce" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`rounded-full px-5 py-2 text-xs font-bold transition cursor-pointer ${
                    tab === t.id
                      ? "bg-[#0f7b3f] text-white"
                      : "bg-white border border-[#e5e7eb] text-[#6b7280]"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {tab === "orders" && (
              <div className="space-y-3">
                {data.orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="rounded-2xl border border-[#e5e7eb] bg-white p-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="tabular-nums text-base font-extrabold text-[#0f7b3f]">
                          {ord.orderCode}
                        </span>
                        <span className="rounded-full bg-[#f3f4f6] px-2.5 py-0.5 text-xs font-bold">
                          {ord.deliveryArea}
                        </span>
                        <span className="text-xs text-[#6b7280]">
                          {ord.slotLabel}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-[#111827]">
                        {ord.customerName} • {ord.customerPhone}
                      </p>
                      <p className="text-xs text-[#6b7280]">
                        {ord.items
                          .map((i) => `${i.productNameEn} (${i.variantLabel}) ×${i.quantity}`)
                          .join(" | ")}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <span className="tabular-nums text-lg font-extrabold text-[#111827]">
                        {formatTaka(ord.totalBdt)}
                      </span>
                      <select
                        value={ord.status}
                        onChange={(e) => updateOrderStatus(ord.id, e.target.value)}
                        className="rounded-xl border border-[#d1d5db] bg-[#f9faf8] px-3 py-2 text-xs font-bold text-[#0f7b3f] cursor-pointer"
                      >
                        {ORDER_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st.replaceAll("_", " ").toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === "products" && (
              <div className="grid gap-4 md:grid-cols-2">
                {data.products.map((prod) => {
                  const v = prod.variants[0];
                  return (
                    <div
                      key={prod.id}
                      className="rounded-2xl border border-[#e5e7eb] bg-white p-5 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-base font-bold text-[#111827]">
                            {prod.nameEn}
                          </h3>
                          <p className="text-xs text-[#6b7280]">{prod.nameBn}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => deleteProduct(prod.id)}
                          className="text-stone-400 hover:text-red-600 cursor-pointer"
                          title="Delete product"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() =>
                            toggleProductFlag(prod.id, "isActive", !prod.isActive)
                          }
                          className={`rounded-full px-3 py-1 font-bold cursor-pointer ${
                            prod.isActive
                              ? "bg-emerald-100 text-[#0f7b3f]"
                              : "bg-stone-100 text-stone-500"
                          }`}
                        >
                          {prod.isActive ? "Active" : "Hidden"}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            toggleProductFlag(prod.id, "isFlashDeal", !prod.isFlashDeal)
                          }
                          className={`rounded-full px-3 py-1 font-bold cursor-pointer ${
                            prod.isFlashDeal
                              ? "bg-amber-100 text-amber-900"
                              : "bg-stone-100 text-stone-500"
                          }`}
                        >
                          {prod.isFlashDeal ? "Flash Deal ★" : "Standard"}
                        </button>
                      </div>

                      {v && (
                        <div className="flex items-center gap-2 border-t border-[#e5e7eb] pt-3 text-xs">
                          <span className="font-semibold text-[#6b7280]">{v.label}:</span>
                          <span className="tabular-nums font-bold">৳{v.priceBdt}</span>
                          <span className="text-[#6b7280]">• Stock: {v.stockQty}</span>
                          <button
                            type="button"
                            onClick={() =>
                              updateVariantStock(prod.id, v.id, v.stockQty + 25, v.priceBdt)
                            }
                            className="ml-auto rounded-full bg-[#f3f4f6] px-3 py-1 font-bold text-[#0f7b3f] hover:bg-emerald-100 cursor-pointer"
                          >
                            +25 Stock
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {tab === "add" && (
              <form
                onSubmit={handleCreateProduct}
                className="max-w-2xl rounded-3xl border border-[#e5e7eb] bg-white p-6 space-y-4"
              >
                <h2 className="text-lg font-extrabold text-[#111827]">
                  Add New Harvest Produce
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    type="text"
                    required
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    placeholder="English Name (e.g. Fresh Korola)"
                    className="rounded-xl border border-[#d1d5db] px-3 py-2 text-sm"
                  />
                  <input
                    type="text"
                    required
                    value={nameBn}
                    onChange={(e) => setNameBn(e.target.value)}
                    placeholder="Bangla Name (e.g. তাজা করলা)"
                    className="rounded-xl border border-[#d1d5db] px-3 py-2 text-sm"
                  />
                  <input
                    type="text"
                    required
                    value={subtitleEn}
                    onChange={(e) => setSubtitleEn(e.target.value)}
                    placeholder="Subtitle EN"
                    className="rounded-xl border border-[#d1d5db] px-3 py-2 text-sm"
                  />
                  <input
                    type="text"
                    required
                    value={subtitleBn}
                    onChange={(e) => setSubtitleBn(e.target.value)}
                    placeholder="Subtitle BN"
                    className="rounded-xl border border-[#d1d5db] px-3 py-2 text-sm"
                  />
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(Number(e.target.value))}
                    className="rounded-xl border border-[#d1d5db] px-3 py-2 text-sm"
                  >
                    {data.categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameEn}
                      </option>
                    ))}
                  </select>
                  <select
                    value={farmerId}
                    onChange={(e) => setFarmerId(Number(e.target.value))}
                    className="rounded-xl border border-[#d1d5db] px-3 py-2 text-sm"
                  >
                    {data.farmers.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.district})
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    required
                    value={variantLabel}
                    onChange={(e) => setVariantLabel(e.target.value)}
                    placeholder="Pack Size (500g)"
                    className="rounded-xl border border-[#d1d5db] px-3 py-2 text-sm"
                  />
                  <input
                    type="number"
                    required
                    value={priceBdt}
                    onChange={(e) => setPriceBdt(Number(e.target.value))}
                    placeholder="Price BDT"
                    className="rounded-xl border border-[#d1d5db] px-3 py-2 text-sm"
                  />
                  <input
                    type="number"
                    required
                    value={stockQty}
                    onChange={(e) => setStockQty(Number(e.target.value))}
                    placeholder="Initial Stock"
                    className="rounded-xl border border-[#d1d5db] px-3 py-2 text-sm"
                  />
                  <select
                    value={visualKey}
                    onChange={(e) => setVisualKey(e.target.value)}
                    className="rounded-xl border border-[#d1d5db] px-3 py-2 text-sm"
                  >
                    <option value="default">Green Produce</option>
                    <option value="tomato">Tomato</option>
                    <option value="potato">Potato</option>
                    <option value="brinjal">Brinjal</option>
                    <option value="gourd">Bottle Gourd</option>
                    <option value="spinach">Leafy Greens</option>
                    <option value="chilli">Chilli</option>
                    <option value="onion">Onion</option>
                    <option value="fish">River Fish</option>
                    <option value="mango">Mango</option>
                  </select>
                </div>
                <input
                  type="text"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  placeholder="Badge (Organic / Deshi / Farm Direct)"
                  className="w-full rounded-xl border border-[#d1d5db] px-3 py-2 text-sm"
                />
                <textarea
                  required
                  value={descriptionEn}
                  onChange={(e) => setDescriptionEn(e.target.value)}
                  placeholder="Full Description (English)"
                  className="w-full rounded-xl border border-[#d1d5db] px-3 py-2 text-sm"
                />
                <textarea
                  required
                  value={descriptionBn}
                  onChange={(e) => setDescriptionBn(e.target.value)}
                  placeholder="Full Description (Bangla)"
                  className="w-full rounded-xl border border-[#d1d5db] px-3 py-2 text-sm"
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-full bg-[#0f7b3f] px-6 py-3 text-sm font-bold text-white hover:bg-[#0b5e30] cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  Publish Produce to Storefront
                </button>
              </form>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
