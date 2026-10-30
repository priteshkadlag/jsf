"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import Picture from "@/components/ui/Picture";
import type { MediaKey } from "@/lib/media";

type Props = {
  media: MediaKey;
  alt: string;
  className?: string;
  sizes?: string;
  /** Percentage the image drifts across the scroll range. */
  strength?: number;
  /** Wipe the frame open from the bottom when it first enters view. */
  reveal?: boolean;
  priority?: boolean;
  shape?: "rect" | "arch";
};

export default function ParallaxImage({
  media,
  alt,
  className = "",
  sizes,
  strength = 12,
  reveal = true,
  priority,
  shape = "rect",
}: Props) {
  const frame = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo(
        inner.current,
        { yPercent: -strength / 2 },
        {
          yPercent: strength / 2,
          ease: "none",
          scrollTrigger: { trigger: frame.current, start: "top bottom", end: "bottom top", scrub: true },
        },
      );
      if (reveal) {
        gsap.fromTo(
          frame.current,
          { clipPath: "inset(100% 0% 0% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1.6,
            ease: "expo.inOut",
            scrollTrigger: { trigger: frame.current, start: "top 90%", once: true },
          },
        );
        gsap.fromTo(
          inner.current?.firstElementChild ?? null,
          { scale: 1.3 },
          { scale: 1, duration: 2, ease: "expo.out", scrollTrigger: { trigger: frame.current, start: "top 90%", once: true } },
        );
      }
    },
    { scope: frame },
  );

  return (
    <div ref={frame} className={`relative overflow-hidden ${shape === "arch" ? "arch" : ""} ${className}`}>
      <div ref={inner} className="absolute inset-x-0" style={{ top: `-${strength}%`, bottom: `-${strength}%` }}>
        <div className="relative h-full w-full">
          <Picture media={media} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
        </div>
      </div>
    </div>
  );
}
