"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import Picture from "@/components/ui/Picture";
import SectionLabel from "@/components/ui/SectionLabel";
import RevealText from "@/components/ui/RevealText";
import GrainMark from "@/components/layout/GrainMark";
import type { MediaKey } from "@/lib/media";
import { site } from "@/data/site";

type Milestone = { mark: string; kicker: string; title: string; text: string; media: MediaKey; alt: string };

const milestones: Milestone[] = [
  {
    mark: "1989",
    kicker: "Chapter one",
    title: "The beginning",
    text: `${site.founder} founds JSF in Goa with a simple belief: a door should be as beautiful as it is enduring.`,
    media: "craft/teak-double-door",
    alt: "A solid teak double door, the craft JSF was founded on",
  },
  {
    mark: "Tuem",
    kicker: "Chapter two",
    title: "Our own factory",
    text: "Production moves to Tuem Industrial Estate, giving us full control over quality, customisation and timelines.",
    media: "factory/frames",
    alt: "Arched timber frames in the workshop at the Tuem factory",
  },
  {
    mark: "Firsts",
    kicker: "Chapter three",
    title: "Technology for Goa",
    text: "We bring Goa its first automated moulder machine and its first kiln seasoning plant — precision at the scale of 2,000 frames a month.",
    media: "factory/moulder",
    alt: "The automated moulder machine at JSF",
  },
  {
    mark: "Villas",
    kicker: "Chapter four",
    title: "Partners in luxury",
    text: "JSF becomes the woodwork partner for landmark villa collections by Isprava and Vianaar — 22 villas at Moira Chapters, 10 at La Selva and more.",
    media: "projects/moira-chapters/01",
    alt: "An arched teak door at Moira Chapters",
  },
  {
    mark: String(site.award.year),
    kicker: "Today",
    title: "Recognised",
    text: `Named ${site.award.title} at the ${site.award.by}.`,
    media: "award/ceremony",
    alt: "The JSF team receiving the Business Goa award",
  },
];

/**
 * Scroll-told timeline: a brass "grain line" grows down the spine, each node ignites as
 * the line reaches it, years slide in from the side and arched photos wipe open.
 */
