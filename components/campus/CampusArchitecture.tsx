"use client";

import { useEffect, useMemo, useState } from "react";
import Roads from "./Roads";
import CentralSpine from "./CentralSpine";
import CampusBuilding from "./CampusBuilding";
import Plaza from "./Plaza";
import WaterBodies from "./WaterBodies";
import Bridges from "./Bridges";
import Vegetation from "./Vegetation";
import CampusPerimeter from "./CampusPerimeter";
import {
  M_GROUND,
  M_GRASS,
  COLORS,
} from "@/lib/materials";
import { BLOCK_X, BLOCK_ROWS, BLOCK_SIZE, BUILDINGS, BUILDING_ORDER } from "@/data/buildings";
import { journey, subscribeJourney } from "@/lib/journey";

/**
 * PHASE 9 — the campus, composed to match the reference architecture.
 *
 *   ┌────── perimeter wall + entrance gate ──────┐
 *   │                                              │
 *   │ 6 primary blocks · central spine · tower     │
 *   │           · entrance lake                    │
 *   │                                              │
 *   └──── white / pale-pink architectural model ───┘
 *
 * External environment uses white/pale-pink to read as a premium architectural
 * presentation model. Inner campus stays natural (white architecture, glass,
 * green grass, water).
 */

function ExternalEnvironment() {
  // A few soft white "district" blocks and thin pink road lines around the
  // campus, so the exterior reads as an architectural model rather than
  // empty ground.
  const blocks = useMemo(() => {
    const arr: {
      r: number;
      a: number;
      w: number;
      d: number;
      rot: number;
    }[] = [];
    const rings = [
      { R: 22, count: 12 },
      { R: 28, count: 14 },
      { R: 33, count: 16 },
    ];
    for (const { R, count } of rings) {
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2 + (R * 0.13);
        const seed = ((i * 91 + R * 17) % 100) / 100;
        // Reserve the south entrance approach (avoid an angular slice at θ≈π/2)
        const dTheta = Math.atan2(
          Math.sin(a - Math.PI / 2),
          Math.cos(a - Math.PI / 2),
        );
        if (Math.abs(dTheta) < 0.32) continue;
        arr.push({
          r: R,
          a,
          w: 1.8 + seed * 2.4,
          d: 1.8 + (1 - seed) * 2.4,
          rot: a + (seed - 0.5) * 0.4,
        });
      }
    }
    return arr;
  }, []);

  // Thin radial "roads" — barely visible pink lines fanning out from the
  // campus, evoking a masterplan.
  const roads = useMemo(() => {
    const arr: number[] = [];
    for (let i = 0; i < 16; i++) {
      arr.push((i / 16) * Math.PI * 2);
    }
    return arr;
  }, []);

  return (
    <group>
      {/* Full outer ground disc — very pale pink-white */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <circleGeometry args={[38, 96]} />
        <meshStandardMaterial
          color={COLORS.groundOutside}
          roughness={1}
        />
      </mesh>

      {/* Soft atmospheric haze ring — barely pink, further out */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.015, 0]}>
        <ringGeometry args={[20, 38, 96]} />
        <meshStandardMaterial
          color={COLORS.outsideMistPink}
          transparent
          opacity={0.35}
          roughness={1}
          depthWrite={false}
        />
      </mesh>

      {/* Very subtle radial "streets" */}
      {roads.map((a, i) => (
        <mesh
          key={`road-${i}`}
          rotation={[-Math.PI / 2, 0, -a + Math.PI / 2]}
          position={[Math.cos(a) * 26, -0.01, Math.sin(a) * 26]}
        >
          <planeGeometry args={[0.06, 22]} />
          <meshStandardMaterial
            color={COLORS.outsidePathPink}
            transparent
            opacity={0.35}
            roughness={1}
          />
        </mesh>
      ))}

      {/* White low blocks arranged in rings — architectural model surroundings */}
      {blocks.map((b, i) => (
        <mesh
          key={`blk-${i}`}
          castShadow={false}
          receiveShadow
          position={[
            Math.cos(b.a) * b.r,
            0.09,
            Math.sin(b.a) * b.r,
          ]}
          rotation={[0, -b.rot, 0]}
        >
          <boxGeometry args={[b.w, 0.18 + ((i * 3) % 5) * 0.05, b.d]} />
          <meshStandardMaterial
            color={COLORS.outsideBlockWhite}
            roughness={0.85}
          />
        </mesh>
      ))}
    </group>
  );
}

function Terrain() {
  return (
    <group>
      {/* Campus site disc — the "green" ground plane inside the wall */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        material={M_GROUND}
        receiveShadow
      >
        <circleGeometry args={[16.4, 96]} />
      </mesh>

      {/* Central grass ellipse around the spine */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.005, 0]}
        material={M_GRASS}
        receiveShadow
      >
        <circleGeometry args={[9.6, 96]} />
      </mesh>

      {/* Faint darker grass boundary */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]}>
        <ringGeometry args={[9.55, 9.75, 96]} />
        <meshStandardMaterial color={COLORS.grassDeep} roughness={1} />
      </mesh>

      {/* Small courtyard lawns beside each block row */}
      {(["rear", "middle", "front"] as const).map((row) => (
        <group key={row}>
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[-BLOCK_X, 0.007, BLOCK_ROWS[row]]}
          >
            <circleGeometry args={[1.4, 32]} />
            <meshStandardMaterial color={COLORS.grassDeep} roughness={1} />
          </mesh>
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[BLOCK_X, 0.007, BLOCK_ROWS[row]]}
          >
            <circleGeometry args={[1.4, 32]} />
            <meshStandardMaterial color={COLORS.grassDeep} roughness={1} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function PrimaryBlocks() {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const apply = () => {
      const f = journey.focus;
      setHidden(f.level !== "campus" && f.building === "eb3");
    };
    apply();
    return subscribeJourney(apply, "focus");
  }, []);

  return (
    <group visible={!hidden}>
      {BUILDING_ORDER.map((id, i) => {
        const b = BUILDINGS[id];
        const rotY = b.side === "left" ? Math.PI : 0;
        const [x, , z] = b.basePosition;
        const variant = i % 2 === 0 ? "default" : "stacked";
        return (
          <group key={id} position={[x, 0, z]} rotation={[0, rotY, 0]}>
            <CampusBuilding
              width={BLOCK_SIZE.width}
              depth={BLOCK_SIZE.depth}
              floors={BLOCK_SIZE.floors}
              floorHeight={BLOCK_SIZE.floorHeight}
              plan="curved"
              canopyOverhang={0.55}
              fins={11}
              variant={variant}
            />
          </group>
        );
      })}
    </group>
  );
}

function BlockBridges() {
  const rows = Object.values(BLOCK_ROWS);
  const wings = [
    ...rows.map((z) => ({ z, xFrom: -BLOCK_X + BLOCK_SIZE.depth / 2, xTo: -1.2 })),
    ...rows.map((z) => ({ z, xFrom: 1.2, xTo: BLOCK_X - BLOCK_SIZE.depth / 2 })),
  ];
  return <Bridges wings={wings} />;
}

export default function CampusArchitecture() {
  return (
    <group>
      <ExternalEnvironment />
      <Terrain />
      <Roads />
      <WaterBodies />

      <CentralSpine />
      <PrimaryBlocks />
      <BlockBridges />

      {/* Entrance plaza + lake, south of the spine */}
      <group position={[0, 0, 6.5]}>
        <Plaza />
      </group>

      <Vegetation />

      {/* Perimeter wall + entrance gate — frames the site */}
      <CampusPerimeter />
    </group>
  );
}
