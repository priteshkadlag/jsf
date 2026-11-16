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
 * The text exists once in the page, so search engines and screen readers read it once.
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
      gsap.set(inners, { yPercent: 160 }); // fully below the mask, which leaves 0.4em for descenders
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
    // One copy of the text: search engines and screen readers read the heading once. The words are
    // split into animated spans in the browser, but they stay real, readable text.
    <Tag ref={ref} className={className} data-reveal="" id={id}>
      <span ref={target}>{children}</span>
      {/* Keeps a word break when two of these sit together as lines of one heading. */}{" "}
    </Tag>
  );
}
