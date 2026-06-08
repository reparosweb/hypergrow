import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HyperGrow — Tecnologia que faz crescer",
    short_name: "HyperGrow",
    description:
      "Websites, sistemas, automação e inteligência artificial para acelerar o crescimento da sua empresa.",
    start_url: "/",
    display: "standalone",
    background_color: "#05060c",
    theme_color: "#0a0c16",
    lang: "pt-BR",
    orientation: "portrait-primary",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon.svg", sizes: "512x512", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
