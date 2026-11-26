import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { PRIMARY_SEO_KEYWORDS, SITE_NAME, SITE_URL } from "@/lib/seo";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      "sobji.com | Fresh Vegetables (Shobji), Shak & Online Bazar in Dhaka",
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Order dawn-harvested vegetables (sobji / shobji), fresh shak (lal shak, palong shak, pui shak), fruits, Padma river fish, and spices online in Dhaka. 100% formalin-free kacha bazar delivered from 6:00 AM.",
  keywords: PRIMARY_SEO_KEYWORDS,
  applicationName: SITE_NAME,
  authors: [{ name: "sobji.com" }],
  creator: "sobji.com",
  publisher: "sobji.com",
  category: "Grocery & Fresh Produce",
  appleWebApp: {
    capable: true,
    title: "sobji.com",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: true,
    email: true,
  },
  alternates: {
    canonical: "/",
    languages: {
      "en-BD": "/",
      "bn-BD": "/",
      "x-default": "/",
    },
  },
  verification: {
    google:
      process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ||
      "aYUjHwMR8tVgdp8YfVT1FUXrgFV3Z5kZ6mKv4vHUtD4",
    ...(process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
      ? {
          other: {
            "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION,
          },
        }
      : {}),
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["bn_BD"],
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "sobji.com | Fresh Vegetables (Shobji), Shak & Online Bazar in Dhaka",
    description:
      "5:00 AM farm-direct vegetables (sobji / shobji), fresh shak, Padma river fish & pure spices delivered across Dhaka from 6:00 AM.",
    images: [
      {
        url: "/images/hero-basket.jpg",
        width: 1200,
        height: 630,
        alt: "Fresh vegetables (sobji), shak and kacha bazar basket from sobji.com",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "sobji.com | Fresh Vegetables (Shobji), Shak & Online Bazar",
    description:
      "Farm-direct sobji, shobji, shak, river fish & spices in Dhaka with 6:00 AM morning delivery.",
    images: ["/images/hero-basket.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#f9faf8] text-[#111827] selection:bg-[#0f7b3f] selection:text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
