"use client";

import { motion, useReducedMotion } from "motion/react";
import Picture from "@/components/ui/Picture";
import { clients } from "@/data/clients";

/** Full logo wall: cards rise in a staggered wave, lift on hover and reveal the client's name. */
export default function ClientWall() {
  const reduce = useReducedMotion();
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5">
      {clients.map((c, i) => (
        <motion.li
          key={c.name}
          initial={reduce ? false : { opacity: 0, y: 50, rotateX: -25 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          viewport={{ once: true, margin: "0px 0px -8% 0px" }}
          transition={{ duration: 1, ease: [0.19, 1, 0.22, 1], delay: (i % 5) * 0.07 }}
          style={{ transformPerspective: 900 }}
        >
          <div className="group relative flex aspect-[4/3] flex-col overflow-hidden rounded-sm bg-white transition-[transform,box-shadow] duration-700 ease-[var(--ease-expo)] hover:-translate-y-2 hover:shadow-[0_24px_50px_-24px_rgb(31_42_36/0.45)]">
            <div className="relative flex-1 p-6 transition-transform duration-700 ease-[var(--ease-expo)] group-hover:-translate-y-3 md:p-8">
              <div className="relative h-full w-full">
                <Picture media={c.logo} alt={c.name} fill sizes="(min-width: 1280px) 18vw, (min-width: 640px) 30vw, 45vw" className="object-contain mix-blend-multiply" />
              </div>
            </div>
            <p className="absolute inset-x-0 bottom-0 translate-y-full bg-espresso px-4 py-2.5 text-center text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ivory transition-transform duration-500 ease-[var(--ease-expo)] group-hover:translate-y-0">
              {c.name}
            </p>
            <span aria-hidden="true" className="absolute left-3 top-3 font-serif text-sm text-stone/50">
              {String(i + 1).padStart(2, "0")}
            </span>
          </div>
        </motion.li>
      ))}
    </ul>
  );
}
