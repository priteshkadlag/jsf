"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Picture from "@/components/ui/Picture";
import { useLenis } from "@/components/providers/SmoothScroll";
import type { MediaKey } from "@/lib/media";

export type GalleryItem = { media: MediaKey; caption: string; category: string; href?: string };

const PAGE = 24;
const ease = [0.19, 1, 0.22, 1] as const;

/** Filterable masonry of all JSF work with paged loading and a keyboard-friendly lightbox. */
export default function GalleryWall({ items, categories }: { items: GalleryItem[]; categories: string[] }) {
  const reduce = useReducedMotion();
  const lenis = useLenis();
  const [filter, setFilter] = useState("All");
  const [limit, setLimit] = useState(PAGE);
  const [index, setIndex] = useState<number | null>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const lastTrigger = useRef<HTMLButtonElement | null>(null);

  const filtered = filter === "All" ? items : items.filter((i) => i.category === filter);
  const shown = filtered.slice(0, limit);
  const open = index !== null;
  const current = index !== null ? filtered[index] : null;

  const step = useCallback(
    (dir: 1 | -1) => setIndex((i) => (i === null ? i : (i + dir + filtered.length) % filtered.length)),
    [filtered.length],
  );

  useEffect(() => {
    if (!open) return;
    const opener = lastTrigger.current;
    lenis?.stop();
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIndex(null);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      lenis?.start();
      opener?.focus();
    };
  }, [open, lenis, step]);

  const choose = (c: string) => {
    setFilter(c);
    setLimit(PAGE);
  };

  return (
    <>
      <div className="sticky-under-header sticky z-20 -mx-[clamp(1rem,4vw,3.5rem)] border-b border-line bg-ivory/85 px-[clamp(1rem,4vw,3.5rem)] py-4 backdrop-blur-md">
        <div role="group" aria-label="Filter gallery" className="flex gap-2 overflow-x-auto [scrollbar-width:none]">
          {["All", ...categories].map((c) => {
            const on = filter === c;
            const count = c === "All" ? items.length : items.filter((i) => i.category === c).length;
            return (
              <button
                key={c}
                type="button"
                aria-pressed={on}
                onClick={() => choose(c)}
                className={`relative shrink-0 rounded-full border px-5 py-2.5 text-sm font-medium transition-colors duration-500 ${
                  on ? "border-ink text-ivory" : "border-line text-ink hover:border-ink"
                }`}
              >
                {on && <motion.span layoutId="gallery-pill" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                <span className="relative">
                  {c} <sup className="ml-0.5 text-[0.65em] opacity-60">{count}</sup>
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <p className="sr-only" aria-live="polite">
        Showing {shown.length} of {filtered.length} images
      </p>

      <ul key={filter} className="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4 [&>li]:mb-4">
        {shown.map((item, i) => (
          <motion.li
            key={item.media}
            className="break-inside-avoid"
            initial={reduce ? false : { opacity: 0, y: 50, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "0px 0px -6% 0px" }}
            transition={{ duration: 1, ease, delay: (i % 4) * 0.06 }}
          >
            <button
              type="button"
              data-cursor="Open"
              onClick={(e) => {
                lastTrigger.current = e.currentTarget;
                setIndex(i);
              }}
              className="group relative block w-full overflow-hidden"
              aria-label={`Open ${item.caption} (image ${i + 1} of ${filtered.length})`}
            >
              <Picture
                media={item.media}
                alt={item.caption}
                sizes="(min-width: 1280px) 24vw, (min-width: 1024px) 32vw, (min-width: 640px) 48vw, 100vw"
                className="h-auto w-full transition-transform duration-[1.4s] ease-[var(--ease-expo)] group-hover:scale-[1.06]"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-espresso/75 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <span className="absolute inset-x-0 bottom-0 flex translate-y-3 items-end justify-between gap-3 p-4 text-left text-ivory opacity-0 transition-all duration-500 ease-[var(--ease-expo)] group-hover:translate-y-0 group-hover:opacity-100">
                <span className="font-serif text-xl leading-tight">{item.caption}</span>
                <span className="eyebrow shrink-0 text-brass">{item.category}</span>
              </span>
            </button>
          </motion.li>
        ))}
      </ul>

      {limit < filtered.length && (
        <div className="mt-16 flex flex-col items-center gap-4">
          <p className="eyebrow text-stone">
            {shown.length} of {filtered.length}
          </p>
          <span className="h-px w-40 overflow-hidden bg-line">
            <span className="block h-full bg-teak transition-[width] duration-700" style={{ width: `${(shown.length / filtered.length) * 100}%` }} />
          </span>
          <button
            type="button"
            onClick={() => setLimit((l) => l + PAGE)}
            className="mt-4 rounded-full bg-ink px-8 py-4 text-sm font-semibold tracking-wide text-ivory transition-colors duration-500 hover:bg-teak"
          >
            Load more work
          </button>
        </div>
      )}

      <AnimatePresence>
        {current && index !== null && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Image viewer"
            className="fixed inset-0 z-[95] flex flex-col bg-espresso/97 text-ivory"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center justify-between gap-4 px-5 py-5 md:px-8">
              <p className="eyebrow text-ivory/60" aria-live="polite">
                {String(index + 1).padStart(2, "0")} / {String(filtered.length).padStart(2, "0")}
              </p>
              <button
                ref={closeBtn}
                type="button"
                onClick={() => setIndex(null)}
                className="eyebrow rounded-full border border-ivory/30 px-5 py-3 hover:bg-ivory hover:text-ink"
              >
                Close
              </button>
            </div>
            <div className="relative flex-1" onClick={() => setIndex(null)}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={current.media}
                  className="absolute inset-4 md:inset-x-24 md:inset-y-2"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.5, ease }}
                >
                  <Picture media={current.media} alt={current.caption} fill sizes="100vw" className="object-contain" />
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="flex flex-col items-center gap-4 px-5 pb-6 md:flex-row md:justify-between md:px-8">
              <div className="text-center md:text-left">
                <p className="font-serif text-2xl">{current.caption}</p>
                {current.href ? (
                  <Link href={current.href} className="link-underline text-sm text-brass">
                    View project →
                  </Link>
                ) : (
                  <p className="text-sm text-ivory/50">{current.category}</p>
                )}
              </div>
              <div className="flex gap-3">
                {([-1, 1] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => step(d)}
                    aria-label={d === 1 ? "Next image" : "Previous image"}
                    className="flex h-14 w-14 items-center justify-center rounded-full border border-ivory/30 hover:bg-ivory hover:text-ink"
                  >
                    <svg viewBox="0 0 24 24" className={`h-4 w-4 ${d === -1 ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
