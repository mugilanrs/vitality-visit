"use client";

import { useEffect, useState } from "react";
import {
  BUILDINGS,
  type BuildingSpec,
} from "@/data/buildings";
import {
  journey,
  subscribeJourney,
  openFloor,
  openRoom,
  enterRoom,
  focusBack,
  setFocus,
} from "@/lib/journey";

/**
 * PHASE 7 — pink glassmorphism agenda overlay.
 *
 * States (from journey.focus.level):
 *   campus   — two tiles: EB3, Signature Tower
 *   building — floor tiles for that building
 *   floor    — a single room card + "Enter room" CTA
 *   inside   — small "you are inside …" header with a "Leave room" button
 *
 * All cards share one glass card style: rounded, pink tint, backdrop-blurred,
 * pink inner ring and soft pink shadow.
 */
export default function AgendaOverlay() {
  const [focus, setFocusState] = useState(() => ({ ...journey.focus }));
  const [welcome, setWelcomeState] = useState(journey.welcome);

  useEffect(() => {
    const unsubFocus = subscribeJourney(
      () => setFocusState({ ...journey.focus }),
      "focus",
    );
    const unsubWelcome = subscribeJourney(
      () => setWelcomeState(journey.welcome),
      "welcome",
    );
    return () => {
      unsubFocus();
      unsubWelcome();
    };
  }, []);

  // Don't render while the welcome intro is on-screen.
  if (welcome) return null;

  const building =
    focus.building != null ? BUILDINGS[focus.building] : null;
  const floor =
    building && focus.floor != null
      ? building.floors.find((f) => f.index === focus.floor) ?? null
      : null;
  const room =
    floor && focus.roomId
      ? floor.rooms.find((r) => r.id === focus.roomId)
      : null;

  // Campus level: the six spatial tiles handle discovery. AgendaOverlay only
  // renders the drill-down cards + the top breadcrumb (when past campus).
  //
  // PHASE 10 (mobile correction):
  //   - Nothing renders at the campus level so the architecture is unshaded
  //     by any DOM overlay.
  //   - The bottom-anchored cards respect env(safe-area-inset-bottom) so an
  //     iOS home indicator can't crop the CTA.
  //   - The top breadcrumb respects env(safe-area-inset-top).
  //   - The Signature Tower's room step skips the intermediate card entirely
  //     — direct-entry buildings go straight to the InsideBar.
  if (focus.level === "campus") return null;

  const insideSignatureRoom =
    focus.level === "room" &&
    building?.directEntry === true;

  return (
    <div className="pointer-events-none fixed inset-0 z-30">
      <div
        className="pointer-events-none absolute inset-x-0 flex justify-center"
        style={{
          top: "calc(max(1.5rem, env(safe-area-inset-top)) + 0.5rem)",
        }}
      >
        <BreadCrumb focusLevel={focus.level} building={building} floor={floor} />
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 flex justify-center px-4"
        style={{
          bottom: "calc(max(1.5rem, env(safe-area-inset-bottom)) + 0.75rem)",
        }}
      >
        {/* EB3's building level is presented by the in-scene EB3Cutaway,
            so no DOM card is needed there. Other buildings would fall
            through to the DOM card. */}
        {focus.level === "building" && building && building.id !== "eb3" && (
          <BuildingCard building={building} />
        )}
        {focus.level === "floor" && building && floor && (
          <FloorCard building={building} floor={floor} />
        )}
        {focus.level === "room" && building && floor && room && !insideSignatureRoom && (
          <RoomCard buildingName={building.name} floorLabel={floor.label} room={room} />
        )}
        {focus.level === "inside" && building && floor && room && (
          <InsideBar
            buildingName={building.name}
            floorLabel={floor.label}
            roomName={room.name}
          />
        )}
      </div>
    </div>
  );
}

// ---------------- Cards ----------------

