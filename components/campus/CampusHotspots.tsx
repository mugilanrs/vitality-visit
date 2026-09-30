"use client";

import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { CAMPUS_LOCATIONS } from "@/data/campusLocations";
import {
  journey,
  setHoverIndex,
  subscribeJourney,
} from "@/lib/journey";

/**
 * PHASE 5 — architectural hotspot annotations.
 *
 * Composition (per hotspot):
 *
 *          LOCATION NAME
 *               │        <- thin vertical annotation line
 *               ●        <- 1.5px dot
 *
 * States:
 *   DEFAULT   — dot only, label faded
 *   HOVER     — dot enlarges, label rises + fades in, line brightens
 *   ACTIVE    — dot filled with accent, label persists, line remains
 *   VISITED   — very subtle ring around the dot
 *
 * Positions come from each location's `hotspotPosition` (may differ from
 * cameraTarget — some markers sit on rooftops).
 */

type HotspotVisual = {
  size: number;
  labelOpacity: number;
  lineOpacity: number;
  lineHeight: number;
  labelOffsetY: number;
  ringOpacity: number;
};

const DEFAULT_STATE: HotspotVisual = {
  size: 1.0,
  labelOpacity: 0,
  lineOpacity: 0.28,
  lineHeight: 0.72,
  labelOffsetY: 0,
  ringOpacity: 0,
};
const HOVER_STATE: HotspotVisual = {
  size: 1.65,
  labelOpacity: 1,
  lineOpacity: 0.9,
  lineHeight: 1.0,
  labelOffsetY: 6,
  ringOpacity: 0.55,
};
const ACTIVE_STATE: HotspotVisual = {
  size: 1.45,
  labelOpacity: 1,
  lineOpacity: 0.85,
  lineHeight: 1.0,
  labelOffsetY: 4,
  ringOpacity: 0.7,
};
const VISITED_STATE: HotspotVisual = {
  size: 1.08,
  labelOpacity: 0.45,
  lineOpacity: 0.42,
  lineHeight: 0.76,
  labelOffsetY: 2,
  ringOpacity: 0.28,
};

function pickState(
  active: boolean,
  hovered: boolean,
  visited: boolean,
): HotspotVisual {
  if (hovered) return HOVER_STATE;
  if (active) return ACTIVE_STATE;
  if (visited) return VISITED_STATE;
  return DEFAULT_STATE;
}

export default function CampusHotspots() {
  return (
    <group>
      {CAMPUS_LOCATIONS.map((loc, i) => (
        <Hotspot
          key={loc.id}
          index={i}
          position={[
            loc.hotspotPosition[0],
            loc.hotspotPosition[1],
            loc.hotspotPosition[2],
          ]}
          name={loc.shortName}
          accent={loc.accent}
        />
      ))}
    </group>
  );
}

