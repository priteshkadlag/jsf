"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";
import SectionLabel from "@/components/ui/SectionLabel";
import RevealText from "@/components/ui/RevealText";
import Picture from "@/components/ui/Picture";
import { Arrow } from "@/components/ui/Button";
import { products } from "@/data/products";

/** "What we do" index. On desktop a floating arched preview follows the cursor. */
export default function Services() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState<number | null>(null);
  const x = useSpring(useMotionValue(0), { stiffness: 160, damping: 22, mass: 0.6 });
  const y = useSpring(useMotionValue(0), { stiffness: 160, damping: 22, mass: 0.6 });

  return (
    <section aria-labelledby="services-title" className="relative bg-paper py-28 md:py-40">
      <div className="container-x">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <SectionLabel index="02">What we do</SectionLabel>
            <RevealText as="h2" id="services-title" className="mt-8 font-serif text-headline">
              Woodwork for every threshold
            </RevealText>
          </div>
          <p className="self-end text-stone md:col-span-4 md:col-start-9">
            The full scope of carpentry from one trusted team: designed with you, made in our factory and installed on site.
          </p>
        </div>

        <ul
          className="mt-16 border-t border-line md:mt-24"
          onPointerMove={(e) => {
            x.set(e.clientX);
            y.set(e.clientY);
          }}
          onPointerEnter={(e) => {
            // Start the preview under the pointer instead of springing in from the corner.
            x.jump(e.clientX);
            y.jump(e.clientY);
          }}
          onPointerLeave={() => setActive(null)}
        >
          {products.map((p, i) => (
            <li key={p.slug} className="border-b border-line">
              <Link
                href={`/products#${p.slug}`}
                onPointerEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                className="group grid grid-cols-[2.5rem_1fr_auto] items-center gap-4 py-6 transition-colors duration-500 md:grid-cols-[4rem_1fr_1fr_auto] md:py-8"
              >
                <span className="eyebrow text-stone">{String(i + 1).padStart(2, "0")}</span>
                <span className="font-serif text-[clamp(1.9rem,4vw,3.6rem)] leading-none transition-transform duration-700 ease-[var(--ease-expo)] group-hover:translate-x-3 group-hover:text-teak">
                  {p.name}
                </span>
                <span className="hidden text-sm text-stone md:block">{p.summary ?? p.short}</span>
                <span className="flex items-center gap-4">
                  <span className="relative h-14 w-11 overflow-hidden arch md:hidden">
                    <Picture media={p.images[0]} alt="" fill sizes="44px" className="object-cover" />
                  </span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-line transition-all duration-500 group-hover:border-teak group-hover:bg-teak group-hover:text-ivory">
                    <Arrow className="-rotate-45 transition-transform duration-500 group-hover:rotate-0" />
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {!reduce && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none fixed left-0 top-0 z-30 hidden aspect-[3/4] w-[min(22vw,320px)] overflow-hidden arch md:block"
          style={{ x, y, translateX: "-50%", translateY: "-55%" }}
          animate={{ opacity: active === null ? 0 : 1, scale: active === null ? 0.85 : 1 }}
          transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
        >
          {products.map((p, i) => (
            <div
              key={p.slug}
              className="absolute inset-0 transition-[opacity,transform] duration-700 ease-[var(--ease-expo)]"
              style={{ opacity: active === i ? 1 : 0, transform: `scale(${active === i ? 1 : 1.15})` }}
            >
              <Picture media={p.images[0]} alt="" fill sizes="320px" className="object-cover" />
            </div>
          ))}
        </motion.div>
      )}
    </section>
  );
}