function BuildingCard({ building }: { building: BuildingSpec }) {
  return (
    <GlassCard>
      <SectionHeading kicker={building.subtitle} title={building.name} />
      <div className="mt-6 flex flex-col gap-3 md:flex-row md:gap-4">
        {building.floors.map((f) => (
          <button
            key={f.index}
            type="button"
            onClick={() => openFloor(f.index)}
            className="group flex-1 rounded-2xl border border-white/40 p-4 text-left backdrop-blur-lg transition-all hover:-translate-y-0.5 focus:outline-none"
            style={{
              background:
                "linear-gradient(140deg, rgba(255,230,238,0.5) 0%, rgba(244,163,193,0.28) 100%)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.55)",
            }}
          >
            <div className="text-[10px] uppercase tracking-[0.3em] text-slate-700/85">
              {f.label}
            </div>
            <div className="mt-1 text-lg font-light uppercase tracking-[0.14em] text-slate-900">
              {f.name}
            </div>
            <div className="mt-2 flex items-center justify-between text-[10px] uppercase tracking-[0.26em] text-slate-700/80">
              <span>{f.rooms.length === 1 ? "1 room" : `${f.rooms.length} rooms`}</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </div>
          </button>
        ))}
      </div>
    </GlassCard>
  );
}

function FloorCard({
  building,
  floor,
}: {
  building: BuildingSpec;
  floor: (typeof building.floors)[number];
}) {
  // Single-room floors auto-highlight that room; multi-room floors show a
  // grid.
  return (
    <GlassCard>
      <SectionHeading
        kicker={`${building.name} · ${floor.label}`}
        title={floor.name}
      />
      <div className="mt-6 flex flex-col gap-3">
        {floor.rooms.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => openRoom(r.id)}
            className="group flex items-center justify-between rounded-2xl border border-white/40 px-5 py-4 text-left backdrop-blur-lg transition-all hover:-translate-y-0.5 focus:outline-none"
            style={{
              background:
                "linear-gradient(140deg, rgba(255,230,238,0.5) 0%, rgba(244,163,193,0.28) 100%)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.55)",
            }}
          >
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-slate-700/85">
                {r.time} · {r.host}
              </div>
              <div className="mt-0.5 text-lg font-light uppercase tracking-[0.14em] text-slate-900">
                {r.name}
              </div>
              <div className="mt-0.5 text-[10px] uppercase tracking-[0.26em] text-slate-700/80">
                {r.capacity}
              </div>
            </div>
            <span className="text-[10px] uppercase tracking-[0.28em] text-slate-700 transition-transform group-hover:translate-x-1">
              Open →
            </span>
          </button>
        ))}
      </div>
    </GlassCard>
  );
}

function RoomCard({
  buildingName,
  floorLabel,
  room,
}: {
  buildingName: string;
  floorLabel: string;
  room: {
    name: string;
    session: string;
    host: string;
    time: string;
    capacity: string;
  };
}) {
  return (
    <GlassCard>
      <SectionHeading
        kicker={`${buildingName} · ${floorLabel}`}
        title={room.name}
      />
      <div className="mt-4 text-[10px] uppercase tracking-[0.3em] text-slate-700/85">
        {room.time} · {room.host}
      </div>
      <h3 className="mt-1 font-light text-2xl leading-tight text-slate-900">
        {room.session}
      </h3>

      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-900/10 pt-3">
        <div>
          <div className="text-[9px] uppercase tracking-[0.28em] text-slate-500">
            Capacity
          </div>
          <div className="mt-0.5 text-sm text-slate-900">{room.capacity}</div>
        </div>
        <div>
          <div className="text-[9px] uppercase tracking-[0.28em] text-slate-500">
            Format
          </div>
          <div className="mt-0.5 text-sm text-slate-900">Board table</div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={focusBack}
          className="pointer-events-auto rounded-full border border-slate-900/20 px-4 py-2 text-[10px] uppercase tracking-[0.28em] text-slate-800 transition-colors hover:bg-white/50 focus:outline-none"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={enterRoom}
          className="pointer-events-auto rounded-full border border-slate-900/25 bg-white/85 px-6 py-2.5 text-[10px] uppercase tracking-[0.32em] text-slate-900 shadow-[0_10px_40px_-12px_rgba(15,23,42,0.35)] transition-all hover:-translate-y-0.5 hover:bg-white focus:outline-none"
        >
          Enter room →
        </button>
      </div>
    </GlassCard>
  );
}

