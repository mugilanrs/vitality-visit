"use client";

import { useMemo } from "react";
import * as THREE from "three";
import {
  M_WHITE_SHELL,
  M_ROOF_WHITE,
  M_TEAL_GLASS,
  M_METAL_DARK,
  M_CONCRETE_LIGHT,
  COLORS,
} from "@/lib/materials";
import { BUILDINGS, INTERIOR_ORIGINS, type InteriorKey } from "@/data/buildings";
import { journey } from "@/lib/journey";
import { Html } from "@react-three/drei";

/**
 * PHASE 7 — mini 3D interior rooms.
 *
 * One RoomInterior per (building, floor, room). Each renders at its own
 * world-space origin so the shared ortho camera can travel to it without
 * colliding with the campus geometry. Rooms are UNMOUNTED when they aren't
 * being visited — no cost while you're browsing the campus.
 *
 * Composition (per room):
 *   - floor slab + subtle border rug
 *   - four walls (three solid, one glass — looks out over the campus)
 *   - ceiling with two soft light bars
 *   - conference table + surrounding chairs
 *   - screen on the back wall carrying the session title + host
 *   - a potted plant + a wall art strip for warmth
 */

type Props = {
  interiorKey: InteriorKey;
};

const ROOM_W = 8;
const ROOM_D = 5;
const ROOM_H = 3;

