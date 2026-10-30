"use client";

import Link from "next/link";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import Picture from "@/components/ui/Picture";
import Magnetic from "@/components/ui/Magnetic";
import { Arrow } from "@/components/ui/Button";
import { products } from "@/data/products";

const tones = [
  { bg: "bg-paper", text: "text-ink", muted: "text-stone", accent: "text-teak", stroke: "rgb(143 86 40 / 0.55)", btn: "bg-ink text-ivory hover:bg-teak" },
  { bg: "bg-espresso", text: "text-ivory", muted: "text-ivory/65", accent: "text-brass", stroke: "rgb(207 159 102 / 0.6)", btn: "bg-ivory text-ink hover:bg-brass" },
  { bg: "bg-sand", text: "text-ink", muted: "text-stone", accent: "text-teak", stroke: "rgb(143 86 40 / 0.5)", btn: "bg-ink text-ivory hover:bg-teak" },
  { bg: "bg-bark", text: "text-ivory", muted: "text-ivory/65", accent: "text-brass", stroke: "rgb(207 159 102 / 0.6)", btn: "bg-ivory text-ink hover:bg-brass" },
];

/**
 * Product showroom: each category is a full-screen card that slides over the previous one,
 * which recedes (scales down and dims). Inside, the photo opens through an arch, the big
 * index drifts, and the copy rises in. On small screens the cards simply flow.
 */
export default function ProductStack() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const cards = gsap.utils.toArray<HTMLElement>("[data-card]");
        const desktop = window.matchMedia("(min-width: 768px)").matches;

        cards.forEach((card, i) => {
          // Transform/opacity only — these stay on the compositor and keep scrolling at 60fps.
          const enter = { trigger: card, start: "top bottom", end: "top top", scrub: 0.4 };

          gsap.fromTo(card.querySelector("[data-arch]"), { scale: 0.72, yPercent: 12 }, { scale: 1, yPercent: 0, ease: "none", scrollTrigger: enter });
          gsap.fromTo(card.querySelector("[data-arch-img]"), { scale: 1.35 }, { scale: 1, ease: "none", scrollTrigger: enter });
          gsap.fromTo(card.querySelector("[data-num]"), { yPercent: 40, xPercent: -6 }, { yPercent: -10, xPercent: 0, ease: "none", scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: 0.4 } });
          gsap.fromTo(card.querySelectorAll("[data-thumb]"), { yPercent: 60, rotate: (k) => (k % 2 ? 8 : -8), autoAlpha: 0 }, { yPercent: 0, rotate: (k) => (k % 2 ? 3 : -3), autoAlpha: 1, stagger: 0.1, ease: "none", scrollTrigger: { ...enter, start: "top 70%" } });
          gsap.fromTo(
            card.querySelectorAll("[data-rise]"),
            { y: 60, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, stagger: 0.08, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: card, start: "top 45%", toggleActions: "play none none reverse" } },
          );

          // The card underneath recedes as the next one slides over it.
          const next = cards[i + 1];
          if (desktop && next) {
            const recede = { trigger: next, start: "top bottom", end: "top top", scrub: 0.4 };
            gsap.to(card.querySelector("[data-card-inner]"), { scale: 0.92, yPercent: -3, ease: "none", scrollTrigger: recede });
            gsap.to(card.querySelector("[data-shade]"), { opacity: 0.55, ease: "none", scrollTrigger: recede });
          }
        });
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="relative">
      {products.map((p, i) => {
        const t = tones[i % tones.length];
        const [main, ...rest] = p.images;
        return (
          <section
            key={p.slug}
            id={p.slug}
            data-card
            aria-labelledby={`${p.slug}-title`}
            className="relative scroll-mt-0 md:sticky md:top-0 md:h-svh"
          >
            <div data-card-inner className={`relative h-full origin-top overflow-hidden ${t.bg} ${t.text} [backface-visibility:hidden] md:rounded-[40px_40px_0_0] md:shadow-[0_-30px_60px_-30px_rgb(26_21_17/0.45)] md:will-change-transform`}>
              {/* Dimming layer for the receding card (opacity is far cheaper than a CSS filter) */}
              <span data-shade aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 bg-espresso opacity-0" />
              {/* Giant outlined index */}
              <span
                data-num
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-[0.18em] right-[-0.04em] select-none font-serif leading-none text-transparent will-change-transform"
                style={{ fontSize: "clamp(12rem, 34vw, 34rem)", WebkitTextStroke: `1px ${t.stroke}` }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>

              <div className="container-x relative grid h-full items-center gap-12 py-20 md:grid-cols-12 md:gap-10 md:py-0">
                {/* Imagery */}
                <div className={`relative md:col-span-5 ${i % 2 ? "md:order-2 md:col-start-8" : "md:col-start-1"}`}>
                  <div data-arch className="relative mx-auto aspect-[3/4] w-full max-w-[460px] origin-bottom overflow-hidden rounded-t-full will-change-transform md:h-[72svh] md:w-auto">
                    <div data-arch-img className="absolute inset-0 will-change-transform">
                      <Picture media={main} alt={`${p.name} by JSF Industries`} fill sizes="(min-width: 768px) 36vw, 90vw" className="object-cover" />
                    </div>
                  </div>
                  {rest.map((m, k) => (
                    <div
                      key={m}
                      data-thumb
                      className={`absolute hidden aspect-[3/4] w-[34%] overflow-hidden rounded-sm border-[5px] border-current shadow-xl md:block ${
                        k === 0 ? (i % 2 ? "-left-10 bottom-6" : "-right-8 bottom-10") : i % 2 ? "-left-4 top-8" : "-right-14 top-10"
                      } ${t.text === "text-ivory" ? "text-bark" : "text-paper"}`}
                    >
                      <Picture media={m} alt={`${p.name} — detail ${k + 2}`} fill sizes="14vw" className="object-cover" />
                    </div>
                  ))}
                </div>

                {/* Copy */}
                <div className={`md:col-span-5 ${i % 2 ? "md:order-1 md:col-start-1" : "md:col-start-8"}`}>
                  <p data-rise className={`eyebrow ${t.accent}`}>
                    {String(i + 1).padStart(2, "0")} / {String(products.length).padStart(2, "0")} — Collection
                  </p>
                  <h2 data-rise id={`${p.slug}-title`} className="mt-6 font-serif text-[clamp(2.8rem,5.4vw,5.6rem)] leading-[0.95]">
                    {p.name}
                  </h2>
                  <p data-rise className={`mt-4 font-serif text-2xl italic ${t.accent}`}>
                    {p.short}
                  </p>
                  <p data-rise className={`mt-8 max-w-md leading-relaxed ${t.muted}`}>
                    {p.description}
                  </p>
                  <div data-rise className="mt-10 flex flex-wrap items-center gap-6">
                    <Magnetic strength={0.25}>
                      <Link
                        href={`/contact?product=${p.slug}`}
                        className={`group inline-flex items-center gap-3 rounded-full px-7 py-4 text-sm font-semibold tracking-wide transition-colors duration-500 ${t.btn}`}
                      >
                        Enquire about {p.name.toLowerCase()}
                        <Arrow className="transition-transform duration-500 group-hover:translate-x-1" />
                      </Link>
                    </Magnetic>
                    {i < products.length - 1 && (
                      <a href={`#${products[i + 1].slug}`} className={`eyebrow link-underline ${t.muted}`}>
                        Next: {products[i + 1].name} ↓
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
