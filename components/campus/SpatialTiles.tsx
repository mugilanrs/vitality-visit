"use client";

import { Html } from "@react-three/drei";
import { useEffect, useState } from "react";
import {
  BUILDINGS,
  MARKER_BUILDINGS,
  type BuildingSpec,
} from "@/data/buildings";
import {
  journey,
  subscribeJourney,
  openBuilding,
  enterRoom,
  setFocus,
  setHoverIndex,
} from "@/lib/journey";

/**
 * PHASE 9 — exactly two interactive markers.
 *
 * The other four primary blocks are ARCHITECTURE ONLY — no card, no icon,
 * no label. Only EB3 and the Signature Tower carry destinations, so only
 * they need markers.
 *
 * A marker is a compact glass wayfinding tag anchored slightly above its
 * building. Not a card, not a panel.
 *
 * PHASE 10 (mobile correction):
 *   - Marker anchors are viewport-aware. On phones the fixed 66px lateral
 *     offset used on desktop pushed the Signature Tower pill off the right
 *     edge; on mobile we center directly over the world anchor and shorten
 *     the label so the pill fits inside the safe viewport at 390-wide.
 *   - Marker size scales down for touch viewports so it stops covering the
 *     architecture.
 */

/** Hook: coarse mobile detection driven by resize. */
function useMobile() {
  const [is, setIs] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const check = () => {
      const coarse = window.matchMedia?.("(pointer: coarse)").matches ?? false;
      setIs(window.innerWidth < 768 || (coarse && window.innerWidth < 900));
    };
    check();
    window.addEventListener("resize", check);
    window.addEventListener("orientationchange", check);
    return () => {
      window.removeEventListener("resize", check);
      window.removeEventListener("orientationchange", check);
    };
  }, []);
  return is;
}

export default function SpatialTiles() {
  const [visible, setVisible] = useState(journey.focus.level === "campus");
  const isMobile = useMobile();

  useEffect(() => {
    const apply = () => setVisible(journey.focus.level === "campus");
    apply();
    return subscribeJourney(apply, "focus");
  }, []);

  return (
    <group>
      {MARKER_BUILDINGS.map((id, i) => {
        const b = BUILDINGS[id];
        if (!b) return null;
        return (
          <Marker
            key={id}
            index={i}
            building={b}
            reveal={visible}
            icon={id === "eb3" ? "board" : "dining"}
            isMobile={isMobile}
          />
        );
      })}
    </group>
  );
}

// Signature Tower is a direct-entry building: click → straight into dining.
function activate(building: BuildingSpec) {
  if (building.directEntry && building.floors.length === 1 && building.floors[0].rooms.length === 1) {
    const room = building.floors[0].rooms[0];
    setFocus({
      level: "room",
      building: building.id,
      floor: building.floors[0].index,
      roomId: room.id,
    });
    // Small delay so the "flying to the tower" camera move reads before we
    // dive into the interior. GSAP-free by design — the camera resolver
    // handles the smoothing.
    window.setTimeout(() => enterRoom(), 700);
    return;
  }
  openBuilding(building.id);
}

/** Short-form building label for mobile pills. */
function mobileLabel(id: string, full: string): string {
  if (id === "signature-tower") return "Tower";
  return full;
}

