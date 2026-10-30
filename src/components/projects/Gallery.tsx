"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Picture from "@/components/ui/Picture";
import { useLenis } from "@/components/providers/SmoothScroll";
import type { MediaKey } from "@/lib/media";

type Props = { images: MediaKey[]; name: string };

/** Masonry gallery with a keyboard-accessible lightbox. */
export default function Gallery({ images, name }: Props) {
  const [index, setIndex] = useState<number | null>(null);
  const lenis = useLenis();
  const closeBtn = useRef<HTMLButtonElement>(null);
  const lastTrigger = useRef<HTMLButtonElement | null>(null);
  const open = index !== null;

  const step = useCallback(
    (dir: 1 | -1) => setIndex((i) => (i === null ? i : (i + dir + images.length) % images.length)),
    [images.length],
  );

  useEffect(() => {
    if (!open) return;
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
      lastTrigger.current?.focus();
    };
  }, [open, lenis, step]);

  return (
    <>
      <ul className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>li]:mb-4">
        {images.map((m, i) => (
          <motion.li
            key={m}
            className="break-inside-avoid"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -8% 0px" }}
            transition={{ duration: 1, ease: [0.19, 1, 0.22, 1], delay: (i % 3) * 0.08 }}
          >
            <button
              type="button"
              data-cursor="Open"
              onClick={(e) => {
                lastTrigger.current = e.currentTarget;
                setIndex(i);
              }}
              className="group block w-full overflow-hidden"
              aria-label={`Open image ${i + 1} of ${images.length}`}
            >
              <Picture
                media={m}
                alt={`${name} — photograph ${i + 1}`}
                sizes="(min-width: 1024px) 31vw, (min-width: 640px) 48vw, 100vw"
                className="h-auto w-full transition-transform duration-[1.4s] ease-[var(--ease-expo)] group-hover:scale-[1.04]"
              />
            </button>
          </motion.li>
        ))}
      </ul>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`${name} gallery`}
            className="fixed inset-0 z-[95] flex flex-col bg-espresso/97 text-ivory"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center justify-between px-5 py-5 md:px-8">
              <p className="eyebrow text-ivory/60" aria-live="polite">
                {String(index + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
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
                  key={index}
                  className="absolute inset-4 md:inset-x-24 md:inset-y-4"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
                >
                  <Picture media={images[index]} alt={`${name} — photograph ${index + 1}`} fill sizes="100vw" className="object-contain" />
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="flex justify-center gap-3 pb-6">
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
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
