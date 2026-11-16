import type { MetadataRoute } from "next";
import { getContent } from "@/lib/cms/content";
import { publishedPosts } from "@/lib/cms/blog";
import { SEO_PAGES } from "@/lib/cms/defaults";
import { getMedia } from "@/lib/media";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { settings, seo, projects, blog, gallery } = await getContent();
  const base = settings.url;
  const posts = publishedPosts(blog.posts);
  const live = projects.filter((p) => p.images.length > 0);
  // Absolute image URLs, so Google Images can find and credit the photos (image sitemap).
  const img = (refs: string[]) => [...new Set(refs.filter(Boolean).map((r) => new URL(getMedia(r).src, base).toString()))];

  const pageImages: Record<string, string[]> = {
    "/": img([seo.ogImage, ...live.map((p) => p.images[0])]),
    "/projects": img(live.map((p) => p.images[0])),
    "/gallery": img(gallery.items.map((g) => g.image)).slice(0, 1000),
  };

  const pages = SEO_PAGES.filter((p) => !seo.pages[p.path]?.noindex)
    .filter((p) => p.path !== "/blog" || posts.length > 0)
    .map(({ path }) => ({
      url: `${base}${path === "/" ? "" : path}`,
      changeFrequency: "monthly" as const,
      priority: path === "/" ? 1 : 0.8,
      ...(pageImages[path]?.length ? { images: pageImages[path] } : {}),
    }));
  const projectPages = live.map((p) => ({
    url: `${base}/projects/${p.slug}`,
    changeFrequency: "yearly" as const,
    priority: 0.6,
    images: img(p.images),
  }));
  const postPages = posts.map((p) => ({
    url: `${base}/blog/${p.slug}`,
    ...(p.date ? { lastModified: p.date } : {}),
    changeFrequency: "yearly" as const,
    priority: 0.6,
    ...(p.cover ? { images: img([p.cover]) } : {}),
  }));
  return [...pages, ...projectPages, ...postPages];
}
