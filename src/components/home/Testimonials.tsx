"use client";

import Link from "next/link";
import { useState } from "react";
import SectionLabel from "@/components/ui/SectionLabel";
import { Arrow } from "@/components/ui/Button";
import { testimonials } from "@/data/site";

/**
 * One quote at a time, moved with arrows (no auto-scroll). Renders nothing until real,
 * approved quotes are added to `testimonials` in src/data/site.ts.
 */
export default function Testimonials({ index }: { index: string }) {
  const [current, setCurrent] = useState(0);
  if (testimonials.length === 0) return null;

  const t = testimonials[current];
  const go = (step: number) => setCurrent((c) => (c + step + testimonials.length) % testimonials.length);
  const attribution = `${t.name}, ${t.role}, ${t.firm} · ${t.project}`;

  return (
    <section aria-labelledby="testimonials-title" aria-roledescription="carousel" className="container-x py-28 md:py-40">
      <SectionLabel index={index}>Testimonials</SectionLabel>
      <h2 id="testimonials-title" className="mt-8 font-serif text-headline">
        In their <em className="text-teak">words</em>
      </h2>

      <figure aria-live="polite" className="mt-16 max-w-5xl border-t border-line pt-12">
        <blockquote className="font-serif text-[clamp(1.8rem,3.4vw,3.2rem)] leading-[1.12]">&ldquo;{t.quote}&rdquo;</blockquote>
        <figcaption className="mt-8 text-sm text-stone">
          {t.projectSlug ? (
            <Link href={`/projects/${t.projectSlug}`} className="link-underline hover:text-teak">
              {attribution}
            </Link>
          ) : (
            attribution
          )}
        </figcaption>
      </figure>

      {testimonials.length > 1 && (
        <div className="mt-10 flex items-center gap-4">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous testimonial"
            className="flex h-12 w-12 items-center justify-center rounded-full border border-line transition-colors duration-500 hover:border-teak hover:bg-teak hover:text-ivory"
          >
            <Arrow className="rotate-180" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next testimonial"
            className="flex h-12 w-12 items-center justify-center rounded-full border border-line transition-colors duration-500 hover:border-teak hover:bg-teak hover:text-ivory"
          >
            <Arrow />
          </button>
          <span className="eyebrow ml-2 text-stone">
            {current + 1} / {testimonials.length}
          </span>
        </div>
      )}
    </section>
  );
}
