import Image from "next/image";
import { getMedia } from "@/lib/media";

/** The JSF Industries horizontal lock-up (arched door, 19·89, wordmark), in walnut or ivory. */
export default function Logo({ tone = "dark", className = "h-9 w-auto" }: { tone?: "dark" | "light"; className?: string }) {
  const { width, height } = getMedia("brand/logo");
  return (
    <Image
      src={tone === "dark" ? "/brand/jsf-logo-dark.png" : "/brand/jsf-logo-light.png"}
      alt="JSF Industries — 1989"
      width={width}
      height={height}
      className={className}
      priority
      unoptimized
    />
  );
}
