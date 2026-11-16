import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Picture from "@/components/ui/Picture";
import CtaBand from "@/components/ui/CtaBand";
import { Arrow } from "@/components/ui/Button";
import { getContent } from "@/lib/cms/content";
import { formatDate, publishedPosts } from "@/lib/cms/blog";
import { ogImage } from "@/lib/cms/seo";
import { getMedia } from "@/lib/media";
import { Markdown, readingMinutes } from "@/lib/markdown";
import { businessId, jsonLd as toJsonLd, snippet } from "@/lib/cms/schema";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";

async function load(slug: string) {
  const { blog, settings } = await getContent();
  const posts = publishedPosts(blog.posts);
  const i = posts.findIndex((p) => p.slug === slug);
  if (i < 0) return null;
  return { post: posts[i], newer: posts[i - 1], older: posts[i + 1], settings };
}

/**
 * Slugs known at build time are prerendered. Ones added later in the admin render on the server on first
 * visit (blocking, so unknown slugs get a real 404 status instead of a streamed not-found page).
 */
export const instant = false;

export async function generateStaticParams() {
  const { blog } = await getContent();
  const slugs = publishedPosts(blog.posts).map((p) => ({ slug: p.slug }));
  // Cache Components needs at least one param at build time; posts published later render on first visit.
  return slugs.length ? slugs : [{ slug: "_" }];
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const data = await load(slug);
  if (!data) notFound();
  const { post } = data;
  const description = post.seoDescription || snippet(post.excerpt);
  return {
    title: post.seoTitle || post.title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.seoTitle || post.title,
      description,
      ...(post.date ? { publishedTime: post.date } : {}),
      ...(post.cover ? { images: ogImage(post.cover, post.title) } : {}),
    },
  };
}

export default async function BlogPostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const data = await load(slug);
  if (!data) notFound();
  const { post, newer, older, settings } = data;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.seoDescription || post.excerpt,
    ...(post.date ? { datePublished: post.date } : {}),
    ...(post.cover ? { image: new URL(getMedia(post.cover).src, settings.url).toString() } : {}),
    author: post.author ? { "@type": "Person", name: post.author } : { "@id": businessId(settings) },
    publisher: { "@id": businessId(settings) },
    mainEntityOfPage: `${settings.url}/blog/${post.slug}`,
    inLanguage: "en-IN",
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toJsonLd(jsonLd) }} />
      <BreadcrumbJsonLd trail={[{ name: "Blog", path: "/blog" }, { name: post.title, path: `/blog/${post.slug}` }]} />

      <header className="container-x pb-12 pt-36 md:pb-16 md:pt-48">
        <nav aria-label="Breadcrumb" className="eyebrow mb-8 text-stone">
          <Link href="/blog" className="link-underline">
            Blog
          </Link>
          {post.tags[0] && <span className="text-teak"> / {post.tags[0]}</span>}
        </nav>
        <h1 className="max-w-5xl font-serif text-headline">{post.title}</h1>
        {post.excerpt && <p className="mt-8 max-w-2xl text-xl leading-relaxed text-stone">{post.excerpt}</p>}
        <p className="eyebrow mt-10 text-stone">
          {[post.author, formatDate(post.date), `${readingMinutes(post.body)} min read`].filter(Boolean).join(" · ")}
        </p>
      </header>

      {post.cover && (
        <div className="container-x">
          <div className="relative aspect-[16/9] overflow-hidden rounded-sm bg-sand">
            <Picture media={post.cover} alt={post.title} fill priority sizes="100vw" className="object-cover" />
          </div>
        </div>
      )}

      <div className="container-x py-16 md:py-24">
        <div className="mx-auto max-w-[44rem]">
          <Markdown source={post.body} />
          {post.tags.length > 0 && (
            <ul className="mt-16 flex flex-wrap gap-2 border-t border-line pt-8">
              {post.tags.map((t) => (
                <li key={t} className="rounded-full border border-line px-4 py-1.5 text-sm text-stone">
                  {t}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {(newer || older) && (
        <nav aria-label="More articles" className="container-x grid gap-px border-y border-line bg-line md:grid-cols-2">
          {[
            { p: older, label: "Previous article" },
            { p: newer, label: "Next article" },
          ].map(({ p, label }) =>
            p ? (
              <Link key={label} href={`/blog/${p.slug}`} className="group flex items-center justify-between gap-6 bg-ivory py-10 md:px-6">
                <span>
                  <span className="eyebrow text-stone">{label}</span>
                  <span className="mt-2 block font-serif text-2xl leading-tight transition-colors group-hover:text-teak">{p.title}</span>
                </span>
                <Arrow className="h-5 w-5 shrink-0" />
              </Link>
            ) : (
              <span key={label} className="hidden bg-ivory md:block" />
            ),
          )}
        </nav>
      )}

      <CtaBand />
    </article>
  );
}
