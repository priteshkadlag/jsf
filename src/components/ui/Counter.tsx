"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";

type Props = { value: number; suffix?: string; grouping?: boolean; className?: string; from?: number };

/** Counts up to `value` when scrolled into view; renders the final value for SSR/no-JS. */
export default function Counter({ value, suffix = "", grouping = false, className, from }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const format = (n: number) => (grouping ? Math.round(n).toLocaleString("en-IN") : String(Math.round(n))) + suffix;

  useGSAP(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const state = { n: from ?? (value > 1000 && !grouping ? value - 60 : 0) };
    el.textContent = format(state.n);
    gsap.to(state, {
      n: value,
      duration: 2.2,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 90%", once: true },
      onUpdate: () => {
        el.textContent = format(state.n);
      },
    });
  });

  return (
    <span ref={ref} className={className}>
      {format(value)}
    </span>
  );
}
