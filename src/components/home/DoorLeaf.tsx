import { useId } from "react";

/**
 * One leaf of the hero's sage-green arched double door, drawn as vector so it stays crisp at any
 * zoom. Coordinates are door-photo pixels for the LEFT leaf (155.5 × 520, the meeting stile on the
 * right); the right leaf is the same drawing mirrored. The glass is genuinely transparent, so the
 * interior photo behind the door shows through it.
 */
const W = 155.5;
const H = 520;

/** Arch centre (on the meeting line) and the radii of the door, glazing and inner glazing bar. */
const CX = W;
const CY = 160;
const R_DOOR = W;
const R_GLASS = 131.5;
const R_INNER = 77.5;

/** Stiles, rails and the lower raised panel. */
const GLASS_L = CX - R_GLASS; // inside edge of the outer stile (24)
const GLASS_R = 134; // inside edge of the meeting stile
const GLASS_BOTTOM = 372;
const PANEL = { x: 23, y: 394.5, w: 111, h: 80 };
const BEVEL = 7;

const GLASS_TOP_AT_STILE = CY - Math.sqrt(R_GLASS ** 2 - (CX - GLASS_R) ** 2);
const INNER_TOP_AT_STILE = CY - Math.sqrt(R_INNER ** 2 - (CX - GLASS_R) ** 2);
const MUNTIN_X = CX - R_INNER;
const ROWS = [CY, 237, 310];
/** The radial bar in the fanlight, 40° above horizontal. */
const RAY = (r: number) => {
  const a = (40 * Math.PI) / 180;
  return [CX - r * Math.cos(a), CY - r * Math.sin(a)] as const;
};

const OUTLINE = `M0 ${H}V${R_DOOR}A${R_DOOR} ${R_DOOR} 0 0 1 ${W} 0V${H}Z`;
const GLASS = `M${GLASS_L} ${GLASS_BOTTOM}V${CY}A${R_GLASS} ${R_GLASS} 0 0 1 ${GLASS_R} ${GLASS_TOP_AT_STILE}V${GLASS_BOTTOM}Z`;

const SAGE = "#748262";
const SAGE_LIGHT = "#8c9a7b";
const SAGE_DARK = "#525d43";

