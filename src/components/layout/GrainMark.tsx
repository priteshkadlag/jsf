/** Decorative wood-grain roundel echoing the JSF mark. Paths use pathLength=1 so they can be "drawn". */
export default function GrainMark({ className = "" }: { className?: string }) {
  const paths = [
    "M30 58 C 70 30, 140 26, 176 60",
    "M44 72 C 80 46, 138 44, 168 74 C 140 86, 100 84, 76 78",
    "M70 82 C 96 64, 136 62, 156 82 C 132 92, 110 90, 96 88",
    "M100 92 C 116 82, 136 82, 146 92 C 132 98, 118 98, 110 96",
    "M14 100 C 60 88, 120 104, 190 98",
    "M12 118 C 70 108, 130 124, 190 114",
    "M16 136 C 70 128, 130 142, 186 132",
    "M24 152 C 80 146, 130 158, 178 150",
    "M38 168 C 86 162, 124 172, 164 166",
    "M62 184 C 96 180, 118 186, 140 182",
  ];
  return (
    <svg viewBox="0 0 200 200" fill="none" aria-hidden="true" className={className}>
      <defs>
        <clipPath id="grain-clip">
          <circle cx="100" cy="100" r="90" />
        </clipPath>
      </defs>
      <g clipPath="url(#grain-clip)" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
        {paths.map((d) => (
          <path key={d} d={d} pathLength={1} data-grain="" />
        ))}
      </g>
    </svg>
  );
}
