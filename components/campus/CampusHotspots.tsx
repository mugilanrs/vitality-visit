"use client";

import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { BUILDING_ORDER, BUILDINGS } from "@/data/buildings";
import { journey, subscribeJourney } from "@/lib/journey";

/**
 * PHASE 7 — architectural annotation markers for the two agenda buildings.
 *
 * Only two markers now — EB3 and Signature Tower. They are purely visual:
 * NO pointer events. The pink glass tiles in the overlay are the single
 * click surface, so we can never end up in a hover-fight between two
 * hotspots (which was the source of the old entrance/auditorium flicker).
 *
 * Each marker is a minimal dot + thin vertical line + small label. It
 * fades out when the user drills into a building.
 */

export default function CampusHotspots() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const apply = () => setVisible(journey.focus.level === "campus");
    apply();
    return subscribeJourney(apply, "focus");
  }, []);

  return (
    <group visible={visible}>
      {BUILDING_ORDER.map((id) => {
        const b = BUILDINGS[id];
        return (
          <Marker
            key={id}
            position={[
              b.markerPosition[0],
              b.markerPosition[1],
              b.markerPosition[2],
            ]}
            name={b.name}
            accent={b.accent}
          />
        );
      })}
    </group>
  );
}

function Marker({
  position,
  name,
  accent,
}: {
  position: [number, number, number];
  name: string;
  accent: string;
}) {
  const dotRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (journey.reducedMotion) return;
    const t = state.clock.elapsedTime;
    const pulse = 1 + 0.08 * Math.sin(t * 1.6 + position[0] * 0.5);
    if (dotRef.current) dotRef.current.scale.setScalar(pulse);
    if (ringRef.current)
      ringRef.current.scale.setScalar(1 + 0.12 * Math.sin(t * 1.1));
  });

  return (
    <group position={position} raycast={() => null}>
      {/* Thin vertical annotation line */}
      <mesh position={[0, -0.6, 0]} raycast={() => null}>
        <boxGeometry args={[0.02, 1.2, 0.02]} />
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={0.55}
          depthWrite={false}
        />
      </mesh>

      {/* Halo ring */}
      <mesh
        ref={ringRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        raycast={() => null}
      >
        <ringGeometry args={[0.14, 0.19, 40]} />
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={0.6}
          depthWrite={false}
        />
      </mesh>

      {/* Filled dot */}
      <mesh
        ref={dotRef}
        rotation={[-Math.PI / 2, 0, 0]}
        raycast={() => null}
      >
        <circleGeometry args={[0.09, 24]} />
        <meshBasicMaterial
          color={"#f7fafc"}
          transparent
          opacity={0.98}
          depthWrite={false}
        />
      </mesh>

      {/* Label */}
      <Html
        position={[0, 0.35, 0]}
        center
        occlude={false}
        zIndexRange={[10, 0]}
        style={{ pointerEvents: "none" }}
      >
        <div
          style={{
            padding: "3px 8px",
            borderRadius: 2,
            background: "rgba(20,28,40,0.72)",
            color: "#f7fafc",
            fontSize: 9.5,
            fontWeight: 500,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            userSelect: "none",
          }}
        >
          {name}
        </div>
      </Html>
    </group>
  );
}
