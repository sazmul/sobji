import { NextResponse } from "next/server";
import { getCatalogProducts, getCategories } from "@/lib/catalog";
import { HOME_FAQS, SITE_URL } from "@/lib/seo";

export async function GET() {
  const [categories, products] = await Promise.all([
    getCategories(),
    getCatalogProducts(),
  ]);

  const lines: string[] = [
    "# sobji.com",
    "",
    "> Bangladesh's farm-direct online kacha bazar for dawn-harvested vegetables (sobji / shobji), leafy greens (shak: Lal Shak, Palong Shak, Pui Shak), fresh fruits, Padma river fish (Rui, Chandpur Ilish, Bagda Chingri), Deshi Sonali chicken, duck eggs, pure spices (moshla), and wooden Ghani mustard oil delivered across Dhaka starting 6:00 AM.",
    "",
    "## Store Overview",
    `- Website: ${SITE_URL}`,
    `- Full Catalog Reference: ${SITE_URL}/llms-full.txt`,
    `- Hotline & WhatsApp: +880 1885-592511`,
    `- Support Email: care@sobji.com`,
    `- Operations Hub: Kawran Bazar Dawn Hub, Dhaka 1215, Bangladesh`,
    `- Delivery Hours: Daily 6:00 AM to 10:00 PM (60-Minute Express available)`,
    `- Free Delivery Threshold: Orders ৳499+ (or ৳299+ for Sobji Club Members); ৳49 standard fee`,
    `- Payments: Cash on Delivery (COD), bKash, Nagad, Visa, Mastercard`,
    "",
    "## Categories",
    ...categories.map(
      (c) => `- [${c.nameEn} (${c.nameBn})](${SITE_URL}/bazar/${c.slug}): ${c.descriptionEn}`
    ),
    "",
    "## Featured Produce & Pricing",
    ...products.map((p) => {
      const defVar = p.variants.find((v) => v.isDefault) ?? p.variants[0];
      const priceStr = defVar ? `৳${defVar.priceBdt} / ${defVar.label}` : "";
      return `- [${p.nameEn} (${p.nameBn})](${SITE_URL}/products/${p.slug}) | ${p.categoryNameEn} | From ${p.farmerDistrict} | ${priceStr}`;
    }),
    "",
    "## Frequently Asked Questions",
    ...HOME_FAQS.flatMap((f) => [`### ${f.questionEn}`, f.answerEn, ""]),
  ];

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}
