import type { MetadataRoute } from "next";
import { APP_SITE_URL } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/tasks",
    "/focus",
    "/notes",
    "/invitations",
    "/about",
    "/features",
    "/pricing",
    "/quran",
    "/tasbih",
    "/adhkar",
    "/dua",
    "/prayer",
    "/qibla",
    "/hijri",
    "/campaigns",
    "/community",
    "/support",
    "/terms",
    "/privacy",
  ];

  const now = new Date();
  return routes.map((route) => ({
    url: `${APP_SITE_URL}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.8,
  }));
}
