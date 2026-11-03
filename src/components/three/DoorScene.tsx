"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { CENTER_Y, F, H, R, S, T, TOTAL_H, TOTAL_W, W, archBand, leafLayout } from "@/components/three/door-geometry";
import Surroundings from "@/components/three/Surroundings";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Fraction of the viewport the door occupies before the scroll begins (mirrored by the CSS placeholder). */
export const DOOR_FILL_HEIGHT = 0.64;
export const DOOR_FILL_WIDTH = 0.72;

type Materials = {
  paint: THREE.MeshStandardMaterial;
  frame: THREE.MeshStandardMaterial;
  stone: THREE.MeshStandardMaterial;
  bead: THREE.MeshStandardMaterial;
  glass: THREE.MeshStandardMaterial;
  brass: THREE.MeshStandardMaterial;
};

const MUNTIN = 0.03;
const BEAD = 0.022;

function Leaf({ side, materials, groupRef }: { side: 1 | -1; materials: Materials; groupRef: RefObject<THREE.Group | null> }) {
  const { leafGeo, glassGeo, panel, muntins, width } = useMemo(() => {
    const { leaf, glass, panel, muntins, width } = leafLayout();
    const leafGeo = new THREE.ExtrudeGeometry(leaf, {
      depth: T,
      bevelEnabled: true,
      bevelThickness: 0.008,
      bevelSize: 0.008,
      bevelSegments: 2,
      curveSegments: 32,
    });
    const glassGeo = new THREE.ShapeGeometry(glass);
    return { leafGeo, glassGeo, panel, muntins, width };
  }, []);

  useEffect(
    () => () => {
      leafGeo.dispose();
      glassGeo.dispose();
    },
    [leafGeo, glassGeo],
  );

  const front = T + 0.008;
  const pw = panel.x1 - panel.x0;
  const ph = panel.y1 - panel.y0;
  const { x0, x1, xm, y0, rails, arc } = muntins;
  return (
    // Mirroring with scale.x = -1 lets both leaves share one geometry; three.js flips winding for us.
    <group ref={groupRef} position={[(-side * W) / 2, 0, -T / 2]} scale={[side, 1, 1]}>
      <mesh geometry={leafGeo} material={materials.paint} />
      <mesh geometry={glassGeo} material={materials.glass} position={[0, 0, T / 2]} />

      {/* Glazing bars: a vertical, three rails and the inner arch */}
      <mesh material={materials.paint} position={[xm, (y0 + H) / 2, T / 2]}>
        <boxGeometry args={[MUNTIN, H - y0, T * 0.7]} />
      </mesh>
      {rails.map((y) => (
        <mesh key={y} material={materials.paint} position={[(x0 + x1) / 2, y, T / 2]}>
          <boxGeometry args={[x1 - x0, MUNTIN, T * 0.7]} />
        </mesh>
      ))}
      <mesh material={materials.paint} position={[arc.cx, arc.cy, T / 2]} rotation={[0, 0, arc.start]} scale={[1, 1, 1.6]}>
        <torusGeometry args={[arc.radius, MUNTIN / 2, 8, 40, arc.length]} />
      </mesh>

      {/* Fielded bottom panel with a bead moulding, on both faces */}
      {([1, -1] as const).map((dir) => (
        <group key={dir} position={[(panel.x0 + panel.x1) / 2, (panel.y0 + panel.y1) / 2, dir === 1 ? front : -0.008]} scale={[1, 1, dir]}>
          {[-1, 1].map((s) => (
            <mesh key={`h${s}`} material={materials.paint} position={[0, s * (ph / 2 - BEAD / 2), 0.006]}>
              <boxGeometry args={[pw, BEAD, 0.012]} />
            </mesh>
          ))}
          {[-1, 1].map((s) => (
            <mesh key={`v${s}`} material={materials.paint} position={[s * (pw / 2 - BEAD / 2), 0, 0.006]}>
              <boxGeometry args={[BEAD, ph, 0.012]} />
            </mesh>
          ))}
          <mesh material={materials.paint} position={[0, 0, 0.008]}>
            <boxGeometry args={[pw - 0.1, ph - 0.1, 0.016]} />
          </mesh>
        </group>
      ))}

      {/* Long brass pull bars on both faces, set into the meeting stile */}
      {([1, -1] as const).map((dir) => (
        <group key={dir} position={[width - 0.045, 1.3, dir === 1 ? front : -0.008]} scale={[1, 1, dir]}>
          <mesh material={materials.brass} position={[0, 0, 0.035]}>
            <cylinderGeometry args={[0.011, 0.011, 0.56, 16]} />
          </mesh>
          {[-0.22, 0.22].map((dy) => (
            <mesh key={dy} material={materials.brass} position={[0, dy, 0.0175]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.007, 0.007, 0.035, 10]} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

function Doorway({ progress, onReady }: { progress: RefObject<number>; onReady?: () => void }) {
  const left = useRef<THREE.Group>(null);
  const right = useRef<THREE.Group>(null);
  const smoothed = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);

  const { materials, frameGeo, surroundGeo } = useMemo(() => {
    const materials: Materials = {
      paint: new THREE.MeshStandardMaterial({ color: "#8a9a83", roughness: 0.55 }),
      frame: new THREE.MeshStandardMaterial({ color: "#7f8f78", roughness: 0.6 }),
      stone: new THREE.MeshStandardMaterial({ color: "#efe7d9", roughness: 0.85 }),
      bead: new THREE.MeshStandardMaterial({ color: "#c9b183", roughness: 0.4, metalness: 0.3 }),
      glass: new THREE.MeshStandardMaterial({
        color: "#eef3ee",
        transparent: true,
        opacity: 0.16,
        roughness: 0.05,
        metalness: 0.1,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
      brass: new THREE.MeshStandardMaterial({ color: "#b4935a", roughness: 0.28, metalness: 0.55 }),
    };
    const frameGeo = new THREE.ExtrudeGeometry(archBand(R, R + F), { depth: 0.24, bevelEnabled: false, curveSegments: 48 });
    const surroundGeo = new THREE.ExtrudeGeometry(archBand(R + F, R + F + S), { depth: 0.05, bevelEnabled: false, curveSegments: 48 });
    return { materials, frameGeo, surroundGeo };
  }, []);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", move, { passive: true });
    // Compile every shader up front, then signal readiness once a frame has actually been drawn,
    // so the placeholder never hands over to a half-built scene.
    let id = 0;
    let cancelled = false;
    gl.compileAsync(scene, camera)
      .catch(() => {})
      .then(() => {
        if (!cancelled) id = requestAnimationFrame(() => requestAnimationFrame(() => onReady?.()));
      });
    return () => {
      cancelled = true;
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(id);
    };
  }, [onReady, gl, scene, camera]);

  useEffect(
    () => () => {
      Object.values(materials).forEach((m) => m.dispose());
      frameGeo.dispose();
      surroundGeo.dispose();
    },
    [materials, frameGeo, surroundGeo],
  );

  useFrame((_, delta) => {
    smoothed.current = THREE.MathUtils.damp(smoothed.current, progress.current ?? 0, 6, delta);
    const p = smoothed.current;

    const open = easeInOut(clamp01((p - 0.05) / 0.45));
    const angle = open * 1.92;
    if (left.current) left.current.rotation.y = angle;
    if (right.current) right.current.rotation.y = -angle;

    // Frame the door to the viewport, then dolly the camera through the opening.
    const aspect = size.width / size.height;
    const t = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
    const start = Math.max(TOTAL_H / DOOR_FILL_HEIGHT / t, TOTAL_W / DOOR_FILL_WIDTH / (t * aspect));
    const dolly = easeInOut(clamp01((p - 0.16) / 0.66));
    const z = THREE.MathUtils.lerp(start, -1, dolly);

    const sway = 1 - dolly;
    const px = THREE.MathUtils.damp(camera.position.x, pointer.current.x * 0.22 * sway, 3, delta);
    const py = CENTER_Y + pointer.current.y * 0.1 * sway;
    camera.position.set(px, THREE.MathUtils.damp(camera.position.y, py, 3, delta), z);
    camera.lookAt(px * 0.4, CENTER_Y, z - 10);
  });

  return (
    <group>
      <Surroundings />
      {/* Marble threshold */}
      <mesh position={[0, 0.012, 0.02]}>
        <boxGeometry args={[W + 2 * F + 0.1, 0.024, 0.34]} />
        <meshStandardMaterial color="#e9e1d4" roughness={0.4} />
      </mesh>
      {/* Stone surround standing proud of the wall */}
      <mesh geometry={surroundGeo} material={materials.stone} position={[0, 0, 0.12]} />
      <mesh geometry={frameGeo} material={materials.frame} position={[0, 0, -0.12]} />
      {/* Pale gilded bead tracing the frame */}
      <mesh material={materials.bead} position={[0, H, 0.124]}>
        <torusGeometry args={[R + F / 2, 0.007, 8, 64, Math.PI]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} material={materials.bead} position={[s * (R + F / 2), H / 2, 0.124]}>
          <cylinderGeometry args={[0.007, 0.007, H, 8]} />
        </mesh>
      ))}
      <Leaf side={1} materials={materials} groupRef={left} />
      <Leaf side={-1} materials={materials} groupRef={right} />

      <ambientLight intensity={0.7} color="#fff1df" />
      {/* Warm late-afternoon sun from the side, as in the reference photograph */}
      <directionalLight position={[-4, 5, 5]} intensity={2.4} color="#fff0d6" />
      <directionalLight position={[4, 1.5, 4]} intensity={0.7} color="#ffd8ad" />
      {/* Warm daylight spilling from inside the villa as the doors open */}
      <pointLight position={[0, 1.6, -1.6]} intensity={5} distance={5} decay={1.6} color="#ffd59c" />
    </group>
  );
}

type Props = {
  progress: RefObject<number>;
  active: boolean;
  onReady?: () => void;
  className?: string;
};

export default function DoorScene({ progress, active, onReady, className }: Props) {
  return (
    <Canvas
      className={className}
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.75]}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      camera={{ fov: 30, near: 0.05, far: 80, position: [0, CENTER_Y, 9] }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      aria-hidden="true"
    >
      <Doorway progress={progress} onReady={onReady} />
    </Canvas>
  );
}
