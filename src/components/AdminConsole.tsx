"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  FolderTree,
  Users,
  Sprout,
  Clock,
  Tag,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  ArrowLeft,
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  Shield,
  Sparkles,
} from "lucide-react";
import { SobjiLogo } from "./Logo";
import { useApp } from "./Providers";
import { formatTaka } from "@/lib/utils";

interface AdminVariant {
  id: number;
  productId: number;
  label: string;
  priceBdt: number;
  compareAtBdt: number | null;
  stockQty: number;
  isDefault: boolean;
}

interface AdminProduct {
  id: number;
  slug: string;
  categoryId: number;
  farmerId: number;
  nameEn: string;
  nameBn: string;
  subtitleEn: string;
  subtitleBn: string;
  descriptionEn: string;
  descriptionBn: string;
  visualKey: string;
  imageUrl: string | null;
  badge: string;
  harvestTime: string;
  isActive: boolean;
  isFeatured: boolean;
  isFlashDeal: boolean;
  isMemberBogo: boolean;
  variants: AdminVariant[];
}

interface AdminOrder {
  id: number;
  orderCode: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
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
    variantLabel: string;
    quantity: number;
    lineTotalBdt: number;
  }>;
}

interface AdminCategory {
  id: number;
  slug: string;
  nameEn: string;
  nameBn: string;
  descriptionEn: string;
  descriptionBn: string;
  sortOrder: number;
  productCount: number;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  isMember: boolean;
  createdAt: string;
  orderCount: number;
  totalSpentBdt: number;
}

interface AdminFarmer {
  id: number;
  name: string;
  nameBn: string;
  district: string;
  upazila: string;
  specialty: string;
  yearsActive: number;
  verified: boolean;
  storyEn: string;
  storyBn: string;
}

interface AdminCoupon {
  id: number;
  code: string;
  discountType: string;
  discountValue: number;
  minOrderBdt: number;
  maxDiscountBdt: number | null;
  descriptionEn: string;
  isActive: boolean;
}

interface AdminSlot {
  id: number;
  labelEn: string;
  labelBn: string;
  windowText: string;
  isExpress: boolean;
  capacity: number;
  isActive: boolean;
}

interface AdminOverviewData {
  currentAdminId: string;
  stats: {
    totalRevenueBdt: number;
    totalOrders: number;
    pendingOrdersCount: number;
    activeProducts: number;
    totalCategories: number;
    totalCustomers: number;
    clubMembers: number;
    lowStockCount: number;
  };
  orders: AdminOrder[];
  products: AdminProduct[];
  categories: AdminCategory[];
  farmers: AdminFarmer[];
  coupons: AdminCoupon[];
  slots: AdminSlot[];
  users: AdminUser[];
}

type AdminSection =
  | "overview"
  | "orders"
  | "products"
  | "categories"
  | "users"
  | "farmers"
  | "logistics";

