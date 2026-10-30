"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { markLoaded } from "@/lib/loader";
import { useLenis } from "@/components/providers/SmoothScroll";
import GrainMark from "@/components/layout/GrainMark";

const STORAGE_KEY = "jsf-intro-seen";

/**
 * First-visit intro: the grain roundel draws itself while the years count from
 * 1989 to today, then the curtain lifts with an arched edge. Repeat visits in the
 * same session skip straight to a quick fade.
 */
export default function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);
  const lenis = useLenis();

  useEffect(() => {
    if (done) lenis?.start();
    else lenis?.stop();
  }, [done, lenis]);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      let seen = false;
      try {
        seen = sessionStorage.getItem(STORAGE_KEY) === "1";
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {}

      if (seen || prefersReducedMotion()) {
        markLoaded();
        gsap.to(el, { autoAlpha: 0, duration: 0.5, ease: "power2.out", onComplete: () => setDone(true) });
        return;
      }

      const year = el.querySelector<HTMLElement>("[data-year]");
      const counter = { y: 1989 };
      const end = 2026;
      const tl = gsap.timeline({ onComplete: () => setDone(true) });
      tl.fromTo(
        el.querySelectorAll("[data-grain]"),
        { strokeDasharray: 1, strokeDashoffset: 1 },
        { strokeDashoffset: 0, duration: 1.6, stagger: 0.07, ease: "power2.inOut" },
      )
        .from(el.querySelectorAll("[data-fade]"), { autoAlpha: 0, y: 16, duration: 0.8, stagger: 0.1 }, 0.2)
        .to(
          counter,
          {
            y: end,
            duration: 1.5,
            ease: "power2.inOut",
            onUpdate: () => {
              if (year) year.textContent = String(Math.round(counter.y));
            },
          },
          0.3,
        )
        .add(markLoaded, "+=0.15")
        .to(el.querySelector("[data-content]"), { yPercent: -40, autoAlpha: 0, duration: 1, ease: "expo.in" }, "<")
        .to(
          el,
          { yPercent: -100, borderBottomLeftRadius: "50% 18vh", borderBottomRightRadius: "50% 18vh", duration: 1.3, ease: "expo.inOut" },
          "<0.25",
        );
    },
    { scope: root },
  );

  if (done) return null;

  return (
    <div
      ref={root}
      className="preloader grain fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-espresso text-ivory"
      role="status"
      aria-label="Loading JSF Industries"
    >
      <div data-content="" className="flex flex-col items-center gap-8">
        <GrainMark className="h-28 w-28 text-brass md:h-36 md:w-36" />
        <div className="flex flex-col items-center gap-2">
          <p data-fade="" className="eyebrow text-ivory/50">
            Crafting since
          </p>
          <p data-fade="" className="font-serif text-6xl tabular-nums md:text-7xl">
            <span data-year="">1989</span>
          </p>
        </div>
      </div>
    </div>
  );
}
