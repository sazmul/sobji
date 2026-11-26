import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Hind_Siliguri, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const hindSiliguri = Hind_Siliguri({
  variable: "--font-hind",
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "sobji.com — Farm-Fresh Vegetables & Organic Bazar in Bangladesh",
  description:
    "Order 100% chemical-free vegetables, leafy greens (shak), river fish, fruits, and pure spices straight from Bangladeshi farmers. 6:00 AM morning delivery across Dhaka.",
  keywords: [
    "sobji.com",
    "online vegetable market bangladesh",
    "fresh vegetables dhaka",
    "organic bazar",
    "sobji delivery",
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${hindSiliguri.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#faf8f3] text-[#111c16] selection:bg-emerald-200 selection:text-emerald-950">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
