"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

type Props = { children: ReactNode; className?: string; delay?: number; y?: number; as?: "div" | "li" | "section" };

/** Simple viewport-triggered rise used for supporting copy and UI blocks. */
export default function FadeIn({ children, className, delay = 0, y = 32, as = "div" }: Props) {
  const reduce = useReducedMotion();
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 1.1, delay, ease: [0.19, 1, 0.22, 1] }}
    >
      {children}
    </Comp>
  );
}
