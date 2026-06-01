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
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon-maskable.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
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
