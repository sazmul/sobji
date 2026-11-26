"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { Lang } from "@/lib/i18n";

export interface CartItem {
  productId: number;
  variantId: number;
  slug: string;
  nameEn: string;
  nameBn: string;
  variantLabel: string;
  priceBdt: number;
  compareAtBdt?: number | null;
  visualKey: string;
  imageUrl?: string | null;
  quantity: number;
  maxStock: number;
  isMemberBogo?: boolean;
}

interface ToastItem {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface AppContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  items: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addItem: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  updateQty: (variantId: number, qty: number) => void;
  removeItem: (variantId: number) => void;
  clearCart: () => void;
  subtotal: number;
  totalCount: number;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const CART_STORAGE_KEY = "sobji_bazar_cart_v1";
const LANG_STORAGE_KEY = "sobji_lang_v1";

export function Providers({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const savedLang = localStorage.getItem(LANG_STORAGE_KEY);
        if (savedLang === "bn" || savedLang === "en") {
          setLangState(savedLang);
        }
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (savedCart) {
          const parsed = JSON.parse(savedCart);
          if (Array.isArray(parsed)) setItems(parsed);
        }
      } catch {
        // Ignore storage errors
      } finally {
        setHydrated(true);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage errors
    }
  }, [items, hydrated]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, next);
    } catch {
      // Ignore
    }
  }, []);

  const toggleLang = useCallback(() => {
    setLang(lang === "en" ? "bn" : "en");
  }, [lang, setLang]);

  const showToast = useCallback(
    (message: string, type: "success" | "error" | "info" = "success") => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    },
    []
  );

  const addItem = useCallback(
    (newItem: Omit<CartItem, "quantity">, qty = 1) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.variantId === newItem.variantId);
        if (existing) {
          const nextQty = Math.min(existing.quantity + qty, newItem.maxStock || 99);
          return prev.map((i) =>
            i.variantId === newItem.variantId ? { ...i, quantity: nextQty } : i
          );
        }
        return [...prev, { ...newItem, quantity: Math.min(qty, newItem.maxStock || 99) }];
      });
      showToast(
        lang === "bn"
          ? `${newItem.nameBn} (${newItem.variantLabel}) ব্যাগে যোগ হয়েছে`
          : `${newItem.nameEn} (${newItem.variantLabel}) added to bazar bag`
      );
    },
    [lang, showToast]
  );

  const updateQty = useCallback((variantId: number, qty: number) => {
    if (qty <= 0) {
      setItems((prev) => prev.filter((i) => i.variantId !== variantId));
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.variantId === variantId
          ? { ...i, quantity: Math.min(qty, i.maxStock || 99) }
          : i
      )
    );
  }, []);

  const removeItem = useCallback((variantId: number) => {
    setItems((prev) => prev.filter((i) => i.variantId !== variantId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const subtotal = items.reduce((sum, i) => sum + i.priceBdt * i.quantity, 0);
  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang,
        toggleLang,
        items,
        isCartOpen,
        setIsCartOpen,
        addItem,
        updateQty,
        removeItem,
        clearCart,
        subtotal,
        totalCount,
        showToast,
      }}
    >
      {children}
      {/* Floating Toast Container */}
      <div
        className="pointer-events-none fixed bottom-20 right-4 z-[100] flex flex-col gap-2 md:bottom-6"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-medium shadow-lg ring-1 backdrop-blur-md transition-all ${
              toast.type === "error"
                ? "bg-red-950/95 text-red-50 ring-red-700/40"
                : toast.type === "info"
                  ? "bg-amber-950/95 text-amber-50 ring-amber-700/40"
                  : "bg-[#14532d]/95 text-white ring-emerald-500/30"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            {toast.message}
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within Providers");
  return ctx;
}
