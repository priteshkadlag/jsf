import type { MetadataRoute } from "next";
import { getContent } from "@/lib/cms/content";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const { settings } = await getContent();
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/admin"] },
    sitemap: `${settings.url}/sitemap.xml`,
  };
}
