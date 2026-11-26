import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getCatalogProducts, getProductBySlug } from "@/lib/catalog";
import { ProductDetailClient } from "@/components/ProductDetailClient";
import { ProductDetailSkeleton } from "@/components/Skeletons";
import { buildProductJsonLd, SITE_URL } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    return {
      title: "Produce Not Found",
      robots: { index: false, follow: false },
    };
  }

  const catNameEn = product.category?.nameEn ?? "Fresh Vegetables";
  const catNameBn = product.category?.nameBn ?? "তাজা সবজি";
  const district = product.farmer?.district ?? "Bogura";
  const defVar = product.variants.find((v) => v.isDefault) ?? product.variants[0];
  const priceText = defVar ? `৳${defVar.priceBdt} / ${defVar.label}` : "";
  const title = `${product.nameEn} (${product.nameBn}) - Fresh ${catNameEn}`;
  const description = `${product.subtitleEn} Fresh ${product.nameEn} (${product.nameBn}) from ${district}. ${priceText ? `Price: ${priceText}. ` : ""}Order fresh sobji & shak online in Dhaka from sobji.com.`;
  const imgUrl = product.imageUrl
    ? product.imageUrl.startsWith("http")
      ? product.imageUrl
      : `${SITE_URL}${product.imageUrl}`
    : `${SITE_URL}/images/hero-basket.jpg`;

  return {
    title,
    description,
    keywords: [
      product.nameEn,
      product.nameBn,
      catNameEn,
      catNameBn,
      "sobji",
      "shobji",
      "shak",
      "fresh vegetables dhaka",
      district,
      "sobji.com",
    ],
    alternates: {
      canonical: `/products/${product.slug}`,
      languages: {
        "en-BD": `/products/${product.slug}`,
        "bn-BD": `/products/${product.slug}`,
        "x-default": `/products/${product.slug}`,
      },
    },
    openGraph: {
      type: "website",
      title,
      description,
      url: `${SITE_URL}/products/${product.slug}`,
      images: [
        {
          url: imgUrl,
          alt: `${product.nameEn} (${product.nameBn}) - sobji.com`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imgUrl],
    },
  };
}

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

  const jsonLd = buildProductJsonLd(product);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient product={product} relatedProducts={related} />
    </>
  );
}

export default function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={<ProductDetailSkeleton />}>
      <ProductContent params={params} />
    </Suspense>
  );
}
