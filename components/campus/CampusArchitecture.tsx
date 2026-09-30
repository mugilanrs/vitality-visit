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
  M_ROOF_RIM,
  M_WHITE_SHELL,
  M_METAL_DARK,
  COLORS,
} from "@/lib/materials";

/**
 * Compose the campus. Positions match the reference image's masterplan:
 *   Central Spine + Tower on the N–S axis, wings fanning east/west,
 *   Plaza + lake to the south of the spine, Auditorium at the front,
 *   Dome to the west of the plaza, Residential crescent NE around a lake.
 */

function Terrain() {
  return (
    <group>
      {/* Wide outer disc — surrounding urban tissue */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <circleGeometry args={[34, 96]} />
        <meshStandardMaterial color={COLORS.groundOutside} roughness={1} />
      </mesh>

      {/* Campus site disc */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        material={M_GROUND}
        receiveShadow
      >
        <circleGeometry args={[16, 96]} />
      </mesh>

      {/* Central grass ellipse around the spine */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.005, 0]}
        material={M_GRASS}
        receiveShadow
      >
        <circleGeometry args={[9.4, 96]} />
      </mesh>

      {/* Faint darker grass boundary strip */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]}>
        <ringGeometry args={[9.35, 9.55, 96]} />
        <meshStandardMaterial color={COLORS.grassDeep} roughness={1} />
      </mesh>

      {/* Residential lawn under the crescent */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[10, 0.005, -4]}
        material={M_GRASS}
        receiveShadow
      >
        <circleGeometry args={[4.4, 64]} />
      </mesh>

      {/* Auditorium lawn */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.005, 10]}
        material={M_GRASS}
        receiveShadow
      >
        <circleGeometry args={[3.5, 64]} />
      </mesh>
    </group>
  );
}

/**
 * Solar-panel canopy over a parking row (west + east corners of the site).
 */
function ParkingCanopy({
  width = 3.4,
  depth = 1.6,
  posts = 6,
}: { width?: number; depth?: number; posts?: number }) {
  return (
    <group>
      {/* Asphalt patch under the canopy */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.011, 0]}>
        <planeGeometry args={[width + 0.4, depth + 0.4]} />
        <meshStandardMaterial color={COLORS.roadDark} roughness={0.95} />
      </mesh>
      {/* Small "cars" (box) rows */}
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
      {/* Solar canopy: tilted panel on posts */}
      <mesh
        castShadow
        position={[0, 0.85, 0]}
        rotation={[-Math.PI / 2 + 0.35, 0, 0]}
      >
        <boxGeometry args={[width, 0.06, depth]} />
        <meshStandardMaterial color={COLORS.solar} roughness={0.35} metalness={0.6} />
      </mesh>
      {/* Panel lattice — thin white lines over the dark panel */}
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
      {/* Supporting posts */}
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

// Residential crescent — five curved buildings around the residential lake.
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
        const R = 3.6;
        const x = Math.cos(r.angle + Math.PI / 2) * R;
        const z = -Math.sin(r.angle + Math.PI / 2) * R;
        const rotY = -r.angle;
        return (
          <group key={i} position={[x, 0, z]} rotation={[0, rotY, 0]}>
            <CampusBuilding
              width={1.9}
              depth={1.15}
              floors={3}
              floorHeight={0.36}
              plan="curved"
              canopyOverhang={0.18}
              fins={5}
            />
          </group>
        );
      })}
    </group>
  );
}

// The eight main wing buildings — four west (Academic), four east (Innovation).
function Wings() {
  const items: {
    side: -1 | 1;
    z: number;
    width: number;
    depth: number;
    floors: number;
  }[] = [
    { side: -1, z: -2.8, width: 3.2, depth: 1.6, floors: 4 },
    { side: -1, z: -0.9, width: 3.6, depth: 1.7, floors: 4 },
    { side: -1, z: 1.1, width: 3.6, depth: 1.7, floors: 4 },
    { side: -1, z: 3.1, width: 3.2, depth: 1.5, floors: 3 },
    { side: 1, z: -2.8, width: 3.2, depth: 1.6, floors: 4 },
    { side: 1, z: -0.9, width: 3.6, depth: 1.7, floors: 4 },
    { side: 1, z: 1.1, width: 3.6, depth: 1.7, floors: 4 },
    { side: 1, z: 3.1, width: 3.2, depth: 1.5, floors: 3 },
  ];

  return (
    <group>
      {items.map((it, i) => {
        // Buildings sit with their "front" (curved facade) facing away from
        // the spine — so we rotate east-side ones 180° so their fronts face +x.
        const rotY = it.side === -1 ? Math.PI : 0;
        const x = it.side * (2.7 + it.depth / 2);
        return (
          <group key={i} position={[x, 0, it.z]} rotation={[0, rotY, 0]}>
            <CampusBuilding
              width={it.width}
              depth={it.depth}
              floors={it.floors}
              plan="curved"
              canopyOverhang={0.32}
              fins={9}
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

      {/* Central Spine + Tower (spine renders the tower itself) */}
      <CentralSpine />

      {/* Wings */}
      <Wings />

      {/* Bridges from each wing to the spine */}
      <Bridges
        wings={[
          { z: -2.8, xFrom: -2.7, xTo: -0.9 },
          { z: -0.9, xFrom: -2.7, xTo: -0.9 },
          { z: 1.1, xFrom: -2.7, xTo: -0.9 },
          { z: 3.1, xFrom: -2.7, xTo: -0.9 },
          { z: -2.8, xFrom: 0.9, xTo: 2.7 },
          { z: -0.9, xFrom: 0.9, xTo: 2.7 },
          { z: 1.1, xFrom: 0.9, xTo: 2.7 },
          { z: 3.1, xFrom: 0.9, xTo: 2.7 },
        ]}
      />

      {/* Main plaza */}
      <group position={[0, 0, 6.5]}>
        <Plaza />
      </group>

      {/* Auditorium at the front */}
      <group position={[0, 0, 10]}>
        <Auditorium width={4.4} depth={2.2} />
      </group>

      {/* Dome west of the plaza */}
      <group position={[-6.2, 0, 6.5]}>
        <Dome radius={1.4} />
      </group>

      {/* Residential crescent */}
      <ResidentialCrescent />

      {/* Parking canopies at the two south corners */}
      <group position={[-9.5, 0, 8.4]} rotation={[0, 0.35, 0]}>
        <ParkingCanopy width={3.6} depth={1.7} posts={5} />
      </group>
      <group position={[9.5, 0, 8.4]} rotation={[0, -0.35, 0]}>
        <ParkingCanopy width={3.6} depth={1.7} posts={5} />
      </group>

      <Vegetation />
    </group>
  );
}
