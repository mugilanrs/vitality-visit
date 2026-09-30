"use client";

import Roads from "./Roads";
import CentralSpine from "./CentralSpine";
import CampusBuilding from "./CampusBuilding";
import Auditorium from "./Auditorium";
import Dome from "./Dome";
import Plaza from "./Plaza";
import WaterBodies from "./WaterBodies";
import Bridges from "./Bridges";
import Vegetation from "./Vegetation";
import {
  M_GROUND,
  M_GRASS,
  M_METAL_DARK,
  COLORS,
} from "@/lib/materials";

/**
 * Compose the campus. Positions match the architectural reference:
 *   Central Spine + Tower on the N–S axis
 *   Wings fanning east/west from the spine
 *   Plaza (with strong axis) + lake to the south of the spine
 *   Auditorium further south, on the plaza axis
 *   Dome to the west of the plaza
 *   Residential crescent NE around a designed lake
 */

const SPINE_LEN = 12.4; // must match CentralSpine.tsx

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

      {/* Central grass ellipse around the spine — elongated to match the spine */}
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

      {/* Residential lawn */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[10, 0.005, -4]}
        material={M_GRASS}
        receiveShadow
      >
        <circleGeometry args={[4.6, 64]} />
      </mesh>

      {/* Auditorium lawn */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.005, 11]}
        material={M_GRASS}
        receiveShadow
      >
        <circleGeometry args={[3.8, 64]} />
      </mesh>
    </group>
  );
}

/** Solar-panel canopy over parking. */
function ParkingCanopy({
  width = 3.4,
  depth = 1.6,
  posts = 6,
}: { width?: number; depth?: number; posts?: number }) {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.011, 0]}>
        <planeGeometry args={[width + 0.4, depth + 0.4]} />
        <meshStandardMaterial color={COLORS.roadDark} roughness={0.95} />
      </mesh>
      {Array.from({ length: 10 }).map((_, i) => (
        <mesh
          key={i}
          position={[(i - 4.5) * (width / 10), 0.09, -depth * 0.25]}
          castShadow
        >
          <boxGeometry args={[width / 12, 0.14, depth * 0.35]} />
          <meshStandardMaterial color="#c8ccd2" roughness={0.5} metalness={0.4} />
        </mesh>
      ))}
      <mesh
        castShadow
        position={[0, 0.85, 0]}
        rotation={[-Math.PI / 2 + 0.35, 0, 0]}
      >
        <boxGeometry args={[width, 0.06, depth]} />
        <meshStandardMaterial color={COLORS.solar} roughness={0.35} metalness={0.6} />
      </mesh>
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh
          key={i}
          position={[(i - 2) * (width / 6), 0.87, 0]}
          rotation={[-Math.PI / 2 + 0.35, 0, 0]}
        >
          <boxGeometry args={[0.03, 0.07, depth]} />
          <meshStandardMaterial color={COLORS.roofWhite} />
        </mesh>
      ))}
      {Array.from({ length: posts }).map((_, i) => (
        <mesh
          key={i}
          castShadow
          position={[(i - (posts - 1) / 2) * (width / posts), 0.4, -depth / 2 + 0.1]}
          material={M_METAL_DARK}
        >
          <cylinderGeometry args={[0.05, 0.05, 0.85, 6]} />
        </mesh>
      ))}
    </group>
  );
}

function ResidentialCrescent() {
  const items = [
    { angle: -0.9 },
    { angle: -0.5 },
    { angle: 0 },
    { angle: 0.5 },
    { angle: 0.9 },
  ];
  return (
    <group position={[10, 0, -4]}>
      {items.map((r, i) => {
        const R = 3.8;
        const x = Math.cos(r.angle + Math.PI / 2) * R;
        const z = -Math.sin(r.angle + Math.PI / 2) * R;
        const rotY = -r.angle;
        return (
          <group key={i} position={[x, 0, z]} rotation={[0, rotY, 0]}>
            <CampusBuilding
              width={2.2}
              depth={1.25}
              floors={3}
              floorHeight={0.36}
              plan="curved"
              canopyOverhang={0.22}
              fins={7}
              variant={i % 2 === 0 ? "default" : "stacked"}
            />
          </group>
        );
      })}
    </group>
  );
}

