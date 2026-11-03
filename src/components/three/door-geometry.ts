import * as THREE from "three";

// Door dimensions in metres — modelled on JSF's painted arched entrance:
// a sage-green double door in a stone surround, each leaf with a fielded bottom panel
// and a glazed upper light divided by muntins that curve into an inner arch.
export const W = 1.6; // clear opening width
export const H = 2.0; // height to the spring line of the arch
export const R = W / 2; // semicircular head
export const F = 0.1; // frame width
export const S = 0.12; // stone surround width
export const T = 0.07; // leaf thickness
export const TOTAL_H = H + R + F + S;
export const TOTAL_W = W + 2 * (F + S);
export const CENTER_Y = TOTAL_H / 2;
export const GAP = 0.005;

/** U-shaped arched band (no sill) between radii r0 and r1, centred on x = 0. Jambs sit at x = ±r. */
export function archBand(r0: number, r1: number) {
  const s = new THREE.Shape();
  s.moveTo(-r1, 0);
  s.lineTo(-r0, 0);
  s.lineTo(-r0, H);
  s.absarc(0, H, r0, Math.PI, 0, true);
  s.lineTo(r0, 0);
  s.lineTo(r1, 0);
  s.lineTo(r1, H);
  s.absarc(0, H, r1, 0, Math.PI, false);
  s.lineTo(-r1, 0);
  return s;
}

/** Wall with an arched opening matching the surround's outer edge. */
export function wallShape(halfWidth = 24, height = 16) {
  const o = R + F + S;
  const s = new THREE.Shape();
  s.moveTo(-halfWidth, 0);
  s.lineTo(-o, 0);
  s.lineTo(-o, H);
  s.absarc(0, H, o, Math.PI, 0, true);
  s.lineTo(o, 0);
  s.lineTo(halfWidth, 0);
  s.lineTo(halfWidth, height);
  s.lineTo(-halfWidth, height);
  s.lineTo(-halfWidth, 0);
  return s;
}

export type Rect = { x0: number; x1: number; y0: number; y1: number };

/**
 * One leaf in hinge-local coordinates: hinge at x = 0, meeting stile at x ≈ W/2.
 * Returns the outline (with the glazed light cut out), the glass outline, the fielded
 * bottom panel, and the muntin layout.
 */
export function leafLayout() {
  const w = W / 2 - GAP;
  const r = R - GAP;
  const cx = W / 2;
  const yArc = (x: number, rad: number) => H + Math.sqrt(Math.max(0, rad * rad - (x - cx) ** 2));

  const leaf = new THREE.Shape();
  leaf.moveTo(0, GAP);
  leaf.lineTo(w, GAP);
  leaf.lineTo(w, yArc(w, r));
  const N = 48;
  for (let i = 1; i <= N; i++) {
    const x = w * (1 - i / N);
    leaf.lineTo(x, yArc(x, r));
  }
  leaf.lineTo(0, GAP);

  // Glazed light: from the lock rail up into the arch, following a stile's width inside the head.
  const x0 = 0.11;
  const x1 = w - 0.085;
  const glassBottom = 0.82;
  const glassR = r - 0.1;
  const outline = [new THREE.Vector2(x0, glassBottom), new THREE.Vector2(x1, glassBottom)];
  for (let i = 0; i <= N; i++) {
    const x = x1 - ((x1 - x0) * i) / N;
    outline.push(new THREE.Vector2(x, yArc(x, glassR)));
  }
  leaf.holes.push(new THREE.Path(outline));
  const glass = new THREE.Shape(outline);

  // Fielded panel below the lock rail.
  const panel: Rect = { x0, x1, y0: 0.14, y1: 0.7 };

  // Muntins: one vertical bar, three rails (the top one on the spring line), and an
  // inner arch springing from the vertical bar towards the meeting stile.
  const xm = (x0 + x1) / 2;
  const rails = [1, 2, 3].map((i) => glassBottom + (i * (H - glassBottom)) / 3);
  const arcR = cx - xm;
  const arcStart = Math.acos((x1 - cx) / arcR);
  const muntins = {
    x0,
    x1,
    xm,
    y0: glassBottom,
    rails,
    arc: { cx, cy: H, radius: arcR, start: arcStart, length: Math.PI - arcStart },
  };

  return { leaf, glass, panel, muntins, width: w };
}
