"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import * as THREE from "three";
import CampusCamera from "./CampusCamera";
import CampusArchitecture from "./CampusArchitecture";

/**
 * Phase 1 scene: clean architectural daylight.
 * - hemisphere (cool sky, warm ground) + high directional key with soft shadows
 * - light Fog for a very subtle horizon fade (NOT FogExp2 — no cyberpunk haze)
 * - ACES tonemap, exposure 1.05 — reads as printed masterplan
 * - Canvas background is a pale gradient, not a photo/render backdrop
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
            "linear-gradient(180deg, #eef3f8 0%, #e6ecf2 55%, #dee4ea 100%)",
        }}
        onCreated={({ scene }) => {
          scene.fog = new THREE.Fog(0xeaf0f6, 34, 62);
        }}
      >
        {/* Sky/ground ambient — cool up, warm down */}
        <hemisphereLight args={[0xdfe9f3, 0xe6e1d3, 0.75]} />

        {/* Sun */}
        <directionalLight
          position={[14, 22, 8]}
          intensity={1.4}
          color={"#fff5df"}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
          shadow-camera-near={0.5}
          shadow-camera-far={60}
          shadow-bias={-0.0005}
        />

        {/* Very soft fill from the opposite side */}
        <directionalLight position={[-10, 8, -6]} intensity={0.25} color={"#cad9e8"} />

        <CampusCamera />
        <Suspense fallback={null}>
          <CampusArchitecture />
        </Suspense>
      </Canvas>
    </div>
  );
}
