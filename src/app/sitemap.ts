import type { MetadataRoute } from "next";
import { getCatalogProducts, getCategories } from "@/lib/catalog";
import { SITE_URL } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([
    getCatalogProducts(),
    getCategories(),
  ]);

  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
      images: [
        `${SITE_URL}/images/hero-basket.jpg`,
        `${SITE_URL}/images/farm-origin.jpg`,
        `${SITE_URL}/images/fresh-fish-spices.jpg`,
      ],
    },
    {
      url: `${SITE_URL}/track`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/llms.txt`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.5,
    },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${SITE_URL}/bazar/${cat.slug}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.9,
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => {
    const imgUrl = product.imageUrl
      ? product.imageUrl.startsWith("http")
        ? product.imageUrl
        : `${SITE_URL}${product.imageUrl}`
      : `${SITE_URL}/images/hero-basket.jpg`;
    return {
      url: `${SITE_URL}/products/${product.slug}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
      images: [imgUrl],
    };
  });

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
