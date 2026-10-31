"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import Picture from "@/components/ui/Picture";
import RevealText from "@/components/ui/RevealText";
import Button from "@/components/ui/Button";

const DoorScene = dynamic(() => import("@/components/three/DoorScene"), { ssr: false });

type Mode = "pending" | "3d" | "static";
let cachedMode: Mode | null = null;

function detectMode(): Mode {
  if (cachedMode) return cachedMode;
  let webgl = false;
  try {
    const c = document.createElement("canvas");
    webgl = !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {}
  cachedMode = webgl && !prefersReducedMotion() ? "3d" : "static";
  return cachedMode;
}
const noopSubscribe = () => () => {};

/**
 * Cinematic opener. A 3D teak arched door sits in an ivory wall; as you scroll it swings
 * open and the camera walks through into a real JSF interior. Falls back to a still
 * hero when WebGL is unavailable or the visitor prefers reduced motion.
 */
export default function Hero() {
  const section = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const mode = useSyncExternalStore(noopSubscribe, detectMode, () => "pending" as Mode);
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(true);
  const onReady = useCallback(() => setReady(true), []);
  const immersive = mode !== "static";

  useEffect(() => {
    const el = section.current;
    if (!el || mode !== "3d") return;
    const io = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { rootMargin: "10% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [mode]);

  useGSAP(
    () => {
      if (mode !== "3d") return;
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.5,
          onUpdate: (self) => {
            progress.current = self.progress;
          },
        },
      });
      tl.to("[data-hint]", { autoAlpha: 0, duration: 0.05 }, 0)
        .to("[data-intro]", { autoAlpha: 0, y: -80, ease: "power1.in", duration: 0.2 }, 0.03)
        .fromTo("[data-photo]", { scale: 1.3 }, { scale: 1, duration: 0.8 }, 0.2)
        .to("[data-wall]", { autoAlpha: 0, duration: 0.08 }, 0.6)
        .fromTo("[data-outro] > *", { autoAlpha: 0, y: 50 }, { autoAlpha: 1, y: 0, stagger: 0.03, duration: 0.12, ease: "power2.out" }, 0.72)
        .to({}, { duration: 0.02 });
    },
    { scope: section, dependencies: [mode] },
  );

  return (
    <section
      ref={section}
      aria-labelledby="hero-title"
      className={`relative ${immersive ? "h-[360svh]" : "h-svh min-h-[640px]"}`}
    >
      <div className="sticky top-0 h-svh min-h-[560px] overflow-hidden">
        {/* The interior revealed behind the door */}
        <div data-photo className="absolute inset-0 origin-center will-change-transform">
          <Picture
            media="craft/arched-hall"
            alt="A villa dining hall lit through tall arched teak windows crafted by JSF Industries"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-espresso/80 via-espresso/25 to-espresso/30" />
        </div>

        {immersive && (
          <div data-wall className="absolute inset-0">
            {/* Lightweight stand-in until the WebGL scene has drawn its first frame */}
            <div
              aria-hidden="true"
              className={`absolute inset-0 flex items-center justify-center bg-ivory transition-opacity duration-700 ${
                ready ? "opacity-0" : "opacity-100"
              }`}
            >
              <div
                className="arch bg-gradient-to-b from-[#c08240] to-[#9a5f27] shadow-[inset_0_0_0_10px_#8f5626]"
                style={{ height: "min(64svh, 114vw)", aspectRatio: "1.84 / 2.92" }}
              />
            </div>
            {mode === "3d" && <DoorScene progress={progress} active={active} onReady={onReady} className="!absolute inset-0" />}
          </div>
        )}

        {/* Copy painted on the wall, either side of the door */}
        {immersive ? (
          <div data-intro className="pointer-events-none absolute inset-0">
            <h1 id="hero-title" className="sr-only">
              JSF Industries — elevating spaces with luxury craftsmanship
            </h1>
            <div aria-hidden="true" className="container-x flex h-full flex-col justify-between pb-10 pt-24 md:justify-center md:pb-0 md:pt-0">
              <div className="md:absolute md:left-[clamp(1rem,4vw,3.5rem)] md:top-1/2 md:max-w-[30vw] md:-translate-y-1/2">
                <p className="eyebrow mb-4 text-teak">Est. 1989 · Tuem, Goa</p>
                <RevealText
                  as="p"
                  trigger="load"
                  className="font-serif text-[clamp(2.6rem,6vw,7.2rem)] leading-[0.92] text-ink"
                >
                  Elevating spaces
                </RevealText>
              </div>
              <div className="text-right md:absolute md:right-[clamp(1rem,4vw,3.5rem)] md:top-1/2 md:max-w-[32vw] md:-translate-y-1/2">
                <RevealText
                  as="p"
                  trigger="load"
                  delay={0.25}
                  className="font-serif text-[clamp(2.6rem,6vw,7.2rem)] italic leading-[0.92] text-teak"
                >
                  with luxury craftsmanship
                </RevealText>
                <p className="mt-5 hidden text-sm text-stone md:block">Teakwood doors, windows &amp; bespoke carpentry</p>
              </div>
            </div>
            <div data-hint className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 md:flex">
              <span className="eyebrow text-stone">Scroll to open</span>
              <span className="relative h-10 w-px overflow-hidden bg-ink/15">
                <span className="absolute inset-x-0 top-0 h-1/2 animate-[hint_2s_ease-in-out_infinite] bg-teak" />
              </span>
            </div>
          </div>
        ) : null}

        {/* Copy over the revealed interior (also the full hero in static mode) */}
        <div data-outro className={`absolute inset-x-0 bottom-0 pb-12 text-ivory md:pb-16 ${immersive ? "[&>*]:invisible" : ""}`}>
          <div className="container-x">
            <p className="eyebrow mb-5 text-brass">JSF Industries · Doors &amp; windows since 1989</p>
            {immersive ? (
              <h2 className="max-w-5xl font-serif text-headline">
                Crafted for Goa&rsquo;s finest villas, <em className="text-brass">built to last generations.</em>
              </h2>
            ) : (
              <h1 id="hero-title" className="max-w-5xl font-serif text-headline">
                Elevating spaces with <em className="text-brass">luxury craftsmanship.</em>
              </h1>
            )}
            <div className="mt-8 flex flex-wrap gap-4">
              <Button href="/projects" variant="light">
                Explore our projects
              </Button>
              <Button href="/craftsmanship" variant="outline-light">
                Inside our factory
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
