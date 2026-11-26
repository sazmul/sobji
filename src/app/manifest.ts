import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "sobji.com | Fresh Vegetables (Shobji), Shak & Online Kacha Bazar",
    short_name: "sobji.com",
    description:
      "Order dawn-harvested vegetables (sobji / shobji), fresh shak, fruits, Padma river fish, deshi chicken, duck eggs, and pure spices (moshla) in Dhaka starting 6:00 AM.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    lang: "en",
    dir: "ltr",
    background_color: "#f9faf8",
    theme_color: "#0f7b3f",
    categories: ["shopping", "food", "lifestyle"],
    shortcuts: [
      {
        name: "Shop Fresh Sobji & Shak",
        short_name: "Fresh Bazar",
        url: "/#catalog",
        icons: [{ src: "/icon.png", sizes: "512x512", type: "image/png" }],
      },
      {
        name: "Track Live Order",
        short_name: "Track Order",
        url: "/track",
        icons: [{ src: "/icon.png", sizes: "512x512", type: "image/png" }],
      },
      {
        name: "Checkout Bag",
        short_name: "Checkout",
        url: "/checkout",
        icons: [{ src: "/icon.png", sizes: "512x512", type: "image/png" }],
      },
    ],
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
