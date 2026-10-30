"use client";

import { useRef, type ElementType } from "react";
import SplitType from "split-type";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { onLoaded } from "@/lib/loader";

type Props = {
  children: string;
  as?: ElementType;
  className?: string;
  /** "scroll" waits for the element to enter the viewport; "load" plays after the preloader. */
  trigger?: "scroll" | "load";
  delay?: number;
  stagger?: number;
  id?: string;
};

/**
 * Splits text into words with SplitType and slides each word up from behind a mask.
 * Assistive tech reads an sr-only copy; the animated copy is aria-hidden.
 */
export default function RevealText({
  children,
  as: Tag = "p",
  className,
  trigger = "scroll",
  delay = 0,
  stagger = 0.06,
  id,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const target = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      const text = target.current;
      if (!el || !text) return;
      if (prefersReducedMotion()) {
        el.setAttribute("data-split-ready", "");
        return;
      }

      const split = new SplitType(text, { types: "words", wordClass: "split-word" });
      const inners = (split.words ?? []).map((word) => {
        const inner = document.createElement("span");
        inner.className = "split-inner";
        inner.textContent = word.textContent;
        word.textContent = "";
        word.appendChild(inner);
        return inner;
      });
      gsap.set(inners, { yPercent: 110 });
      el.setAttribute("data-split-ready", "");

      const play = () =>
        gsap.to(inners, { yPercent: 0, duration: 1.4, stagger, delay, ease: "expo.out" });

      if (trigger === "load") {
        let tween: gsap.core.Tween | undefined;
        const off = onLoaded(() => {
          tween = play();
        });
        return () => {
          off();
          tween?.kill();
          split.revert();
        };
      }

      const tween = gsap.to(inners, {
        yPercent: 0,
        duration: 1.4,
        stagger,
        delay,
        ease: "expo.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      });
      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
        split.revert();
      };
    },
    { scope: ref, dependencies: [children] },
  );

  return (
    <Tag ref={ref} className={className} data-reveal="" id={id}>
      <span className="sr-only">{children}</span>
      <span ref={target} aria-hidden="true">
        {children}
      </span>
    </Tag>
  );
}
