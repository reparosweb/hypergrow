import type { MetadataRoute } from "next";
import { siteServices } from "@/lib/site-services";

const SITE = "https://hypergrow-lovat.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const main: MetadataRoute.Sitemap = [
    { url: `${SITE}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },
    { url: `${SITE}/privacidade`, lastModified: now, priority: 0.2 },
    { url: `${SITE}/termos`, lastModified: now, priority: 0.2 },
  ];
  const services: MetadataRoute.Sitemap = siteServices.map((s) => ({
    url: `${SITE}/servicos/${s.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));
  return [...main, ...services];
}
