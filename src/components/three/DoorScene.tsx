"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import {
  CENTER_Y,
  F,
  H,
  T,
  TOTAL_H,
  TOTAL_W,
  W,
  createWoodTexture,
  frameShape,
  leafShapes,
  wallShape,
} from "@/components/three/door-geometry";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Fraction of the viewport the door occupies before the scroll begins (mirrored by the CSS placeholder). */
export const DOOR_FILL_HEIGHT = 0.62;
export const DOOR_FILL_WIDTH = 0.72;

type Materials = {
  leaf: THREE.MeshStandardMaterial;
  panel: THREE.MeshStandardMaterial;
  frame: THREE.MeshStandardMaterial;
  brass: THREE.MeshStandardMaterial;
  glass: THREE.MeshStandardMaterial;
};

function Leaf({ side, materials, groupRef }: { side: 1 | -1; materials: Materials; groupRef: RefObject<THREE.Group | null> }) {
  const { leafGeo, fanGeo, width, bars, panels } = useMemo(() => {
    const { leaf, fan, width, fanRadius, fanCenter } = leafShapes();
    const leafGeo = new THREE.ExtrudeGeometry(leaf, {
      depth: T,
      bevelEnabled: true,
      bevelThickness: 0.008,
      bevelSize: 0.008,
      bevelSegments: 2,
      curveSegments: 32,
    });
    const fanGeo = new THREE.ShapeGeometry(fan);
    // Radiating glazing bars of the fanlight, angles measured from the arch centre.
    const bars = [112, 135, 158].map((deg) => {
      const a = THREE.MathUtils.degToRad(deg);
      const len = fanRadius;
      return {
        position: [fanCenter.x + Math.cos(a) * (len / 2), fanCenter.y + Math.sin(a) * (len / 2), T / 2] as const,
        rotation: a,
        length: len,
      };
    });
    const x0 = 0.12;
    const x1 = width - 0.09;
    const panels = [
      { y0: 0.16, y1: 0.92 },
      { y0: 1.06, y1: H - 0.04 },
    ].map(({ y0, y1 }) => ({ x: (x0 + x1) / 2, y: (y0 + y1) / 2, w: x1 - x0, h: y1 - y0 }));
    return { leafGeo, fanGeo, width, bars, panels };
  }, []);

  useEffect(() => () => {
    leafGeo.dispose();
    fanGeo.dispose();
  }, [leafGeo, fanGeo]);

  const faceZ = T + 0.008;
  return (
    // Mirroring with scale.x = -1 lets both leaves share one geometry; three.js flips winding for us.
    <group ref={groupRef} position={[(-side * W) / 2, 0, -T / 2]} scale={[side, 1, 1]}>
      <mesh geometry={leafGeo} material={materials.leaf} />
      <mesh geometry={fanGeo} material={materials.glass} position={[0, 0, T / 2]} />
      {bars.map((b, i) => (
        <mesh key={i} position={b.position} rotation={[0, 0, b.rotation]} material={materials.leaf}>
          <boxGeometry args={[b.length, 0.022, 0.03]} />
        </mesh>
      ))}
      {panels.map((p, i) => (
        <group key={i}>
          <RoundedBox args={[p.w, p.h, 0.026]} radius={0.008} smoothness={2} position={[p.x, p.y, faceZ + 0.006]} material={materials.panel} />
          <RoundedBox args={[p.w, p.h, 0.026]} radius={0.008} smoothness={2} position={[p.x, p.y, -0.014]} material={materials.panel} />
        </group>
      ))}
      {/* Brass pull handle on both faces of the meeting stile */}
      {[faceZ + 0.045, -0.053].map((z) => (
        <group key={z} position={[width - 0.07, 1.02, z]}>
          <mesh material={materials.brass}>
            <cylinderGeometry args={[0.011, 0.011, 0.3, 16]} />
          </mesh>
          {[-0.12, 0.12].map((dy) => (
            <mesh key={dy} position={[0, dy, z > 0 ? -0.022 : 0.022]} rotation={[Math.PI / 2, 0, 0]} material={materials.brass}>
              <cylinderGeometry args={[0.008, 0.008, 0.044, 12]} />
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

  const { materials, frameGeo, wallGeo } = useMemo(() => {
    const leafTex = createWoodTexture("#8a5329", 19);
    const panelTex = leafTex.clone();
    panelTex.offset.set(0.37, 0.21);
    const frameTex = createWoodTexture("#5c361b", 7);
    const materials: Materials = {
      leaf: new THREE.MeshStandardMaterial({ map: leafTex, roughness: 0.52, metalness: 0.02 }),
      panel: new THREE.MeshStandardMaterial({ map: panelTex, color: "#e9cfb4", roughness: 0.48 }),
      frame: new THREE.MeshStandardMaterial({ map: frameTex, roughness: 0.6 }),
      brass: new THREE.MeshStandardMaterial({ color: "#c79a5c", roughness: 0.28, metalness: 0.55 }),
      glass: new THREE.MeshStandardMaterial({
        color: "#f7dfb5",
        transparent: true,
        opacity: 0.32,
        roughness: 0.1,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    };
    const frameGeo = new THREE.ExtrudeGeometry(frameShape(), { depth: 0.26, bevelEnabled: false, curveSegments: 48 });
    const wallGeo = new THREE.ShapeGeometry(wallShape(), 48);
    return { materials, frameGeo, wallGeo };
  }, []);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", move, { passive: true });
    // Signal readiness after the first frame has actually been drawn.
    const id = requestAnimationFrame(() => requestAnimationFrame(() => onReady?.()));
    return () => {
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(id);
    };
  }, [onReady]);

  useEffect(
    () => () => {
      Object.values(materials).forEach((m) => {
        m.map?.dispose();
        m.dispose();
      });
      frameGeo.dispose();
      wallGeo.dispose();
    },
    [materials, frameGeo, wallGeo],
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
      {/* Plaster wall, unlit so it matches the page's ivory exactly */}
      <mesh geometry={wallGeo} position={[0, 0, 0.13]}>
        <meshBasicMaterial color="#f2ece2" toneMapped={false} />
      </mesh>
      {/* Floor in front of the wall */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 12.13]}>
        <planeGeometry args={[48, 24]} />
        <meshBasicMaterial color="#e6dccd" toneMapped={false} />
      </mesh>
      {/* Laterite threshold */}
      <mesh position={[0, 0.012, 0]}>
        <boxGeometry args={[W + 2 * F + 0.08, 0.024, 0.34]} />
        <meshStandardMaterial color="#b9a58c" roughness={0.9} />
      </mesh>
      <mesh geometry={frameGeo} material={materials.frame} position={[0, 0, -0.13]} />
      <Leaf side={1} materials={materials} groupRef={left} />
      <Leaf side={-1} materials={materials} groupRef={right} />

      <ambientLight intensity={0.7} color="#fff1df" />
      <directionalLight position={[-3, 5, 6]} intensity={2.2} color="#fff4e4" />
      <directionalLight position={[4, 1.5, 4]} intensity={0.55} color="#ffd8ad" />
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
