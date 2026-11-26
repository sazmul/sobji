import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTaka(amount: number, lang: "en" | "bn" = "en"): string {
  const rounded = Math.round(amount);
  const formatted = rounded.toLocaleString("en-IN");
  if (lang === "bn") {
    return `৳${toBanglaDigits(formatted)}`;
  }
  return `৳${formatted}`;
}

export function toBanglaDigits(input: string | number): string {
  const digits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(input).replace(/\d/g, (d) => digits[Number(d)] ?? d);
}

export function generateOrderCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 6; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `SBJ-${suffix}`;
}

export const FREE_DELIVERY_THRESHOLD = 499;
export const STANDARD_DELIVERY_FEE = 49;
export const EXPRESS_DELIVERY_FEE = 79;

export function calculateDeliveryFee(
  subtotal: number,
  isExpress: boolean,
  isMember: boolean
): number {
  if (subtotal <= 0) return 0;
  if (isExpress) return isMember ? 39 : EXPRESS_DELIVERY_FEE;
  if (isMember && subtotal >= 299) return 0;
  if (subtotal >= FREE_DELIVERY_THRESHOLD) return 0;
  return STANDARD_DELIVERY_FEE;
}
