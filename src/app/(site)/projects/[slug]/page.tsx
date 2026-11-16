import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ParallaxImage from "@/components/ui/ParallaxImage";
import RevealText from "@/components/ui/RevealText";
import FadeIn from "@/components/ui/FadeIn";
import SectionLabel from "@/components/ui/SectionLabel";
import Picture from "@/components/ui/Picture";
import Gallery from "@/components/projects/Gallery";
import { Arrow } from "@/components/ui/Button";
import { getMedia } from "@/lib/media";
import { getContent } from "@/lib/cms/content";
import { ogImage } from "@/lib/cms/seo";
import { absolute, businessId, jsonLd, snippet } from "@/lib/cms/schema";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import type { Project } from "@/lib/cms/types";

async function load(slug: string) {
  const { projects, settings } = await getContent();
  const list = projects.filter((p) => p.images.length > 0);
  const i = list.findIndex((p) => p.slug === slug);
  if (i < 0) return null;
  const project: Project = list[i];
  return { project, next: list[(i + 1) % list.length], settings };
}

/**
 * Slugs known at build time are prerendered. Ones added later in the admin render on the server on first
 * visit (blocking, so unknown slugs get a real 404 status instead of a streamed not-found page).
 */
export const instant = false;

export async function generateStaticParams() {
  const { projects } = await getContent();
  const slugs = projects.filter((p) => p.images.length > 0).map((p) => ({ slug: p.slug }));
  // Cache Components needs at least one param at build time; projects added later render on first visit.
  return slugs.length ? slugs : [{ slug: "_" }];
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const data = await load(slug);
  if (!data) notFound();
  const { project, settings } = data;
  const by = [project.developer && `for ${project.developer}`, project.location].filter(Boolean).join(", ");
  // Search results show about 60 characters of a title: drop the " · JSF Industries" suffix when it won't fit.
  const title = project.seoTitle || [project.name, project.scope].filter(Boolean).join(" — ");
  return {
    title: title.length + settings.name.length + 3 > 62 ? { absolute: title } : title,
    description: project.seoDescription || snippet(`${project.summary} ${project.scope} by ${settings.name}${by ? ` ${by}` : ""}.`),
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: { images: ogImage(project.images[0], project.name) },
  };
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const data = await load(slug);
  if (!data) notFound();
  const { project, next, settings: site } = data;
  const cover = project.images[0];
  const [lead, ...rest] = project.body;

  const meta = [
    { label: "Developer", value: project.developer },
    { label: "Location", value: project.location },
    { label: "Scope", value: project.scope },
    { label: "Scale", value: project.scale },
  ].filter((m) => m.value);

  const url = `${site.url}/projects/${project.slug}`;
  const projectLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": `${url}#project`,
    url,
    name: project.name,
    headline: [project.name, project.scope].filter(Boolean).join(" — "),
    description: project.summary,
    keywords: project.scope || undefined,
    creator: { "@id": businessId(site) },
    image: project.images.slice(0, 6).map((ref) => absolute(site, getMedia(ref).src)),
    locationCreated: project.location
      ? { "@type": "Place", name: project.location, address: { "@type": "PostalAddress", addressRegion: "Goa", addressCountry: "IN" } }
      : undefined,
    sourceOrganization: project.developer ? { "@type": "Organization", name: project.developer } : undefined,
    inLanguage: "en-IN",
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(projectLd) }} />
      <BreadcrumbJsonLd trail={[{ name: "Projects", path: "/projects" }, { name: project.name, path: `/projects/${project.slug}` }]} />

      <header className="relative flex h-svh min-h-[620px] items-end overflow-hidden text-ivory">
        <ParallaxImage
          media={cover}
          alt={`${project.name} — ${project.scope.toLowerCase()} by ${site.name}`}
          priority
          reveal={false}
          className="!absolute inset-0"
          strength={14}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-espresso/90 from-10% via-espresso/60 via-50% to-espresso/10" />
        {/* A soft light band behind the fixed header keeps the dark logo and menu readable on any photo. */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-ivory/85 via-ivory/40 to-transparent md:h-40" />
        <div className="container-x relative pb-12 [text-shadow:0_2px_20px_rgb(0_0_0/0.3)] md:pb-16">
          <nav aria-label="Breadcrumb" className="eyebrow mb-8 text-ivory/90">
            <Link href="/projects" className="link-underline">
              Projects
            </Link>{" "}
            {project.developer && (
              <>
                / <span className="text-brass">{project.developer}</span>
              </>
            )}
          </nav>
          <RevealText as="h1" trigger="load" className="font-serif text-display">
            {project.name}
          </RevealText>
          <FadeIn delay={0.4}>
            <p className="mt-6 max-w-xl text-lg text-ivory/80">{project.summary}</p>
          </FadeIn>
        </div>
      </header>

      <section className="container-x py-24 md:py-36">
        <dl className="grid grid-cols-2 gap-8 border-b border-line pb-12 md:grid-cols-4">
          {meta.map((m) => (
            <div key={m.label}>
              <dt className="eyebrow text-stone">{m.label}</dt>
              <dd className="mt-3 font-serif text-2xl leading-tight">{m.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-16 grid gap-12 md:mt-24 md:grid-cols-12">
          <div className="md:col-span-3">
            <SectionLabel index="01">The project</SectionLabel>
          </div>
          <div className="space-y-8 md:col-span-8 md:col-start-5">
            {lead && (
              <FadeIn>
                <p className="font-serif text-[clamp(1.6rem,2.6vw,2.4rem)] leading-[1.2]">{lead}</p>
              </FadeIn>
            )}
            {rest.map((para, i) => (
              <FadeIn key={i} delay={0.05}>
                <p className="max-w-2xl leading-relaxed text-ink/80">{para}</p>
              </FadeIn>
            ))}
          </div>
        </div>

        {project.features.length > 0 && (
          <ul className="mt-20 grid gap-px overflow-hidden border border-line bg-line md:mt-28 md:grid-cols-3">
            {project.features.map((f, i) => (
              <FadeIn as="li" key={`${f.title}-${i}`} delay={i * 0.08} className="bg-ivory p-8 md:p-10">
                <span className="font-serif text-xl text-teak">{String(i + 1).padStart(2, "0")}</span>
                <h2 className="mt-8 font-serif text-3xl">{f.title}</h2>
                <p className="mt-4 text-sm leading-relaxed text-stone">{f.text}</p>
              </FadeIn>
            ))}
          </ul>
        )}
      </section>

      {project.images.length > 1 && (
        <section aria-labelledby="gallery-title" className="container-x pb-24 md:pb-36">
          <div className="mb-12 flex items-end justify-between gap-6">
            <div>
              <SectionLabel index="02">Gallery</SectionLabel>
              <h2 id="gallery-title" className="mt-6 font-serif text-title">
                In the details
              </h2>
            </div>
            <p className="eyebrow text-stone">{project.images.length - 1} photographs</p>
          </div>
          <Gallery images={project.images.slice(1)} name={project.name} />
        </section>
      )}

      <Link
        href={`/projects/${next.slug}`}
        data-cursor="Next"
        className="group relative block h-[70svh] min-h-[420px] overflow-hidden bg-espresso text-ivory"
      >
        <Picture
          media={next.images[0]}
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-50 transition-all duration-[1.6s] ease-[var(--ease-expo)] group-hover:scale-105 group-hover:opacity-70"
        />
        {/* Keeps the label and name readable on bright photos. */}
        <div className="absolute inset-0 bg-gradient-to-t from-espresso/85 via-espresso/30 to-transparent" />
        <div className="container-x relative flex h-full flex-col justify-end pb-12 [text-shadow:0_2px_20px_rgb(0_0_0/0.3)] md:pb-16">
          <p className="eyebrow text-ivory/85">Next project</p>
          <div className="mt-4 flex items-end justify-between gap-6">
            <p className="font-serif text-display">{next.name}</p>
            <span className="mb-4 hidden h-20 w-20 shrink-0 items-center justify-center rounded-full border border-ivory/40 transition-colors duration-500 group-hover:bg-ivory group-hover:text-ink md:flex">
              <Arrow className="h-6 w-6" />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
