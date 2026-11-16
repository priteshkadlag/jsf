import type { MetadataRoute } from "next";
import { getContent } from "@/lib/cms/content";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const { settings, theme } = await getContent();
  return {
    name: settings.name,
    short_name: settings.shortName || settings.name,
    description: settings.description,
    start_url: "/",
    display: "standalone",
    background_color: theme.colors.ivory,
    theme_color: theme.colors.espresso,
    lang: "en-IN",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
