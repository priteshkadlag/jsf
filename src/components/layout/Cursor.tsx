"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";

/**
 * Soft follower cursor for mouse users. Elements with data-cursor="Label" expand it
 * into a labelled disc (e.g. "View" over project cards). The native cursor stays visible.
 */
export default function Cursor() {
  const reduce = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [label, setLabel] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.5 });

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    const update = () => setEnabled(mq.matches && !reduce);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [reduce]);

  useEffect(() => {
    if (!enabled) return;
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
      const target = (e.target as Element | null)?.closest<HTMLElement>("[data-cursor]");
      setLabel(target?.dataset.cursor ?? null);
    };
    const leave = () => setVisible(false);
    // Content moves under a still pointer while scrolling, so re-check what it is over.
    const rescan = () => {
      const el = document.elementFromPoint(x.get(), y.get());
      setLabel(el?.closest<HTMLElement>("[data-cursor]")?.dataset.cursor ?? null);
    };
    window.addEventListener("scroll", rescan, { passive: true });
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("scroll", rescan);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[90] flex items-center justify-center rounded-full bg-teak text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-ivory"
      style={{ x: sx, y: sy, translateX: "-50%", translateY: "-50%" }}
      animate={{
        width: label ? 96 : 10,
        height: label ? 96 : 10,
        opacity: visible ? (label ? 0.95 : 0.7) : 0,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
    >
      <motion.span animate={{ opacity: label ? 1 : 0, scale: label ? 1 : 0.6 }}>{label}</motion.span>
    </motion.div>
  );
}
