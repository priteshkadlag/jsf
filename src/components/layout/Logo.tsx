import Image from "next/image";
import { getMedia } from "@/lib/media";

type Props = {
  tone?: "dark" | "light";
  className?: string;
  /** Uploaded logo from Admin → Header & footer; falls back to the built-in JSF lock-up. */
  src?: string;
  alt?: string;
};

/** The JSF Industries horizontal lock-up (arched door, 19·89, wordmark), in walnut or ivory. */
export default function Logo({ tone = "dark", className = "h-9 w-auto", src, alt = "JSF Industries — 1989" }: Props) {
  const custom = src ? getMedia(src) : null;
  const { width, height } = custom ?? getMedia("brand/logo");
  return (
    <Image
      src={custom ? custom.src : tone === "dark" ? "/brand/jsf-logo-dark.png" : "/brand/jsf-logo-light.png"}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority
      unoptimized
    />
  );
}
