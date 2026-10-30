"use client";

import Link from "next/link";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import Picture from "@/components/ui/Picture";
import SectionLabel from "@/components/ui/SectionLabel";
import { Arrow } from "@/components/ui/Button";
import { featuredProjects, projects } from "@/data/projects";

/**
 * Horizontal gallery driven by vertical scroll on desktop (sticky + translateX, no pinning,
 * so it plays nicely with page transitions). Stacks vertically on small screens.
 */
export default function FeaturedProjects() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        const sec = section.current!;
        const el = track.current!;
        const distance = () => Math.max(0, el.scrollWidth - window.innerWidth);
        const measure = () => {
          sec.style.height = `${distance() + window.innerHeight}px`;
        };
        measure();

        const tween = gsap.to(el, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: sec,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.6,
            invalidateOnRefresh: true,
            onRefreshInit: measure,
          },
        });

        gsap.utils.toArray<HTMLElement>("[data-card-img]").forEach((img) => {
          gsap.fromTo(
            img,
            { xPercent: -10 },
            {
              xPercent: 10,
              ease: "none",
              scrollTrigger: { trigger: img, containerAnimation: tween, start: "left right", end: "right left", scrub: true },
            },
          );
        });

        return () => {
          sec.style.height = "";
        };
      });
    },
    { scope: section },
  );

  return (
    <section ref={section} aria-labelledby="featured-title" className="grain relative bg-espresso text-ivory">
      <div className="overflow-hidden md:sticky md:top-0 md:flex md:h-svh md:items-center">
        <div ref={track} className="flex flex-col gap-16 px-[clamp(1rem,4vw,3.5rem)] py-28 md:w-max md:flex-row md:items-end md:gap-[4vw] md:py-0">
          <div className="flex shrink-0 flex-col justify-between gap-10 md:h-[72svh] md:w-[34vw]">
            <SectionLabel index="03" tone="light">
              Selected projects
            </SectionLabel>
            <div>
              <h2 id="featured-title" className="font-serif text-headline">
                Villas we&rsquo;ve <em className="text-brass">opened up</em>
              </h2>
              <p className="mt-6 max-w-md text-ivory/65">
                Doors, windows and carpentry for Goa&rsquo;s most considered homes — in partnership with developers like
                Isprava and Vianaar.
              </p>
            </div>
          </div>

          {featuredProjects.map((p, i) => (
            <Link
              key={p.slug}
              href={`/projects/${p.slug}`}
              data-cursor="View"
              className="group block shrink-0 md:w-[min(30vw,460px)]"
              style={{ marginBottom: i % 2 ? "6svh" : 0 }}
            >
              <div className="relative aspect-[3/4] overflow-hidden arch md:aspect-auto md:h-[58svh]">
                <div data-card-img className="absolute inset-y-0 -inset-x-[12%]">
                  <Picture
                    media={p.cover}
                    alt={`${p.name} — ${p.scope.toLowerCase()} by JSF Industries`}
                    fill
                    sizes="(min-width: 768px) 32vw, 100vw"
                    className="object-cover transition-transform duration-[1.4s] ease-[var(--ease-expo)] group-hover:scale-105"
                  />
                </div>
              </div>
              <div className="mt-6 flex items-start justify-between gap-6">
                <div>
                  <p className="eyebrow text-brass">
                    {p.developer} · {p.location}
                  </p>
                  <h3 className="mt-2 font-serif text-[clamp(1.8rem,2.6vw,2.6rem)] leading-none">{p.name}</h3>
                  <p className="mt-2 text-sm text-ivory/60">{p.scale ?? p.scope}</p>
                </div>
                <span className="font-serif text-xl text-ivory/40">{String(i + 1).padStart(2, "0")}</span>
              </div>
            </Link>
          ))}

          <Link
            href="/projects"
            className="group flex shrink-0 flex-col items-start justify-center gap-6 border-t border-line-light pt-10 md:h-[58svh] md:w-[24vw] md:border-l md:border-t-0 md:pl-[3vw] md:pt-0"
          >
            <span className="font-serif text-[clamp(2.4rem,4vw,4rem)] leading-none">
              All {projects.length} <br />
              <em className="text-brass">projects</em>
            </span>
            <span className="flex h-16 w-16 items-center justify-center rounded-full border border-line-light transition-colors duration-500 group-hover:bg-brass group-hover:text-espresso">
              <Arrow className="h-5 w-5" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
