"use client";

import { Canvas } from "@react-three/fiber";
import { ContactShadows, SoftShadows } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import CampusCamera from "./CampusCamera";
import CampusArchitecture from "./CampusArchitecture";
import CampusHotspots from "./CampusHotspots";
import SpatialFocus from "./SpatialFocus";
import { detectQuality, type QualitySettings } from "@/lib/quality";

/**
 * Premium architectural daylight (Phase 3 baseline, Phase 6 tuning).
 *
 * Lighting model:
 *   - Hemisphere: cool sky (#dfe9f3) + warm ground (#e6e1d3) — hero ambient
 *   - Directional key: high, warm sun tint, casts soft PCF-Soft shadows
 *   - Directional fill: opposite side, cool tint, no shadow
 *   - Ambient: barely-there floor tint, keeps under-canopies from going pitch
 *   - SoftShadows: PCF soft-shadow monkeypatch (disabled on LOW tier)
 *   - ContactShadows: rounds off the shadow directly under each building
 *
 * Renderer:
 *   - dpr scales per quality tier
 *   - ACES tonemap, exposure 1.05
 *   - Fog (not FogExp2) for a whisper of horizon fade
 */
export default function CampusScene() {
  const [quality, setQuality] = useState<QualitySettings>(() => detectQuality());

  useEffect(() => {
    const on = () => setQuality(detectQuality());
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
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
        onCreated={({ scene }) => {
          scene.fog = new THREE.Fog(0xeaf0f6, 36, 68);
        }}
      >
        {useSoftShadows && (
          <SoftShadows size={22} samples={12} focus={0.9} />
        )}

        {/* Base ambient */}
        <ambientLight intensity={0.32} color={"#f2ecdd"} />
        <hemisphereLight args={[0xdfe9f3, 0xe6e1d3, 0.78]} />

        {/* Sun */}
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
        </Suspense>
      </Canvas>
    </div>
  );
}
