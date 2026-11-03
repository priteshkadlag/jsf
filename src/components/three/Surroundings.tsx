"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { wallShape } from "@/components/three/door-geometry";
import {
  PALM_X,
  RUNNER,
  SCONCE,
  createBlobTexture,
  createContactShadowTexture,
  createFloorTexture,
  createPalmGeometry,
  createPotGeometry,
  createTileTexture,
  createWallTexture,
} from "@/components/three/surroundings-assets";

const WALL_Z = 0.12;

type Materials = {
  iron: THREE.Material;
  wax: THREE.Material;
  flame: THREE.Material;
  pot: THREE.Material;
  soil: THREE.Material;
  palm: THREE.Material;
};

/** Wrought-iron two-candle sconce, standing 0.11 m proud of the wall. */
function Sconce({ x, materials }: { x: number; materials: Materials }) {
  const flames = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    flames.current?.children.forEach((f, i) => {
      const k = 1 + Math.sin(t * 13 + i * 2.1) * 0.06 + Math.sin(t * 7.3 + i) * 0.05;
      f.scale.set(1, 2.4 * k, 1);
    });
  });

  const d = 0.11;
  return (
    <group position={[x, SCONCE.y, WALL_Z]}>
      {/* Oval backplate and the bracket out from the wall */}
      <mesh material={materials.iron} position={[0, -0.1, 0.008]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 1.7]}>
        <cylinderGeometry args={[0.035, 0.035, 0.016, 24]} />
      </mesh>
      <mesh material={materials.iron} position={[0, -0.1, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.009, 0.009, 0.1, 10]} />
      </mesh>
      {/* Swept arms, central stem and scroll crest */}
      <mesh material={materials.iron} position={[0, 0.02, d]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.12, 0.009, 8, 40, Math.PI]} />
      </mesh>
      <mesh material={materials.iron} position={[0, 0.02, d]}>
        <cylinderGeometry args={[0.008, 0.008, 0.24, 10]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} material={materials.iron} position={[s * 0.034, 0.15, d]} scale={[s, 1, 1]} rotation={[0, 0, -0.3]}>
          <torusGeometry args={[0.034, 0.007, 8, 28, Math.PI * 1.4]} />
        </mesh>
      ))}
      <mesh material={materials.iron} position={[0, -0.135, d]}>
        <sphereGeometry args={[0.018, 16, 12]} />
      </mesh>
      {/* Cups and candles */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.12, 0.02, d]}>
          <mesh material={materials.iron} position={[0, 0.012, 0]}>
            <cylinderGeometry args={[0.028, 0.016, 0.025, 20]} />
          </mesh>
          <mesh material={materials.wax} position={[0, 0.075, 0]}>
            <cylinderGeometry args={[0.016, 0.016, 0.1, 16]} />
          </mesh>
        </group>
      ))}
      <group ref={flames}>
        {[-1, 1].map((s) => (
          <mesh key={s} material={materials.flame} position={[s * 0.12, 0.148, d]} scale={[1, 2.4, 1]}>
            <sphereGeometry args={[0.011, 12, 8]} />
          </mesh>
        ))}
      </group>
      <pointLight position={[0, 0.17, 0.2]} intensity={0.8} distance={1.6} decay={2} color="#ffc27a" />
    </group>
  );
}

/**
 * Everything around the door: plaster wall, limestone floor, encaustic tile runner,
 * candle sconces and potted palms.
 */
export default function Surroundings() {
  const { tex, geo, mat } = useMemo(() => {
    const tex = {
      wall: createWallTexture(),
      floor: createFloorTexture(),
      tile: createTileTexture(),
      contact: createContactShadowTexture(),
      blob: createBlobTexture(),
    };
    tex.floor.repeat.set(48 / 1.2, 24 / 1.2);
    const geo = {
      wall: new THREE.ShapeGeometry(wallShape(), 48),
      pot: createPotGeometry(),
      palms: [createPalmGeometry(3), createPalmGeometry(8)],
    };
    const mat: Materials = {
      iron: new THREE.MeshStandardMaterial({ color: "#1d1b19", roughness: 0.45, metalness: 0.6 }),
      wax: new THREE.MeshStandardMaterial({ color: "#f4ead8", roughness: 0.7 }),
      flame: new THREE.MeshBasicMaterial({ color: "#ffd27a", toneMapped: false }),
      pot: new THREE.MeshStandardMaterial({ color: "#c47a4b", roughness: 0.88, side: THREE.DoubleSide }),
      soil: new THREE.MeshStandardMaterial({ color: "#4a3326", roughness: 1 }),
      palm: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.75, side: THREE.DoubleSide }),
    };
    return { tex, geo, mat };
  }, []);

  useEffect(
    () => () => {
      Object.values(tex).forEach((t) => t.dispose());
      [geo.wall, geo.pot, ...geo.palms].forEach((g) => g.dispose());
      Object.values(mat).forEach((m) => m.dispose());
    },
    [tex, geo, mat],
  );

  const flat = { toneMapped: false } as const;
  const decal = { transparent: true, depthWrite: false, toneMapped: false } as const;
  return (
    <group>
      {/* Plaster wall, unlit so its edges match the page's ivory exactly */}
      <mesh geometry={geo.wall} position={[0, 0, WALL_Z]}>
        <meshBasicMaterial map={tex.wall} {...flat} />
      </mesh>

      {/* Floor: limestone, the tiled runner, then a contact shadow along the wall */}
      <group rotation={[-Math.PI / 2, 0, 0]}>
        <mesh position={[0, -12 - WALL_Z, 0]}>
          <planeGeometry args={[48, 24]} />
          <meshBasicMaterial map={tex.floor} {...flat} />
        </mesh>
        <mesh position={[0, -0.2 - RUNNER.d / 2, 0.002]}>
          <planeGeometry args={[RUNNER.w, RUNNER.d]} />
          <meshBasicMaterial map={tex.tile} {...flat} />
        </mesh>
        <mesh position={[0, -WALL_Z - 0.3, 0.004]}>
          <planeGeometry args={[16, 0.6]} />
          <meshBasicMaterial map={tex.contact} {...decal} />
        </mesh>
      </group>

      {[-1, 1].map((s, i) => (
        <group key={s}>
          <Sconce x={s * SCONCE.x} materials={mat} />
          {/* Potted palm, its blob shadow pushed right by the low sun */}
          <mesh position={[s * PALM_X + 0.15, 0.005, 0.55]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1, 0.7]} />
            <meshBasicMaterial map={tex.blob} {...decal} />
          </mesh>
          <group position={[s * PALM_X, 0, 0.5]}>
            <mesh geometry={geo.pot} material={mat.pot} />
            <mesh material={mat.soil} position={[0, 0.48, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.158, 32]} />
            </mesh>
            <mesh geometry={geo.palms[i]} material={mat.palm} position={[0, 0.48, 0]} rotation={[0, i * 1.3, 0]} />
          </group>
        </group>
      ))}
    </group>
  );
}