export default function RoomInterior({ interiorKey }: Props) {
  const origin = INTERIOR_ORIGINS[interiorKey];
  const meta = useMemo(() => resolveMeta(interiorKey), [interiorKey]);
  if (!meta) return null;

  return (
    <group position={[origin[0], origin[1], origin[2]]}>
      <group position={[0, -1.4, 0]}>
        {/* --- Floor --- */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
          material={M_CONCRETE_LIGHT}
        >
          <planeGeometry args={[ROOM_W + 1.6, ROOM_D + 1.6]} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
          <planeGeometry args={[ROOM_W, ROOM_D]} />
          <meshStandardMaterial
            color={"#e9dccb"}
            roughness={0.85}
          />
        </mesh>
        {/* subtle rug under the table */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
          <planeGeometry args={[ROOM_W * 0.6, ROOM_D * 0.55]} />
          <meshStandardMaterial color={"#e5c9d6"} roughness={0.95} />
        </mesh>

        {/* --- Back wall (with screen) --- */}
        <mesh
          castShadow
          receiveShadow
          position={[0, ROOM_H / 2, -ROOM_D / 2]}
          material={M_WHITE_SHELL}
        >
          <boxGeometry args={[ROOM_W, ROOM_H, 0.08]} />
        </mesh>
        {/* Screen on the back wall */}
        <mesh position={[0, ROOM_H / 2 + 0.15, -ROOM_D / 2 + 0.05]}>
          <boxGeometry args={[ROOM_W * 0.42, ROOM_H * 0.38, 0.03]} />
          <meshStandardMaterial
            color={"#0f172a"}
            emissive={"#1c2e4a"}
            emissiveIntensity={0.35}
            roughness={0.3}
          />
        </mesh>
        {/* Wall-mounted art strip beside the screen */}
        <mesh
          position={[ROOM_W * 0.35, ROOM_H / 2, -ROOM_D / 2 + 0.06]}
        >
          <boxGeometry args={[0.9, ROOM_H * 0.5, 0.03]} />
          <meshStandardMaterial color={COLORS.blossomPink} roughness={0.7} />
        </mesh>

        {/* --- Side walls --- */}
        <mesh
          castShadow
          receiveShadow
          position={[-ROOM_W / 2, ROOM_H / 2, 0]}
          material={M_WHITE_SHELL}
        >
          <boxGeometry args={[0.08, ROOM_H, ROOM_D]} />
        </mesh>
        <mesh
          castShadow
          receiveShadow
          position={[ROOM_W / 2, ROOM_H / 2, 0]}
          material={M_WHITE_SHELL}
        >
          <boxGeometry args={[0.08, ROOM_H, ROOM_D]} />
        </mesh>

        {/* --- Front wall: full-height glass (view out to the "campus") --- */}
        <mesh
          castShadow
          position={[0, ROOM_H / 2, ROOM_D / 2]}
          material={M_TEAL_GLASS}
        >
          <boxGeometry args={[ROOM_W, ROOM_H, 0.05]} />
        </mesh>
        {/* Glass mullions */}
        {[-3, -1.5, 0, 1.5, 3].map((x, i) => (
          <mesh
            key={i}
            position={[x, ROOM_H / 2, ROOM_D / 2 + 0.02]}
            material={M_METAL_DARK}
          >
            <boxGeometry args={[0.04, ROOM_H, 0.04]} />
          </mesh>
        ))}

        {/* --- Ceiling --- */}
        <mesh
          receiveShadow
          position={[0, ROOM_H, 0]}
          material={M_ROOF_WHITE}
        >
          <boxGeometry args={[ROOM_W, 0.06, ROOM_D]} />
        </mesh>
        {/* Two soft light bars */}
        {[-1.4, 1.4].map((z, i) => (
          <mesh key={i} position={[0, ROOM_H - 0.05, z]}>
            <boxGeometry args={[ROOM_W * 0.7, 0.03, 0.25]} />
            <meshStandardMaterial
              color={"#fff9ea"}
              emissive={"#fff2c8"}
              emissiveIntensity={0.85}
            />
          </mesh>
        ))}

        {/* --- Conference table --- */}
        <group position={[0, 0, 0]}>
          <mesh castShadow receiveShadow position={[0, 0.78, 0]}>
            <boxGeometry args={[4.4, 0.1, 1.6]} />
            <meshStandardMaterial
              color={"#3f2a1c"}
              roughness={0.35}
              metalness={0.05}
            />
          </mesh>
          {/* Table trim */}
          <mesh position={[0, 0.83, 0]}>
            <boxGeometry args={[4.42, 0.02, 1.62]} />
            <meshStandardMaterial color={"#d9c9a3"} roughness={0.5} />
          </mesh>
          {/* Table pedestals */}
          {[-1.4, 1.4].map((x, i) => (
            <mesh key={i} castShadow position={[x, 0.38, 0]} material={M_METAL_DARK}>
              <boxGeometry args={[0.3, 0.75, 0.5]} />
            </mesh>
          ))}
          {/* Screens on the table */}
          {[-1.6, -0.55, 0.55, 1.6].map((x, i) => (
            <mesh
              key={i}
              castShadow
              position={[x, 0.86, i % 2 ? 0.4 : -0.4]}
            >
              <boxGeometry args={[0.4, 0.25, 0.02]} />
              <meshStandardMaterial
                color={"#111827"}
                emissive={"#3b475e"}
                emissiveIntensity={0.25}
              />
            </mesh>
          ))}
        </group>

        {/* --- Chairs — 8, around the table --- */}
        {CHAIRS.map(([x, z, rot], i) => (
          <group key={i} position={[x, 0, z]} rotation={[0, rot, 0]}>
            <mesh castShadow position={[0, 0.45, 0]}>
              <boxGeometry args={[0.55, 0.08, 0.55]} />
              <meshStandardMaterial color={"#1f2937"} roughness={0.6} />
            </mesh>
            <mesh castShadow position={[0, 0.85, -0.24]}>
              <boxGeometry args={[0.55, 0.8, 0.08]} />
              <meshStandardMaterial color={"#1f2937"} roughness={0.6} />
            </mesh>
            <mesh castShadow position={[0, 0.22, 0]} material={M_METAL_DARK}>
              <cylinderGeometry args={[0.04, 0.04, 0.4, 8]} />
            </mesh>
          </group>
        ))}

        {/* --- Potted plant --- */}
        <group position={[-ROOM_W / 2 + 0.8, 0, ROOM_D / 2 - 0.7]}>
          <mesh castShadow position={[0, 0.25, 0]}>
            <cylinderGeometry args={[0.25, 0.22, 0.5, 16]} />
            <meshStandardMaterial color={"#8f5a3c"} roughness={0.9} />
          </mesh>
          <mesh castShadow position={[0, 0.95, 0]}>
            <icosahedronGeometry args={[0.55, 1]} />
            <meshStandardMaterial color={"#4f9d5d"} roughness={0.9} />
          </mesh>
        </group>

        {/* --- Session card floating in front of the screen --- */}
        <Html
          position={[0, ROOM_H / 2 + 0.15, -ROOM_D / 2 + 0.08]}
          center
          transform
          distanceFactor={4.2}
          style={{ pointerEvents: "none" }}
        >
          <div
            style={{
              width: 260,
              padding: "10px 14px",
              borderRadius: 8,
              background: "rgba(15,23,42,0.35)",
              color: "#f7fafc",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              boxShadow: "0 6px 24px -8px rgba(0,0,0,0.5)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 9,
                letterSpacing: "0.34em",
                textTransform: "uppercase",
                opacity: 0.7,
              }}
            >
              {meta.buildingName} · {meta.floorLabel}
            </div>
            <div
              style={{
                marginTop: 4,
                fontSize: 15,
                fontWeight: 300,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
              }}
            >
              {meta.roomName}
            </div>
            <div
              style={{
                marginTop: 4,
                fontSize: 9,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                opacity: 0.75,
              }}
            >
              {meta.time} · {meta.host}
            </div>
          </div>
        </Html>
      </group>
    </group>
  );
}

// ---------------- Chair positions ----------------

const CHAIRS: [number, number, number][] = [
  // north side of table
  [-1.6, -1.15, Math.PI],
  [-0.55, -1.15, Math.PI],
  [0.55, -1.15, Math.PI],
  [1.6, -1.15, Math.PI],
  // south side of table
  [-1.6, 1.15, 0],
  [-0.55, 1.15, 0],
  [0.55, 1.15, 0],
  [1.6, 1.15, 0],
];

// ---------------- Room mounter ----------------

function resolveMeta(key: InteriorKey) {
  const [buildingId, floorIdxStr, roomId] = key.split("::") as [
    "eb3" | "signature-tower",
    string,
    string,
  ];
  const floorIdx = Number(floorIdxStr);
  const b = BUILDINGS[buildingId];
  if (!b) return null;
  const f = b.floors.find((x) => x.index === floorIdx);
  if (!f) return null;
  const r = f.rooms.find((x) => x.id === roomId);
  if (!r) return null;
  return {
    buildingName: b.name,
    floorLabel: f.label,
    roomName: r.name,
    host: r.host,
    time: r.time,
  };
}

/**
 * Mount the currently-focused interior room, if any. Only the one the user is
 * inside is rendered — memory and draw calls stay bounded.
 */
export function ActiveInterior() {
  const f = journey.focus;
  if (f.level !== "inside" || !f.building || f.floor == null || !f.roomId)
    return null;
  const key = `${f.building}::${f.floor}::${f.roomId}` as InteriorKey;
  if (!(key in INTERIOR_ORIGINS)) return null;
  return <RoomInterior interiorKey={key} />;
}
