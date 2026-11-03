"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring, useReducedMotion } from "motion/react";
import { useState } from "react";
import { useLenis } from "@/components/providers/SmoothScroll";
import Magnetic from "@/components/ui/Magnetic";

const R = 26;

/** Floating "back to top" control with a ring that fills as you scroll down the page. */
export default function BackToTop() {
  const lenis = useLenis();
  const reduce = useReducedMotion();
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });
  const [visible, setVisible] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => setVisible(y > 700));

  const toTop = () => {
    if (lenis) lenis.scrollTo(0, { duration: 1.8, easing: (t) => 1 - Math.pow(1 - t, 4) });
    else window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    document.getElementById("main")?.focus({ preventScroll: true });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed bottom-5 right-5 z-[60] md:bottom-8 md:right-8"
          initial={{ opacity: 0, scale: 0.6, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 30 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
        >
          <Magnetic strength={0.3}>
            <button
              type="button"
              onClick={toTop}
              aria-label="Back to top"
              className="group relative flex h-16 w-16 items-center justify-center rounded-full bg-ink text-ivory ring-1 ring-ivory/20 shadow-[0_10px_30px_-10px_rgb(31_42_36/0.6)] transition-colors duration-500 hover:bg-teak"
            >
              <svg viewBox="0 0 64 64" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden="true">
                <circle cx="32" cy="32" r={R} fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="1.5" />
                <motion.circle
                  cx="32"
                  cy="32"
                  r={R}
                  fill="none"
                  stroke="#b4935a"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  style={{ pathLength: progress }}
                />
              </svg>
              <span className="relative flex h-5 w-5 overflow-hidden" aria-hidden="true">
                {[0, 1].map((i) => (
                  <svg
                    key={i}
                    viewBox="0 0 24 24"
                    className={`absolute h-5 w-5 transition-transform duration-500 ease-[var(--ease-expo)] ${
                      i === 0 ? "group-hover:-translate-y-full" : "translate-y-full group-hover:translate-y-0"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  >
                    <path d="M12 19V5M6 11l6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ))}
              </span>
            </button>
          </Magnetic>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
