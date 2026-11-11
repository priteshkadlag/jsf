/** Line drawing of the arched double door from the JSF logo. Paths use pathLength=1 so they can be "drawn". */
export default function BrandMark({ className = "" }: { className?: string }) {
  const paths = [
    // Arch (outer + inner) and the half-sun fanlight
    "M50 58 A50 50 0 0 1 150 58",
    "M58 58 A42 42 0 0 1 142 58",
    "M90 58 A10 10 0 0 1 110 58",
    "M90.8 54.2 L64.9 43.5",
    "M92.9 50.9 L73.1 31.1",
    "M96.2 48.8 L85.5 22.9",
    "M100 48 L100 20",
    "M103.8 48.8 L114.5 22.9",
    "M107.1 50.9 L126.9 31.1",
    "M109.2 54.2 L135.1 43.5",
    // Transom bar, door frame and centre split
    "M44 58 H156 V64 H44 Z",
    "M48 64 V194 H152 V64",
    "M100 64 V194",
    // Arched upper panels, lower panels and handles
    "M58 140 V88 A17 17 0 0 1 92 88 V140 Z",
    "M108 140 V88 A17 17 0 0 1 142 88 V140 Z",
    "M58 150 H92 V186 H58 Z",
    "M108 150 H142 V186 H108 Z",
    "M95 124 V146",
    "M105 124 V146",
  ];
  return (
    <svg viewBox="0 0 200 200" fill="none" aria-hidden="true" className={className}>
      <g stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        {paths.map((d) => (
          <path key={d} d={d} pathLength={1} data-grain="" />
        ))}
      </g>
    </svg>
  );
}
