"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Picture from "@/components/ui/Picture";
import { useLenis } from "@/components/providers/SmoothScroll";
import type { MediaKey } from "@/lib/media";

type Props = { src: string; poster: MediaKey; title: string; className?: string };

/** Poster with a play button that opens a full-screen player. The video only loads on demand. */
export default function VideoModal({ src, poster, title, className = "" }: Props) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const lenis = useLenis();

  useEffect(() => {
    if (!open) return;
    const opener = trigger.current;
    lenis?.stop();
    close.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      lenis?.start();
      opener?.focus();
    };
  }, [open, lenis]);

  return (
    <>
      <button
        ref={trigger}
        type="button"
        onClick={() => setOpen(true)}
        data-cursor="Play"
        className={`group relative block w-full overflow-hidden ${className}`}
        aria-label={`Play video: ${title}`}
      >
        <Picture media={poster} alt="" fill sizes="(min-width: 768px) 60vw, 100vw" className="object-cover transition-transform duration-[1.6s] ease-[var(--ease-expo)] group-hover:scale-105" />
        <span className="absolute inset-0 bg-espresso/35 transition-colors duration-700 group-hover:bg-espresso/20" />
        <span className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-ivory/60 text-ivory backdrop-blur-sm transition-transform duration-700 ease-[var(--ease-expo)] group-hover:scale-110 md:h-32 md:w-32">
          <svg viewBox="0 0 24 24" className="ml-1 h-6 w-6" fill="currentColor" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
        <span className="eyebrow absolute bottom-6 left-6 text-ivory">{title}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="fixed inset-0 z-[95] flex items-center justify-center bg-espresso/95 p-4 md:p-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.video
              src={src}
              controls
              autoPlay
              playsInline
              className="max-h-full max-w-full rounded-sm"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
              onClick={(e) => e.stopPropagation()}
            />
            <button
              ref={close}
              type="button"
              onClick={() => setOpen(false)}
              className="eyebrow absolute right-5 top-5 rounded-full border border-ivory/30 px-5 py-3 text-ivory hover:bg-ivory hover:text-ink"
            >
              Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
