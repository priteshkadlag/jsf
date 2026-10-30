type Props = { index?: string; children: string; tone?: "dark" | "light"; className?: string };

/** Small numbered eyebrow used to open each section, e.g. "(02) — What we do". */
export default function SectionLabel({ index, children, tone = "dark", className = "" }: Props) {
  return (
    <p className={`eyebrow flex items-center gap-3 ${tone === "dark" ? "text-stone" : "text-ivory/60"} ${className}`}>
      {index && <span className={tone === "dark" ? "text-teak" : "text-brass"}>({index})</span>}
      <span aria-hidden="true" className="h-px w-8 bg-current opacity-50" />
      <span>{children}</span>
    </p>
  );
}
