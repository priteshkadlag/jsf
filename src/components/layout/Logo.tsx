import Image from "next/image";
import { getMedia } from "@/lib/media";

/** The JSF Industries lock-up (wood-grain mark + wordmark), in ink or ivory. */
export default function Logo({ tone = "dark", className = "h-9 w-auto" }: { tone?: "dark" | "light"; className?: string }) {
  const { width, height } = getMedia("brand/logo");
  return (
    <Image
      src={tone === "dark" ? "/brand/logo-dark.png" : "/brand/logo-light.png"}
      alt="JSF Industries — Estd. 1989"
      width={width}
      height={height}
      className={className}
      priority
      unoptimized
    />
  );
}
