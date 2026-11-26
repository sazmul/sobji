import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Track Your Order",
  description:
    "Track your fresh sobji, shak, and kacha bazar delivery across Dhaka live with your sobji.com order code.",
  alternates: {
    canonical: "/track",
  },
};

export default function TrackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
