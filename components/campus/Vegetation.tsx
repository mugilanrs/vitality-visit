"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { COLORS } from "@/lib/materials";
import { journey } from "@/lib/journey";

/**
 * Instanced vegetation — real InstancedMesh per species, so ~300+ plants
 * cost only a handful of draw calls.
 *
 * Species:
 *   - broadleaf tree: rounded canopy on a short trunk (perimeter ring, inner clusters)
 *   - narrow tree:    upright conifer-ish (perimeter ring, filler)
 *   - palm:           radial fronds on a slim trunk (plaza + residential lake rings + boulevard)
 *   - ornamental:     small pink-blossom tree (plaza edge, entrance flanks)
 *
 * Each species picks its own count, positions, and per-instance scale/rotation
 * jitter so the vegetation never looks tiled or randomly scattered.
 */

// ---------------- Merged geometry per species (one BufferGeometry each) ----------------

function mergePreserving(
  geoms: THREE.BufferGeometry[],
  colors: THREE.Color[],
): THREE.BufferGeometry {
  // Manually merge geoms into one indexed geometry with a per-vertex color
  // attribute — lets one InstancedMesh with vertexColors carry trunk + canopy.
  let vertexCount = 0;
  let indexCount = 0;
  for (const g of geoms) {
    vertexCount += g.attributes.position.count;
    if (g.index) indexCount += g.index.count;
    else indexCount += g.attributes.position.count;
  }
  const positions = new Float32Array(vertexCount * 3);
  const normals = new Float32Array(vertexCount * 3);
  const colorAttr = new Float32Array(vertexCount * 3);
  const indices = new Uint32Array(indexCount);

  let vOffset = 0;
  let iOffset = 0;
  geoms.forEach((g, gi) => {
    g.computeVertexNormals();
    const pos = g.attributes.position.array as Float32Array;
    const nrm = g.attributes.normal.array as Float32Array;
    positions.set(pos, vOffset * 3);
    normals.set(nrm, vOffset * 3);
    const c = colors[gi];
    for (let v = 0; v < g.attributes.position.count; v++) {
      colorAttr[(vOffset + v) * 3] = c.r;
      colorAttr[(vOffset + v) * 3 + 1] = c.g;
      colorAttr[(vOffset + v) * 3 + 2] = c.b;
    }
    if (g.index) {
      const src = g.index.array as ArrayLike<number>;
      for (let i = 0; i < src.length; i++) {
        indices[iOffset + i] = src[i] + vOffset;
      }
      iOffset += src.length;
    } else {
      for (let i = 0; i < g.attributes.position.count; i++) {
        indices[iOffset + i] = vOffset + i;
      }
      iOffset += g.attributes.position.count;
    }
    vOffset += g.attributes.position.count;
  });

  const merged = new THREE.BufferGeometry();
  merged.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  merged.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
  merged.setAttribute("color", new THREE.BufferAttribute(colorAttr, 3));
  merged.setIndex(new THREE.BufferAttribute(indices, 1));
  return merged;
}

function makeBroadleafGeometry(): THREE.BufferGeometry {
  const trunk = new THREE.CylinderGeometry(0.05, 0.09, 0.6, 6);
  trunk.translate(0, 0.3, 0);
  const c1 = new THREE.IcosahedronGeometry(0.42, 1);
  c1.translate(0, 0.82, 0);
  const c2 = new THREE.IcosahedronGeometry(0.32, 1);
  c2.translate(0.16, 1.02, -0.1);
  return mergePreserving(
    [trunk, c1, c2],
    [
      new THREE.Color(COLORS.trunk),
      new THREE.Color(COLORS.leavesGreen),
      new THREE.Color("#5aa25e"),
    ],
  );
}

