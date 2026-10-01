"use client";

import { useEffect, useState } from "react";
import { MARKER_BUILDINGS, BUILDINGS } from "@/data/buildings";
import { journey, subscribeJourney } from "@/lib/journey";

/**
 * PHASE 10 — ground-plane annotation only under the two interactive
 * destinations (EB3 + Signature Tower). The other four primary blocks
 * are architecture only and no longer wear a hotspot ring.
 *
 * These rings are NOT interactive. The click surface is the pink glass
 * marker (SpatialTiles), so we can never end up in a hover-race between
 * a marker and an on-ground ring.
 */
export default function CampusHotspots() {
  const [visible, setVisible] = useState(journey.focus.level === "campus");

  useEffect(() => {
    const apply = () => setVisible(journey.focus.level === "campus");
    apply();
    return subscribeJourney(apply, "focus");
  }, []);

  return (
    <group visible={visible}>
      {MARKER_BUILDINGS.map((id) => {
        const b = BUILDINGS[id];
        if (!b) return null;
        const [x, , z] = b.basePosition;
        return (
          <group key={id} position={[x, 0.02, z]} raycast={() => null}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
              <ringGeometry args={[0.24, 0.34, 40]} />
              <meshBasicMaterial
                color={b.accent}
                transparent
                opacity={0.5}
                depthWrite={false}
              />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
              <circleGeometry args={[0.14, 24]} />
              <meshBasicMaterial
                color={"#ffffff"}
                transparent
                opacity={0.85}
                depthWrite={false}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
