import * as THREE from "three";
import { F, H, R, S } from "@/components/three/door-geometry";

// The courtyard the door sits in: sunlit plaster, a tiled runner, iron candle sconces
// and a pair of potted areca palms. Everything is painted procedurally so the scene
// needs no image downloads.

export const IVORY = "#e8e3db";
export const SCONCE = { x: R + F + S + 0.42, y: 2.05 };
export const PALM_X = R + F + S + 0.52;
export const RUNNER = { w: 1.92, d: 2.56, tile: 0.32 };

/** Mulberry32 — deterministic noise so the scene looks identical on every visit. */
function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeCanvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d")!] as const;
}

function toTexture(c: HTMLCanvasElement, repeat = false) {
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  if (repeat) tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/** A palm frond silhouette: leaflets fanning off a drooping midrib. Angles are canvas-space (+y down). */
function frond(g: CanvasRenderingContext2D, x: number, y: number, angle: number, len: number, rand: () => number) {
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  const at = (t: number) => [x + dx * len * t, y + dy * len * t + 0.25 * len * t * t] as const;

  g.lineWidth = Math.max(len * 0.012, 0.8);
  g.beginPath();
  g.moveTo(x, y);
  for (let i = 1; i <= 24; i++) g.lineTo(...at(i / 24));
  g.stroke();

  const w = Math.max(len * 0.022, 0.9);
  for (let i = 3; i <= 24; i++) {
    const t = i / 24;
    const [px, py] = at(t);
    const [qx, qy] = at(t - 0.01);
    const a = Math.atan2(py - qy, px - qx);
    const l = len * (0.05 + 0.3 * Math.sin(Math.PI * t));
    for (const s of [-1, 1]) {
      const la = a + s * (0.75 + rand() * 0.2);
      g.beginPath();
      g.ellipse(px + (Math.cos(la) * l) / 2, py + (Math.sin(la) * l) / 2, l / 2, w, la, 0, Math.PI * 2);
      g.fill();
    }
  }
}

/**
 * Lime-plastered wall, 16 m × 6 m centred on the door: mottled plaster, dappled palm
 * shadows from the low sun, the surround's drop shadow and the glow of the sconces.
 * It fades to the page's flat ivory at its edges so clamping blends seamlessly.
 *
 * This runs on the main thread while the page loads, so every step is kept cheap:
 * shadows are painted at quarter resolution and upscaled (which also softens them),
 * and the grain is a single pass over the pixel buffer.
 */
export function createWallTexture() {
  const K = 128; // pixels per metre
  const WW = 16;
  const WH = 6;
  const [c, g] = makeCanvas(WW * K, WH * K);
  const rand = rng(11);
  const px = (x: number) => (x + WW / 2) * K;
  const py = (y: number) => (WH - y) * K;

  g.fillStyle = IVORY;
  g.fillRect(0, 0, c.width, c.height);

  // Plaster: broad mottling.
  for (let i = 0; i < 30; i++) {
    const x = rand() * c.width;
    const y = rand() * c.height;
    const r = (0.4 + rand() * 1.1) * K;
    const tone = rand() > 0.5 ? "255,250,240" : "150,120,90";
    const grad = g.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, `rgba(${tone},0.05)`);
    grad.addColorStop(1, `rgba(${tone},0)`);
    g.fillStyle = grad;
    g.fillRect(x - r, y - r, r * 2, r * 2);
  }

  // Leaf shadows: trees beyond the frame, plus the potted palms thrown down and to the right.
  const q = 4;
  const sK = K / q;
  const spx = (x: number) => px(x) / q;
  const spy = (y: number) => py(y) / q;
  const [sc, sg] = makeCanvas(c.width / q, c.height / q);
  sg.fillStyle = sg.strokeStyle = "#000";
  for (let i = 0; i < 9; i++) {
    frond(sg, spx(-7.5 + rand() * 15), spy(2.8 + rand() * 3), 0.3 + rand() * 0.5, (1.4 + rand() * 1.2) * sK, rand);
  }
  for (const side of [-1, 1]) {
    for (let j = 0; j < 7; j++) {
      frond(sg, spx(side * PALM_X + 0.35), spy(0.9), -Math.PI / 2 + (j - 3) * 0.38 + rand() * 0.2, (0.6 + rand() * 0.3) * sK, rand);
    }
  }
  sg.globalCompositeOperation = "destination-in";
  const fade = sg.createRadialGradient(spx(0), spy(2), 0, spx(0), spy(2), 7.5 * sK);
  fade.addColorStop(0.55, "#000");
  fade.addColorStop(1, "rgba(0,0,0,0)");
  sg.fillStyle = fade;
  sg.fillRect(0, 0, sc.width, sc.height);
  sg.globalCompositeOperation = "source-in";
  sg.fillStyle = "rgb(92,70,48)";
  sg.fillRect(0, 0, sc.width, sc.height);

  g.save();
  g.globalAlpha = 0.14;
  g.imageSmoothingQuality = "high";
  g.drawImage(sc, 0, 0, c.width, c.height);
  g.restore();

  // Soft drop shadow of the stone surround; only the blurred shadow lands on the canvas.
  const o = (R + F + S) * K;
  g.save();
  g.shadowColor = "rgba(80,58,38,0.24)";
  g.shadowBlur = 0.08 * K;
  g.shadowOffsetX = c.width + 0.06 * K;
  g.shadowOffsetY = 0.05 * K;
  g.beginPath();
  g.moveTo(px(0) - o - c.width, py(0));
  g.lineTo(px(0) - o - c.width, py(H));
  g.arc(px(0) - c.width, py(H), o, Math.PI, Math.PI * 2);
  g.lineTo(px(0) + o - c.width, py(0));
  g.fill();
  g.restore();

  // Candlelight pooling on the plaster around each sconce.
  for (const s of [-1, 1]) {
    const x = px(s * SCONCE.x);
    const y = py(SCONCE.y + 0.12);
    const glow = g.createRadialGradient(x, y, 0, x, y, 0.9 * K);
    glow.addColorStop(0, "rgba(255,238,205,0.85)");
    glow.addColorStop(0.25, "rgba(255,236,206,0.45)");
    glow.addColorStop(1, "rgba(255,236,206,0)");
    g.fillStyle = glow;
    g.fillRect(x - K, y - K, 2 * K, 2 * K);
    const warm = g.createRadialGradient(x, y, 0, x, y, 0.3 * K);
    warm.addColorStop(0, "rgba(255,200,130,0.28)");
    warm.addColorStop(1, "rgba(255,200,130,0)");
    g.fillStyle = warm;
    g.fillRect(x - K, y - K, 2 * K, 2 * K);
  }

  // Fade back to flat ivory at the left, right and top edges.
  const edge = 0.8 * K;
  const fades: [number, number, number, number][] = [
    [0, 0, edge, 0],
    [c.width, 0, c.width - edge, 0],
    [0, 0, 0, edge],
  ];
  for (const [x0, y0, x1, y1] of fades) {
    const grad = g.createLinearGradient(x0, y0, x1, y1);
    grad.addColorStop(0, IVORY);
    grad.addColorStop(1, "rgba(232,227,219,0)");
    g.fillStyle = grad;
    g.fillRect(Math.min(x0, x1), Math.min(y0, y1), x0 === x1 ? c.width : edge, y0 === y1 ? c.height : edge);
  }

  // Plaster grain in one pass, tapering to nothing in the edge band so the clamped border stays flat ivory.
  const img = g.getImageData(0, 0, c.width, c.height);
  const d = img.data;
  for (let y = 0; y < c.height; y++) {
    const wy = Math.min(1, y / edge);
    for (let x = 0; x < c.width; x++) {
      const amp = 9 * Math.min(wy, x / edge, (c.width - 1 - x) / edge, 1);
      if (amp <= 0) continue;
      const n = (rand() - 0.5) * amp;
      const i = (y * c.width + x) * 4;
      d[i] += n;
      d[i + 1] += n;
      d[i + 2] += n;
    }
  }
  g.putImageData(img, 0, 0);

  // Ambient occlusion where the wall meets the floor.
  const base = g.createLinearGradient(0, py(0), 0, py(0.4));
  base.addColorStop(0, "rgba(105,80,58,0.16)");
  base.addColorStop(1, "rgba(105,80,58,0)");
  g.fillStyle = base;
  g.fillRect(0, py(0.4), c.width, 0.4 * K);

  // ShapeGeometry UVs are in metres; map x ∈ [-8, 8], y ∈ [0, 6] onto the canvas.
  const tex = toTexture(c);
  tex.repeat.set(1 / WW, 1 / WH);
  tex.offset.set(0.5, 0);
  return tex;
}

