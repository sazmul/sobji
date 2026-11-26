import {
  getCategories,
  getCatalogProducts,
  getDeliverySlots,
  getFarmers,
} from "@/lib/catalog";
import { StorefrontHome } from "@/components/StorefrontHome";

export default async function HomePage() {
  const [categories, products, farmers, slots] = await Promise.all([
    getCategories(),
    getCatalogProducts(),
    getFarmers(),
    getDeliverySlots(),
  ]);

  return (
    <StorefrontHome
      categories={categories}
      products={products}
      farmers={farmers}
      slots={slots}
    />
  );
}