function InsideBar({
  buildingName,
  floorLabel,
  roomName,
}: {
  buildingName: string;
  floorLabel: string;
  roomName: string;
}) {
  return (
    <div
      className="pointer-events-auto flex items-center gap-4 rounded-full border border-white/45 px-5 py-2.5 backdrop-blur-xl"
      style={{
        background:
          "linear-gradient(140deg, rgba(255,214,230,0.4) 0%, rgba(244,163,193,0.28) 100%)",
        boxShadow:
          "0 20px 60px -18px rgba(244,163,193,0.55), inset 0 1px 0 rgba(255,255,255,0.55)",
      }}
    >
      <div>
        <div className="text-[9px] uppercase tracking-[0.34em] text-slate-700/85">
          {buildingName} · {floorLabel}
        </div>
        <div className="text-[12px] uppercase tracking-[0.18em] text-slate-900">
          {roomName}
        </div>
      </div>
      <button
        type="button"
        onClick={focusBack}
        className="rounded-full border border-slate-900/20 px-4 py-1.5 text-[10px] uppercase tracking-[0.28em] text-slate-800 transition-colors hover:bg-white/60 focus:outline-none"
      >
        ← Leave room
      </button>
    </div>
  );
}

// ---------------- Shared bits ----------------

function GlassCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="pointer-events-auto w-[min(92vw,520px)] rounded-3xl border border-white/40 p-6 backdrop-blur-2xl"
      style={{
        background:
          "linear-gradient(140deg, rgba(255,214,230,0.4) 0%, rgba(244,163,193,0.24) 45%, rgba(255,255,255,0.2) 100%)",
        boxShadow:
          "0 22px 60px -18px rgba(244,163,193,0.55), inset 0 1px 0 rgba(255,255,255,0.55)",
      }}
    >
      {children}
    </div>
  );
}

function SectionHeading({
  kicker,
  title,
}: {
  kicker: string;
  title: string;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.34em] text-slate-700/80">
        {kicker}
      </div>
      <div className="mt-1 text-2xl font-light uppercase tracking-[0.14em] text-slate-900">
        {title}
      </div>
    </div>
  );
}

// ---------------- Top breadcrumb ----------------

type CrumbProps = {
  focusLevel: string;
  building: BuildingSpec | null;
  floor: { label: string } | null;
};

function BreadCrumb({ focusLevel, building, floor }: CrumbProps) {
  if (focusLevel === "campus") {
    return (
      <div className="pointer-events-none flex flex-col items-center">
        <div className="text-[10px] uppercase tracking-[0.42em] text-slate-500">
          Agenda
        </div>
        <div className="mt-1 text-[11px] uppercase tracking-[0.32em] text-slate-800">
          Choose a building
        </div>
      </div>
    );
  }

  const bits: { label: string; onClick: () => void; muted?: boolean }[] = [
    {
      label: "Campus",
      onClick: () => setFocus({ level: "campus" }),
      muted: focusLevel !== "campus",
    },
  ];
  if (building) {
    bits.push({
      label: building.name,
      onClick: () => setFocus({ level: "building", building: building.id }),
      muted: focusLevel !== "building",
    });
  }
  if (floor && building) {
    bits.push({
      label: floor.label,
      onClick: () =>
        setFocus({
          level: "floor",
          building: building.id,
          floor: building.floors.find((f) => f.label === floor.label)?.index,
        }),
      muted: focusLevel !== "floor",
    });
  }

  return (
    <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/40 bg-white/40 px-4 py-1.5 backdrop-blur-md">
      {bits.map((b, i) => (
        <div key={i} className="flex items-center gap-2">
          <button
            type="button"
            onClick={b.onClick}
            className={
              "text-[10px] uppercase tracking-[0.3em] transition-colors " +
              (b.muted
                ? "text-slate-500 hover:text-slate-900"
                : "text-slate-900")
            }
          >
            {b.label}
          </button>
          {i < bits.length - 1 && (
            <span className="text-slate-400 text-[10px]">/</span>
          )}
        </div>
      ))}
    </div>
  );
}
