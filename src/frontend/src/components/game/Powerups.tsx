import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type * as THREE from "three";
import type { PowerupType } from "../../store/gameStore";
import { useGameStore } from "../../store/gameStore";

const LANE_X = [-2, 0, 2];
const POOL_SIZE = 9;
const SPAWN_Z = -65;
const DESPAWN_Z = 8;

const POWERUP_TYPES: PowerupType[] = ["speed", "shield", "magnet"];

const POWERUP_COLORS: Record<PowerupType, { color: string; emissive: string }> =
  {
    speed: { color: "#ffd700", emissive: "#ff8800" },
    shield: { color: "#00e5ff", emissive: "#0088cc" },
    magnet: { color: "#cc44ff", emissive: "#8800cc" },
  };

interface PowerupData {
  active: boolean;
  x: number;
  z: number;
  type: PowerupType;
}

const powerupPool: PowerupData[] = Array.from({ length: POOL_SIZE }, () => ({
  active: false,
  x: 0,
  z: -999,
  type: "speed" as PowerupType,
}));

let spawnTimer = 0;

function spawnPowerup() {
  const idx = powerupPool.findIndex((p) => !p.active);
  if (idx === -1) return;
  const lane = Math.floor(Math.random() * 3);
  const type = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
  powerupPool[idx] = { active: true, x: LANE_X[lane], z: SPAWN_Z, type };
}

export function resetPowerups() {
  for (const p of powerupPool) {
    p.active = false;
    p.z = -999;
  }
  spawnTimer = 0;
}

interface PowerupItemProps {
  index: number;
  type: PowerupType;
  meshRefs: React.MutableRefObject<(THREE.Mesh | null)[]>;
  lightRefs: React.MutableRefObject<(THREE.PointLight | null)[]>;
}

function PowerupItem({ index, type, meshRefs, lightRefs }: PowerupItemProps) {
  const colors = POWERUP_COLORS[type] || POWERUP_COLORS.speed;
  return (
    <group>
      <mesh
        ref={(el) => {
          meshRefs.current[index] = el;
        }}
        position={[0, 1.2, -999]}
        visible={false}
      >
        <boxGeometry args={[0.6, 0.6, 0.6]} />
        <meshStandardMaterial
          color={colors.color}
          emissive={colors.emissive}
          emissiveIntensity={0.8}
          metalness={0.3}
          roughness={0.2}
        />
      </mesh>
      <pointLight
        ref={(el) => {
          lightRefs.current[index] = el;
        }}
        position={[0, 1.2, -999]}
        intensity={2}
        distance={4}
        color={colors.color}
        visible={false}
      />
    </group>
  );
}

export default function Powerups() {
  const meshRefs = useRef<(THREE.Mesh | null)[]>(
    new Array(POOL_SIZE).fill(null),
  );
  const lightRefs = useRef<(THREE.PointLight | null)[]>(
    new Array(POOL_SIZE).fill(null),
  );

  useFrame((_, delta) => {
    const { speed, gameState, playerTargetX, playerY, activatePowerup } =
      useGameStore.getState();
    if (gameState !== "playing") return;

    spawnTimer += delta;
    if (spawnTimer > 5) {
      spawnTimer = 0;
      spawnPowerup();
    }

    const t = Date.now() * 0.002;
    for (let i = 0; i < POOL_SIZE; i++) {
      const pd = powerupPool[i];
      const mesh = meshRefs.current[i];
      if (!mesh) continue;

      if (!pd.active) {
        mesh.visible = false;
        if (lightRefs.current[i])
          (lightRefs.current[i] as THREE.PointLight).visible = false;
        continue;
      }

      pd.z += speed * delta;
      mesh.position.set(pd.x, 1.2, pd.z);
      mesh.rotation.y = t + i * 1.2;
      mesh.visible = true;
      if (lightRefs.current[i]) {
        const light = lightRefs.current[i] as THREE.PointLight;
        light.position.set(pd.x, 1.2, pd.z);
        light.visible = true;
      }

      if (pd.z > DESPAWN_Z) {
        pd.active = false;
        mesh.visible = false;
        continue;
      }

      const dx = Math.abs(playerTargetX - pd.x);
      const dz = Math.abs(pd.z);
      const dy = Math.abs(playerY - 1.2);
      if (dx < 1.0 && dz < 1.5 && dy < 2.0) {
        pd.active = false;
        mesh.visible = false;
        activatePowerup(pd.type);
      }
    }
  });

  return (
    <group>
      {powerupPool.map((pd, i) => (
        <PowerupItem
          // biome-ignore lint/suspicious/noArrayIndexKey: pool index is stable
          key={i}
          index={i}
          type={pd.type}
          meshRefs={meshRefs}
          lightRefs={lightRefs}
        />
      ))}
    </group>
  );
}