export default function DoorLeaf({ side }: { side: "left" | "right" }) {
  const uid = useId().replace(/:/g, "");
  const id = (name: string) => `${name}-${uid}`;
  const [rx1, ry1] = RAY(R_INNER);
  const [rx2, ry2] = RAY(R_GLASS + 2);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      className="absolute inset-0 h-full w-full overflow-visible"
    >
      <defs>
        {/* Light falls from the upper left; the meeting edge sits slightly in shadow. */}
        <linearGradient id={id("paint")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={SAGE_LIGHT} />
          <stop offset="0.55" stopColor={SAGE} />
          <stop offset="1" stopColor={SAGE_DARK} />
        </linearGradient>
        <linearGradient id={id("glass")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.16" />
          <stop offset="0.35" stopColor="#fff" stopOpacity="0.02" />
          <stop offset="0.48" stopColor="#fff" stopOpacity="0.12" />
          <stop offset="0.56" stopColor="#fff" stopOpacity="0.02" />
          <stop offset="1" stopColor="#dfe8d6" stopOpacity="0.08" />
        </linearGradient>
        <linearGradient id={id("brass")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8f6a34" />
          <stop offset="0.4" stopColor="#e2c27f" />
          <stop offset="0.7" stopColor="#c19a55" />
          <stop offset="1" stopColor="#7d5a2a" />
        </linearGradient>
        {/* Fine vertical wood grain showing through the paint. */}
        <filter id={id("grain")} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9 0.012" numOctaves="2" seed="7" />
          <feColorMatrix values="0 0 0 0 0.18  0 0 0 0 0.2  0 0 0 0 0.12  0 0 0 1.1 -0.45" />
          {/* Keep the grain inside the painted shape (turbulence fills the whole filter region). */}
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
        <clipPath id={id("glass-clip")}>
          <path d={GLASS} />
        </clipPath>
        <clipPath id={id("leaf-clip")}>
          <path d={OUTLINE} />
        </clipPath>
      </defs>

      <g transform={side === "right" ? `translate(${W} 0) scale(-1 1)` : undefined}>
        {/* Glass: a faint sheen; the room behind shows through. */}
        <path d={GLASS} fill={`url(#${id("glass")})`} />

        {/* Glazing bars */}
        <g clipPath={`url(#${id("glass-clip")})`} stroke={SAGE} strokeWidth="5" fill="none" strokeLinecap="square">
          {ROWS.map((y) => (
            <line key={y} x1={GLASS_L} y1={y} x2={GLASS_R} y2={y} />
          ))}
          <line x1={MUNTIN_X} y1={CY} x2={MUNTIN_X} y2={GLASS_BOTTOM} />
          <path d={`M${MUNTIN_X} ${CY}A${R_INNER} ${R_INNER} 0 0 1 ${GLASS_R} ${INNER_TOP_AT_STILE}`} />
          <line x1={rx1} y1={ry1} x2={rx2} y2={ry2} />
        </g>
        {/* Highlight along the top/left of each bar */}
        <g clipPath={`url(#${id("glass-clip")})`} stroke={SAGE_LIGHT} strokeWidth="1" fill="none" opacity="0.8">
          {ROWS.map((y) => (
            <line key={y} x1={GLASS_L} y1={y - 2} x2={GLASS_R} y2={y - 2} />
          ))}
          <line x1={MUNTIN_X - 2} y1={CY} x2={MUNTIN_X - 2} y2={GLASS_BOTTOM} />
          <path d={`M${MUNTIN_X - 2} ${CY}A${R_INNER + 2} ${R_INNER + 2} 0 0 1 ${GLASS_R} ${CY - Math.sqrt((R_INNER + 2) ** 2 - (CX - GLASS_R) ** 2)}`} />
        </g>

        {/* Frame: the leaf with the glazing cut out */}
        <path d={`${OUTLINE}${GLASS}`} fillRule="evenodd" fill={`url(#${id("paint")})`} />
        <path d={`${OUTLINE}${GLASS}`} fillRule="evenodd" filter={`url(#${id("grain")})`} opacity="0.55" />
        {/* Moulding around the glass: shadowed putty line plus a lit bead */}
        <path d={GLASS} fill="none" stroke="rgba(28,34,18,0.45)" strokeWidth="2.2" />
        <path d={GLASS} fill="none" stroke={SAGE_LIGHT} strokeWidth="0.8" transform="translate(-1.6 -1.6)" opacity="0.7" clipPath={`url(#${id("leaf-clip")})`} />

        {/* Raised lower panel: shadowed bevel bottom/right, lit bevel top/left, flat field */}
        <rect x={PANEL.x} y={PANEL.y} width={PANEL.w} height={PANEL.h} fill={SAGE_DARK} opacity="0.55" />
        <path
          d={`M${PANEL.x} ${PANEL.y}H${PANEL.x + PANEL.w}L${PANEL.x + PANEL.w - BEVEL} ${PANEL.y + BEVEL}H${PANEL.x + BEVEL}V${PANEL.y + PANEL.h - BEVEL}L${PANEL.x} ${PANEL.y + PANEL.h}Z`}
          fill={SAGE_LIGHT}
          opacity="0.75"
        />
        <rect x={PANEL.x + BEVEL} y={PANEL.y + BEVEL} width={PANEL.w - BEVEL * 2} height={PANEL.h - BEVEL * 2} fill={SAGE} />
        <rect
          x={PANEL.x + BEVEL}
          y={PANEL.y + BEVEL}
          width={PANEL.w - BEVEL * 2}
          height={PANEL.h - BEVEL * 2}
          filter={`url(#${id("grain")})`}
          opacity="0.5"
        />
        <rect x={PANEL.x} y={PANEL.y} width={PANEL.w} height={PANEL.h} fill="none" stroke="rgba(28,34,18,0.45)" strokeWidth="1.2" />

        {/* Outer edge and meeting edge: a thin dark line reads as the leaf's thickness */}
        <path d={OUTLINE} fill="none" stroke="rgba(28,34,18,0.5)" strokeWidth="1.4" />
        <rect x={W - 1.6} y="0" width="1.6" height={H} fill="rgba(20,24,10,0.6)" />

        {/* Long brass pull with two stand-offs */}
        <g>
          <rect x="145" y="224" width="5" height="106" rx="2.5" fill="rgba(20,24,10,0.22)" />
          <rect x="141" y="226" width="5" height="4" rx="1" fill="#7d5a2a" />
          <rect x="141" y="318" width="5" height="4" rx="1" fill="#7d5a2a" />
          <rect x="142.3" y="220" width="4.6" height="108" rx="2.3" fill={`url(#${id("brass")})`} />
          <rect x="143.4" y="222" width="0.9" height="104" rx="0.45" fill="#fff4d6" opacity="0.6" />
        </g>
      </g>
    </svg>
  );
}
