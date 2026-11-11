"use client";

import Image from "next/image";
import { useRef, useSyncExternalStore } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import Picture from "@/components/ui/Picture";
import RevealText from "@/components/ui/RevealText";
import Button from "@/components/ui/Button";
import DoorLeaf from "@/components/home/DoorLeaf";

type Mode = "pending" | "animated" | "static";
const detectMode = (): Mode => (prefersReducedMotion() ? "static" : "animated");
const noopSubscribe = () => () => {};

/**
 * Door photo (1600 × 800) and where its doorway sits in it, in image pixels. The doorway is cut out
 * of the photo and the two leaves are redrawn on top as vector (DoorLeaf), so they stay sharp however
 * far the camera zooms; on scroll they swing open on their hinges to reveal the interior behind.
 */
const DOOR_SRC = "/images/hero/door-entrance.webp";
const IMG_W = 1600;
const IMG_H = 800;
const DOOR = { x: 642, y: 83, w: 311, h: 520 };
const pct = (v: number, of: number) => `${(v / of) * 100}%`;

/** Fraction of the stage the doorway covers, used to work out how far to zoom to walk through it. */
const DOOR_FRAC_W = DOOR.w / IMG_W;
const DOOR_FRAC_H = DOOR.h / IMG_H;
/** Arch: a semicircle whose radius is half the door width, expressed against the door's height. */
const ARCH_Y = pct(DOOR.w / 2, DOOR.h);

/** Alpha mask that cuts the arched doorway out of the wall photo, so the room behind shows through. */
const ARCH_R = DOOR.w / 2;
const DOORWAY_MASK = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${IMG_W} ${IMG_H}' preserveAspectRatio='none'>` +
    `<path fill-rule='evenodd' d='M0 0H${IMG_W}V${IMG_H}H0Z` +
    `M${DOOR.x} ${DOOR.y + DOOR.h}V${DOOR.y + ARCH_R}A${ARCH_R} ${ARCH_R} 0 0 1 ${DOOR.x + DOOR.w} ${DOOR.y + ARCH_R}V${DOOR.y + DOOR.h}Z'/></svg>`,
)}")`;

/**
 * Cinematic opener: JSF's sage-green arched door in a sunlit wall. As you scroll the two leaves
 * swing open and the camera walks through into a real JSF interior. Falls back to a still hero
 * when the visitor prefers reduced motion.
 */
