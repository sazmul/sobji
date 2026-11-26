import type { Metadata } from "next";
import {
  Newsreader,
  Plus_Jakarta_Sans,
  Hind_Siliguri,
  JetBrains_Mono,
} from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
  title: "sobji.com — Farm-Direct Organic Bazar, Bangladesh",
  description:
    "Dawn-harvested vegetables, leafy greens, river fish, and pure pantry staples delivered straight from verified Bangladeshi farms from 6:00 AM.",
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
      className={`${newsreader.variable} ${jakarta.variable} ${hindSiliguri.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#fbf9f5] text-[#112218] selection:bg-[#143624] selection:text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
