"use client";

import { useEffect, useRef } from "react";
import { getMedia, type MediaKey } from "@/lib/media";

type Props = { src: string; poster: MediaKey; label: string; className?: string };

/** Muted, looping ambient video that only downloads and plays while on screen. */
export default function InViewVideo({ src, poster, label, className = "" }: Props) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (video.preload === "none") video.preload = "auto";
          video.play().catch(() => {});
        } else video.pause();
      },
      { threshold: 0.2 },
    );
    io.observe(video);
    return () => io.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      className={className}
      src={src}
      poster={getMedia(poster).src}
      muted
      loop
      playsInline
      preload="none"
      aria-label={label}
    />
  );
}