export default function Milestones() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          "[data-spine-fill]",
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: { trigger: "[data-spine]", start: "top 55%", end: "bottom 55%", scrub: true },
          },
        );
        gsap.to("[data-grain-mark]", {
          rotate: 120,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true },
        });

        gsap.utils.toArray<HTMLElement>("[data-milestone]").forEach((item) => {
          const fromLeft = item.dataset.side === "left";
          gsap.fromTo(
            item.querySelector("[data-mark]"),
            { xPercent: fromLeft ? -30 : 30, autoAlpha: 0 },
            { xPercent: 0, autoAlpha: 1, duration: 1.6, scrollTrigger: { trigger: item, start: "top 75%", once: true } },
          );
          gsap.fromTo(
            item.querySelector("[data-photo]"),
            { clipPath: "inset(100% 0% 0% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", duration: 1.6, ease: "expo.inOut", scrollTrigger: { trigger: item, start: "top 75%", once: true } },
          );
          gsap.fromTo(
            item.querySelectorAll("[data-copy] > *"),
            { y: 30, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, stagger: 0.08, duration: 1.2, scrollTrigger: { trigger: item, start: "top 70%", once: true } },
          );
          gsap.to(item.querySelector("[data-photo] img"), {
            yPercent: -8,
            ease: "none",
            scrollTrigger: { trigger: item, start: "top bottom", end: "bottom top", scrub: true },
          });
          // Ignite the node when the growing line reaches it.
          gsap.timeline({ scrollTrigger: { trigger: item, start: "top 55%", toggleActions: "play none none reverse" } })
            .to(item.querySelector("[data-node]"), { scale: 1, backgroundColor: "#cf9f66", borderColor: "#cf9f66", duration: 0.5, ease: "back.out(3)" })
            .to(item.querySelector("[data-node-ring]"), { scale: 2.6, autoAlpha: 0, duration: 0.9, ease: "power2.out" }, 0);
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-labelledby="milestones-title" className="grain relative overflow-hidden bg-espresso py-28 text-ivory md:py-40">
      <div className="container-x relative">
        <div className="flex flex-col items-start justify-between gap-10 md:flex-row md:items-end">
          <div>
            <SectionLabel index="02" tone="light">
              Milestones
            </SectionLabel>
            <RevealText as="h2" id="milestones-title" className="mt-8 max-w-3xl font-serif text-headline">
              Three decades in the making
            </RevealText>
          </div>
          <div className="flex items-center gap-5 text-ivory/60">
            <span data-grain-mark className="block">
              <GrainMark className="h-20 w-20 text-brass md:h-24 md:w-24" />
            </span>
            <p className="eyebrow max-w-[14rem] leading-relaxed">
              {site.founded} — today · Every chapter carved in timber
            </p>
          </div>
        </div>

        <ol data-spine className="relative mt-24 md:mt-32">
          {/* Spine */}
          <span aria-hidden="true" className="absolute bottom-0 left-[11px] top-0 w-px bg-ivory/15 md:left-1/2 md:-translate-x-1/2" />
          <span
            aria-hidden="true"
            data-spine-fill
            className="absolute bottom-0 left-[11px] top-0 w-[2px] origin-top -translate-x-[0.5px] bg-gradient-to-b from-brass via-brass to-teak md:left-1/2 md:-translate-x-1/2"
          />

          {milestones.map((m, i) => {
            const left = i % 2 === 0;
            return (
              <li
                key={m.title}
                data-milestone
                data-side={left ? "left" : "right"}
                className="relative grid gap-8 pb-24 pl-12 last:pb-0 md:grid-cols-2 md:gap-0 md:pb-40 md:pl-0"
              >
                {/* Node */}
                <span aria-hidden="true" className="absolute left-0 top-2 flex h-6 w-6 items-center justify-center md:left-1/2 md:-translate-x-1/2">
                  <span data-node-ring className="absolute inset-0 rounded-full border border-brass opacity-60" />
                  <span data-node className="h-3 w-3 scale-75 rounded-full border border-ivory/40 bg-espresso" />
                </span>

                {/* Text side */}
                <div className={`${left ? "md:pr-20 md:text-right" : "md:order-2 md:pl-20"}`}>
                  <p
                    data-mark
                    className="font-serif text-[clamp(4.5rem,11vw,10rem)] leading-[0.85] text-transparent [-webkit-text-stroke:1px_rgb(207_159_102)]"
                  >
                    {m.mark}
                  </p>
                  <div data-copy className={`mt-6 ${left ? "md:ml-auto" : ""} max-w-md`}>
                    <p className="eyebrow text-brass">{m.kicker}</p>
                    <h3 className="mt-3 font-serif text-[clamp(2rem,3vw,2.8rem)] leading-tight">{m.title}</h3>
                    <p className="mt-4 leading-relaxed text-ivory/70">{m.text}</p>
                  </div>
                </div>

                {/* Image side */}
                <div className={`${left ? "md:order-2 md:pl-20" : "md:pr-20"}`}>
                  <div
                    data-photo
                    className={`relative aspect-[4/5] w-full max-w-sm overflow-hidden arch md:mt-10 ${left ? "" : "md:ml-auto"}`}
                  >
                    <Picture
                      media={m.media}
                      alt={m.alt}
                      fill
                      sizes="(min-width: 768px) 28vw, 80vw"
                      className="scale-110 object-cover"
                    />
                    <span className="absolute inset-0 bg-gradient-to-t from-espresso/40 to-transparent" />
                    <span className="eyebrow absolute bottom-5 left-1/2 -translate-x-1/2 text-ivory/90">0{i + 1}</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
