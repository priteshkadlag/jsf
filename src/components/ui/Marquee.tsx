import type { ReactNode } from "react";

type Props = { children: ReactNode; duration?: number; reverse?: boolean; className?: string; label?: string };

/** CSS-driven infinite marquee. Content is duplicated once; the copy is hidden from assistive tech. */
export default function Marquee({ children, duration = 40, reverse, className = "", label }: Props) {
  return (
    <div
      className={`marquee relative flex overflow-hidden ${reverse ? "marquee-reverse" : ""} ${className}`}
      style={{ ["--marquee-duration" as string]: `${duration}s` }}
      role={label ? "region" : undefined}
      aria-label={label}
    >
      <div className="animate-marquee flex w-max shrink-0">
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
