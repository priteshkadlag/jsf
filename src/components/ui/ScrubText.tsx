"use client";

import { useRef, type ElementType } from "react";
import SplitType from "split-type";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";

type Props = { children: string; as?: ElementType; className?: string };

/** Words brighten from faint to full ink as the paragraph scrolls through the viewport. */
export default function ScrubText({ children, as: Tag = "p", className }: Props) {
  const ref = useRef<HTMLElement>(null);
  const target = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = target.current;
      if (!el || prefersReducedMotion()) return;
      const split = new SplitType(el, { types: "words" });
      gsap.fromTo(
        split.words ?? [],
        { opacity: 0.16 },
        {
          opacity: 1,
          stagger: 0.08,
          ease: "none",
          scrollTrigger: { trigger: ref.current, start: "top 80%", end: "bottom 45%", scrub: true },
        },
      );
      return () => split.revert();
    },
    { scope: ref, dependencies: [children] },
  );

  return (
    <Tag ref={ref} className={className}>
      <span className="sr-only">{children}</span>
      <span ref={target} aria-hidden="true">
        {children}
      </span>
    </Tag>
  );
}
