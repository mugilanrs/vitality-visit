"use client";

import { Html } from "@react-three/drei";
import { useEffect, useState } from "react";
import {
  BUILDING_ORDER,
  BUILDINGS,
  type BuildingSpec,
} from "@/data/buildings";
import {
  journey,
  subscribeJourney,
  openBuilding,
  setHoverIndex,
} from "@/lib/journey";

/**
 * PHASE 8 — six world-anchored architectural glass tiles.
 *
 * Each tile floats slightly above its building via drei's <Html>, so it
 * lives inside the scene rather than the DOM overlay. Result: the tile is
 * spatially and visually anchored to its building, exactly as the brief
 * calls for ("THIS TILE → THIS BUILDING").
 *
 * A tile is not a card — it is architectural wayfinding: frosted white with
 * a very subtle pink tint, a thin pink/white edge, and a soft pink glow that
 * grows on hover.
 *
 * Tiles fade out when the user drills into a building (level !== "campus").
 */
export default function SpatialTiles() {
  const [visible, setVisible] = useState(journey.focus.level === "campus");

  useEffect(() => {
    const apply = () => setVisible(journey.focus.level === "campus");
    apply();
    return subscribeJourney(apply, "focus");
  }, []);

  return (
    <group>
      {BUILDING_ORDER.map((id, i) => {
        const b = BUILDINGS[id];
        return (
          <SpatialTile
            key={id}
            index={i}
            building={b}
            reveal={visible}
          />
        );
      })}
    </group>
  );
}

function SpatialTile({
  index,
  building,
  reveal,
}: {
  index: number;
  building: BuildingSpec;
  reveal: boolean;
}) {
  const [hover, setHover] = useState(false);

  const [x, y, z] = building.markerPosition;

  // Left-side blocks anchor to the right of their marker, right-side to the left,
  // so the tile never sits over the building silhouette.
  const anchorOffsetX = building.side === "left" ? -110 : 110;

  return (
    <group position={[x, y, z]}>
      <Html
        center
        occlude={false}
        zIndexRange={[15, 5]}
        style={{
          pointerEvents: reveal ? "auto" : "none",
          userSelect: "none",
          transform: `translate(${anchorOffsetX}px, 0)`,
        }}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            openBuilding(building.id);
          }}
          onMouseEnter={() => {
            setHover(true);
            setHoverIndex(index);
          }}
          onMouseLeave={() => {
            setHover(false);
            if (journey.hoverIndex === index) setHoverIndex(null);
          }}
          className="group relative flex w-[168px] flex-col items-start rounded-2xl border px-3.5 py-3 text-left transition-all duration-300 focus:outline-none"
          style={{
            background:
              "linear-gradient(140deg, rgba(255,255,255,0.42) 0%, rgba(255,232,240,0.34) 55%, rgba(255,214,230,0.28) 100%)",
            borderColor: hover
              ? "rgba(255,182,203,0.72)"
              : "rgba(255,255,255,0.42)",
            backdropFilter: "blur(14px) saturate(160%)",
            WebkitBackdropFilter: "blur(14px) saturate(160%)",
            boxShadow: hover
              ? "0 22px 60px -18px rgba(244,163,193,0.65), 0 0 26px rgba(255,182,203,0.35), inset 0 1px 0 rgba(255,255,255,0.6)"
              : "0 14px 40px -18px rgba(244,163,193,0.4), inset 0 1px 0 rgba(255,255,255,0.55)",
            transform: hover
              ? "translateY(-3px)"
              : reveal
                ? "translateY(0)"
                : "translateY(6px)",
            opacity: reveal ? (hover ? 1 : 0.92) : 0,
            filter: reveal ? "none" : "blur(4px)",
            transition:
              "opacity 380ms cubic-bezier(0.4,0,0.2,1), transform 380ms cubic-bezier(0.4,0,0.2,1), filter 380ms, background 220ms, box-shadow 220ms, border-color 220ms",
          }}
        >
          {/* Inner highlight rim */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-[1px] rounded-[15px]"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0) 45%)",
            }}
          />
          <span className="relative text-[8.5px] font-medium uppercase tracking-[0.32em] text-slate-700/85">
            Agenda
          </span>
          <span className="relative mt-0.5 text-[13px] font-light uppercase tracking-[0.14em] text-slate-900">
            {building.name}
          </span>
          <span className="relative mt-0.5 text-[9px] uppercase tracking-[0.28em] text-slate-700/75">
            {building.subtitle}
          </span>
          <span
            className="relative mt-2 flex w-full items-center justify-between text-[9px] uppercase tracking-[0.28em] text-slate-700/80"
          >
            <span>
              {building.floors.length === 1
                ? "1 space"
                : `${building.floors.length} floors`}
            </span>
            <span
              className="text-slate-900 transition-transform duration-300"
              style={{ transform: hover ? "translateX(3px)" : "translateX(0)" }}
            >
              →
            </span>
          </span>

          {/* Tiny anchor tick pointing back toward the building */}
          <span
            aria-hidden
            className="pointer-events-none absolute top-1/2 h-[1.5px] w-4"
            style={{
              background:
                "linear-gradient(90deg, rgba(255,182,203,0.9), rgba(255,182,203,0))",
              [building.side === "left" ? "right" : "left"]: "-16px",
              transform: `translateY(-50%) ${building.side === "left" ? "" : "scaleX(-1)"}`,
              opacity: hover ? 1 : 0.55,
              transition: "opacity 220ms",
            }}
          />
        </button>
      </Html>
    </group>
  );
}
