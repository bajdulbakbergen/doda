import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.name,
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#0a0a0a",
    lang: "ru",
    categories: ["business", "productivity"],
    // Иконки добавьте в /public/icon-{192,512}.png и раскомментируйте:
    // icons: [
    //   { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
    //   { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    //   { src: "/icon-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    // ],
    icons: [],
  };
}
