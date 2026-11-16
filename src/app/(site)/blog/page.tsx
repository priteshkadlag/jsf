import Link from "next/link";
import RevealText from "@/components/ui/RevealText";
import FadeIn from "@/components/ui/FadeIn";
import Picture from "@/components/ui/Picture";
import CtaBand from "@/components/ui/CtaBand";
import { Arrow } from "@/components/ui/Button";
import { getContent } from "@/lib/cms/content";
import { formatDate, publishedPosts } from "@/lib/cms/blog";
import { pageMetadata } from "@/lib/cms/seo";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";

export const generateMetadata = () => pageMetadata("/blog");

export default async function BlogPage() {
  const { blog } = await getContent();
  const posts = publishedPosts(blog.posts);
  const [lead, ...rest] = posts;

  return (
    <>
      <BreadcrumbJsonLd trail={[{ name: "Blog", path: "/blog" }]} />
      <section className="container-x pb-20 pt-36 md:pb-28 md:pt-48">
        <div className="grid gap-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-8">
            <p className="eyebrow mb-8 text-teak">Blog{posts.length > 0 ? ` · ${posts.length} ${posts.length === 1 ? "article" : "articles"}` : ""}</p>
            <h1 className="font-serif text-display">
              <RevealText as="span" trigger="load" className="block">
                {blog.heading}
              </RevealText>
              {blog.accent && (
                <RevealText as="span" trigger="load" delay={0.12} className="block italic text-teak">
                  {blog.accent}
                </RevealText>
              )}
            </h1>
          </div>
          <FadeIn delay={0.3} className="md:col-span-4">
            <p className="leading-relaxed text-stone">{blog.intro}</p>
          </FadeIn>
        </div>

        {posts.length === 0 ? (
          <div className="mt-20 border-t border-line pt-12">
            <p className="font-serif text-3xl">The first articles are on their way.</p>
            <p className="mt-3 max-w-md text-stone">
              In the meantime, browse our{" "}
              <Link href="/projects" className="text-teak underline underline-offset-4">
                recent projects
              </Link>
              .
            </p>
          </div>
        ) : (
          <>
            <Link href={`/blog/${lead.slug}`} data-cursor="Read" className="group mt-16 grid gap-8 border-t border-line pt-12 md:mt-24 md:grid-cols-12 md:gap-10">
              <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-sand md:col-span-7">
                {lead.cover && (
                  <Picture
                    media={lead.cover}
                    alt={lead.title}
                    fill
                    priority
                    sizes="(min-width: 768px) 58vw, 100vw"
                    className="object-cover transition-transform duration-[1.4s] ease-[var(--ease-expo)] group-hover:scale-105"
                  />
                )}
              </div>
              <div className="flex flex-col justify-end md:col-span-5">
                <p className="eyebrow text-teak">
                  {[formatDate(lead.date), lead.tags[0]].filter(Boolean).join(" · ")}
                </p>
                <h2 className="mt-4 font-serif text-title transition-colors duration-500 group-hover:text-teak">{lead.title}</h2>
                {lead.excerpt && <p className="mt-5 leading-relaxed text-stone">{lead.excerpt}</p>}
                <span className="mt-8 inline-flex items-center gap-3 text-sm font-semibold">
                  Read the article <Arrow />
                </span>
              </div>
            </Link>

            {rest.length > 0 && (
              <ul className="mt-20 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((p) => (
                  <li key={p.slug}>
                    <Link href={`/blog/${p.slug}`} data-cursor="Read" className="group block">
                      <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-sand">
                        {p.cover && (
                          <Picture
                            media={p.cover}
                            alt={p.title}
                            fill
                            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                            className="object-cover transition-transform duration-[1.4s] ease-[var(--ease-expo)] group-hover:scale-105"
                          />
                        )}
                      </div>
                      <p className="eyebrow mt-5 text-teak">{formatDate(p.date)}</p>
                      <h2 className="mt-2 font-serif text-3xl leading-tight transition-colors duration-500 group-hover:text-teak">{p.title}</h2>
                      {p.excerpt && <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-stone">{p.excerpt}</p>}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>
      <CtaBand />
    </>
  );
}
