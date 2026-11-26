import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getCatalogProducts, getProductBySlug } from "@/lib/catalog";
import { ProductDetailClient } from "@/components/ProductDetailClient";

async function ProductContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [product, allProducts] = await Promise.all([
    getProductBySlug(slug),
    getCatalogProducts(),
  ]);

  if (!product) {
    notFound();
  }

  const related = allProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return <ProductDetailClient product={product} relatedProducts={related} />;
}

export default function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-6 py-16 text-sm text-[#526559]">
          Loading harvest details...
        </div>
      }
    >
      <ProductContent params={params} />
    </Suspense>
  );
}
