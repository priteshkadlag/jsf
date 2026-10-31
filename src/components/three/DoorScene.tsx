"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { CENTER_Y, F, T, TOTAL_H, TOTAL_W, W, createWoodTexture, frameShape, leafLayout, wallShape } from "@/components/three/door-geometry";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Fraction of the viewport the door occupies before the scroll begins (mirrored by the CSS placeholder). */
export const DOOR_FILL_HEIGHT = 0.64;
export const DOOR_FILL_WIDTH = 0.72;

type Materials = {
  leaf: THREE.MeshStandardMaterial;
  carving: THREE.MeshStandardMaterial;
  frame: THREE.MeshStandardMaterial;
  glass: THREE.MeshStandardMaterial;
  iron: THREE.MeshStandardMaterial;
  brass: THREE.MeshStandardMaterial;
};

const REED_R = 0.011;

/** Vertical reeds of the arched head panel, drawn as one instanced mesh per face. */
function Reeds({ face, material, reeds }: { face: "front" | "back"; material: THREE.Material; reeds: { x: number; y0: number; y1: number }[] }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    const z = face === "front" ? T + 0.012 : -0.012;
    reeds.forEach((reed, i) => {
      const h = reed.y1 - reed.y0;
      m.makeScale(1, h, 0.6).setPosition(reed.x, reed.y0 + h / 2, z);
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [face, reeds]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, reeds.length]} material={material}>
      <cylinderGeometry args={[REED_R, REED_R, 1, 10, 1]} />
    </instancedMesh>
  );
}

/** Stepped diamond medallion: a square plate turned 45° with a four-sided pyramid on top. */
function Diamond({ size, materials, z, flip }: { size: number; materials: Materials; z: number; flip?: boolean }) {
  const dir = flip ? -1 : 1;
  return (
    <group position={[0, 0, z]} scale={[1, 1, dir]}>
      <mesh material={materials.carving} rotation={[0, 0, Math.PI / 4]} position={[0, 0, 0.012]}>
        <boxGeometry args={[size, size, 0.024]} />
      </mesh>
      <mesh material={materials.carving} rotation={[0, 0, Math.PI / 4]} position={[0, 0, 0.03]}>
        <boxGeometry args={[size * 0.74, size * 0.74, 0.014]} />
      </mesh>
      {/* Pyramid: a 4-sided cone pointing out of the door, corners aligned to the diamond */}
      <mesh material={materials.carving} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.037 + size * 0.11]}>
        <coneGeometry args={[size * 0.5, size * 0.22, 4, 1]} />
      </mesh>
    </group>
  );
}

function Leaf({ side, materials, groupRef }: { side: 1 | -1; materials: Materials; groupRef: RefObject<THREE.Group | null> }) {
  const { leafGeo, panes, reeds, width } = useMemo(() => {
    const { leaf, panes, reeds, width } = leafLayout();
    const leafGeo = new THREE.ExtrudeGeometry(leaf, {
      depth: T,
      bevelEnabled: true,
      bevelThickness: 0.008,
      bevelSize: 0.008,
      bevelSegments: 2,
      curveSegments: 32,
    });
    return { leafGeo, panes, reeds, width };
  }, []);

  useEffect(() => () => leafGeo.dispose(), [leafGeo]);

  const front = T + 0.008;
  return (
    // Mirroring with scale.x = -1 lets both leaves share one geometry; three.js flips winding for us.
    <group ref={groupRef} position={[(-side * W) / 2, 0, -T / 2]} scale={[side, 1, 1]}>
      <mesh geometry={leafGeo} material={materials.leaf} />

      {panes.map((p, i) => {
        const cx = (p.x0 + p.x1) / 2;
        const cy = (p.y0 + p.y1) / 2;
        const size = Math.min(p.x1 - p.x0, p.y1 - p.y0) * 0.68;
        return (
          <group key={i} position={[cx, cy, 0]}>
            <mesh material={materials.glass} position={[0, 0, T / 2]}>
              <planeGeometry args={[p.x1 - p.x0, p.y1 - p.y0]} />
            </mesh>
            <Diamond size={size} materials={materials} z={T / 2 + 0.004} />
            <Diamond size={size} materials={materials} z={T / 2 - 0.004} flip />
          </group>
        );
      })}

      <Reeds face="front" material={materials.carving} reeds={reeds} />
      <Reeds face="back" material={materials.carving} reeds={reeds} />

      {/* Black iron pull bars on both faces, set into the meeting stile */}
      {[front + 0.04, -0.048].map((z) => (
        <group key={z} position={[width - 0.055, 1.48, z]}>
          <mesh material={materials.iron}>
            <boxGeometry args={[0.026, 0.48, 0.022]} />
          </mesh>
          {[-0.2, 0.2].map((dy) => (
            <mesh key={dy} position={[0, dy, z > 0 ? -0.02 : 0.02]} material={materials.iron}>
              <boxGeometry args={[0.016, 0.016, 0.04]} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Brass lever and escutcheon on the right-hand leaf only */}
      {side === -1 && (
        <group position={[width - 0.08, 1.02, front + 0.012]}>
          <mesh material={materials.brass}>
            <boxGeometry args={[0.036, 0.12, 0.01]} />
          </mesh>
          <mesh material={materials.brass} position={[-0.06, 0.03, 0.022]}>
            <boxGeometry args={[0.13, 0.016, 0.016]} />
          </mesh>
        </group>
      )}
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
    const leafTex = createWoodTexture("#b0712f", 19);
    const carveTex = leafTex.clone();
    carveTex.offset.set(0.37, 0.21);
    carveTex.repeat.set(4, 4);
    const frameTex = createWoodTexture("#a3652a", 7);
    const materials: Materials = {
      leaf: new THREE.MeshStandardMaterial({ map: leafTex, roughness: 0.42 }),
      carving: new THREE.MeshStandardMaterial({ map: carveTex, color: "#fff2df", roughness: 0.4 }),
      frame: new THREE.MeshStandardMaterial({ map: frameTex, roughness: 0.48 }),
      glass: new THREE.MeshStandardMaterial({
        color: "#241c16",
        transparent: true,
        opacity: 0.74,
        roughness: 0.05,
        metalness: 0.2,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
      iron: new THREE.MeshStandardMaterial({ color: "#1c1a18", roughness: 0.38, metalness: 0.55 }),
      brass: new THREE.MeshStandardMaterial({ color: "#c9a062", roughness: 0.3, metalness: 0.55 }),
    };
    const frameGeo = new THREE.ExtrudeGeometry(frameShape(), { depth: 0.24, bevelEnabled: false, curveSegments: 48 });
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
      <mesh geometry={wallGeo} position={[0, 0, 0.12]}>
        <meshBasicMaterial color="#f2ece2" toneMapped={false} />
      </mesh>
      {/* Floor in front of the wall */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 12.12]}>
        <planeGeometry args={[48, 24]} />
        <meshBasicMaterial color="#e6dccd" toneMapped={false} />
      </mesh>
      {/* Laterite threshold */}
      <mesh position={[0, 0.012, 0.02]}>
        <boxGeometry args={[W + 2 * F + 0.1, 0.024, 0.34]} />
        <meshStandardMaterial color="#9c6a4b" roughness={0.85} />
      </mesh>
      <mesh geometry={frameGeo} material={materials.frame} position={[0, 0, -0.12]} />
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
