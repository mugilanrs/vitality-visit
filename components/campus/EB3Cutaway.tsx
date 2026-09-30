"use client";

import { Html } from "@react-three/drei";
import { useEffect, useState } from "react";
import * as THREE from "three";
import {
  M_WHITE_SHELL,
  M_ROOF_WHITE,
  M_TEAL_GLASS,
  M_METAL_DARK,
} from "@/lib/materials";
import {
  BUILDINGS,
  BLOCK_SIZE,
} from "@/data/buildings";
import { journey, openFloor, subscribeJourney } from "@/lib/journey";

/**
 * PHASE 9 — the EB3 vertical architectural cutaway.
 *
 * When journey.focus is at level "building" and building === "eb3", the
 * six-block scene fades and EB3 becomes a vertical section — three floor
 * slabs stacked, each carrying a floating destination card:
 *
 *          ┌────────────────┐
 *          │ Board Room PM  │  ← Level 3
 *          ├────────────────┤
 *          │ Board Room AM  │  ← Level 2
 *          ├────────────────┤
 *          │      ODC       │  ← Level 1
 *          └────────────────┘
 *
 * Each level is clickable — clicking flies the camera to that floor's
 * interior (the existing RoomInterior scene).
 */

export default function EB3Cutaway() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const apply = () =>
      setActive(
        journey.focus.level === "building" && journey.focus.building === "eb3",
      );
    apply();
    return subscribeJourney(apply, "focus");
  }, []);

  const eb3 = BUILDINGS.eb3;
  if (!eb3) return null;
  const [bx, , bz] = eb3.basePosition;

  return (
    <group position={[bx, 0, bz]} visible={active}>
      <Slice active={active} floors={eb3.floors} />
    </group>
  );
}

function Slice({
  active,
  floors,
}: {
  active: boolean;
  floors: (typeof BUILDINGS)["eb3"]["floors"];
}) {
  // Cutaway dimensions — slightly larger than the actual EB3 shell so the
  // section reads as an emphasized architectural drawing.
  const W = BLOCK_SIZE.width * 1.15;
  const D = BLOCK_SIZE.depth * 1.15;
  const H = 1.15; // per-level slab height (roomy)
  const slabT = 0.06;

  return (
    <group>
      {/* Vertical spine — rear wall behind the levels */}
      <mesh
        castShadow
        receiveShadow
        position={[0, floors.length * H / 2, -D / 2]}
        material={M_WHITE_SHELL}
      >
        <boxGeometry args={[W, floors.length * H + 0.2, 0.06]} />
      </mesh>

      {/* Two side walls (thin) so the section reads as a room */}
      {[-1, 1].map((s) => (
        <mesh
          key={s}
          castShadow
          receiveShadow
          position={[s * W / 2, floors.length * H / 2, -D / 4]}
          material={M_WHITE_SHELL}
        >
          <boxGeometry args={[0.04, floors.length * H + 0.2, D * 0.6]} />
        </mesh>
      ))}

      {floors.map((f, i) => (
        <Level
          key={f.index}
          floor={f}
          y={i * H}
          W={W}
          D={D}
          H={H}
          slabT={slabT}
          active={active}
        />
      ))}

      {/* Top canopy above level 3 */}
      <mesh
        castShadow
        receiveShadow
        position={[0, floors.length * H + 0.03, 0]}
        material={M_ROOF_WHITE}
      >
        <boxGeometry args={[W + 0.5, 0.08, D + 0.5]} />
      </mesh>
    </group>
  );
}

