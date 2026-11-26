import { getDeliverySlots } from "@/lib/catalog";
import { CheckoutClient } from "@/components/CheckoutClient";

export default async function CheckoutPage() {
  const slots = await getDeliverySlots();
  return <CheckoutClient slots={slots} />;
}