function Hotspot({
  index,
  position,
  name,
  accent,
}: {
  index: number;
  position: [number, number, number];
  name: string;
  accent: string;
}) {
  const [hovered, setHovered] = useState(false);
  const [active, setActive] = useState(journey.activeIndex === index);
  const [visited, setVisited] = useState(journey.visited.has(index));
  const dotRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const lineRef = useRef<THREE.Mesh>(null);
  const lineMatRef = useRef<THREE.MeshBasicMaterial | null>(null);
  const ringMatRef = useRef<THREE.MeshBasicMaterial | null>(null);
  const dotMatRef = useRef<THREE.MeshBasicMaterial | null>(null);

  // React to journey changes without re-rendering every frame.
  useEffect(() => {
    return subscribeJourney(() => {
      const nowActive = journey.activeIndex === index;
      const nowVisited = journey.visited.has(index);
      setActive(nowActive);
      setVisited(nowVisited);
    }, "change");
  }, [index]);

  // Reflect state visually — animated toward the target state.
  const smoothed = useRef<HotspotVisual>({ ...DEFAULT_STATE });
  useFrame((_, dt) => {
    const target = pickState(active, hovered, visited);
    const k = Math.min(1, dt * 8);
    const s = smoothed.current;
    s.size += (target.size - s.size) * k;
    s.labelOpacity += (target.labelOpacity - s.labelOpacity) * k;
    s.lineOpacity += (target.lineOpacity - s.lineOpacity) * k;
    s.lineHeight += (target.lineHeight - s.lineHeight) * k;
    s.labelOffsetY += (target.labelOffsetY - s.labelOffsetY) * k;
    s.ringOpacity += (target.ringOpacity - s.ringOpacity) * k;

    if (dotRef.current) dotRef.current.scale.setScalar(s.size);
    if (ringRef.current) ringRef.current.scale.setScalar(s.size * 1.6);
    if (lineRef.current) {
      lineRef.current.scale.y = s.lineHeight;
      lineRef.current.position.y = s.lineHeight * 0.5;
    }
    if (lineMatRef.current) lineMatRef.current.opacity = s.lineOpacity;
    if (ringMatRef.current) ringMatRef.current.opacity = s.ringOpacity;
    if (dotMatRef.current) {
      // Dot subtly picks up accent when hover or active
      dotMatRef.current.color.set(
        hovered || active ? accent : "#f7fafc",
      );
    }
  });

  return (
    <group position={position}>
      {/* Thin vertical annotation line rising from the ground/roof mark */}
      <mesh ref={lineRef} position={[0, 0.36, 0]}>
        <boxGeometry args={[0.015, 0.72, 0.015]} />
        <meshBasicMaterial
          ref={lineMatRef}
          color={accent}
          transparent
          opacity={0.28}
          depthWrite={false}
        />
      </mesh>

      {/* Subtle ring — reads as visited/active */}
      <mesh
        ref={ringRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.015, 0]}
      >
        <ringGeometry args={[0.11, 0.15, 40]} />
        <meshBasicMaterial
          ref={ringMatRef}
          color={accent}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>

      {/* The dot — small, precise, sits at ground/roof mark */}
      <mesh
        ref={dotRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.018, 0]}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          setHoverIndex(index);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          if (journey.hoverIndex === index) setHoverIndex(null);
          document.body.style.cursor = "";
        }}
        onClick={(e) => {
          e.stopPropagation();
          window.dispatchEvent(
            new CustomEvent("campus-focus", { detail: { index } }),
          );
        }}
      >
        <circleGeometry args={[0.07, 24]} />
        <meshBasicMaterial
          ref={dotMatRef}
          color={"#f7fafc"}
          transparent
          opacity={0.98}
          depthWrite={false}
        />
      </mesh>

      {/* Screen-space label above the annotation line */}
      <Html
        position={[0, 0.95, 0]}
        center
        occlude={false}
        zIndexRange={[10, 0]}
        style={{ pointerEvents: "none" }}
      >
        <div
          style={{
            transform: `translateY(${-smoothed.current.labelOffsetY}px)`,
            opacity: smoothed.current.labelOpacity,
            transition:
              "opacity 220ms ease, transform 220ms cubic-bezier(0.4,0,0.2,1)",
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "3px 8px",
            borderRadius: 2,
            background:
              hovered || active
                ? "rgba(20,28,40,0.86)"
                : "rgba(20,28,40,0.62)",
            color: "#f7fafc",
            fontSize: 9.5,
            fontWeight: 500,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            boxShadow:
              hovered || active
                ? "0 6px 18px -8px rgba(15,23,42,0.35)"
                : "none",
            userSelect: "none",
          }}
        >
          <span style={{ opacity: 0.7 }}>
            {String(index + 1).padStart(2, "0")}
          </span>
          <span
            style={{
              width: 1,
              height: 8,
              background: "rgba(247,250,252,0.35)",
            }}
          />
          <span>{name}</span>
        </div>
      </Html>
    </group>
  );
}
