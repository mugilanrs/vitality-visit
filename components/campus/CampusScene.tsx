"use client";

import { Canvas } from "@react-three/fiber";
import { ContactShadows, SoftShadows } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import CampusCamera from "./CampusCamera";
import CampusArchitecture from "./CampusArchitecture";
import CampusHotspots from "./CampusHotspots";
import SpatialFocus from "./SpatialFocus";
import SpatialTiles from "./SpatialTiles";
import EB3Cutaway from "./EB3Cutaway";
import { ActiveInterior } from "./RoomInterior";
import { detectQuality, type QualitySettings } from "@/lib/quality";
import { journey, subscribeJourney } from "@/lib/journey";

/**
 * Premium architectural daylight (Phase 3 baseline; Phase 6 tuning; Phase 7
 * adds interior room rendering).
 *
 * The scene renders one of two "stages":
 *   - Campus stage: architecture + hotspots + spatial focus
 *   - Interior stage: a mini board-room scene at an off-campus origin
 *
 * The stage is chosen by `journey.focus.level`. The campus stage is always
 * rendered so re-entry is instant; the interior is mounted only while
 * `level === "inside"`.
 */
export default function CampusScene() {
  const [quality, setQuality] = useState<QualitySettings>(() => detectQuality());
  const [inside, setInside] = useState(journey.focus.level === "inside");

  useEffect(() => {
    const on = () => setQuality(detectQuality());
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);

  // React to focus stack change to toggle interior mount.
  useEffect(() => {
    return subscribeJourney(
      () => setInside(journey.focus.level === "inside"),
      "focus",
    );
  }, []);

  const useSoftShadows = quality.softShadows;
  const shadowMap = quality.shadowMap;

  const styleBg = useMemo(
    () => ({
      background:
        "linear-gradient(180deg, #edf2f8 0%, #e4ebf1 55%, #dbe2e8 100%)",
    }),
    [],
  );

  return (
    <div className="absolute inset-0">
      <Canvas
        dpr={quality.dpr}
        shadows
        gl={{
          antialias: quality.tier !== "low",
          alpha: false,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.05,
        }}
        style={styleBg}
        onCreated={({ scene, gl }) => {
          scene.fog = new THREE.Fog(0xeaf0f6, 36, 68);
          // Match the WebGL clear color to the sky/fog tint. Without this the
          // renderer defaults to black, which showed up as a large letterbox
          // above/below the campus on portrait viewports.
          gl.setClearColor(new THREE.Color(0xeaf0f6), 1);
        }}
      >
        {useSoftShadows && (
          <SoftShadows size={22} samples={12} focus={0.9} />
        )}

        <ambientLight intensity={0.32} color={"#f2ecdd"} />
        <hemisphereLight args={[0xdfe9f3, 0xe6e1d3, 0.78]} />

        <directionalLight
          position={[14, 22, 8]}
          intensity={1.45}
          color={"#fff2cf"}
          castShadow
          shadow-mapSize-width={shadowMap}
          shadow-mapSize-height={shadowMap}
          shadow-camera-left={-22}
          shadow-camera-right={22}
          shadow-camera-top={22}
          shadow-camera-bottom={-22}
          shadow-camera-near={0.5}
          shadow-camera-far={68}
          shadow-bias={-0.0005}
          shadow-normalBias={0.02}
        />
        <directionalLight
          position={[-10, 9, -6]}
          intensity={0.32}
          color={"#c9dbee"}
        />

        <CampusCamera />

        <Suspense fallback={null}>
          {/* Campus stage — hidden while the user is inside a room */}
          <group visible={!inside}>
            <CampusArchitecture />

            <ContactShadows
              position={[0, 0.02, 0]}
              opacity={0.4}
              scale={40}
              blur={2.4}
              far={5}
              resolution={quality.contactShadowsRes}
              color={"#1c2833"}
            />

            <SpatialFocus />
            <CampusHotspots />
            <SpatialTiles />
            <EB3Cutaway />
          </group>

          {/* Interior stage — mounted only while focus.level === "inside" */}
          <ActiveInterior />
        </Suspense>
      </Canvas>
    </div>
  );
}
