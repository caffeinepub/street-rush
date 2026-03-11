import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import type * as THREE from "three";
import { useGameStore } from "../../store/gameStore";

const LANE_X = [-2, 0, 2];
const SPAWN_Z = -60;
const DESPAWN_Z = 8;
const OBSTACLE_POOL_SIZE = 20;
const OBSTACLE_COLORS = ["#e63946", "#f4a261", "#2a9d8f", "#e9c46a", "#457b9d"];

interface ObstacleData {
  active: boolean;
  lane: number;
  type: "barrier" | "box" | "pillar";
  x: number;
  z: number;
  w: number;
  h: number;
  d: number;
}

function makeObstacleGeometry(
  type: ObstacleData["type"],
): [number, number, number] {
  if (type === "barrier") return [2.5, 0.9, 0.4];
  if (type === "pillar") return [0.6, 2.5, 0.6];
  return [0.9, 1.1, 0.9];
}

let spawnTimer = 0;

export const obstacleData: ObstacleData[] = [];

for (let i = 0; i < OBSTACLE_POOL_SIZE; i++) {
  obstacleData.push({
    active: false,
    lane: 0,
    type: "box",
    x: 0,
    z: -999,
    w: 1,
    h: 1,
    d: 1,
  });
}

function spawnObstacles() {
  const numBlocked = Math.random() < 0.4 ? 2 : 1;
  const lanes = [0, 1, 2].sort(() => Math.random() - 0.5).slice(0, numBlocked);

  for (const lane of lanes) {
    const idx = obstacleData.findIndex((o) => !o.active);
    if (idx === -1) break;
    const types: ObstacleData["type"][] = ["barrier", "box", "pillar"];
    const type = types[Math.floor(Math.random() * types.length)];
    const [w, h, d] = makeObstacleGeometry(type);
    obstacleData[idx] = {
      active: true,
      lane,
      type,
      x: LANE_X[lane],
      z: SPAWN_Z,
      w,
      h,
      d,
    };
  }
}

// Stable pool keys
const OBSTACLE_KEYS = Array.from(
  { length: OBSTACLE_POOL_SIZE },
  (_, i) => `obs-${i}`,
);

interface ObstacleMeshProps {
  poolKey: string;
  meshRefs: React.MutableRefObject<(THREE.Mesh | null)[]>;
  index: number;
  od: ObstacleData;
}

function ObstacleMesh({
  poolKey: _poolKey,
  index,
  od,
  meshRefs,
}: ObstacleMeshProps) {
  const [w, h, d] = makeObstacleGeometry(od.type);
  const color = OBSTACLE_COLORS[index % OBSTACLE_COLORS.length];
  return (
    <mesh
      ref={(el) => {
        meshRefs.current[index] = el;
      }}
      position={[od.x, h / 2, od.z]}
      visible={false}
      castShadow
    >
      <boxGeometry args={[w, h, d]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

export default function Obstacles() {
  const meshRefs = useRef<(THREE.Mesh | null)[]>(
    new Array(OBSTACLE_POOL_SIZE).fill(null),
  );

  useEffect(() => {}, []);

  useFrame((_, delta) => {
    const { speed, gameState, playerY, isSliding, endGame } =
      useGameStore.getState();
    if (gameState !== "playing") return;

    spawnTimer += delta;
    const dynInterval = Math.max(1.0, 2.2 - speed * 0.04);
    if (spawnTimer >= dynInterval) {
      spawnTimer = 0;
      spawnObstacles();
    }

    const playerX = useGameStore.getState().playerTargetX;

    for (let i = 0; i < OBSTACLE_POOL_SIZE; i++) {
      const od = obstacleData[i];
      const mesh = meshRefs.current[i];
      if (!od.active || !mesh) continue;

      od.z += speed * delta;
      mesh.position.z = od.z;
      mesh.visible = od.active;

      if (od.z > DESPAWN_Z) {
        od.active = false;
        mesh.visible = false;
        continue;
      }

      const px = playerX;
      const py = playerY + 0.9;
      const pz = 0;

      const halfW = od.w / 2 + 0.1;
      const halfH = (isSliding ? od.h * 0.5 : od.h) / 2 + 0.05;
      const halfD = od.d / 2 + 0.3;
      const playerHalfH = isSliding ? 0.4 : 0.9;

      const xOk = Math.abs(px - od.x) < halfW + 0.25;
      const yOk = Math.abs(py - od.h / 2) < halfH + playerHalfH;
      const zOk = Math.abs(pz - od.z) < halfD;

      if (xOk && yOk && zOk) {
        for (const o of obstacleData) o.active = false;
        spawnTimer = 0;
        endGame();
        return;
      }
    }
  });

  return (
    <group>
      {obstacleData.map((od, i) => (
        <ObstacleMesh
          key={OBSTACLE_KEYS[i]}
          poolKey={OBSTACLE_KEYS[i]}
          index={i}
          od={od}
          meshRefs={meshRefs}
        />
      ))}
    </group>
  );
}

export function resetObstacles() {
  for (const o of obstacleData) o.active = false;
  spawnTimer = 0;
}