const ORDER_STATUSES = [
  "confirmed",
  "harvesting",
  "packed",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

const STATUS_STYLE: Record<string, string> = {
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  harvesting: "bg-emerald-50 text-emerald-700 border-emerald-200",
  packed: "bg-amber-50 text-amber-700 border-amber-200",
  out_for_delivery: "bg-indigo-50 text-indigo-700 border-indigo-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

export function AdminConsole() {
  const { showToast } = useApp();
  const router = useRouter();
  const [data, setData] = useState<AdminOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState<AdminSection>("overview");

  // Search & filters
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [prodSearch, setProdSearch] = useState("");
  const [prodCatFilter, setProdCatFilter] = useState<number | "all">("all");
  const [userSearch, setUserSearch] = useState("");

  // Modals
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [showNewProduct, setShowNewProduct] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null);
  const [showNewCategory, setShowNewCategory] = useState(false);

  // New Product State
  const [newProd, setNewProd] = useState({
    nameEn: "",
    nameBn: "",
    subtitleEn: "",
    subtitleBn: "",
    descriptionEn: "",
    descriptionBn: "",
    categoryId: 1,
    farmerId: 1,
    visualKey: "default",
    badge: "Organic",
    variantLabel: "500g",
    priceBdt: 60,
    stockQty: 50,
    isFlashDeal: false,
  });

  // Edit Product Variant Helper State
  const [editProdForm, setEditProdForm] = useState({
    nameEn: "",
    nameBn: "",
    subtitleEn: "",
    subtitleBn: "",
    descriptionEn: "",
    descriptionBn: "",
    categoryId: 1,
    farmerId: 1,
    imageUrl: "",
    badge: "Organic",
    isActive: true,
    isFeatured: false,
    isFlashDeal: false,
    isMemberBogo: false,
    variantId: 0,
    priceBdt: 0,
    compareAtBdt: "",
    stockQty: 0,
    newVarLabel: "",
    newVarPrice: "",
    newVarStock: "40",
  });

  // Category Form State
  const [catForm, setCatForm] = useState({
    nameEn: "",
    nameBn: "",
    descriptionEn: "",
    descriptionBn: "",
    sortOrder: 10,
  });

  // Farmer Form State
  const [farmerForm, setFarmerForm] = useState({
    name: "",
    nameBn: "",
    district: "",
    upazila: "",
    specialty: "",
    yearsActive: 8,
    storyEn: "",
    storyBn: "",
  });

  // Coupon & Slot Form State
  const [couponForm, setCouponForm] = useState({
    code: "",
    discountType: "percent" as "percent" | "fixed",
    discountValue: 10,
    minOrderBdt: 300,
    maxDiscountBdt: 150,
    descriptionEn: "",
  });
  const [slotForm, setSlotForm] = useState({
    labelEn: "",
    labelBn: "",
    windowText: "",
    capacity: 60,
    isExpress: false,
  });

  const loadOverview = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/overview");
      if (res.status === 401 || res.status === 403) {
        router.push("/sign-in?redirect=/admin");
        return;
      }
      if (res.ok) {
        const json: AdminOverviewData = await res.json();
        setData(json);
        setNewProd((p) => ({
          ...p,
          categoryId: json.categories[0]?.id ?? 1,
          farmerId: json.farmers[0]?.id ?? 1,
        }));
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  const openEditProduct = (prod: AdminProduct) => {
    const defVar = prod.variants[0];
    setEditingProduct(prod);
    setEditProdForm({
      nameEn: prod.nameEn,
      nameBn: prod.nameBn,
      subtitleEn: prod.subtitleEn,
      subtitleBn: prod.subtitleBn,
      descriptionEn: prod.descriptionEn,
      descriptionBn: prod.descriptionBn,
      categoryId: prod.categoryId,
      farmerId: prod.farmerId,
      imageUrl: prod.imageUrl ?? "",
      badge: prod.badge,
      isActive: prod.isActive,
      isFeatured: prod.isFeatured,
      isFlashDeal: prod.isFlashDeal,
      isMemberBogo: prod.isMemberBogo,
      variantId: defVar?.id ?? 0,
      priceBdt: defVar?.priceBdt ?? 0,
      compareAtBdt: defVar?.compareAtBdt ? String(defVar.compareAtBdt) : "",
      stockQty: defVar?.stockQty ?? 0,
      newVarLabel: "",
      newVarPrice: "",
      newVarStock: "40",
    });
  };

  const handleSaveProductEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    const payload: Record<string, unknown> = {
      nameEn: editProdForm.nameEn,
      nameBn: editProdForm.nameBn,
      subtitleEn: editProdForm.subtitleEn,
      subtitleBn: editProdForm.subtitleBn,
      descriptionEn: editProdForm.descriptionEn,
      descriptionBn: editProdForm.descriptionBn,
      categoryId: Number(editProdForm.categoryId),
      farmerId: Number(editProdForm.farmerId),
      imageUrl: editProdForm.imageUrl || null,
      badge: editProdForm.badge,
      isActive: editProdForm.isActive,
      isFeatured: editProdForm.isFeatured,
      isFlashDeal: editProdForm.isFlashDeal,
      isMemberBogo: editProdForm.isMemberBogo,
    };
    if (editProdForm.variantId) {
      payload.variantId = editProdForm.variantId;
      payload.priceBdt = Number(editProdForm.priceBdt);
      payload.compareAtBdt = editProdForm.compareAtBdt
        ? Number(editProdForm.compareAtBdt)
        : null;
      payload.stockQty = Number(editProdForm.stockQty);
    }
    if (editProdForm.newVarLabel.trim() && Number(editProdForm.newVarPrice) > 0) {
      payload.newVariant = {
        label: editProdForm.newVarLabel.trim(),
        priceBdt: Number(editProdForm.newVarPrice),
        stockQty: Number(editProdForm.newVarStock || 40),
      };
    }

    const res = await fetch(`/api/admin/products/${editingProduct.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      showToast("Product updated successfully");
      setEditingProduct(null);
      loadOverview();
    } else {
      const err = await res.json();
      showToast(err.error || "Failed to update product", "error");
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...newProd,
        categoryId: Number(newProd.categoryId),
        farmerId: Number(newProd.farmerId),
        priceBdt: Number(newProd.priceBdt),
        stockQty: Number(newProd.stockQty),
        isFeatured: true,
      }),
    });
    if (res.ok) {
      showToast("Product published to storefront");
      setShowNewProduct(false);
      setNewProd((p) => ({
        ...p,
        nameEn: "",
        nameBn: "",
        subtitleEn: "",
        subtitleBn: "",
        descriptionEn: "",
        descriptionBn: "",
      }));
      loadOverview();
    } else {
      const err = await res.json();
      showToast(err.error || "Failed to create product", "error");
    }
  };

  const quickAdjustStock = async (prodId: number, v: AdminVariant, delta: number) => {
    const res = await fetch(`/api/admin/products/${prodId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variantId: v.id, stockQty: Math.max(0, v.stockQty + delta) }),
    });
    if (res.ok) {
      showToast(`Stock updated (${v.label})`);
      loadOverview();
    }
  };

  const toggleProductField = async (
    prodId: number,
    field: "isActive" | "isFlashDeal" | "isFeatured",
    val: boolean
  ) => {
    const res = await fetch(`/api/admin/products/${prodId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: val }),
    });
    if (res.ok) {
      showToast("Product updated");
      loadOverview();
    }
  };

  const deleteProduct = async (prodId: number) => {
    const res = await fetch(`/api/admin/products/${prodId}`, { method: "DELETE" });
    if (res.ok) {
      showToast("Product deleted");
      loadOverview();
    }
  };

  const updateOrder = async (
    orderId: number,
    updates: { status?: string; paymentStatus?: string }
  ) => {
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      showToast("Order updated");
      loadOverview();
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingCategory
      ? `/api/admin/categories/${editingCategory.id}`
      : "/api/admin/categories";
    const method = editingCategory ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...catForm,
        sortOrder: Number(catForm.sortOrder),
      }),
    });
    if (res.ok) {
      showToast(editingCategory ? "Category updated" : "Category created");
      setEditingCategory(null);
      setShowNewCategory(false);
      loadOverview();
    } else {
      const err = await res.json();
      showToast(err.error || "Category error", "error");
    }
  };

  const deleteCategory = async (catId: number) => {
    const res = await fetch(`/api/admin/categories/${catId}`, { method: "DELETE" });
    if (res.ok) {
      showToast("Category removed");
      loadOverview();
    } else {
      const err = await res.json();
      showToast(err.error || "Cannot delete category", "error");
    }
  };

  const updateUser = async (
    userId: string,
    updates: { role?: "customer" | "admin"; isMember?: boolean }
  ) => {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      showToast("User permissions updated");
      loadOverview();
    } else {
      const err = await res.json();
      showToast(err.error || "Failed to update user", "error");
    }
  };

  const handleCreateFarmer = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/farmers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...farmerForm,
        yearsActive: Number(farmerForm.yearsActive),
      }),
    });
    if (res.ok) {
      showToast("Farmer partner added");
      setFarmerForm({
        name: "",
        nameBn: "",
        district: "",
        upazila: "",
        specialty: "",
        yearsActive: 8,
        storyEn: "",
        storyBn: "",
      });
      loadOverview();
    }
  };

  const toggleFarmerVerified = async (id: number, verified: boolean) => {
    const res = await fetch("/api/admin/farmers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, verified }),
    });
    if (res.ok) {
      showToast("Farmer status updated");
      loadOverview();
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...couponForm,
        discountValue: Number(couponForm.discountValue),
        minOrderBdt: Number(couponForm.minOrderBdt),
        maxDiscountBdt: Number(couponForm.maxDiscountBdt),
      }),
    });
    if (res.ok) {
      showToast("Promo coupon created");
      setCouponForm({
        code: "",
        discountType: "percent",
        discountValue: 10,
        minOrderBdt: 300,
        maxDiscountBdt: 150,
        descriptionEn: "",
      });
      loadOverview();
    }
  };

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "slot", ...slotForm }),
    });
    if (res.ok) {
      showToast("Delivery slot added");
      setSlotForm({ labelEn: "", labelBn: "", windowText: "", capacity: 60, isExpress: false });
      loadOverview();
    }
  };

  const filteredOrders = useMemo(() => {
    if (!data) return [];
    return data.orders.filter((o) => {
      const statusMatch = orderStatusFilter === "all" || o.status === orderStatusFilter;
      const q = orderSearch.trim().toLowerCase();
      const textMatch =
        !q ||
        o.orderCode.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.toLowerCase().includes(q) ||
        o.deliveryArea.toLowerCase().includes(q);
      return statusMatch && textMatch;
    });
  }, [data, orderSearch, orderStatusFilter]);

  const filteredProducts = useMemo(() => {
    if (!data) return [];
    return data.products.filter((p) => {
      const catMatch = prodCatFilter === "all" || p.categoryId === prodCatFilter;
      const q = prodSearch.trim().toLowerCase();
      const textMatch =
        !q ||
        p.nameEn.toLowerCase().includes(q) ||
        p.nameBn.toLowerCase().includes(q) ||
        p.badge.toLowerCase().includes(q);
      return catMatch && textMatch;
    });
  }, [data, prodSearch, prodCatFilter]);

  const filteredUsers = useMemo(() => {
    if (!data) return [];
    const q = userSearch.trim().toLowerCase();
    if (!q) return data.users;
    return data.users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone || "").toLowerCase().includes(q)
    );
  }, [data, userSearch]);

  const navItems: Array<{ id: AdminSection; label: string; icon: React.ElementType; badge?: number }> = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "orders", label: "Orders", icon: ShoppingBag, badge: data?.stats.pendingOrdersCount },
    { id: "products", label: "Products", icon: Package, badge: data?.products.length },
    { id: "categories", label: "Categories", icon: FolderTree, badge: data?.categories.length },
    { id: "users", label: "Users & Club", icon: Users, badge: data?.users.length },
    { id: "farmers", label: "Farmers", icon: Sprout, badge: data?.farmers.length },
    { id: "logistics", label: "Slots & Coupons", icon: Clock },
  ];

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9faf8] text-sm font-medium text-gray-500">
        Loading Sobji Operations Console...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#f9faf8] text-gray-900">
      {/* Left Fixed Admin Sidebar (Desktop) */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col justify-between border-r border-gray-200 bg-white">
        <div>
          <div className="border-b border-gray-200 px-5 py-4">
            <SobjiLogo />
            <span className="mt-2 inline-block rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-[#0f7b3f]">
              Operations Admin
            </span>
          </div>

          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = section === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSection(item.id)}
                  className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition cursor-pointer ${
                    active
                      ? "bg-[#0f7b3f] text-white"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </span>
                  {typeof item.badge === "number" && (
                    <span
                      className={`rounded-md px-1.5 py-0.5 tabular-nums text-[11px] font-semibold ${
                        active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-gray-200 p-4 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-xl border border-gray-200 px-3.5 py-2 text-xs font-semibold text-gray-700 hover:border-[#0f7b3f] hover:text-[#0f7b3f]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>View Live Storefront</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Admin Header */}
        <header className="sticky top-0 z-30 border-b border-gray-200 bg-white px-4 py-3.5 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-bold text-gray-900 sm:text-xl capitalize">
                {navItems.find((n) => n.id === section)?.label}
              </h1>
              <p className="text-xs text-gray-500">
                Real-time store control • Neon Postgres synced
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowNewProduct(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f7b3f] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0b5e30] cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Product</span>
              </button>
              <Link
                href="/"
                className="lg:hidden rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700"
              >
                Storefront
              </Link>
            </div>
          </div>

          {/* Mobile Tabs */}
          <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1 lg:hidden">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSection(item.id)}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                  section === item.id
                    ? "bg-[#0f7b3f] text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 space-y-6">
          {/* OVERVIEW SECTION */}
          {section === "overview" && (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  {
                    label: "Gross Revenue",
                    value: formatTaka(data.stats.totalRevenueBdt),
                    sub: `${data.stats.totalOrders} total orders`,
                    icon: TrendingUp,
                  },
                  {
                    label: "Active Orders Queue",
                    value: String(data.stats.pendingOrdersCount),
                    sub: "Pending dispatch / transit",
                    icon: ShoppingBag,
                  },
                  {
                    label: "Catalog Health",
                    value: `${data.stats.activeProducts} SKUs`,
                    sub: `${data.stats.lowStockCount} low-stock variants (≤15)`,
                    icon: AlertTriangle,
                  },
                  {
                    label: "Customers & Club",
                    value: String(data.stats.totalCustomers),
                    sub: `${data.stats.clubMembers} Sobji Club members`,
                    icon: Users,
                  },
                ].map((kpi, idx) => {
                  const Icon = kpi.icon;
                  return (
                    <div
                      key={idx}
                      className="rounded-2xl border border-gray-200 bg-white p-5"
                    >
                      <div className="flex items-center justify-between text-xs font-medium text-gray-500">
                        <span>{kpi.label}</span>
                        <Icon className="h-4 w-4 text-[#0f7b3f]" />
                      </div>
                      <p className="mt-2 tabular-nums text-2xl font-bold text-gray-900">
                        {kpi.value}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">{kpi.sub}</p>
                    </div>
                  );
                })}
              </div>

              <div className="grid gap-6 lg:grid-cols-12">
                <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:col-span-7">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-gray-900">Recent Orders</h2>
                    <button
                      type="button"
                      onClick={() => setSection("orders")}
                      className="text-xs font-semibold text-[#0f7b3f] hover:underline cursor-pointer"
                    >
                      Manage all →
                    </button>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {data.orders.slice(0, 6).map((ord) => (
                      <div
                        key={ord.id}
                        className="flex items-center justify-between gap-3 py-3 text-sm"
                      >
                        <div>
                          <p className="font-semibold text-gray-900 tabular-nums">
                            {ord.orderCode} · {ord.customerName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {ord.deliveryArea} · {ord.slotLabel}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold capitalize ${
                              STATUS_STYLE[ord.status] || "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {ord.status.replaceAll("_", " ")}
                          </span>
                          <span className="tabular-nums font-bold text-gray-900">
                            {formatTaka(ord.totalBdt)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:col-span-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-gray-900">Low Stock Watch</h2>
                    <button
                      type="button"
                      onClick={() => setSection("products")}
                      className="text-xs font-semibold text-[#0f7b3f] hover:underline cursor-pointer"
                    >
                      Restock →
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    {data.products
                      .flatMap((p) =>
                        p.variants
                          .filter((v) => v.stockQty <= 25)
                          .map((v) => ({ prod: p, v }))
                      )
                      .slice(0, 6)
                      .map(({ prod, v }) => (
                        <div
                          key={v.id}
                          className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3.5 py-2.5 text-xs"
                        >
                          <div>
                            <p className="font-semibold text-gray-900">
                              {prod.nameEn} ({v.label})
                            </p>
                            <p className="text-gray-500 tabular-nums">
                              Remaining: {v.stockQty} units
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => quickAdjustStock(prod.id, v, 30)}
                            className="rounded-lg bg-[#0f7b3f] px-2.5 py-1 text-[11px] font-semibold text-white cursor-pointer"
                          >
                            +30
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ORDERS SECTION */}
          {section === "orders" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="relative flex-1 min-w-[220px] max-w-md">
                  <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="search"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Search order code, customer, phone, area..."
                    className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-[#0f7b3f] focus:outline-none"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {["all", ...ORDER_STATUSES].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setOrderStatusFilter(st)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize cursor-pointer ${
                        orderStatusFilter === st
                          ? "bg-[#0f7b3f] text-white"
                          : "border border-gray-200 bg-white text-gray-600"
                      }`}
                    >
                      {st.replaceAll("_", " ")}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Order</th>
                      <th className="px-4 py-3">Customer & Address</th>
                      <th className="px-4 py-3">Items</th>
                      <th className="px-4 py-3">Payment</th>
                      <th className="px-4 py-3">Dispatch Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-gray-50/70">
                        <td className="px-4 py-3.5 align-top">
                          <p className="tabular-nums font-bold text-[#0f7b3f]">
                            {ord.orderCode}
                          </p>
                          <p className="text-xs text-gray-500">{ord.deliveryDate}</p>
                          <p className="text-xs text-gray-500">{ord.slotLabel}</p>
                        </td>
                        <td className="px-4 py-3.5 align-top">
                          <p className="font-semibold text-gray-900">{ord.customerName}</p>
                          <p className="text-xs text-gray-500 tabular-nums">
                            {ord.customerPhone}
                          </p>
                          <p className="text-xs text-gray-500 max-w-xs">
                            {ord.deliveryArea} — {ord.deliveryAddress}
                          </p>
                        </td>
                        <td className="px-4 py-3.5 align-top text-xs text-gray-600 max-w-xs">
                          {ord.items.map((i) => (
                            <p key={i.id}>
                              {i.productNameEn} ({i.variantLabel}) × {i.quantity}
                            </p>
                          ))}
                        </td>
                        <td className="px-4 py-3.5 align-top">
                          <p className="tabular-nums font-bold text-gray-900">
                            {formatTaka(ord.totalBdt)}
                          </p>
                          <select
                            value={ord.paymentStatus}
                            onChange={(e) =>
                              updateOrder(ord.id, { paymentStatus: e.target.value })
                            }
                            className="mt-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-medium uppercase cursor-pointer"
                          >
                            <option value="pending">{ord.paymentMethod} • Pending</option>
                            <option value="paid">{ord.paymentMethod} • Paid</option>
                          </select>
                        </td>
                        <td className="px-4 py-3.5 align-top">
                          <select
                            value={ord.status}
                            onChange={(e) =>
                              updateOrder(ord.id, { status: e.target.value })
                            }
                            className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-900 cursor-pointer"
                          >
                            {ORDER_STATUSES.map((st) => (
                              <option key={st} value={st}>
                                {st.replaceAll("_", " ").toUpperCase()}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PRODUCTS SECTION */}
          {section === "products" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 flex-1">
                  <div className="relative min-w-[220px] max-w-sm flex-1">
                    <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="search"
                      value={prodSearch}
                      onChange={(e) => setProdSearch(e.target.value)}
                      placeholder="Search product EN/BN..."
                      className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-[#0f7b3f] focus:outline-none"
                    />
                  </div>
                  <select
                    value={prodCatFilter}
                    onChange={(e) =>
                      setProdCatFilter(
                        e.target.value === "all" ? "all" : Number(e.target.value)
                      )
                    }
                    className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium cursor-pointer"
                  >
                    <option value="all">All Categories</option>
                    {data.categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNewProduct(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f7b3f] px-4 py-2 text-xs font-semibold text-white cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  New Product
                </button>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Product</th>
                      <th className="px-4 py-3">Pack Variants & Stock</th>
                      <th className="px-4 py-3">Visibility & Flags</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredProducts.map((prod) => (
                      <tr key={prod.id} className="hover:bg-gray-50/70">
                        <td className="px-4 py-3.5 align-top">
                          <div className="flex items-center gap-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={prod.imageUrl || "/images/hero-basket.jpg"}
                              alt={prod.nameEn}
                              className="h-11 w-11 rounded-lg object-cover border border-gray-200 shrink-0"
                            />
                            <div>
                              <p className="font-semibold text-gray-900">
                                {prod.nameEn}
                              </p>
                              <p className="text-xs text-gray-500">
                                {prod.nameBn} · {prod.badge}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 align-top">
                          <div className="space-y-1.5">
                            {prod.variants.map((v) => (
                              <div
                                key={v.id}
                                className="flex items-center gap-2 text-xs tabular-nums"
                              >
                                <span className="font-medium text-gray-700 w-24 truncate">
                                  {v.label}
                                </span>
                                <span className="font-bold text-gray-900 w-14">
                                  ৳{v.priceBdt}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded font-semibold ${
                                    v.stockQty <= 15
                                      ? "bg-red-50 text-red-700"
                                      : "bg-gray-100 text-gray-700"
                                  }`}
                                >
                                  Stock: {v.stockQty}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => quickAdjustStock(prod.id, v, 25)}
                                  className="rounded border border-gray-200 px-2 py-0.5 text-[11px] font-semibold hover:border-[#0f7b3f] hover:text-[#0f7b3f] cursor-pointer"
                                >
                                  +25
                                </button>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 align-top">
                          <div className="flex flex-wrap gap-1.5 text-xs">
                            <button
                              type="button"
                              onClick={() =>
                                toggleProductField(prod.id, "isActive", !prod.isActive)
                              }
                              className={`rounded-lg px-2.5 py-1 font-semibold cursor-pointer ${
                                prod.isActive
                                  ? "bg-emerald-50 text-[#0f7b3f]"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {prod.isActive ? "Active" : "Hidden"}
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                toggleProductField(
                                  prod.id,
                                  "isFlashDeal",
                                  !prod.isFlashDeal
                                )
                              }
                              className={`rounded-lg px-2.5 py-1 font-semibold cursor-pointer ${
                                prod.isFlashDeal
                                  ? "bg-orange-50 text-orange-700"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {prod.isFlashDeal ? "Discount ★" : "Regular"}
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 align-top text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => openEditProduct(prod)}
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:border-[#0f7b3f] cursor-pointer"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteProduct(prod.id)}
                            className="inline-flex items-center rounded-lg border border-gray-200 p-1.5 text-gray-400 hover:text-red-600 cursor-pointer"
                            aria-label="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CATEGORIES SECTION */}
          {section === "categories" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Organize storefront departments and display order.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setEditingCategory(null);
                    setCatForm({
                      nameEn: "",
                      nameBn: "",
                      descriptionEn: "",
                      descriptionBn: "",
                      sortOrder: data.categories.length + 1,
                    });
                    setShowNewCategory(true);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f7b3f] px-4 py-2 text-xs font-semibold text-white cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Category
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {data.categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="rounded-2xl border border-gray-200 bg-white p-5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="tabular-nums">Order #{cat.sortOrder}</span>
                        <span className="rounded-md bg-gray-100 px-2 py-0.5 font-semibold text-gray-700 tabular-nums">
                          {cat.productCount} products
                        </span>
                      </div>
                      <h3 className="mt-2 text-base font-bold text-gray-900">
                        {cat.nameEn}
                      </h3>
                      <p className="text-xs font-medium text-[#0f7b3f]">{cat.nameBn}</p>
                      <p className="mt-2 text-xs text-gray-500">{cat.descriptionEn}</p>
                    </div>
                    <div className="mt-4 flex items-center justify-end gap-2 border-t border-gray-100 pt-3">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCategory(cat);
                          setCatForm({
                            nameEn: cat.nameEn,
                            nameBn: cat.nameBn,
                            descriptionEn: cat.descriptionEn,
                            descriptionBn: cat.descriptionBn,
                            sortOrder: cat.sortOrder,
                          });
                          setShowNewCategory(true);
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:border-[#0f7b3f] cursor-pointer"
                      >
                        <Pencil className="h-3 w-3" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteCategory(cat.id)}
                        className="rounded-lg border border-gray-200 p-1.5 text-gray-400 hover:text-red-600 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* USERS & CLUB SECTION */}
          {section === "users" && (
            <div className="space-y-4">
              <div className="relative max-w-md">
                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="search"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search user by name, email, phone..."
                  className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-[#0f7b3f] focus:outline-none"
                />
              </div>

              <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase text-gray-500">
                    <tr>
                      <th className="px-4 py-3">User</th>
                      <th className="px-4 py-3">Orders & Spend</th>
                      <th className="px-4 py-3">Sobji Club</th>
                      <th className="px-4 py-3">Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredUsers.map((u) => {
                      const isSelf = u.id === data.currentAdminId;
                      return (
                        <tr key={u.id} className="hover:bg-gray-50/70">
                          <td className="px-4 py-3.5">
                            <p className="font-semibold text-gray-900">
                              {u.name} {isSelf && <span className="text-xs text-[#0f7b3f]">(You)</span>}
                            </p>
                            <p className="text-xs text-gray-500">{u.email}</p>
                            {u.phone && (
                              <p className="text-xs text-gray-500 tabular-nums">{u.phone}</p>
                            )}
                          </td>
                          <td className="px-4 py-3.5 tabular-nums">
                            <p className="font-semibold text-gray-900">
                              {formatTaka(u.totalSpentBdt)}
                            </p>
                            <p className="text-xs text-gray-500">{u.orderCount} orders</p>
                          </td>
                          <td className="px-4 py-3.5">
                            <button
                              type="button"
                              onClick={() => updateUser(u.id, { isMember: !u.isMember })}
                              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold cursor-pointer ${
                                u.isMember
                                  ? "bg-emerald-50 text-[#0f7b3f]"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              <Sparkles className="h-3 w-3" />
                              {u.isMember ? "Club Member" : "Standard"}
                            </button>
                          </td>
                          <td className="px-4 py-3.5">
                            <button
                              type="button"
                              disabled={isSelf}
                              onClick={() =>
                                updateUser(u.id, {
                                  role: u.role === "admin" ? "customer" : "admin",
                                })
                              }
                              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold cursor-pointer disabled:opacity-50 ${
                                u.role === "admin"
                                  ? "bg-amber-50 text-amber-800 border border-amber-200"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              <Shield className="h-3 w-3" />
                              {u.role.toUpperCase()}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* FARMERS SECTION */}
          {section === "farmers" && (
            <div className="grid gap-6 lg:grid-cols-12">
              <div className="lg:col-span-7 grid gap-4 sm:grid-cols-2">
                {data.farmers.map((f) => (
                  <div
                    key={f.id}
                    className="rounded-2xl border border-gray-200 bg-white p-5 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#0f7b3f]">
                        {f.upazila}, {f.district}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleFarmerVerified(f.id, !f.verified)}
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold cursor-pointer ${
                          f.verified
                            ? "bg-emerald-50 text-[#0f7b3f]"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        {f.verified ? "Verified" : "Pending"}
                      </button>
                    </div>
                    <h3 className="text-sm font-bold text-gray-900">
                      {f.name} ({f.nameBn})
                    </h3>
                    <p className="text-xs font-medium text-gray-700">{f.specialty}</p>
                    <p className="text-xs text-gray-500">{f.storyEn}</p>
                  </div>
                ))}
              </div>

              <form
                onSubmit={handleCreateFarmer}
                className="rounded-2xl border border-gray-200 bg-white p-6 space-y-3 lg:col-span-5 h-fit"
              >
                <h3 className="text-base font-bold text-gray-900">Add Partner Farmer</h3>
                <div className="grid grid-cols-2 gap-2.5">
                  <input
                    required
                    value={farmerForm.name}
                    onChange={(e) => setFarmerForm({ ...farmerForm, name: e.target.value })}
                    placeholder="Farmer Name (EN)"
                    className="rounded-xl border border-gray-200 px-3 py-2 text-xs"
                  />
                  <input
                    required
                    value={farmerForm.nameBn}
                    onChange={(e) => setFarmerForm({ ...farmerForm, nameBn: e.target.value })}
                    placeholder="Farmer Name (BN)"
                    className="rounded-xl border border-gray-200 px-3 py-2 text-xs"
                  />
                  <input
                    required
                    value={farmerForm.district}
                    onChange={(e) =>
                      setFarmerForm({ ...farmerForm, district: e.target.value })
                    }
                    placeholder="District (e.g. Rangpur)"
                    className="rounded-xl border border-gray-200 px-3 py-2 text-xs"
                  />
                  <input
                    required
                    value={farmerForm.upazila}
                    onChange={(e) =>
                      setFarmerForm({ ...farmerForm, upazila: e.target.value })
                    }
                    placeholder="Upazila"
                    className="rounded-xl border border-gray-200 px-3 py-2 text-xs"
                  />
                </div>
                <input
                  required
                  value={farmerForm.specialty}
                  onChange={(e) =>
                    setFarmerForm({ ...farmerForm, specialty: e.target.value })
                  }
                  placeholder="Specialty (e.g. Organic Winter Greens)"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs"
                />
                <textarea
                  required
                  rows={2}
                  value={farmerForm.storyEn}
                  onChange={(e) =>
                    setFarmerForm({ ...farmerForm, storyEn: e.target.value })
                  }
                  placeholder="Farm Story (English)"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs"
                />
                <textarea
                  required
                  rows={2}
                  value={farmerForm.storyBn}
                  onChange={(e) =>
                    setFarmerForm({ ...farmerForm, storyBn: e.target.value })
                  }
                  placeholder="Farm Story (Bangla)"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs"
                />
                <button
                  type="submit"
                  className="w-full rounded-xl bg-[#0f7b3f] py-2.5 text-xs font-semibold text-white cursor-pointer"
                >
                  Save Partner Farmer
                </button>
              </form>
            </div>
          )}

          {/* DELIVERY SLOTS & COUPONS SECTION */}
          {section === "logistics" && (
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Coupons */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4">
                <h2 className="flex items-center gap-2 text-base font-bold text-gray-900">
                  <Tag className="h-4 w-4 text-[#0f7b3f]" />
                  Promo Coupons
                </h2>
                <div className="divide-y divide-gray-100">
                  {data.coupons.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between py-2.5 text-xs"
                    >
                      <div>
                        <p className="font-bold text-gray-900">{c.code}</p>
                        <p className="text-gray-500">{c.descriptionEn}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={async () => {
                            await fetch("/api/admin/coupons", {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ id: c.id, isActive: !c.isActive }),
                            });
                            loadOverview();
                          }}
                          className={`rounded-lg px-2.5 py-1 font-semibold cursor-pointer ${
                            c.isActive
                              ? "bg-emerald-50 text-[#0f7b3f]"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {c.isActive ? "Active" : "Paused"}
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            await fetch(`/api/admin/coupons?id=${c.id}`, {
                              method: "DELETE",
                            });
                            loadOverview();
                          }}
                          className="text-gray-400 hover:text-red-600 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <form
                  onSubmit={handleCreateCoupon}
                  className="border-t border-gray-100 pt-4 space-y-2.5"
                >
                  <p className="text-xs font-bold text-gray-700">Create Coupon</p>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      required
                      value={couponForm.code}
                      onChange={(e) =>
                        setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })
                      }
                      placeholder="Code (e.g. WINTER20)"
                      className="rounded-xl border border-gray-200 px-3 py-2 text-xs uppercase"
                    />
                    <select
                      value={couponForm.discountType}
                      onChange={(e) =>
                        setCouponForm({
                          ...couponForm,
                          discountType: e.target.value as "percent" | "fixed",
                        })
                      }
                      className="rounded-xl border border-gray-200 px-3 py-2 text-xs"
                    >
                      <option value="percent">Percent (%)</option>
                      <option value="fixed">Fixed (৳)</option>
                    </select>
                    <input
                      type="number"
                      required
                      value={couponForm.discountValue}
                      onChange={(e) =>
                        setCouponForm({
                          ...couponForm,
                          discountValue: Number(e.target.value),
                        })
                      }
                      placeholder="Value"
                      className="rounded-xl border border-gray-200 px-3 py-2 text-xs"
                    />
                    <input
                      type="number"
                      required
                      value={couponForm.minOrderBdt}
                      onChange={(e) =>
                        setCouponForm({
                          ...couponForm,
                          minOrderBdt: Number(e.target.value),
                        })
                      }
                      placeholder="Min Order (৳)"
                      className="rounded-xl border border-gray-200 px-3 py-2 text-xs"
                    />
                  </div>
                  <input
                    required
                    value={couponForm.descriptionEn}
                    onChange={(e) =>
                      setCouponForm({ ...couponForm, descriptionEn: e.target.value })
                    }
                    placeholder="Description (e.g. 20% off winter vegetables)"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs"
                  />
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-[#0f7b3f] py-2 text-xs font-semibold text-white cursor-pointer"
                  >
                    Create Coupon
                  </button>
                </form>
              </div>

              {/* Delivery Slots */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4">
                <h2 className="flex items-center gap-2 text-base font-bold text-gray-900">
                  <Clock className="h-4 w-4 text-[#0f7b3f]" />
                  Dhaka Delivery Slots
                </h2>
                <div className="divide-y divide-gray-100">
                  {data.slots.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between py-2.5 text-xs"
                    >
                      <div>
                        <p className="font-bold text-gray-900">{s.labelEn}</p>
                        <p className="text-gray-500">{s.windowText}</p>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          await fetch("/api/admin/coupons", {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              kind: "slot",
                              id: s.id,
                              isActive: !s.isActive,
                            }),
                          });
                          loadOverview();
                        }}
                        className={`rounded-lg px-2.5 py-1 font-semibold cursor-pointer ${
                          s.isActive
                            ? "bg-emerald-50 text-[#0f7b3f]"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {s.isActive ? "Active" : "Disabled"}
                      </button>
                    </div>
                  ))}
                </div>

                <form
                  onSubmit={handleCreateSlot}
                  className="border-t border-gray-100 pt-4 space-y-2.5"
                >
                  <p className="text-xs font-bold text-gray-700">Add Delivery Slot</p>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      required
                      value={slotForm.labelEn}
                      onChange={(e) => setSlotForm({ ...slotForm, labelEn: e.target.value })}
                      placeholder="Slot Name EN"
                      className="rounded-xl border border-gray-200 px-3 py-2 text-xs"
                    />
                    <input
                      required
                      value={slotForm.windowText}
                      onChange={(e) =>
                        setSlotForm({ ...slotForm, windowText: e.target.value })
                      }
                      placeholder="Window (e.g. 9:00 PM – 11:00 PM)"
                      className="rounded-xl border border-gray-200 px-3 py-2 text-xs"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-[#0f7b3f] py-2 text-xs font-semibold text-white cursor-pointer"
                  >
                    Add Slot
                  </button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* EDIT PRODUCT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <form
            onSubmit={handleSaveProductEdit}
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <h2 className="text-lg font-bold text-gray-900">
                Edit Product: {editingProduct.nameEn}
              </h2>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="p-1 text-gray-400 hover:text-gray-900 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 text-xs">
              <div>
                <label className="font-semibold text-gray-600">English Name</label>
                <input
                  required
                  value={editProdForm.nameEn}
                  onChange={(e) =>
                    setEditProdForm({ ...editProdForm, nameEn: e.target.value })
                  }
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="font-semibold text-gray-600">Bangla Name</label>
                <input
                  required
                  value={editProdForm.nameBn}
                  onChange={(e) =>
                    setEditProdForm({ ...editProdForm, nameBn: e.target.value })
                  }
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="font-semibold text-gray-600">Category</label>
                <select
                  value={editProdForm.categoryId}
                  onChange={(e) =>
                    setEditProdForm({
                      ...editProdForm,
                      categoryId: Number(e.target.value),
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                >
                  {data.categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nameEn}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-semibold text-gray-600">Farmer Partner</label>
                <select
                  value={editProdForm.farmerId}
                  onChange={(e) =>
                    setEditProdForm({
                      ...editProdForm,
                      farmerId: Number(e.target.value),
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                >
                  {data.farmers.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.district})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-semibold text-gray-600">Image URL</label>
                <input
                  value={editProdForm.imageUrl}
                  onChange={(e) =>
                    setEditProdForm({ ...editProdForm, imageUrl: e.target.value })
                  }
                  placeholder="/images/products/tomato.jpg"
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="font-semibold text-gray-600">Quality Badge</label>
                <input
                  value={editProdForm.badge}
                  onChange={(e) =>
                    setEditProdForm({ ...editProdForm, badge: e.target.value })
                  }
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                />
              </div>
            </div>

            {/* Edit Variant */}
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3 text-xs">
              <p className="font-bold text-gray-900">Edit Pack Variant Price & Stock</p>
              <div className="grid gap-2 sm:grid-cols-4">
                <select
                  value={editProdForm.variantId}
                  onChange={(e) => {
                    const vid = Number(e.target.value);
                    const found = editingProduct.variants.find((v) => v.id === vid);
                    if (found) {
                      setEditProdForm({
                        ...editProdForm,
                        variantId: found.id,
                        priceBdt: found.priceBdt,
                        compareAtBdt: found.compareAtBdt
                          ? String(found.compareAtBdt)
                          : "",
                        stockQty: found.stockQty,
                      });
                    }
                  }}
                  className="rounded-lg border border-gray-200 bg-white px-2.5 py-2 font-semibold"
                >
                  {editingProduct.variants.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.label}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={editProdForm.priceBdt}
                  onChange={(e) =>
                    setEditProdForm({
                      ...editProdForm,
                      priceBdt: Number(e.target.value),
                    })
                  }
                  placeholder="Price ৳"
                  className="rounded-lg border border-gray-200 bg-white px-2.5 py-2"
                />
                <input
                  type="number"
                  value={editProdForm.compareAtBdt}
                  onChange={(e) =>
                    setEditProdForm({ ...editProdForm, compareAtBdt: e.target.value })
                  }
                  placeholder="MRP ৳ (optional)"
                  className="rounded-lg border border-gray-200 bg-white px-2.5 py-2"
                />
                <input
                  type="number"
                  value={editProdForm.stockQty}
                  onChange={(e) =>
                    setEditProdForm({
                      ...editProdForm,
                      stockQty: Number(e.target.value),
                    })
                  }
                  placeholder="Stock"
                  className="rounded-lg border border-gray-200 bg-white px-2.5 py-2"
                />
              </div>

              <p className="pt-2 font-bold text-gray-700">
                Or Add Another Pack Size (Optional)
              </p>
              <div className="grid gap-2 sm:grid-cols-3">
                <input
                  value={editProdForm.newVarLabel}
                  onChange={(e) =>
                    setEditProdForm({ ...editProdForm, newVarLabel: e.target.value })
                  }
                  placeholder="e.g. 2kg"
                  className="rounded-lg border border-gray-200 bg-white px-2.5 py-2"
                />
                <input
                  type="number"
                  value={editProdForm.newVarPrice}
                  onChange={(e) =>
                    setEditProdForm({ ...editProdForm, newVarPrice: e.target.value })
                  }
                  placeholder="Price ৳"
                  className="rounded-lg border border-gray-200 bg-white px-2.5 py-2"
                />
                <input
                  type="number"
                  value={editProdForm.newVarStock}
                  onChange={(e) =>
                    setEditProdForm({ ...editProdForm, newVarStock: e.target.value })
                  }
                  placeholder="Stock Qty"
                  className="rounded-lg border border-gray-200 bg-white px-2.5 py-2"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-xs font-medium">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editProdForm.isActive}
                  onChange={(e) =>
                    setEditProdForm({ ...editProdForm, isActive: e.target.checked })
                  }
                />
                Active in Storefront
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editProdForm.isFlashDeal}
                  onChange={(e) =>
                    setEditProdForm({ ...editProdForm, isFlashDeal: e.target.checked })
                  }
                />
                Weekly Discount
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editProdForm.isMemberBogo}
                  onChange={(e) =>
                    setEditProdForm({ ...editProdForm, isMemberBogo: e.target.checked })
                  }
                />
                Member BOGO
              </label>
            </div>

            <div className="flex justify-end gap-2 border-t border-gray-200 pt-4">
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-[#0f7b3f] px-5 py-2 text-xs font-semibold text-white cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ADD NEW PRODUCT MODAL */}
      {showNewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <form
            onSubmit={handleCreateProduct}
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl space-y-3"
          >
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <h2 className="text-lg font-bold text-gray-900">Publish New Produce</h2>
              <button
                type="button"
                onClick={() => setShowNewProduct(false)}
                className="p-1 text-gray-400 hover:text-gray-900 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 text-sm">
              <input
                required
                value={newProd.nameEn}
                onChange={(e) => setNewProd({ ...newProd, nameEn: e.target.value })}
                placeholder="English Name"
                className="rounded-xl border border-gray-200 px-3 py-2"
              />
              <input
                required
                value={newProd.nameBn}
                onChange={(e) => setNewProd({ ...newProd, nameBn: e.target.value })}
                placeholder="Bangla Name"
                className="rounded-xl border border-gray-200 px-3 py-2"
              />
              <input
                required
                value={newProd.subtitleEn}
                onChange={(e) => setNewProd({ ...newProd, subtitleEn: e.target.value })}
                placeholder="Subtitle EN"
                className="rounded-xl border border-gray-200 px-3 py-2"
              />
              <input
                required
                value={newProd.subtitleBn}
                onChange={(e) => setNewProd({ ...newProd, subtitleBn: e.target.value })}
                placeholder="Subtitle BN"
                className="rounded-xl border border-gray-200 px-3 py-2"
              />
              <select
                value={newProd.categoryId}
                onChange={(e) =>
                  setNewProd({ ...newProd, categoryId: Number(e.target.value) })
                }
                className="rounded-xl border border-gray-200 px-3 py-2"
              >
                {data.categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nameEn}
                  </option>
                ))}
              </select>
              <select
                value={newProd.farmerId}
                onChange={(e) =>
                  setNewProd({ ...newProd, farmerId: Number(e.target.value) })
                }
                className="rounded-xl border border-gray-200 px-3 py-2"
              >
                {data.farmers.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.district})
                  </option>
                ))}
              </select>
              <input
                required
                value={newProd.variantLabel}
                onChange={(e) =>
                  setNewProd({ ...newProd, variantLabel: e.target.value })
                }
                placeholder="Pack Size (e.g. 500g)"
                className="rounded-xl border border-gray-200 px-3 py-2"
              />
              <input
                type="number"
                required
                value={newProd.priceBdt}
                onChange={(e) =>
                  setNewProd({ ...newProd, priceBdt: Number(e.target.value) })
                }
                placeholder="Price ৳"
                className="rounded-xl border border-gray-200 px-3 py-2"
              />
            </div>
            <textarea
              required
              rows={2}
              value={newProd.descriptionEn}
              onChange={(e) =>
                setNewProd({ ...newProd, descriptionEn: e.target.value })
              }
              placeholder="Description EN"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
            />
            <textarea
              required
              rows={2}
              value={newProd.descriptionBn}
              onChange={(e) =>
                setNewProd({ ...newProd, descriptionBn: e.target.value })
              }
              placeholder="Description BN"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNewProduct(false)}
                className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-[#0f7b3f] px-5 py-2 text-xs font-semibold text-white cursor-pointer"
              >
                Publish Product
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ADD / EDIT CATEGORY MODAL */}
      {showNewCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <form
            onSubmit={handleSaveCategory}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-3"
          >
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <h2 className="text-base font-bold text-gray-900">
                {editingCategory ? "Edit Category" : "Create Category"}
              </h2>
              <button
                type="button"
                onClick={() => setShowNewCategory(false)}
                className="p-1 text-gray-400 hover:text-gray-900 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <input
              required
              value={catForm.nameEn}
              onChange={(e) => setCatForm({ ...catForm, nameEn: e.target.value })}
              placeholder="Category Name EN"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
            />
            <input
              required
              value={catForm.nameBn}
              onChange={(e) => setCatForm({ ...catForm, nameBn: e.target.value })}
              placeholder="Category Name BN"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
            />
            <input
              required
              value={catForm.descriptionEn}
              onChange={(e) =>
                setCatForm({ ...catForm, descriptionEn: e.target.value })
              }
              placeholder="Short Description EN"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
            />
            <input
              required
              value={catForm.descriptionBn}
              onChange={(e) =>
                setCatForm({ ...catForm, descriptionBn: e.target.value })
              }
              placeholder="Short Description BN"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
            />
            <input
              type="number"
              value={catForm.sortOrder}
              onChange={(e) =>
                setCatForm({ ...catForm, sortOrder: Number(e.target.value) })
              }
              placeholder="Sort Order"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNewCategory(false)}
                className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-[#0f7b3f] px-5 py-2 text-xs font-semibold text-white cursor-pointer"
              >
                Save Category
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
