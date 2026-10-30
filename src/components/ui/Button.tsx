import Link from "next/link";
import type { ReactNode } from "react";
import Magnetic from "@/components/ui/Magnetic";

type Props = {
  href: string;
  children: ReactNode;
  variant?: "dark" | "light" | "outline" | "outline-light";
  external?: boolean;
  className?: string;
};

const styles = {
  dark: "bg-ink text-ivory hover:bg-teak",
  light: "bg-ivory text-ink hover:bg-brass",
  outline: "border border-ink/30 text-ink hover:bg-ink hover:text-ivory",
  "outline-light": "border border-ivory/30 text-ivory hover:bg-ivory hover:text-ink",
};

export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={`h-4 w-4 ${className}`} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Pill CTA with a magnetic hover and an arrow that slides on hover. */
export default function Button({ href, children, variant = "dark", external, className = "" }: Props) {
  const cls = `group inline-flex items-center gap-3 rounded-full px-7 py-4 text-sm font-semibold tracking-wide transition-colors duration-500 ${styles[variant]} ${className}`;
  const inner = (
    <>
      <span>{children}</span>
      <span className="relative flex h-4 w-4 overflow-hidden">
        <Arrow className="absolute transition-transform duration-500 ease-[var(--ease-expo)] group-hover:translate-x-full" />
        <Arrow className="absolute -translate-x-full transition-transform duration-500 ease-[var(--ease-expo)] group-hover:translate-x-0" />
      </span>
    </>
  );
  return (
    <Magnetic strength={0.25}>
      {external ? (
        <a href={href} className={cls} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
          {inner}
        </a>
      ) : (
        <Link href={href} className={cls}>
          {inner}
        </Link>
      )}
    </Magnetic>
  );
}