function makeNarrowGeometry(): THREE.BufferGeometry {
  const trunk = new THREE.CylinderGeometry(0.045, 0.075, 0.5, 6);
  trunk.translate(0, 0.25, 0);
  // Elongated conifer — a stack of ovals
  const c1 = new THREE.SphereGeometry(0.25, 8, 6);
  c1.scale(1, 1.7, 1);
  c1.translate(0, 0.85, 0);
  const c2 = new THREE.SphereGeometry(0.18, 8, 6);
  c2.scale(1, 1.7, 1);
  c2.translate(0, 1.25, 0);
  return mergePreserving(
    [trunk, c1, c2],
    [
      new THREE.Color(COLORS.trunk),
      new THREE.Color("#4a8f52"),
      new THREE.Color("#3f7e46"),
    ],
  );
}

function makePalmGeometry(): THREE.BufferGeometry {
  const geoms: THREE.BufferGeometry[] = [];
  const colors: THREE.Color[] = [];

  const trunk = new THREE.CylinderGeometry(0.045, 0.075, 0.95, 6);
  trunk.translate(0, 0.475, 0);
  geoms.push(trunk);
  colors.push(new THREE.Color(COLORS.trunk));

  const FRONDS = 7;
  for (let i = 0; i < FRONDS; i++) {
    const a = (i / FRONDS) * Math.PI * 2;
    const leaf = new THREE.BoxGeometry(0.05, 0.02, 0.55);
    // Tilt each frond outward and rotate around vertical axis
    leaf.translate(0, 0, 0.3);
    leaf.rotateX(-0.35);
    leaf.rotateY(a);
    leaf.translate(Math.cos(a) * 0.06, 1.0, Math.sin(a) * 0.06);
    geoms.push(leaf);
    colors.push(new THREE.Color(COLORS.palmGreen));
  }
  return mergePreserving(geoms, colors);
}

function makeOrnamentalGeometry(): THREE.BufferGeometry {
  const trunk = new THREE.CylinderGeometry(0.04, 0.06, 0.35, 6);
  trunk.translate(0, 0.175, 0);
  const canopy = new THREE.IcosahedronGeometry(0.28, 1);
  canopy.translate(0, 0.5, 0);
  const canopy2 = new THREE.IcosahedronGeometry(0.2, 1);
  canopy2.translate(0.12, 0.62, -0.08);
  return mergePreserving(
    [trunk, canopy, canopy2],
    [
      new THREE.Color(COLORS.trunk),
      new THREE.Color(COLORS.blossomPink),
      new THREE.Color("#f7b6cf"),
    ],
  );
}

// ---------------- Positions per species ----------------

function palmPositions() {
  const arr: [number, number, number, number][] = [];
  // Ring around the entrance lake (outside)
  for (let i = 0; i < 22; i++) {
    const a = (i / 22) * Math.PI * 2;
    const rx = 4.6;
    const rz = 3.9;
    arr.push([Math.cos(a) * rx, 0, 6.5 + Math.sin(a) * rz, a]);
  }
  // Twin rows along the entrance boulevard leading to the plaza
  for (let i = 0; i < 5; i++) {
    for (const side of [-1, 1]) {
      arr.push([side * 1.75, 0, 9.4 + i * 0.7, 0]);
    }
  }
  return arr;
}

function broadleafPositions() {
  const arr: [number, number, number, number][] = [];
  // Dense outer perimeter ring — inside the fog radius
  for (let i = 0; i < 78; i++) {
    const a = (i / 78) * Math.PI * 2;
    const seed = (i * 91) % 100;
    const jitter = (seed / 100) * 0.9;
    const r = 14.3 + jitter;
    const rz = 12.2 + jitter * 0.8;
    arr.push([Math.cos(a) * r, 0, Math.sin(a) * rz, (seed / 100) * Math.PI * 2]);
  }
  // Grass-island clusters between the spine and the ring road
  const spots: [number, number][] = [
    [-7.6, 4.0],
    [-7.2, -3.6],
    [7.6, 4.4],
    [6.4, 7.0],
    [7.2, -1.2],
  ];
  spots.forEach(([x, z], si) => {
    for (let k = 0; k < 3; k++) {
      const ang = (k / 3) * Math.PI * 2 + si * 0.9;
      const r = 0.6;
      arr.push([x + Math.cos(ang) * r, 0, z + Math.sin(ang) * r, ang]);
    }
  });
  return arr;
}

