"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import Picture from "@/components/ui/Picture";
import SectionLabel from "@/components/ui/SectionLabel";

/**
 * The arched window, JSF's signature: an arch-shaped aperture grows on scroll until the
 * interior fills the screen, then the brand's own words about the arch appear over it.
 */
export default function ArchReveal({ index = "04" }: { index?: string }) {
  const section = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: section.current, start: "top top", end: "bottom bottom", scrub: 0.6, invalidateOnRefresh: true },
        });
        tl.fromTo(
          "[data-aperture]",
          {
            width: () => (window.innerWidth < 768 ? window.innerWidth * 0.62 : Math.min(window.innerWidth * 0.26, 420)),
            height: () => (window.innerWidth < 768 ? window.innerHeight * 0.5 : window.innerHeight * 0.62),
            borderTopLeftRadius: () => (window.innerWidth < 768 ? window.innerWidth * 0.31 : Math.min(window.innerWidth * 0.13, 210)),
            borderTopRightRadius: () => (window.innerWidth < 768 ? window.innerWidth * 0.31 : Math.min(window.innerWidth * 0.13, 210)),
          },
          {
            width: () => window.innerWidth,
            height: () => window.innerHeight,
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            duration: 0.6,
            ease: "power2.inOut",
          },
          0,
        )
          .fromTo("[data-aperture-img]", { scale: 1.35 }, { scale: 1, duration: 0.6 }, 0)
          .to("[data-arch-title]", { autoAlpha: 0, scale: 0.92, duration: 0.25 }, 0.05)
          .fromTo("[data-arch-shade]", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 }, 0.55)
          .fromTo("[data-arch-quote] > *", { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, stagger: 0.05, duration: 0.2 }, 0.62)
          .to({}, { duration: 0.15 });
      });
    },
    { scope: section },
  );

  return (
    <section ref={section} aria-labelledby="arch-title" className="relative h-[280svh] motion-reduce:h-auto">
      <div className="sticky top-0 flex h-svh items-end justify-center overflow-hidden motion-reduce:relative">
        <div
          data-arch-title
          className="pointer-events-none absolute inset-x-0 top-[12svh] z-10 flex flex-col items-center px-4 text-center md:top-[14svh]"
        >
          <SectionLabel index={index}>Signature</SectionLabel>
          <h2 id="arch-title" className="mt-6 font-serif text-display">
            The <em className="text-teak">arched</em> window
          </h2>
        </div>

        <div data-aperture className="arch relative h-svh w-full overflow-hidden motion-reduce:rounded-none">
          <div data-aperture-img className="absolute inset-0">
            <Picture
              media="craft/arched-living"
              alt="Light pouring through a tall arched teak window into a villa living room"
              fill
              sizes="100vw"
              className="object-cover"
            />
          </div>
          <div data-arch-shade className="absolute inset-0 bg-gradient-to-t from-espresso/85 via-espresso/30 to-transparent" />
          <div data-arch-quote className="absolute inset-x-0 bottom-0 pb-14 text-ivory md:pb-20">
            <div className="container-x grid gap-8 md:grid-cols-12">
              <p className="eyebrow text-brass md:col-span-3">Arched windows by JSF</p>
              <blockquote className="font-serif text-[clamp(1.9rem,3.6vw,3.6rem)] leading-[1.08] md:col-span-8">
                &ldquo;More than an architectural feature — a carefully crafted portal that invites nature inside and bathes
                interiors in soft, filtered light. Each curve is a deliberate pause.&rdquo;
              </blockquote>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
