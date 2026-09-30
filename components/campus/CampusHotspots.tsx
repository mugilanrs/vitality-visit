"use client";

import { useEffect, useState } from "react";
import { BUILDING_ORDER, BUILDINGS } from "@/data/buildings";
import { journey, subscribeJourney } from "@/lib/journey";

/**
 * PHASE 8 — tiny world-space annotation dots under each block.
 *
 * These are NOT interactive. The click surface is the pink glass tile
 * (SpatialTiles), so we can never end up in a hover-race between two
 * on-ground markers. Each dot is a soft pink disc that fades when the
 * user drills into a building.
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
      {BUILDING_ORDER.map((id) => {
        const b = BUILDINGS[id];
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