// Eight wing buildings — four west (Academic), four east (Innovation), fanning
// along the length of the spine, with variety in floor count and variant.
function Wings() {
  const items: {
    side: -1 | 1;
    z: number;
    width: number;
    depth: number;
    floors: number;
    variant: "default" | "stacked";
  }[] = [
    { side: -1, z: -4.4, width: 3.4, depth: 1.8, floors: 5, variant: "default" },
    { side: -1, z: -1.7, width: 3.8, depth: 1.9, floors: 5, variant: "stacked" },
    { side: -1, z: 1.0, width: 3.8, depth: 1.9, floors: 5, variant: "default" },
    { side: -1, z: 3.6, width: 3.4, depth: 1.7, floors: 4, variant: "stacked" },
    { side: 1, z: -4.4, width: 3.4, depth: 1.8, floors: 5, variant: "default" },
    { side: 1, z: -1.7, width: 3.8, depth: 1.9, floors: 5, variant: "stacked" },
    { side: 1, z: 1.0, width: 3.8, depth: 1.9, floors: 5, variant: "default" },
    { side: 1, z: 3.6, width: 3.4, depth: 1.7, floors: 4, variant: "stacked" },
  ];

  return (
    <group>
      {items.map((it, i) => {
        const rotY = it.side === -1 ? Math.PI : 0;
        const x = it.side * (2.9 + it.depth / 2);
        return (
          <group key={i} position={[x, 0, it.z]} rotation={[0, rotY, 0]}>
            <CampusBuilding
              width={it.width}
              depth={it.depth}
              floors={it.floors}
              plan="curved"
              canopyOverhang={0.45}
              fins={10}
              variant={it.variant}
            />
          </group>
        );
      })}
    </group>
  );
}

export default function CampusArchitecture() {
  return (
    <group>
      <Terrain />
      <Roads />
      <WaterBodies />

      <CentralSpine />
      <Wings />

      {/* Bridges — narrow glass walkways from wings to spine. Positioned
          slightly outside the spine so they don't collide with the atrium. */}
      <Bridges
        wings={[
          { z: -4.4, xFrom: -2.9, xTo: -1.2 },
          { z: -1.7, xFrom: -2.9, xTo: -1.2 },
          { z: 1.0, xFrom: -2.9, xTo: -1.2 },
          { z: 3.6, xFrom: -2.9, xTo: -1.2 },
          { z: -4.4, xFrom: 1.2, xTo: 2.9 },
          { z: -1.7, xFrom: 1.2, xTo: 2.9 },
          { z: 1.0, xFrom: 1.2, xTo: 2.9 },
          { z: 3.6, xFrom: 1.2, xTo: 2.9 },
        ]}
      />

      {/* Main plaza — pushed south of the spine, sits on the axis */}
      <group position={[0, 0, 6.5]}>
        <Plaza />
      </group>

      {/* Auditorium at the front, on the same axis */}
      <group position={[0, 0, 11]}>
        <Auditorium width={5.2} depth={2.6} />
      </group>

      {/* Dome west of the plaza */}
      <group position={[-6.6, 0, 6.5]}>
        <Dome radius={1.6} />
      </group>

      <ResidentialCrescent />

      {/* Solar-panel parking canopies */}
      <group position={[-9.7, 0, 8.6]} rotation={[0, 0.35, 0]}>
        <ParkingCanopy width={3.6} depth={1.7} posts={5} />
      </group>
      <group position={[9.7, 0, 8.6]} rotation={[0, -0.35, 0]}>
        <ParkingCanopy width={3.6} depth={1.7} posts={5} />
      </group>

      <Vegetation />
    </group>
  );
}
