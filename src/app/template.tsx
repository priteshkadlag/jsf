"use client";

import { useEffect, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

// False during SSR and hydration; true for every client-side navigation after that,
// so the transition never hides server-rendered content on first load.
let hydrated = false;

export default function Template({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  const animate = hydrated && !reduce;

  useEffect(() => {
    hydrated = true;
  }, []);

  return (
    <>
      {animate && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[80] origin-top bg-espresso"
          initial={{ scaleY: 1 }}
          animate={{ scaleY: 0 }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        />
      )}
      <motion.div
        initial={animate ? { opacity: 0, y: 40 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.19, 1, 0.22, 1], delay: 0.2 }}
      >
        {children}
      </motion.div>
    </>
  );
}
