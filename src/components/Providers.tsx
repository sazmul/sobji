"use client";

import React, { Suspense, createContext, useContext, useEffect, useState, useCallback } from "react";
import type { Lang } from "@/lib/i18n";
import { LiveChatWidget } from "./LiveChatWidget";

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

export const DHAKA_AREAS = [
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

interface AppContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  deliveryArea: string;
  setDeliveryArea: (area: string) => void;
  items: CartItem[];
  wishlistIds: number[];
  toggleWishlist: (productId: number, name?: string) => void;
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
const WISHLIST_STORAGE_KEY = "sobji_wishlist_v1";
const AREA_STORAGE_KEY = "sobji_area_v1";

export function Providers({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  const [deliveryArea, setDeliveryAreaState] = useState<string>("Dhanmondi");
  const [items, setItems] = useState<CartItem[]>([]);
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
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
        const savedArea = localStorage.getItem(AREA_STORAGE_KEY);
        if (savedArea && DHAKA_AREAS.includes(savedArea)) {
          setDeliveryAreaState(savedArea);
        }
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (savedCart) {
          const parsed = JSON.parse(savedCart);
          if (Array.isArray(parsed)) setItems(parsed);
        }
        const savedWish = localStorage.getItem(WISHLIST_STORAGE_KEY);
        if (savedWish) {
          const parsedWish = JSON.parse(savedWish);
          if (Array.isArray(parsedWish)) setWishlistIds(parsedWish);
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
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistIds));
    } catch {
      // Ignore storage errors
    }
  }, [items, wishlistIds, hydrated]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, next);
    } catch {
      // Ignore
    }
  }, []);

  const setDeliveryArea = useCallback((area: string) => {
    setDeliveryAreaState(area);
    try {
      localStorage.setItem(AREA_STORAGE_KEY, area);
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

  const toggleWishlist = useCallback(
    (productId: number, name?: string) => {
      setWishlistIds((prev) => {
        const exists = prev.includes(productId);
        const next = exists
          ? prev.filter((id) => id !== productId)
          : [...prev, productId];
        showToast(
          exists
            ? `${name || "Item"} removed from wishlist`
            : `${name || "Item"} saved to wishlist`,
          "info"
        );
        return next;
      });
    },
    [showToast]
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
          ? `${newItem.nameBn} (${newItem.variantLabel}) কার্টে যোগ হয়েছে`
          : `${newItem.nameEn} (${newItem.variantLabel}) added to cart`
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
        deliveryArea,
        setDeliveryArea,
        items,
        wishlistIds,
        toggleWishlist,
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
      <Suspense fallback={null}>
        <LiveChatWidget />
      </Suspense>
      <div
        className="pointer-events-none fixed bottom-36 right-4 z-[100] flex flex-col gap-2 md:bottom-24 md:right-6"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-2.5 rounded-xl px-4 py-3 text-xs font-semibold shadow-lg backdrop-blur-md transition-all ${
              toast.type === "error"
                ? "bg-red-700 text-white"
                : toast.type === "info"
                  ? "bg-gray-900 text-white"
                  : "bg-[#0f7b3f] text-white"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-white" />
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