function narrowPositions() {
  const arr: [number, number, number, number][] = [];
  // Second (inner) ring, offset for variety
  for (let i = 0; i < 42; i++) {
    const a = (i / 42) * Math.PI * 2 + 0.04;
    const seed = (i * 51) % 100;
    const jitter = (seed / 100) * 0.7;
    const r = 15.4 + jitter;
    const rz = 13.1 + jitter * 0.6;
    arr.push([Math.cos(a) * r, 0, Math.sin(a) * rz, (seed / 100) * Math.PI * 2]);
  }
  return arr;
}

function ornamentalPositions() {
  const arr: [number, number, number, number][] = [];
  // Pink blossom accents flanking the plaza south walkway
  for (let i = 0; i < 4; i++) {
    for (const side of [-1, 1]) {
      arr.push([side * 2.4, 0, 5.5 + i * 0.7, 0]);
    }
  }
  // Entrance path accents
  for (let i = 0; i < 3; i++) {
    for (const side of [-1, 1]) {
      arr.push([side * 2.8, 0, 12.0 + i * 0.7, 0]);
    }
  }
  return arr;
}

// ---------------- Instanced mesh rendering ----------------

type Species = {
  count: number;
  positions: [number, number, number, number][];
  geometry: THREE.BufferGeometry;
  scaleBase: number;
  scaleJitter: number;
  /** If true, apply a very subtle ambient sway on the group as a whole. */
  sway?: boolean;
};

function useSpecies(): Species[] {
  return useMemo(() => {
    const palm = palmPositions();
    const broad = broadleafPositions();
    const narrow = narrowPositions();
    const orn = ornamentalPositions();
    return [
      {
        count: palm.length,
        positions: palm,
        geometry: makePalmGeometry(),
        scaleBase: 0.95,
        scaleJitter: 0.25,
        sway: true,
      },
      {
        count: broad.length,
        positions: broad,
        geometry: makeBroadleafGeometry(),
        scaleBase: 0.95,
        scaleJitter: 0.45,
      },
      {
        count: narrow.length,
        positions: narrow,
        geometry: makeNarrowGeometry(),
        scaleBase: 0.9,
        scaleJitter: 0.4,
      },
      {
        count: orn.length,
        positions: orn,
        geometry: makeOrnamentalGeometry(),
        scaleBase: 1.0,
        scaleJitter: 0.2,
        sway: true,
      },
    ];
  }, []);
}

function SpeciesInstanced({ species }: { species: Species }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.85,
      }),
    [],
  );

  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3();
    species.positions.forEach(([x, y, z, rot], i) => {
      const jitter = ((i * 17) % 100) / 100;
      const scale = species.scaleBase + jitter * species.scaleJitter;
      q.setFromEuler(new THREE.Euler(0, rot, 0));
      s.set(scale, scale, scale);
      m.compose(new THREE.Vector3(x, y, z), q, s);
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.frustumCulled = false;
  }, [species]);

  // Ambient sway — applied at the group level so we don't rewrite matrices.
  useFrame((state) => {
    if (!species.sway || journey.reducedMotion) return;
    const g = groupRef.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    g.rotation.z = Math.sin(t * 0.35) * 0.004;
    g.rotation.x = Math.cos(t * 0.27) * 0.003;
  });

  return (
    <group ref={groupRef}>
      <instancedMesh
        ref={ref}
        args={[species.geometry, mat, species.count]}
        castShadow
        receiveShadow
      />
    </group>
  );
}

export default function Vegetation() {
  const species = useSpecies();
  return (
    <group>
      {species.map((s, i) => (
        <SpeciesInstanced key={i} species={s} />
      ))}
    </group>
  );
}
