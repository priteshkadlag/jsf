"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { markLoaded } from "@/lib/loader";
import { useLenis } from "@/components/providers/SmoothScroll";

const STORAGE_KEY = "jsf-intro-seen";
/** One push-and-return of the plane (matches the CSS keyframes in globals.css). */
const STROKE_MS = 2400;

/** Resolves once the page (images, fonts) has finished loading. */
const pageLoaded = () =>
  new Promise<void>((resolve) => {
    if (document.readyState === "complete") resolve();
    else window.addEventListener("load", () => resolve(), { once: true });
  });

/**
 * First-visit intro: a hand plane pushes across a board, curling off a shaving, above
 * "Est. 1989". It finishes at least one full stroke and waits for the page to load, then the
 * curtain lifts with an arched edge. Repeat visits in the same session get a quick fade.
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

      let cancelled = false;
      let tl: gsap.core.Timeline | undefined;
      gsap.from(el.querySelector("[data-content]"), { autoAlpha: 0, y: 12, duration: 0.6, ease: "power2.out" });

      const minStroke = new Promise((resolve) => setTimeout(resolve, STROKE_MS));
      Promise.all([minStroke, pageLoaded()]).then(() => {
        if (cancelled) return;
        markLoaded();
        tl = gsap
          .timeline({ onComplete: () => setDone(true) })
          .to(el.querySelector("[data-content]"), { yPercent: -40, autoAlpha: 0, duration: 0.9, ease: "expo.in" })
          .to(
            el,
            { yPercent: -100, borderBottomLeftRadius: "50% 18vh", borderBottomRightRadius: "50% 18vh", duration: 1.3, ease: "expo.inOut" },
            "<0.25",
          );
      });

      return () => {
        cancelled = true;
        tl?.kill();
      };
    },
    { scope: root },
  );

  if (done) return null;

  return (
    <div
      ref={root}
      className="jsf-loader grain fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      role="status"
      aria-label="Loading JSF Industries"
    >
      <div data-content="" className="flex flex-col items-center gap-3.5">
        <svg viewBox="18 44 204 78" aria-hidden="true" className="h-auto w-[min(320px,78vw)] overflow-visible">
          {/* Wood surface */}
          <line className="jsf-ink" x1="12" y1="100.5" x2="228" y2="100.5" />
          <g className="jsf-hatch" strokeWidth=".9">
            <line x1="20" y1="106" x2="222" y2="106" strokeDasharray="26 5 9 4 40 6 14 5" />
            <line x1="30" y1="111" x2="212" y2="111" strokeDasharray="12 6 30 4 8 7 22 5" />
            <line x1="44" y1="116" x2="198" y2="116" strokeDasharray="18 8 6 6 28 9" />
          </g>

          {/* Hand plane, facing left */}
          <g className="jsf-plane">
            <g transform="translate(65 0)">
              {/* Rear tote */}
              <path
                className="jsf-fill"
                d="M74 89 C76 80 82 66 92 57 C96 53 103 53 104 58 C105 62 101 64 99 68 C96 74 97 82 102 88 L106 89 Z"
              />
              <path className="jsf-hatch" d="M84 86 C85 76 89 68 95 61 M89 88 C90 79 93 72 98 65" />

              {/* Iron + lever cap */}
              <path className="jsf-fill" d="M41 90 L62 58 L68 61 L49 90 Z" />
              <rect className="jsf-fill" x="57" y="62" width="9" height="6" rx="1.5" transform="rotate(-58 61.5 65)" />
              <line className="jsf-hatch" x1="47" y1="90" x2="64" y2="62.5" />

              {/* Body */}
              <path
                className="jsf-fill"
                d="M2 100 L111 100 L111 93 C111 90 109 88 106 88 L72 88 L64 84 L36 84 L30 89 L16 89 C8 89 3 94 2 100 Z"
              />
              <g className="jsf-hatch">
                <line x1="12" y1="96.5" x2="104" y2="96.5" strokeDasharray="20 3 12 3 30 3" />
                <line x1="20" y1="93" x2="104" y2="93" strokeDasharray="8 4 26 4 14 4" />
              </g>

              {/* Shaving */}
              <path className="jsf-ink jsf-shaving" d="M41 89 C38 79 30 74 24 79 C19 84 24 90 29 88 C33 86 31 80 27 81" />

              {/* Front knob */}
              <path className="jsf-fill" d="M12 90 L12 85 L18 85 L18 90 Z" />
              <ellipse className="jsf-fill" cx="15" cy="76" rx="7.5" ry="9" />
              <path className="jsf-hatch" d="M11 72 C13 70 17 70 19 72 M10 77 C13 75 17 75 20 77 M11 82 C13 80 17 80 19 82" />
            </g>
          </g>
        </svg>

        <p className="pl-[0.32em] font-serif text-[22px] font-semibold leading-none tracking-[0.32em] text-brass">EST. 1989</p>
      </div>
    </div>
  );
}
