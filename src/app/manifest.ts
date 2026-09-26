import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Divino Fogão · Cardápio",
    short_name: "Divino Fogão",
    description: "Cardápio digital do Divino Fogão – São Leopoldo",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    theme_color: "#6b1d22",
    background_color: "#f4eee4",
    lang: "pt-BR",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
