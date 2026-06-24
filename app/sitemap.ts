import type { MetadataRoute } from "next";
import { siteServices } from "@/lib/site-services";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const main: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },
    { url: `${SITE_URL}/privacidade`, lastModified: now, priority: 0.2 },
    { url: `${SITE_URL}/termos`, lastModified: now, priority: 0.2 },
  ];
  const services: MetadataRoute.Sitemap = siteServices.map((s) => ({
    url: `${SITE_URL}/servicos/${s.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));
  return [...main, ...services];
}
