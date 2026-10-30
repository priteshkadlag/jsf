import type { Metadata } from "next";
import Link from "next/link";
import RevealText from "@/components/ui/RevealText";
import FadeIn from "@/components/ui/FadeIn";
import SectionLabel from "@/components/ui/SectionLabel";
import Counter from "@/components/ui/Counter";
import Picture from "@/components/ui/Picture";
import Marquee from "@/components/ui/Marquee";
import CtaBand from "@/components/ui/CtaBand";
import { Arrow } from "@/components/ui/Button";
import ClientWall from "@/components/clients/ClientWall";
import { clients } from "@/data/clients";
import { projects, type Developer } from "@/data/projects";
import type { MediaKey } from "@/lib/media";

export const metadata: Metadata = {
  title: "Clients — Trusted by Goa's Leading Developers",
  description:
    "JSF Industries crafts doors, windows and carpentry for Isprava, Vianaar, Manohar International Airport, Vision Dempo, Devashri Nirman and more of Goa's leading developers.",
  alternates: { canonical: "/clients" },
};

const partners: { name: Developer; logo: MediaKey; text: string }[] = [
  {
    name: "Isprava",
    logo: "clients/isprava",
    text: "Our longest-running villa partnership — from the 22 villas of Moira Chapters to Amora, Villa Rosa and the Mandrem estate.",
  },
  {
    name: "Vianaar",
    logo: "clients/vianaar",
    text: "Doors, windows, staircases and ceilings for Vianaar's Goan homes — including all 10 villas at La Selva, Assagao.",
  },
];

export default function ClientsPage() {
  const villas = 22 + 10 + 6;
  return (
    <>
      <section className="container-x pb-20 pt-36 md:pb-28 md:pt-48">
        <p className="eyebrow mb-8 text-teak">Clients</p>
        <h1 className="font-serif text-display">
          <RevealText as="span" trigger="load" className="block">
            Trusted by Goa&rsquo;s
          </RevealText>
          <RevealText as="span" trigger="load" delay={0.12} className="block italic text-teak">
            finest builders
          </RevealText>
        </h1>
        <FadeIn delay={0.4}>
          <p className="mt-10 max-w-2xl text-lg leading-relaxed text-stone md:ml-[40%]">
            Luxury villa developers, real-estate groups, architects and even an international airport — partners who return to
            JSF project after project for woodwork that is on time, on budget and built to last.
          </p>
        </FadeIn>

        <dl className="mt-20 grid grid-cols-2 gap-y-12 border-t border-line pt-12 md:grid-cols-4">
          {[
            { value: clients.length, suffix: "+", label: "Clients & partners" },
            { value: projects.length, suffix: "", label: "Signature villa projects" },
            { value: villas, suffix: "+", label: "Villas fitted at Moira, La Selva & Amora" },
            { value: 1, suffix: "", label: "International airport" },
          ].map((s) => (
            <div key={s.label} className="flex flex-col-reverse pr-6">
              <dt className="mt-3 text-sm text-stone">{s.label}</dt>
              <dd className="font-serif text-[clamp(2.8rem,5vw,4.8rem)] leading-none">
                <Counter value={s.value} suffix={s.suffix} />
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="partners-title" className="grain relative bg-espresso py-24 text-ivory md:py-36">
        <div className="container-x relative">
          <SectionLabel index="01" tone="light">
            Key partners
          </SectionLabel>
          <RevealText as="h2" id="partners-title" className="mt-8 max-w-3xl font-serif text-headline">
            Two developers, dozens of villas
          </RevealText>

          <div className="mt-16 grid gap-6 md:mt-24 md:grid-cols-2">
            {partners.map((p, i) => {
              const work = projects.filter((x) => x.developer === p.name);
              return (
                <FadeIn key={p.name} delay={i * 0.1} className="group relative overflow-hidden rounded-sm bg-bark">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Picture
                      media={work[0].cover}
                      alt={`${work[0].name} by ${p.name}`}
                      fill
                      sizes="(min-width: 768px) 50vw, 100vw"
                      className="object-cover transition-transform duration-[1.6s] ease-[var(--ease-expo)] group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-bark via-bark/20 to-transparent" />
                    <div className="absolute left-6 top-6 flex h-20 w-20 items-center justify-center overflow-hidden rounded-sm bg-white p-2 md:h-24 md:w-24">
                      <div className="relative h-full w-full">
                        <Picture media={p.logo} alt={p.name} fill sizes="96px" className="object-contain" />
                      </div>
                    </div>
                  </div>
                  <div className="p-6 md:p-10">
                    <div className="flex items-baseline justify-between gap-4">
                      <h3 className="font-serif text-4xl md:text-5xl">{p.name}</h3>
                      <span className="eyebrow text-brass">{work.length} projects</span>
                    </div>
                    <p className="mt-4 max-w-md leading-relaxed text-ivory/70">{p.text}</p>
                    <ul className="mt-8 flex flex-wrap gap-2">
                      {work.map((w) => (
                        <li key={w.slug}>
                          <Link
                            href={`/projects/${w.slug}`}
                            className="inline-flex items-center gap-2 rounded-full border border-line-light px-4 py-2 text-sm text-ivory/85 transition-colors duration-500 hover:border-brass hover:bg-brass hover:text-espresso"
                          >
                            {w.name}
                            <Arrow className="h-3 w-3" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      <section aria-labelledby="wall-title" className="container-x py-24 md:py-36">
        <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <SectionLabel index="02">Our esteemed clients</SectionLabel>
            <RevealText as="h2" id="wall-title" className="mt-8 font-serif text-headline">
              In good company
            </RevealText>
          </div>
          <p className="max-w-sm text-sm text-stone">Hover a logo to see who&rsquo;s behind it.</p>
        </div>
        <ClientWall />
      </section>

      <div aria-hidden="true" className="overflow-hidden border-y border-line py-8">
        <Marquee duration={30}>
          {clients.map((c) => (
            <span key={c.name} className="mx-8 flex items-center gap-8 font-serif text-[clamp(2rem,4vw,3.6rem)] italic text-ink/80">
              {c.name}
              <span className="h-2 w-2 rounded-full bg-teak" />
            </span>
          ))}
        </Marquee>
      </div>

      <CtaBand title="Join Goa’s leading developers." accent="Let’s build together." />
    </>
  );
}
