"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Picture from "@/components/ui/Picture";
import type { Developer, ProjectWithImages } from "@/data/projects";

type Filter = "All" | Developer;

export default function ProjectGrid({ projects }: { projects: ProjectWithImages[] }) {
  const [filter, setFilter] = useState<Filter>("All");
  const reduce = useReducedMotion();
  const filters: Filter[] = ["All", "Isprava", "Vianaar"];
  const visible = filter === "All" ? projects : projects.filter((p) => p.developer === filter);

  return (
    <>
      <div role="group" aria-label="Filter projects by developer" className="flex flex-wrap gap-3">
        {filters.map((f) => {
          const count = f === "All" ? projects.length : projects.filter((p) => p.developer === f).length;
          const on = filter === f;
          return (
            <button
              key={f}
              type="button"
              aria-pressed={on}
              onClick={() => setFilter(f)}
              className={`relative rounded-full border px-5 py-2.5 text-sm font-medium transition-colors duration-500 ${
                on ? "border-ink text-ivory" : "border-line text-ink hover:border-ink"
              }`}
            >
              {on && (
                <motion.span
                  layoutId="filter-pill"
                  className="absolute inset-0 -z-0 rounded-full bg-ink"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span className="relative">
                {f} <sup className="ml-0.5 text-[0.65em] opacity-60">{count}</sup>
              </span>
            </button>
          );
        })}
      </div>
      <p className="sr-only" aria-live="polite">
        Showing {visible.length} projects
      </p>

      <motion.ul layout className="mt-14 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3 md:mt-20">
        <AnimatePresence mode="popLayout">
          {visible.map((p, i) => (
            <motion.li
              key={p.slug}
              layout={!reduce}
              initial={reduce ? false : { opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1], delay: reduce ? 0 : (i % 3) * 0.06 }}
              className={i % 3 === 1 ? "lg:mt-24" : ""}
            >
              <Link href={`/projects/${p.slug}`} data-cursor="View" className="group block">
                <div className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] transition-[border-radius] duration-[1.2s] ease-[var(--ease-expo)] group-hover:rounded-t-[24px]">
                  <Picture
                    media={p.cover}
                    alt={`${p.name}, ${p.location}`}
                    fill
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                    className="object-cover transition-transform duration-[1.4s] ease-[var(--ease-expo)] group-hover:scale-105"
                  />
                </div>
                <div className="mt-5 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-serif text-3xl leading-tight transition-colors duration-500 group-hover:text-teak">{p.name}</h2>
                    <p className="mt-1 text-sm text-stone">{p.scale ? `${p.scope} · ${p.scale}` : p.scope}</p>
                  </div>
                  <span className="eyebrow mt-2 shrink-0 text-teak">{p.developer}</span>
                </div>
              </Link>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </>
  );
}
