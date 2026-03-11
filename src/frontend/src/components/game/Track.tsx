import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import type * as THREE from "three";
import { useGameStore } from "../../store/gameStore";

const TILE_LENGTH = 24;
const NUM_TILES = 8;
const TRACK_WIDTH = 6;
const BUILDING_COLORS = [
  "#264653",
  "#2a9d8f",
  "#e9c46a",
  "#f4a261",
  "#e76f51",
  "#023047",
  "#219ebc",
];

function TrackTile({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[TRACK_WIDTH, 0.1, TILE_LENGTH]} />
        <meshStandardMaterial color="#2b2d42" />
      </mesh>
      <mesh position={[-1, 0, 0]}>
        <boxGeometry args={[0.06, 0.02, TILE_LENGTH]} />
        <meshStandardMaterial color="#ffffff" opacity={0.4} transparent />
      </mesh>
      <mesh position={[1, 0, 0]}>
        <boxGeometry args={[0.06, 0.02, TILE_LENGTH]} />
        <meshStandardMaterial color="#ffffff" opacity={0.4} transparent />
      </mesh>
      <mesh position={[-3.1, 0.05, 0]}>
        <boxGeometry args={[0.2, 0.1, TILE_LENGTH]} />
        <meshStandardMaterial color="#8d99ae" />
      </mesh>
      <mesh position={[3.1, 0.05, 0]}>
        <boxGeometry args={[0.2, 0.1, TILE_LENGTH]} />
        <meshStandardMaterial color="#8d99ae" />
      </mesh>
      <mesh position={[-4.5, -0.02, 0]}>
        <boxGeometry args={[2.8, 0.08, TILE_LENGTH]} />
        <meshStandardMaterial color="#adb5bd" />
      </mesh>
      <mesh position={[4.5, -0.02, 0]}>
        <boxGeometry args={[2.8, 0.08, TILE_LENGTH]} />
        <meshStandardMaterial color="#adb5bd" />
      </mesh>
    </group>
  );
}

interface BuildingData {
  x: number;
  z: number;
  w: number;
  h: number;
  d: number;
  color: string;
  key: string;
}

function generateBuildings(seed: number): BuildingData[] {
  const buildings: BuildingData[] = [];
  const rng = (n: number) =>
    Math.abs(Math.sin(seed * 9301 + n * 49297 + 233995)) % 1;
  for (let i = 0; i < 3; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const w = 1.5 + rng(i) * 2;
    const h = 3 + rng(i + 10) * 8;
    const d = 2 + rng(i + 20) * 3;
    const x = side * (5.5 + rng(i + 5) * 1.5);
    const z = -TILE_LENGTH / 2 + rng(i + 30) * TILE_LENGTH;
    buildings.push({
      x,
      z,
      w,
      h,
      d,
      color: BUILDING_COLORS[Math.floor(rng(i + 40) * BUILDING_COLORS.length)],
      key: `b-${seed}-${i}`,
    });
  }
  return buildings;
}

// Stable tile keys
const TILE_KEYS = Array.from({ length: NUM_TILES }, (_, i) => `tile-${i}`);

interface TileGroupProps {
  tileKey: string;
  index: number;
  tilesRef: React.MutableRefObject<THREE.Group[]>;
}

function TileGroup({ tileKey: _tileKey, index, tilesRef }: TileGroupProps) {
  return (
    <group
      ref={(el) => {
        if (el) tilesRef.current[index] = el;
      }}
      position={[0, 0, -(index * TILE_LENGTH)]}
    >
      <TrackTile position={[0, 0, 0]} />
      {generateBuildings(index).map((b) => (
        <mesh key={b.key} position={[b.x, b.h / 2, b.z]} castShadow>
          <boxGeometry args={[b.w, b.h, b.d]} />
          <meshStandardMaterial color={b.color} />
        </mesh>
      ))}
    </group>
  );
}

export default function Track() {
  const tilesRef = useRef<THREE.Group[]>([]);
  const tileSeeds = useRef<number[]>([]);

  useEffect(() => {
    for (let i = 0; i < NUM_TILES; i++) tileSeeds.current[i] = i;
  }, []);

  useFrame(() => {
    const { speed, gameState } = useGameStore.getState();
    if (gameState !== "playing") return;
    for (let i = 0; i < tilesRef.current.length; i++) {
      const tile = tilesRef.current[i];
      if (!tile) continue;
      tile.position.z += speed * (1 / 60);
      if (tile.position.z > TILE_LENGTH * 1.5) {
        tile.position.z -= TILE_LENGTH * NUM_TILES;
        tileSeeds.current[i] = tileSeeds.current[i] + NUM_TILES;
      }
    }
  });

  return (
    <group>
      {TILE_KEYS.map((tileKey, i) => (
        <TileGroup
          key={tileKey}
          tileKey={tileKey}
          index={i}
          tilesRef={tilesRef}
        />
      ))}
      <mesh position={[0, -0.1, -50]} receiveShadow>
        <boxGeometry args={[100, 0.01, 200]} />
        <meshStandardMaterial color="#495057" />
      </mesh>
    </group>
  );
}
