import type { Metadata } from "next";
import { getDeliverySlots } from "@/lib/catalog";
import { CheckoutClient } from "@/components/CheckoutClient";

export const metadata: Metadata = {
  title: "Checkout & Delivery Slot",
  description: "Complete your fresh sobji, shak, and kacha bazar order with 6:00 AM Dhaka delivery.",
  robots: { index: false, follow: true },
};

export default async function CheckoutPage() {
  const slots = await getDeliverySlots();
  return <CheckoutClient slots={slots} />;
}