function Level({
  floor,
  y,
  W,
  D,
  H,
  slabT,
  active,
}: {
  floor: (typeof BUILDINGS)["eb3"]["floors"][number];
  y: number;
  W: number;
  D: number;
  H: number;
  slabT: number;
  active: boolean;
}) {
  const [hover, setHover] = useState(false);
  const room = floor.rooms[0];

  return (
    <group position={[0, y, 0]}>
      {/* Floor slab */}
      <mesh
        castShadow
        receiveShadow
        position={[0, slabT / 2, 0]}
        material={M_WHITE_SHELL}
      >
        <boxGeometry args={[W + 0.3, slabT, D + 0.3]} />
      </mesh>
      {/* Slab underline — thin darker strip on the front edge */}
      <mesh position={[0, slabT + 0.005, D / 2 + 0.15]} material={M_METAL_DARK}>
        <boxGeometry args={[W + 0.32, 0.02, 0.02]} />
      </mesh>

      {/* Glass front face — the "cutaway" reveal */}
      <mesh
        castShadow
        position={[0, H / 2, D / 4]}
        material={M_TEAL_GLASS}
      >
        <boxGeometry args={[W * 0.9, H * 0.88, 0.03]} />
      </mesh>

      {/* Furniture silhouette — a simple table + a couple of chair blobs.
          Just enough architectural detail to read as an inhabited floor. */}
      <mesh
        castShadow
        position={[0, 0.28, -0.15]}
        material={M_METAL_DARK}
      >
        <boxGeometry args={[W * 0.55, 0.06, D * 0.3]} />
      </mesh>
      {[-1, 0, 1].map((cx) => (
        <mesh key={cx} castShadow position={[cx * W * 0.22, 0.18, 0.1]}>
          <boxGeometry args={[0.2, 0.36, 0.2]} />
          <meshStandardMaterial color={"#1f2937"} roughness={0.6} />
        </mesh>
      ))}

      {/* Floating destination tag — glass pill anchored to this level */}
      <Html
        position={[W / 2 + 0.6, H / 2, 0]}
        center
        occlude={false}
        style={{
          pointerEvents: active ? "auto" : "none",
          userSelect: "none",
        }}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            openFloor(floor.index);
          }}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          className="group relative flex flex-col items-start rounded-xl border px-3 py-2 focus:outline-none"
          style={{
            width: 168,
            background:
              "linear-gradient(140deg, rgba(255,255,255,0.55) 0%, rgba(255,232,240,0.4) 100%)",
            borderColor: hover
              ? "rgba(255,182,203,0.9)"
              : "rgba(255,255,255,0.6)",
            backdropFilter: "blur(14px) saturate(160%)",
            WebkitBackdropFilter: "blur(14px) saturate(160%)",
            boxShadow: hover
              ? "0 14px 30px -14px rgba(244,163,193,0.65), 0 0 20px rgba(255,182,203,0.4), inset 0 1px 0 rgba(255,255,255,0.7)"
              : "0 10px 24px -14px rgba(244,163,193,0.45), inset 0 1px 0 rgba(255,255,255,0.55)",
            transform: hover ? "translateY(-2px)" : "translateY(0)",
            transition:
              "transform 260ms cubic-bezier(0.4,0,0.2,1), background 200ms, box-shadow 200ms, border-color 200ms",
          }}
        >
          <span className="text-[8.5px] font-medium uppercase tracking-[0.34em] text-slate-700/85">
            {floor.label}
          </span>
          <span className="mt-0.5 text-[13px] font-light uppercase tracking-[0.14em] text-slate-900">
            {room?.name ?? floor.name}
          </span>
          <span className="mt-1 text-[9px] uppercase tracking-[0.26em] text-slate-700/80">
            {room?.time ?? ""}
          </span>
          <span
            className="mt-1.5 flex w-full items-center justify-between text-[9px] uppercase tracking-[0.28em] text-slate-700"
          >
            <span>{room?.host ?? ""}</span>
            <span
              className="transition-transform duration-300"
              style={{ transform: hover ? "translateX(3px)" : "translateX(0)" }}
            >
              →
            </span>
          </span>

          {/* Anchor tick pointing back at the level */}
          <span
            aria-hidden
            className="pointer-events-none absolute top-1/2 -left-3 h-[1.5px] w-3"
            style={{
              background:
                "linear-gradient(90deg, rgba(255,182,203,0), rgba(255,182,203,0.9))",
              transform: "translateY(-50%)",
              opacity: hover ? 1 : 0.6,
              transition: "opacity 220ms",
            }}
          />
        </button>
      </Html>
    </group>
  );
}
