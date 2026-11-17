import Image from "next/image";
import { getMedia } from "@/lib/media";

type Props = {
  tone?: "dark" | "light";
  /** "compact" leaves out the small "Doors · Windows · Interiors" line, for header-size logos. */
  variant?: "compact" | "full";
  className?: string;
  /** Uploaded logo from Admin → Header & footer; falls back to the built-in JSF logo. */
  src?: string;
  alt?: string;
};

/** Sizes of the built-in SVGs (their viewBox), so the browser reserves the right space. */
const BUILT_IN = {
  compact: { width: 674, height: 577 },
  full: { width: 724, height: 643 },
} as const;

/** The JSF Industries logo (gold arch over JSF), in green for light backgrounds or cream for dark ones. */
export default function Logo({ tone = "dark", variant = "compact", className = "h-12 w-auto", src, alt = "JSF Industries" }: Props) {
  const custom = src ? getMedia(src) : null;
  const { width, height } = custom ?? BUILT_IN[variant];
  return (
    <Image
      src={custom ? custom.src : `/brand/jsf-logo-${tone}${variant === "compact" ? "-compact" : ""}.svg`}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority
      unoptimized
    />
  );
}
