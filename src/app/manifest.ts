import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.name,
    description: siteConfig.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#0a0a0a",
    lang: "ru",
    dir: "ltr",
    categories: ["business", "productivity", "finance"],
    prefer_related_applications: false,
    icons: [
      // PNG обязательны для Android Chrome install-prompt и Play Store.
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      // SVG как fallback для современных браузеров.
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
    shortcuts: [
      {
        name: "Создать лот",
        short_name: "Новый лот",
        description: "Опубликовать новый тендер",
        url: "/lots/new",
      },
      {
        name: "Каталог лотов",
        short_name: "Лоты",
        url: "/lots",
      },
      {
        name: "Лента",
        short_name: "Лента",
        url: "/feed",
      },
    ],
  };
}
