"use client";

import { Canvas } from "@react-three/fiber";
import { ContactShadows, SoftShadows } from "@react-three/drei";
import { Suspense } from "react";
import * as THREE from "three";
import CampusCamera from "./CampusCamera";
import CampusArchitecture from "./CampusArchitecture";
import CampusHotspots from "./CampusHotspots";

/**
 * Premium architectural daylight.
 *
 * Lighting model:
 *   - Hemisphere: cool sky (#dfe9f3) + warm ground (#e6e1d3) — hero ambient
 *   - Directional key: high, warm sun tint, casts soft PCF-Soft shadows
 *   - Directional fill: opposite side, cool tint, no shadow
 *   - Ambient: barely-there floor tint, keeps under-canopies from going pitch
 *   - SoftShadows: PCF soft-shadow monkeypatch — reads as premium arch-viz
 *   - ContactShadows: rounds off the shadow directly under each building
 *
 * Renderer:
 *   - dpr capped at 2 (perf on retina)
 *   - ACES tonemap, exposure 1.05
 *   - Fog (not FogExp2) for a whisper of horizon fade
 */
export default function CampusScene() {
  return (
    <div className="absolute inset-0">
      <Canvas
        dpr={[1, 2]}
        shadows
        gl={{
          antialias: true,
          alpha: false,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.05,
        }}
        style={{
          background:
            "linear-gradient(180deg, #edf2f8 0%, #e4ebf1 55%, #dbe2e8 100%)",
        }}
        onCreated={({ scene }) => {
          scene.fog = new THREE.Fog(0xeaf0f6, 36, 68);
        }}
      >
        {/* Premium soft shadows (drei monkeypatches the shadow shader once) */}
        <SoftShadows size={22} samples={12} focus={0.9} />

        {/* Base ambient — very subtle, only to keep under-canopy shadows readable */}
        <ambientLight intensity={0.32} color={"#f2ecdd"} />

        {/* Hemisphere — the workhorse for architectural daylight */}
        <hemisphereLight args={[0xdfe9f3, 0xe6e1d3, 0.78]} />

        {/* Sun */}
        <directionalLight
          position={[14, 22, 8]}
          intensity={1.45}
          color={"#fff2cf"}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-left={-22}
          shadow-camera-right={22}
          shadow-camera-top={22}
          shadow-camera-bottom={-22}
          shadow-camera-near={0.5}
          shadow-camera-far={68}
          shadow-bias={-0.0005}
          shadow-normalBias={0.02}
        />

        {/* Cool fill from the opposite side */}
        <directionalLight
          position={[-10, 9, -6]}
          intensity={0.32}
          color={"#c9dbee"}
        />

        <CampusCamera />

        <Suspense fallback={null}>
          <CampusArchitecture />

          {/* Contact shadows — soft round shadow blob under the whole model */}
          <ContactShadows
            position={[0, 0.02, 0]}
            opacity={0.4}
            scale={40}
            blur={2.4}
            far={5}
            resolution={1024}
            color={"#1c2833"}
          />

          {/* World-space hotspots for hover/click */}
          <CampusHotspots />
        </Suspense>
      </Canvas>
    </div>
  );
}
