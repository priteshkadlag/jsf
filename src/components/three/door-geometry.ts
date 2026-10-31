import * as THREE from "three";

// Door dimensions in metres — modelled on JSF's carved teak entrance:
// an arched double door with a reeded head panel and four glazed, diamond-studded lights per leaf.
export const W = 1.6; // clear opening width
export const H = 2.0; // height to the spring line of the arch
export const R = W / 2; // semicircular head
export const F = 0.12; // frame width
export const T = 0.07; // leaf thickness
export const TOTAL_H = H + R + F;
export const TOTAL_W = W + 2 * F;
export const CENTER_Y = TOTAL_H / 2;
export const GAP = 0.005;

/** Mulberry32 — deterministic noise so the grain looks identical on every visit. */
function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Paints straight-grain teak onto a canvas: honey base, wavering dark/light fibres. */
export function createWoodTexture(base: string, seed: number) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 1024;
  const g = canvas.getContext("2d")!;
  const rand = rng(seed);

  g.fillStyle = base;
  g.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 14; i++) {
    const x = rand() * 512;
    const w = 20 + rand() * 70;
    const grad = g.createLinearGradient(x - w, 0, x + w, 0);
    const tone = rand() > 0.5 ? "255,226,170" : "70,32,6";
    grad.addColorStop(0, `rgba(${tone},0)`);
    grad.addColorStop(0.5, `rgba(${tone},${0.05 + rand() * 0.07})`);
    grad.addColorStop(1, `rgba(${tone},0)`);
    g.fillStyle = grad;
    g.fillRect(x - w, 0, w * 2, 1024);
  }

  for (let i = 0; i < 240; i++) {
    const x0 = rand() * 512;
    const amp = 1.5 + rand() * 8;
    const freq = 0.002 + rand() * 0.008;
    const phase = rand() * Math.PI * 2;
    const dark = rand() > 0.35;
    g.strokeStyle = dark ? `rgba(80,36,6,${0.05 + rand() * 0.16})` : `rgba(255,224,170,${0.04 + rand() * 0.08})`;
    g.lineWidth = 0.4 + rand() * 2.2;
    g.beginPath();
    for (let y = 0; y <= 1024; y += 8) {
      const x = x0 + Math.sin(y * freq + phase) * amp + Math.sin(y * freq * 3.3 + phase * 1.7) * amp * 0.25;
      if (y === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  // Extrude UVs are in metres: one tile covers 0.9 m × 2.4 m.
  tex.repeat.set(1 / 0.9, 1 / 2.4);
  return tex;
}

/** U-shaped arched frame (no sill), centred on x = 0. */
export function frameShape() {
  const s = new THREE.Shape();
  s.moveTo(-W / 2 - F, 0);
  s.lineTo(-W / 2, 0);
  s.lineTo(-W / 2, H);
  s.absarc(0, H, R, Math.PI, 0, true);
  s.lineTo(W / 2, 0);
  s.lineTo(W / 2 + F, 0);
  s.lineTo(W / 2 + F, H);
  s.absarc(0, H, R + F, 0, Math.PI, false);
  s.lineTo(-W / 2 - F, 0);
  return s;
}

/** Wall with an arched opening matching the frame's outer edge. */
export function wallShape(halfWidth = 24, height = 16) {
  const s = new THREE.Shape();
  s.moveTo(-halfWidth, 0);
  s.lineTo(-W / 2 - F, 0);
  s.lineTo(-W / 2 - F, H);
  s.absarc(0, H, R + F, Math.PI, 0, true);
  s.lineTo(W / 2 + F, 0);
  s.lineTo(halfWidth, 0);
  s.lineTo(halfWidth, height);
  s.lineTo(-halfWidth, height);
  s.lineTo(-halfWidth, 0);
  return s;
}

export type Rect = { x0: number; x1: number; y0: number; y1: number };

/**
 * One leaf in hinge-local coordinates: hinge at x = 0, meeting stile at x ≈ W/2.
 * Returns the outline (with four glazed openings cut out), the glass rectangles,
 * and the reed positions for the arched head panel.
 */
export function leafLayout() {
  const w = W / 2 - GAP;
  const r = R - GAP;
  const cx = W / 2;
  const yOuter = (x: number) => H + Math.sqrt(Math.max(0, r * r - (x - cx) ** 2));

  const leaf = new THREE.Shape();
  leaf.moveTo(0, GAP);
  leaf.lineTo(w, GAP);
  leaf.lineTo(w, yOuter(w));
  const N = 48;
  for (let i = 1; i <= N; i++) {
    const x = w * (1 - i / N);
    leaf.lineTo(x, yOuter(x));
  }
  leaf.lineTo(0, GAP);

  // Four glazed lights between the bottom rail and the spring line.
  const x0 = 0.13;
  const x1 = w - 0.11;
  const paneH = 0.4;
  const rail = 0.07;
  const panes: Rect[] = Array.from({ length: 4 }, (_, i) => {
    const y0 = 0.2 + i * (paneH + rail);
    return { x0, x1, y0, y1: y0 + paneH };
  });
  panes.forEach(({ x0, x1, y0, y1 }) => {
    const hole = new THREE.Path();
    hole.moveTo(x0, y0);
    hole.lineTo(x1, y0);
    hole.lineTo(x1, y1);
    hole.lineTo(x0, y1);
    hole.lineTo(x0, y0);
    leaf.holes.push(hole);
  });

  // Reeded head panel: vertical reeds rising from above the top light to just inside the arch.
  const reedBase = panes[3].y1 + 0.08;
  const inner = r - 0.1;
  const pitch = 0.03;
  const count = Math.floor((x1 - x0) / pitch);
  const reeds = Array.from({ length: count }, (_, i) => {
    const x = x0 + pitch / 2 + i * pitch;
    const top = H + Math.sqrt(Math.max(0, inner * inner - (x - cx) ** 2));
    return { x, y0: reedBase, y1: Math.max(reedBase + 0.02, top) };
  });

  return { leaf, panes, reeds, width: w };
}
