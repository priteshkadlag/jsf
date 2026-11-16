import { getContent } from "@/lib/cms/content";
import { publishedPosts } from "@/lib/cms/blog";
import { SEO_PAGES } from "@/lib/cms/defaults";
import { products } from "@/data/products";

/**
 * /llms.txt — a plain-text guide to the site for AI assistants and answer engines (llmstxt.org).
 * Built from the same content as the pages, so it stays current after edits in the admin.
 */
export async function GET() {
  const { settings: s, seo, projects, blog } = await getContent();
  const url = (path: string) => `${s.url}${path === "/" ? "" : path}`;
  const live = projects.filter((p) => p.images.length > 0);
  const posts = publishedPosts(blog.posts);

  const lines = [
    `# ${s.name}`,
    "",
    `> ${s.description}`,
    "",
    `${s.name} (est. ${s.founded}, founded by ${s.founder}) manufactures doors, windows and architectural woodwork at its own factory at ${s.address.line1}, ${s.address.line2}, ${s.address.city} ${s.address.postalCode}, India, and works with architects, interior designers and developers across Goa.`,
    s.award.title ? `Recognition: ${s.award.title} — ${s.award.by} ${s.award.year}.` : "",
    `Contact: ${s.phone} · ${s.email}`,
    "",
    "## Pages",
    ...SEO_PAGES.filter((p) => !seo.pages[p.path]?.noindex && (p.path !== "/blog" || posts.length)).map(
      (p) => `- [${p.label}](${url(p.path)}): ${seo.pages[p.path]?.description || (p.path === "/" ? seo.description : "")}`.replace(/: $/, ""),
    ),
    "",
    "## Products",
    ...products.map((p) => `- ${p.name}: ${p.summary ?? p.short}`),
    "",
    "## Projects",
    ...live.map((p) => `- [${p.name}](${url(`/projects/${p.slug}`)}): ${[p.scope, p.developer && `for ${p.developer}`, p.location].filter(Boolean).join(", ")}. ${p.summary}`),
    ...(posts.length ? ["", "## Articles", ...posts.map((p) => `- [${p.title}](${url(`/blog/${p.slug}`)}): ${p.excerpt}`)] : []),
    "",
  ];

  return new Response(lines.filter((l, i, a) => !(l === "" && a[i - 1] === "")).join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
