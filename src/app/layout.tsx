import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "sobji.com | Fresh Vegetables & Online Bazar in Bangladesh",
  description:
    "Straight from the field with zero middlemen. Order fresh vegetables, leafy greens (shak), river fish, fruits, and pure spices with 6:00 AM delivery across Dhaka.",
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