export default function Hero() {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const mode = useSyncExternalStore(
    noopSubscribe,
    detectMode,
    () => "pending" as Mode,
  );
  const immersive = mode !== "static";

  useGSAP(
    () => {
      if (mode !== "animated") return;
      // Zoom just far enough that the doorway covers the whole viewport.
      const walkThrough = () => {
        const el = stage.current!;
        const sx = window.innerWidth / (el.offsetWidth * DOOR_FRAC_W);
        const sy = window.innerHeight / (el.offsetHeight * DOOR_FRAC_H);
        return Math.max(sx, sy) * 1.12;
      };
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.5,
          invalidateOnRefresh: true,
        },
      });
      tl.to("[data-hint]", { autoAlpha: 0, duration: 0.05 }, 0)
        .to(
          "[data-intro]",
          { autoAlpha: 0, y: -80, ease: "power1.in", duration: 0.2 },
          0.03,
        )
        .fromTo(
          "[data-leaf='left']",
          { rotateY: 0 },
          { rotateY: 84, ease: "power2.inOut", duration: 0.4 },
          0.06,
        )
        .fromTo(
          "[data-leaf='right']",
          { rotateY: 0 },
          { rotateY: -84, ease: "power2.inOut", duration: 0.4 },
          0.06,
        )
        .fromTo(
          "[data-leaf]",
          { filter: "brightness(1)" },
          { filter: "brightness(0.55)", duration: 0.4 },
          0.06,
        )
        // The room is farther away than the wall, so it grows more slowly: natural parallax.
        .fromTo(
          "[data-photo]",
          { scale: 1.4 },
          { scale: 1, duration: 0.64 },
          0.04,
        )
        .fromTo(
          "[data-stage]",
          { scale: 1 },
          { scale: walkThrough, ease: "power2.in", duration: 0.36 },
          0.32,
        )
        // By now the doorway covers the screen, so dropping the wall is invisible.
        .set("[data-wall]", { autoAlpha: 0 }, 0.69)
        .fromTo(
          "[data-photo-shade]",
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.1 },
          0.66,
        )
        .fromTo(
          "[data-outro] > *",
          { autoAlpha: 0, y: 50 },
          {
            autoAlpha: 1,
            y: 0,
            stagger: 0.03,
            duration: 0.12,
            ease: "power2.out",
          },
          0.72,
        )
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
        <div
          data-photo
          className="absolute inset-0 origin-center will-change-transform"
        >
          <Picture
            media="craft/arched-hall"
            alt="A villa dining hall lit through tall arched teak windows crafted by JSF Industries"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div
            data-photo-shade
            className="absolute inset-0 bg-gradient-to-t from-espresso/80 via-espresso/25 to-espresso/30"
          />
        </div>

        {immersive && (
          <div data-wall aria-hidden="true" className="absolute inset-0">
            {/* The photo, sized like object-cover so door coordinates stay in proportion */}
            <div className="absolute left-1/2 top-[8svh] aspect-[2/1] w-[max(100vw,170svh)] -translate-x-1/2 md:top-[7svh] md:w-[max(100vw,200svh,1120px)]">
              <div
                ref={stage}
                data-stage
                className="absolute inset-0 will-change-transform"
                style={{
                  transformOrigin: `${pct(DOOR.x + DOOR.w / 2, IMG_W)} ${pct(DOOR.y + DOOR.h / 2, IMG_H)}`,
                }}
              >
                <Image
                  src={DOOR_SRC}
                  alt=""
                  fill
                  priority
                  sizes="max(100vw, 200svh)"
                  className="object-cover"
                  style={{
                    maskImage: DOORWAY_MASK,
                    WebkitMaskImage: DOORWAY_MASK,
                    maskSize: "100% 100%",
                    WebkitMaskSize: "100% 100%",
                  }}
                />
                {/* Plain wall above and below the photo (the door sits lower to clear the header);
                    each band feathers a few pixels onto the photo so there is no visible seam. */}
                <div
                  className="pointer-events-none absolute inset-x-0 top-[-40%] h-[45%]"
                  style={{
                    background:
                      "linear-gradient(to bottom, #f0e2d3 0%, #f0e2d3 89%, rgba(240,226,211,0) 100%)",
                  }}
                />
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-[-40%] h-[43%]"
                  style={{
                    background:
                      "linear-gradient(to top, #f4eae5 0%, #f4eae5 93%, rgba(244,234,229,0) 100%)",
                  }}
                />

                {/* The doorway: interior behind, then the two leaves on top */}
                <div
                  className="absolute"
                  style={{
                    left: pct(DOOR.x, IMG_W),
                    top: pct(DOOR.y, IMG_H),
                    width: pct(DOOR.w, IMG_W),
                    height: pct(DOOR.h, IMG_H),
                    perspective: "1400px",
                  }}
                >
                  {/* Soft shadow around the opening; the room itself is the full-screen photo behind */}
                  <div
                    className="absolute inset-0 shadow-[inset_0_0_50px_rgba(40,25,10,0.5)]"
                    style={{
                      borderRadius: `50% 50% 0 0 / ${ARCH_Y} ${ARCH_Y} 0 0`,
                    }}
                  />
                  <div
                    data-leaf="left"
                    className="absolute inset-y-0 left-0 w-1/2 origin-left will-change-transform"
                  >
                    <DoorLeaf side="left" />
                  </div>
                  <div
                    data-leaf="right"
                    className="absolute inset-y-0 right-0 w-1/2 origin-right will-change-transform"
                  >
                    <DoorLeaf side="right" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Copy on the wall, either side of the door */}
        {immersive ? (
          <div data-intro className="pointer-events-none absolute inset-0">
            <h1 id="hero-title" className="sr-only">
              JSF Industries — architectural woodwork, made to measure
            </h1>
            <div
              aria-hidden="true"
              className="container-x flex h-full flex-col justify-end bg-gradient-to-t from-[#f6ece0] from-[18%] via-[#f6ece0]/70 via-[32%] to-transparent to-[48%] pb-10 md:justify-center md:bg-none md:pb-0"
            >
              <div className="md:absolute md:left-[clamp(1rem,4vw,3.5rem)] md:top-[30%] md:max-w-[28vw] md:-translate-y-1/2">
                <p className="eyebrow mb-4 text-teak">Est. 1989 · Tuem, Goa</p>
                <RevealText
                  as="p"
                  trigger="load"
                  className="font-serif text-[clamp(2.6rem,5.6vw,6.8rem)] leading-[0.92] text-heading"
                >
                  Architectural woodwork,
                </RevealText>
              </div>
              <div className="md:absolute md:text-right md:right-[clamp(1rem,4vw,3.5rem)] md:top-[30%] md:max-w-[28vw] md:-translate-y-1/2">
                <RevealText
                  as="p"
                  trigger="load"
                  delay={0.25}
                  className="font-serif text-[clamp(2.6rem,5.6vw,6.8rem)] italic leading-[0.92] text-teak"
                >
                  made to measure
                </RevealText>
                <p className="mt-5 hidden text-sm text-stone md:block">
                  Doors, architectural solutions &amp; custom joinery
                </p>
              </div>
            </div>
            <div
              data-hint
              className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 md:flex"
            >
              <span className="eyebrow text-stone">Scroll to open</span>
              <span className="relative h-10 w-px overflow-hidden bg-ink/15">
                <span className="absolute inset-x-0 top-0 h-1/2 animate-[hint_2s_ease-in-out_infinite] bg-teak" />
              </span>
            </div>
          </div>
        ) : null}

        {/* Copy over the revealed interior (also the full hero in static mode) */}
        <div
          data-outro
          className={`absolute inset-x-0 bottom-0 pb-12 text-ivory md:pb-16 ${immersive ? "[&>*]:invisible" : ""}`}
        >
          <div className="container-x">
            <p className="eyebrow mb-5 text-brass">
              JSF Industries · Custom joinery since 1989
            </p>
            {immersive ? (
              <h2 className="max-w-5xl font-serif text-headline">
                Precision woodwork for Goa&rsquo;s finest villas,{" "}
                <em className="text-brass">built to last.</em>
              </h2>
            ) : (
              <h1
                id="hero-title"
                className="max-w-5xl font-serif text-headline"
              >
                Architectural woodwork,{" "}
                <em className="text-brass">made to measure.</em>
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