/** Honed limestone floor: 0.6 m slabs with faint veining. One canvas holds a 2 × 2 block. */
export function createFloorTexture() {
  const T = 256;
  const [c, g] = makeCanvas(T * 2, T * 2);
  const rand = rng(5);
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 2; j++) {
      const d = rand() * 8 - 4;
      g.fillStyle = `rgb(${222 + d},${216 + d},${206 + d})`;
      g.fillRect(i * T, j * T, T, T);
      g.strokeStyle = "rgba(170,150,130,0.14)";
      g.lineWidth = 1;
      for (let v = 0; v < 3; v++) {
        g.beginPath();
        g.moveTo(i * T + rand() * T, j * T);
        g.bezierCurveTo(i * T + rand() * T, j * T + T * 0.3, i * T + rand() * T, j * T + T * 0.7, i * T + rand() * T, j * T + T);
        g.stroke();
      }
    }
  }
  g.fillStyle = "rgba(150,128,105,0.45)";
  for (const p of [0, T]) {
    g.fillRect(p, 0, 2, c.height);
    g.fillRect(0, p, c.width, 2);
  }
  return toTexture(c, true);
}

/** One encaustic cement tile: terracotta quarter-rounds at the corners and a sage flower at the centre. */
export function createTileTexture() {
  const T = 256;
  const [c, g] = makeCanvas(T, T);
  const rand = rng(23);
  const terracotta = "#c4825a";
  const sage = "#8a9a83";
  const cream = "#ecdfc6";

  g.fillStyle = cream;
  g.fillRect(0, 0, T, T);

  for (const [x, y] of [[0, 0], [T, 0], [0, T], [T, T]]) {
    const ring = (r: number, color: string) => {
      g.fillStyle = color;
      g.beginPath();
      g.arc(x, y, r, 0, Math.PI * 2);
      g.fill();
    };
    ring(74, terracotta);
    ring(56, cream);
    ring(40, sage);
    ring(16, terracotta);
  }

  const m = T / 2;
  const petal = (a: number, dist: number, rx: number, ry: number, color: string) => {
    g.fillStyle = color;
    g.beginPath();
    g.ellipse(m + Math.cos(a) * dist, m + Math.sin(a) * dist, rx, ry, a, 0, Math.PI * 2);
    g.fill();
  };
  for (let k = 0; k < 4; k++) {
    const a = (k * Math.PI) / 2;
    petal(a, 40, 38, 19, sage);
    petal(a + Math.PI / 4, 52, 22, 9, terracotta);
  }
  g.fillStyle = terracotta;
  g.beginPath();
  g.arc(m, m, 16, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = cream;
  g.beginPath();
  g.arc(m, m, 7, 0, Math.PI * 2);
  g.fill();

  // Wear and a fine grout line.
  for (let i = 0; i < 1800; i++) {
    g.fillStyle = `rgba(255,248,232,${0.05 + rand() * 0.12})`;
    g.fillRect(rand() * T, rand() * T, 1 + rand() * 2, 1 + rand() * 2);
  }
  g.strokeStyle = "rgba(110,88,66,0.4)";
  g.lineWidth = 3;
  g.strokeRect(0, 0, T, T);

  const tex = toTexture(c, true);
  tex.repeat.set(RUNNER.w / RUNNER.tile, RUNNER.d / RUNNER.tile);
  return tex;
}

/** Soft contact shadow for the base of the wall: dark at the top edge of the canvas, clear at the bottom. */
export function createContactShadowTexture() {
  const [c, g] = makeCanvas(4, 128);
  const grad = g.createLinearGradient(0, 0, 0, 128);
  grad.addColorStop(0, "rgba(70,50,32,0.3)");
  grad.addColorStop(1, "rgba(70,50,32,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 4, 128);
  return toTexture(c);
}

/** Round blob shadow for the pots. */
export function createBlobTexture() {
  const [c, g] = makeCanvas(128, 128);
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, "rgba(60,40,25,0.5)");
  grad.addColorStop(1, "rgba(60,40,25,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  return toTexture(c);
}

/** Bellied terracotta planter with a rolled rim, 0.53 m tall. */
export function createPotGeometry() {
  const profile: [number, number][] = [
    [0.001, 0],
    [0.12, 0],
    [0.15, 0.02],
    [0.2, 0.1],
    [0.225, 0.2],
    [0.225, 0.28],
    [0.2, 0.37],
    [0.165, 0.43],
    [0.16, 0.45],
    [0.185, 0.47],
    [0.192, 0.5],
    [0.185, 0.525],
    [0.165, 0.525],
    [0.155, 0.49],
  ];
  return new THREE.LatheGeometry(
    profile.map(([r, y]) => new THREE.Vector2(r, y)),
    48,
  );
}

/**
 * Areca palm: a clump of canes, each carrying arching fronds of narrow leaflets.
 * Built as one vertex-coloured triangle soup so a whole palm is a single draw call.
 */
export function createPalmGeometry(seed: number) {
  const rand = rng(seed);
  const pos: number[] = [];
  const col: number[] = [];
  const up = new THREE.Vector3(0, 1, 0);
  const color = new THREE.Color();

  const tri = (a: THREE.Vector3, b: THREE.Vector3, d: THREE.Vector3, c: THREE.Color) => {
    pos.push(a.x, a.y, a.z, b.x, b.y, b.z, d.x, d.y, d.z);
    for (let k = 0; k < 3; k++) col.push(c.r, c.g, c.b);
  };
  const quad = (a: THREE.Vector3, b: THREE.Vector3, d: THREE.Vector3, e: THREE.Vector3, c: THREE.Color) => {
    tri(a, b, d, c);
    tri(a, d, e, c);
  };

  const canes = Array.from({ length: 5 }, () => {
    const a = rand() * Math.PI * 2;
    const r = rand() * 0.06;
    return new THREE.Vector3(Math.cos(a) * r, 0.2 + rand() * 0.3, Math.sin(a) * r);
  });
  const caneColor = new THREE.Color("#8d8a4a");
  for (const top of canes) {
    for (const [sx, sz] of [[0.012, 0], [0, 0.012]]) {
      quad(
        new THREE.Vector3(top.x - sx, 0, top.z - sz),
        new THREE.Vector3(top.x + sx, 0, top.z + sz),
        new THREE.Vector3(top.x + sx, top.y, top.z + sz),
        new THREE.Vector3(top.x - sx, top.y, top.z - sz),
        caneColor,
      );
    }
  }

  const fronds = 16;
  const stemColor = new THREE.Color("#6f8038");
  for (let f = 0; f < fronds; f++) {
    const base = canes[f % canes.length];
    const az = (f / fronds) * Math.PI * 2 + rand() * 0.4;
    const elev = 0.55 + rand() * 0.75;
    const len = 0.7 + rand() * 0.45;
    const droop = 0.35 + rand() * 0.3;
    const h = new THREE.Vector3(Math.cos(az), 0, Math.sin(az));
    const point = (t: number) =>
      base
        .clone()
        .addScaledVector(h, len * t * Math.cos(elev))
        .addScaledVector(up, len * t * Math.sin(elev) - droop * len * t * t);
    const hue = 0.22 + rand() * 0.05;

    const N = 22;
    let prev = point(0);
    for (let i = 1; i <= N; i++) {
      const t = i / N;
      const p = point(t);
      const tan = p.clone().sub(prev).normalize();
      const side = new THREE.Vector3().crossVectors(tan, up).normalize();

      const sw = 0.008 * (1 - t * 0.7);
      quad(
        prev.clone().addScaledVector(side, -sw),
        prev.clone().addScaledVector(side, sw),
        p.clone().addScaledVector(side, sw),
        p.clone().addScaledVector(side, -sw),
        stemColor,
      );

      if (t > 0.12) {
        for (const s of [-1, 1]) {
          const l = 0.32 * Math.sin(Math.PI * Math.min(1, t * 1.05)) * (0.85 + rand() * 0.3) + 0.04;
          const dir = side.clone().multiplyScalar(s).addScaledVector(tan, 0.7).addScaledVector(up, -0.45).normalize();
          const wdir = tan.clone().addScaledVector(dir, -tan.dot(dir)).normalize();
          const mid = p.clone().addScaledVector(dir, l * 0.4);
          const tip = p.clone().addScaledVector(dir, l);
          color.setHSL(hue + rand() * 0.02, 0.45 + rand() * 0.15, 0.3 + t * 0.1 + rand() * 0.08);
          tri(p, mid.clone().addScaledVector(wdir, 0.022), tip, color);
          tri(p, tip, mid.clone().addScaledVector(wdir, -0.022), color);
        }
      }
      prev = p;
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  geo.computeVertexNormals();
  return geo;
}
