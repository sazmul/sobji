import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getCatalogProducts, getCategories } from "@/lib/catalog";
import { CategoryHubClient } from "@/components/CategoryHubClient";
import { CardRowSkeleton } from "@/components/Skeletons";
import {
  buildCategoryJsonLd,
  CATEGORY_SEO_META,
  PRIMARY_SEO_KEYWORDS,
  SITE_URL,
} from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: slug } = await params;
  const categories = await getCategories();
  const matched = categories.find((c) => c.slug === slug);

  if (!matched) {
    return {
      title: "Category Not Found",
      robots: { index: false, follow: false },
    };
  }

  const seo = CATEGORY_SEO_META[matched.slug];
  const title = seo?.titleEn || `${matched.nameEn} (${matched.nameBn})`;
  const description =
    seo?.descriptionEn ||
    `${matched.descriptionEn} Order fresh ${matched.nameEn} (${matched.nameBn}) online in Dhaka from sobji.com.`;

  return {
    title,
    description,
    keywords: [...(seo?.keywords ?? []), ...PRIMARY_SEO_KEYWORDS.slice(0, 12)],
    alternates: {
      canonical: `/bazar/${matched.slug}`,
      languages: {
        "en-BD": `/bazar/${matched.slug}`,
        "bn-BD": `/bazar/${matched.slug}`,
        "x-default": `/bazar/${matched.slug}`,
      },
    },
    openGraph: {
      type: "website",
      title,
      description,
      url: `${SITE_URL}/bazar/${matched.slug}`,
      images: [
        {
          url: "/images/hero-basket.jpg",
          width: 1200,
          height: 630,
          alt: `${matched.nameEn} (${matched.nameBn}) - sobji.com`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/images/hero-basket.jpg"],
    },
  };
}

async function CategoryContent({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;
  const [categories, allProducts] = await Promise.all([
    getCategories(),
    getCatalogProducts(),
  ]);

  const current = categories.find((c) => c.slug === slug);
  if (!current) {
    notFound();
  }

  const filtered = allProducts.filter((p) => p.categorySlug === current.slug);
  const jsonLd = buildCategoryJsonLd(current, filtered);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CategoryHubClient
        category={current}
        allCategories={categories}
        products={filtered}
      />
    </>
  );
}

export default function CategoryHubPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <CardRowSkeleton rows={3} />
        </div>
      }
    >
      <CategoryContent params={params} />
    </Suspense>
  );
}
