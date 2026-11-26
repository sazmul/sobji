import type { Metadata } from "next";
import {
  getCategories,
  getCatalogProducts,
  getDeliverySlots,
  getFarmers,
} from "@/lib/catalog";
import { StorefrontHome } from "@/components/StorefrontHome";
import { buildHomeJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "sobji.com | Fresh Vegetables (Shobji), Shak & Online Kacha Bazar",
  description:
    "Shop daily farm-direct sobji, shobji, shak (লাল শাক, পালং শাক), potato, tomato, brinjal, Padma rui fish & pure spices online in Dhaka. 100% formalin-free with 6:00 AM delivery.",
  alternates: {
    canonical: "/",
  },
};

export default async function HomePage() {
  const [categories, products, farmers, slots] = await Promise.all([
    getCategories(),
    getCatalogProducts(),
    getFarmers(),
    getDeliverySlots(),
  ]);

  const jsonLd = buildHomeJsonLd(products);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <StorefrontHome
        categories={categories}
        products={products}
        farmers={farmers}
        slots={slots}
      />
    </>
  );
}