function Marker({
  index,
  building,
  reveal,
  icon,
  isMobile,
}: {
  index: number;
  building: BuildingSpec;
  reveal: boolean;
  icon: "board" | "dining";
  isMobile: boolean;
}) {
  const [hover, setHover] = useState(false);

  const [x, y, z] = building.markerPosition;

  // Desktop: lateral offset with tail line pointing back at the building.
  // Mobile: centered directly above the world anchor so the pill never
  //         escapes the viewport (Signature Tower pill previously clipped
  //         off the right edge on 390-wide screens).
  const desktopOffsetX = building.side === "left" ? -66 : 66;
  const desktopOffsetY = building.id === "signature-tower" ? -20 : -4;
  const mobileOffsetX = 0;
  const mobileOffsetY = building.id === "signature-tower" ? -22 : -30;

  const anchorOffsetX = isMobile ? mobileOffsetX : desktopOffsetX;
  const anchorOffsetY = isMobile ? mobileOffsetY : desktopOffsetY;

  const label = isMobile ? mobileLabel(building.id, building.name) : building.name;

  const iconSize = isMobile ? 16 : 20;
  const iconBoxClass = isMobile
    ? "flex h-4 w-4 items-center justify-center rounded-full"
    : "flex h-5 w-5 items-center justify-center rounded-full";
  const buttonPadClass = isMobile ? "px-2.5 py-1" : "px-3 py-1.5";
  const buttonGapClass = isMobile ? "gap-1.5" : "gap-2";
  const labelClass = isMobile
    ? "text-[9.5px] font-semibold uppercase tracking-[0.22em] text-slate-900"
    : "text-[10px] font-medium uppercase tracking-[0.28em] text-slate-900";

  return (
    <group position={[x, y, z]}>
      <Html
        center
        occlude={false}
        zIndexRange={[15, 5]}
        style={{
          pointerEvents: reveal ? "auto" : "none",
          userSelect: "none",
          transform: `translate(${anchorOffsetX}px, ${anchorOffsetY}px)`,
        }}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            activate(building);
          }}
          onMouseEnter={() => {
            setHover(true);
            setHoverIndex(index);
          }}
          onMouseLeave={() => {
            setHover(false);
            if (journey.hoverIndex === index) setHoverIndex(null);
          }}
          onTouchStart={() => setHoverIndex(index)}
          onTouchEnd={() => {
            if (journey.hoverIndex === index) setHoverIndex(null);
          }}
          className={`group relative flex items-center rounded-full border focus:outline-none ${buttonGapClass} ${buttonPadClass}`}
          style={{
            background:
              "linear-gradient(140deg, rgba(255,255,255,0.58) 0%, rgba(255,232,240,0.42) 100%)",
            borderColor: hover
              ? "rgba(255,182,203,0.85)"
              : "rgba(255,255,255,0.6)",
            backdropFilter: "blur(12px) saturate(160%)",
            WebkitBackdropFilter: "blur(12px) saturate(160%)",
            boxShadow: hover
              ? "0 12px 28px -12px rgba(244,163,193,0.65), 0 0 20px rgba(255,182,203,0.4), inset 0 1px 0 rgba(255,255,255,0.7)"
              : "0 8px 20px -12px rgba(244,163,193,0.45), inset 0 1px 0 rgba(255,255,255,0.6)",
            transform: hover
              ? "translateY(-2px)"
              : reveal
                ? "translateY(0)"
                : "translateY(4px)",
            opacity: reveal ? 1 : 0,
            filter: reveal ? "none" : "blur(4px)",
            transition:
              "opacity 380ms cubic-bezier(0.4,0,0.2,1), transform 320ms cubic-bezier(0.4,0,0.2,1), filter 380ms, background 200ms, box-shadow 200ms, border-color 200ms",
            // Keep the pill on-screen if the underlying world anchor drifts
            // near the viewport edge (portrait phones especially).
            maxWidth: isMobile ? "calc(100vw - 28px)" : undefined,
          }}
        >
          <span
            aria-hidden
            className={iconBoxClass}
            style={{
              background: hover
                ? "rgba(244,163,193,0.35)"
                : "rgba(244,163,193,0.22)",
              color: "#7a2d47",
            }}
          >
            {icon === "board" ? <BoardIcon size={iconSize / 2} /> : <DiningIcon size={iconSize / 2} />}
          </span>
          <span className={labelClass}>{label}</span>

          {/* Anchor tick pointing at the building — desktop only, tick would
              overlap the icon on mobile where the pill sits directly over the
              anchor. */}
          {!isMobile && (
            <span
              aria-hidden
              className="pointer-events-none absolute top-1/2 h-[1.5px] w-3"
              style={{
                background:
                  "linear-gradient(90deg, rgba(255,182,203,0.9), rgba(255,182,203,0))",
                [building.side === "left" ? "right" : "left"]: "-12px",
                transform: `translateY(-50%) ${building.side === "left" ? "" : "scaleX(-1)"}`,
                opacity: hover ? 1 : 0.6,
                transition: "opacity 220ms",
              }}
            />
          )}
        </button>
      </Html>
    </group>
  );
}

function BoardIcon({ size = 5 }: { size?: number }) {
  const d = size * 2;
  return (
    <svg width={d} height={d} viewBox="0 0 12 12" fill="none">
      <rect x="1.5" y="2.5" width="9" height="6" rx="1" stroke="currentColor" strokeWidth="1.1" />
      <path d="M4 9v1.5M8 9v1.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

function DiningIcon({ size = 5 }: { size?: number }) {
  const d = size * 2;
  return (
    <svg width={d} height={d} viewBox="0 0 12 12" fill="none">
      <path d="M3 2v4a1 1 0 0 0 1 1v3.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M5 2v3.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M8.5 2c-1 0-1.5.8-1.5 2s.5 2 1.5 2v4.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}
