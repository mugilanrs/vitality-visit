"use client";

import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { CAMPUS_LOCATIONS } from "@/data/campusLocations";
import { journey, emitJourneyChange } from "@/lib/journey";

/**
 * World-space hotspots — one per location. A soft luminous disc + a minimal
 * floating label. Hover lifts the label and stores the hover index on the
 * journey state so the UI can react.
 *
 * Positions come from each location's `camera.target` (the point the camera
 * looks at when that stop is active). This keeps hotspot ↔ camera aligned
 * without a second position source.
 *
 * Click: writes the desired index into a global custom event so the page's
 * scroll container can smooth-scroll to that stop. Kept as an event so the
 * scroll owner remains the single source of truth.
 */

type Props = {
  /** Optional external "onFocus" — page.tsx wires this to its scroll jump. */
  onFocus?: (index: number) => void;
};

const dot = new THREE.Vector3();

export default function CampusHotspots(_props: Props = {}) {
  return (
    <group>
      {CAMPUS_LOCATIONS.map((loc, i) => {
        const t = loc.camera.target ?? [0, 0, 0];
        return <Hotspot key={loc.id} index={i} position={[t[0], 0, t[2]]} name={loc.name} />;
      })}
    </group>
  );
}

function Hotspot({
  index,
  position,
  name,
}: {
  index: number;
  position: [number, number, number];
  name: string;
}) {
  const [hovered, setHovered] = useState(false);
  const [active, setActive] = useState(false);
  const ringRef = useRef<THREE.Mesh>(null);
  const dotRef = useRef<THREE.Mesh>(null);

  // Idle breathing scale on the ring + dot
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const pulse = 1 + 0.06 * Math.sin(t * 1.4 + index * 0.7);
    if (ringRef.current) ringRef.current.scale.setScalar(pulse);
    if (dotRef.current) dotRef.current.scale.setScalar(hovered ? 1.3 : 1);
  });

  // Reflect active from journey.activeIndex, without React re-renders per frame.
  useFrame(() => {
    const next = journey.activeIndex === index;
    if (next !== active) setActive(next);
  });

  const ringColor = hovered ? "#f7b6cf" : active ? "#ffffff" : "#7cc4c4";
  const labelBg = hovered
    ? "rgba(255,255,255,0.98)"
    : active
      ? "rgba(255,255,255,0.94)"
      : "rgba(255,255,255,0.78)";

  return (
    <group position={position}>
      {/* Luminous ground ring */}
      <mesh
        ref={ringRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.03, 0]}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          journey.hoverIndex = index;
          emitJourneyChange();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          if (journey.hoverIndex === index) {
            journey.hoverIndex = null;
            emitJourneyChange();
          }
          document.body.style.cursor = "";
        }}
        onClick={(e) => {
          e.stopPropagation();
          window.dispatchEvent(
            new CustomEvent("campus-focus", { detail: { index } }),
          );
        }}
      >
        <ringGeometry args={[0.42, 0.55, 40]} />
        <meshStandardMaterial
          color={ringColor}
          emissive={ringColor}
          emissiveIntensity={hovered ? 0.55 : 0.3}
          transparent
          opacity={hovered ? 0.95 : 0.75}
        />
      </mesh>

      {/* Small central dot */}
      <mesh
        ref={dotRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.032, 0]}
      >
        <circleGeometry args={[0.14, 24]} />
        <meshStandardMaterial
          color={ringColor}
          emissive={ringColor}
          emissiveIntensity={0.7}
        />
      </mesh>

      {/* Floating label — pure screen-space, fixed size */}
      <Html
        position={[0, hovered || active ? 0.9 : 0.6, 0]}
        center
        occlude={false}
        zIndexRange={[10, 0]}
        style={{ pointerEvents: "none" }}
      >
        <div
          style={{
            background: labelBg,
            color: "#1b2432",
            padding: "3px 9px",
            borderRadius: 999,
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            boxShadow: hovered
              ? "0 8px 24px -8px rgba(15,23,42,0.32)"
              : "0 4px 12px -6px rgba(15,23,42,0.22)",
            transform: hovered || active ? "translateY(0)" : "translateY(4px)",
            opacity: hovered || active ? 1 : 0.7,
            transition: "all 220ms cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {String(index + 1).padStart(2, "0")} · {name}
        </div>
      </Html>
    </group>
  );
}
