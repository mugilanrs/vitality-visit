"use client";

import Roads from "./Roads";
import CentralSpine from "./CentralSpine";
import CampusBuilding from "./CampusBuilding";
import Plaza from "./Plaza";
import WaterBodies from "./WaterBodies";
import Bridges from "./Bridges";
import Vegetation from "./Vegetation";
import {
  M_GROUND,
  M_GRASS,
  COLORS,
} from "@/lib/materials";
import { BLOCK_X, BLOCK_ROWS, BLOCK_SIZE, BUILDINGS, BUILDING_ORDER } from "@/data/buildings";

/**
 * PHASE 8 — the campus, composed to match the reference architecture.
 *
 *   ┌────────── 6 primary blocks ──────────┐
 *   │                                       │
 *   │ left rear     ── spine ──   right rear
 *   │ left middle   ── spine ──   right middle
 *   │ left front    ── spine ──   right front (EB3)
 *   │                                       │
 *   └───────── entrance lake · plaza ───────┘
 *
 * Removed vs. Phase 7:  the auditorium, the dome, the residential
 * crescent, and the solar-panel parking canopies. Those were secondary
 * masses the reference brief calls extra — the six wings + spine + entrance
 * water carry the composition on their own.
 */

function Terrain() {
  return (
    <group>
      {/* Surrounding urban tissue */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <circleGeometry args={[36, 96]} />
        <meshStandardMaterial color={COLORS.groundOutside} roughness={1} />
      </mesh>

      {/* Campus site disc */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        material={M_GROUND}
        receiveShadow
      >
        <circleGeometry args={[16.5, 96]} />
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

/**
 * The six primary blocks — three per side, rendered at uniform size for a
 * clean bilateral composition. Variant alternates so the two sides don't
 * look identically copy-pasted.
 */
function PrimaryBlocks() {
  return (
    <group>
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

/**
 * Glass walkway bridges from the spine to each of the six block rows.
 * One per row per side = six bridges, matching the block count.
 */
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
    </group>
  );
}
