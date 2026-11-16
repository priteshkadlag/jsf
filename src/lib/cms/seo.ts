import "server-only";
import type { Metadata } from "next";
import { getMedia } from "@/lib/media";
import { getContent } from "./content";

export function ogImage(ref: string, alt: string) {
  if (!ref) return undefined;
  const m = getMedia(ref);
  return [{ url: m.src, width: m.width, height: m.height, alt }];
}

/** Metadata for a static page, using the title/description/image set in Admin → SEO. */
export async function pageMetadata(path: string): Promise<Metadata> {
  const { seo, settings } = await getContent();
  const p = seo.pages[path];
  const title = p?.title || undefined;
  const description = p?.description || seo.description;
  const images = ogImage(p?.ogImage || seo.ogImage, title ?? settings.name);
  return {
    // The home page uses the site-wide default title as-is (no template suffix).
    title: path === "/" ? { absolute: p?.title || seo.titleDefault } : title,
    description,
    alternates: { canonical: path },
    openGraph: { title: title ?? seo.titleDefault, description, url: path, ...(images ? { images } : {}) },
    ...(p?.noindex ? { robots: { index: false, follow: true } } : {}),
  };
}
