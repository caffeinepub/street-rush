import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type * as THREE from "three";
import { useGameStore } from "../../store/gameStore";

const LANE_X = [-2, 0, 2];
const COIN_POOL = 30;
const SPAWN_Z = -65;
const DESPAWN_Z = 8;
const MAGNET_RANGE = 8;

interface CoinData {
  active: boolean;
  x: number;
  z: number;
}

const coinData: CoinData[] = Array.from({ length: COIN_POOL }, () => ({
  active: false,
  x: 0,
  z: -999,
}));

let coinSpawnTimer = 0;

function spawnCoins() {
  const lane = Math.floor(Math.random() * 3);
  const count = 3 + Math.floor(Math.random() * 4);
  for (let c = 0; c < count; c++) {
    const idx = coinData.findIndex((cd) => !cd.active);
    if (idx === -1) break;
    coinData[idx] = { active: true, x: LANE_X[lane], z: SPAWN_Z - c * 2.5 };
  }
}

interface CoinMeshProps {
  index: number;
  meshRefs: React.MutableRefObject<(THREE.Mesh | null)[]>;
}

function CoinMesh({ index, meshRefs }: CoinMeshProps) {
  return (
    <mesh
      ref={(el) => {
        meshRefs.current[index] = el;
      }}
      position={[0, 0.9, -999]}
      visible={false}
    >
      <torusGeometry args={[0.28, 0.09, 8, 16]} />
      <meshStandardMaterial
        color="#ffd700"
        emissive="#ff9900"
        emissiveIntensity={0.4}
        metalness={0.8}
        roughness={0.2}
      />
    </mesh>
  );
}

export default function Coins() {
  const meshRefs = useRef<(THREE.Mesh | null)[]>(
    new Array(COIN_POOL).fill(null),
  );

  useFrame((_, delta) => {
    const { speed, gameState, playerTargetX, addCoin, activePowerup } =
      useGameStore.getState();
    if (gameState !== "playing") return;

    coinSpawnTimer += delta;
    if (coinSpawnTimer > 1.5) {
      coinSpawnTimer = 0;
      spawnCoins();
    }

    const t = Date.now() * 0.003;
    for (let i = 0; i < COIN_POOL; i++) {
      const cd = coinData[i];
      const mesh = meshRefs.current[i];
      if (!mesh) continue;
      if (!cd.active) {
        mesh.visible = false;
        continue;
      }

      cd.z += speed * delta;
      mesh.position.z = cd.z;
      mesh.rotation.y = t + i;
      mesh.visible = true;

      if (cd.z > DESPAWN_Z) {
        cd.active = false;
        mesh.visible = false;
        continue;
      }

      // Magnet powerup: auto-collect nearby coins
      if (activePowerup === "magnet") {
        const dx = Math.abs(playerTargetX - cd.x);
        const dz = Math.abs(cd.z);
        if (dx < MAGNET_RANGE && dz < MAGNET_RANGE) {
          cd.active = false;
          mesh.visible = false;
          addCoin();
          continue;
        }
      }

      const dx = Math.abs(playerTargetX - cd.x);
      const dz = Math.abs(cd.z);
      if (dx < 0.8 && dz < 1.2) {
        cd.active = false;
        mesh.visible = false;
        addCoin();
      }
    }
  });

  return (
    <group>
      {coinData.map((_, i) => (
        <CoinMesh
          // biome-ignore lint/suspicious/noArrayIndexKey: coin pool index is stable
          key={i}
          index={i}
          meshRefs={meshRefs}
        />
      ))}
    </group>
  );
}

export function resetCoins() {
  for (const c of coinData) {
    c.active = false;
    c.z = -999;
  }
  coinSpawnTimer = 0;
}
