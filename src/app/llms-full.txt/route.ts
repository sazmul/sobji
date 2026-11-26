import { NextResponse } from "next/server";
import { getCatalogProducts, getCategories, getDeliverySlots, getFarmers } from "@/lib/catalog";
import { HOME_FAQS, SITE_URL } from "@/lib/seo";

export async function GET() {
  const [categories, products, farmers, slots] = await Promise.all([
    getCategories(),
    getCatalogProducts(),
    getFarmers(),
    getDeliverySlots(),
  ]);

  const lines: string[] = [
    "# sobji.com - Complete Structured Product, Farm, Delivery & FAQ Guide",
    "",
    `Canonical URL: ${SITE_URL}`,
    "Brand Aliases: sobji.com, Sobji, Shobji, সবজি, শাক, Sobji Bazar, Online Kacha Bazar Dhaka",
    "Hotline / WhatsApp: +880 1885-592511 | Email: care@sobji.com",
    "Hub: Kawran Bazar Dawn Hub, Dhaka 1215, Bangladesh",
    "",
    "## Dhaka Delivery Zones Covered",
    "Dhanmondi, Gulshan, Banani, Baridhara, Uttara, Mirpur, Mohammadpur, Bashundhara R/A, Badda, Rampura, Khilgaon, Motijheel",
    "",
    "## Active Delivery Slots",
    ...slots.map((s) => `- ${s.labelEn} (${s.labelBn}): ${s.windowText}${s.isExpress ? " [Express]" : ""}`),
    "",
    "## Category Landing URLs",
    ...categories.map(
      (c) => `- ${c.nameEn} (${c.nameBn}): ${SITE_URL}/bazar/${c.slug} - ${c.descriptionEn}`
    ),
    "",
    "## Partner Bangladeshi Farmers & Sourcing Districts",
    ...farmers.map(
      (f) => `- ${f.name} (${f.nameBn}) - ${f.upazila}, ${f.district} | Specialty: ${f.specialty} (${f.yearsActive} yrs)`
    ),
    "",
    "## Complete Product Catalog (Live Database Prices in BDT)",
    ...products.flatMap((p) => {
      const variantsText = p.variants
        .map((v) => `${v.label}: ৳${v.priceBdt} (stock: ${v.stockQty})`)
        .join(", ");
      return [
        `### ${p.nameEn} (${p.nameBn})`,
        `- URL: ${SITE_URL}/products/${p.slug}`,
        `- Category: ${p.categoryNameEn} (${p.categoryNameBn})`,
        `- Farm Origin: ${p.farmerName}, ${p.farmerUpazila}, ${p.farmerDistrict}`,
        `- Harvest Window: ${p.harvestTime}`,
        `- Variants & Prices: ${variantsText}`,
        `- Summary: ${p.subtitleEn} ${p.descriptionEn}`,
        `- Bangla Summary: ${p.subtitleBn} ${p.descriptionBn}`,
        `- Storage Tip: ${p.storageTipEn}`,
        "",
      ];
    }),
    "## Common Customer Questions & Direct Answers",
    ...HOME_FAQS.flatMap((f) => [
      `Q: ${f.questionEn}`,
      `A: ${f.answerEn}`,
      `Q (BN): ${f.questionBn}`,
      `A (BN): ${f.answerBn}`,
      "",
    ]),
  ];

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}
