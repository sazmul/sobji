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
  title: "sobji.com — Straight From The Field | Online Vegetable & Bazar BD",
  description:
    "No Middleman. Fair price for the farmer, lower price for you. Order fresh vegetables, leafy greens (shak), river fish, fruits, and spices with 6:00 AM delivery across Dhaka.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${hindSiliguri.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-[#18231c] selection:bg-emerald-600 selection:text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
