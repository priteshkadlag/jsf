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
import { getNextProject, getProject, projects } from "@/data/projects";
import { site } from "@/data/site";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  const cover = getMedia(project.cover);
  return {
    title: `${project.name} — ${project.scope}`,
    description: `${project.summary} ${project.scope} by JSF Industries for ${project.developer}, ${project.location}.`,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: { images: [{ url: cover.src, width: cover.width, height: cover.height, alt: project.name }] },
  };
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  const next = getNextProject(slug);
  const [lead, ...rest] = project.body;

  const meta = [
    { label: "Developer", value: project.developer },
    { label: "Location", value: project.location },
    { label: "Scope", value: project.scope },
    ...(project.scale ? [{ label: "Scale", value: project.scale }] : []),
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.name,
    description: project.summary,
    creator: { "@type": "Organization", name: site.name, url: site.url },
    image: `${site.url}${getMedia(project.cover).src}`,
    locationCreated: { "@type": "Place", name: project.location },
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <header className="relative flex h-svh min-h-[620px] items-end overflow-hidden text-ivory">
        <ParallaxImage
          media={project.cover}
          alt={`${project.name} — ${project.scope.toLowerCase()} by JSF Industries`}
          priority
          reveal={false}
          className="!absolute inset-0"
          strength={14}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-espresso/85 via-espresso/20 to-espresso/30" />
        <div className="container-x relative pb-12 md:pb-16">
          <nav aria-label="Breadcrumb" className="eyebrow mb-8 text-ivory/70">
            <Link href="/projects" className="link-underline">
              Projects
            </Link>{" "}
            / <span className="text-brass">{project.developer}</span>
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
            <FadeIn>
              <p className="font-serif text-[clamp(1.6rem,2.6vw,2.4rem)] leading-[1.2]">{lead}</p>
            </FadeIn>
            {rest.map((para, i) => (
              <FadeIn key={i} delay={0.05}>
                <p className="max-w-2xl leading-relaxed text-ink/80">{para}</p>
              </FadeIn>
            ))}
          </div>
        </div>

        {project.features && (
          <ul className="mt-20 grid gap-px overflow-hidden border border-line bg-line md:mt-28 md:grid-cols-3">
            {project.features.map((f, i) => (
              <FadeIn as="li" key={f.title} delay={i * 0.08} className="bg-ivory p-8 md:p-10">
                <span className="font-serif text-xl text-teak">0{i + 1}</span>
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
          media={next.cover}
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-50 transition-all duration-[1.6s] ease-[var(--ease-expo)] group-hover:scale-105 group-hover:opacity-70"
        />
        <div className="container-x relative flex h-full flex-col justify-end pb-12 md:pb-16">
          <p className="eyebrow text-brass">Next project</p>
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
