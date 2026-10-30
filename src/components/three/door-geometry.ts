import * as THREE from "three";

// Door dimensions in metres — a typical Goan arched entrance.
export const W = 1.6; // clear opening width
export const H = 1.9; // height to the spring line of the arch
export const R = W / 2; // semicircular head
export const F = 0.14; // frame (chaukat) width
export const T = 0.07; // leaf thickness
export const TOTAL_H = H + R + F;
export const TOTAL_W = W + 2 * F;
export const CENTER_Y = TOTAL_H / 2;
export const GAP = 0.006;

/** Mulberry32 — deterministic noise so the grain looks identical on every visit. */
function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Paints straight-grain teak onto a canvas: warm base, wavering dark/light fibres, faint figure. */
export function createWoodTexture(base: string, seed: number) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 1024;
  const g = canvas.getContext("2d")!;
  const rand = rng(seed);

  g.fillStyle = base;
  g.fillRect(0, 0, canvas.width, canvas.height);

  // Broad tonal bands
  for (let i = 0; i < 14; i++) {
    const x = rand() * 512;
    const w = 20 + rand() * 70;
    const grad = g.createLinearGradient(x - w, 0, x + w, 0);
    const tone = rand() > 0.5 ? "255,220,180" : "40,18,6";
    grad.addColorStop(0, `rgba(${tone},0)`);
    grad.addColorStop(0.5, `rgba(${tone},${0.04 + rand() * 0.07})`);
    grad.addColorStop(1, `rgba(${tone},0)`);
    g.fillStyle = grad;
    g.fillRect(x - w, 0, w * 2, 1024);
  }

  // Fibres
  for (let i = 0; i < 260; i++) {
    const x0 = rand() * 512;
    const amp = 1.5 + rand() * 9;
    const freq = 0.002 + rand() * 0.008;
    const phase = rand() * Math.PI * 2;
    const dark = rand() > 0.3;
    g.strokeStyle = dark ? `rgba(38,16,4,${0.05 + rand() * 0.2})` : `rgba(255,214,168,${0.03 + rand() * 0.08})`;
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

/**
 * One leaf in hinge-local coordinates: hinge at x = 0, meeting stile at x ≈ W/2.
 * The head follows the arch; a quarter-fan fanlight is cut out of the top.
 */
export function leafShapes() {
  const w = W / 2 - GAP;
  const r = R - GAP;
  const cx = W / 2;
  const N = 48;
  const yOuter = (x: number) => H + Math.sqrt(Math.max(0, r * r - (x - cx) ** 2));

  const leaf = new THREE.Shape();
  leaf.moveTo(0, GAP);
  leaf.lineTo(w, GAP);
  leaf.lineTo(w, yOuter(w));
  for (let i = 1; i <= N; i++) {
    const x = w * (1 - i / N);
    leaf.lineTo(x, yOuter(x));
  }
  leaf.lineTo(0, GAP);

  const ri = r - 0.11;
  const yb = H + 0.06;
  const xr = w - 0.07;
  const xl = cx - Math.sqrt(ri * ri - (yb - H) ** 2);
  const yInner = (x: number) => H + Math.sqrt(Math.max(0, ri * ri - (x - cx) ** 2));

  const fan = new THREE.Shape();
  fan.moveTo(xr, yb);
  fan.lineTo(xr, yInner(xr));
  for (let i = 1; i <= N; i++) {
    const x = xr + (xl - xr) * (i / N);
    fan.lineTo(x, yInner(x));
  }
  fan.lineTo(xl, yb);
  fan.lineTo(xr, yb);

  leaf.holes.push(new THREE.Path(fan.getPoints()));

  return { leaf, fan, width: w, fanRadius: ri, fanCenter: new THREE.Vector2(cx, H) };
}
