import { useFrame, useThree } from "@react-three/fiber";
import { useEffect } from "react";
import * as THREE from "three";
import type { BackgroundType } from "../../store/gameStore";
import { useGameStore } from "../../store/gameStore";
import Coins from "./Coins";
import Obstacles from "./Obstacles";
import Player from "./Player";
import Powerups from "./Powerups";
import Track from "./Track";

const BG_THEMES: Record<
  BackgroundType,
  {
    sky: string;
    fog: string;
    ambient: string;
    ambientIntensity: number;
    dirIntensity: number;
    dirColor: string;
  }
> = {
  city: {
    sky: "#87CEEB",
    fog: "#87CEEB",
    ambient: "#fff8f0",
    ambientIntensity: 0.6,
    dirIntensity: 1.4,
    dirColor: "#ffffff",
  },
  jungle: {
    sky: "#2d6a4f",
    fog: "#52b788",
    ambient: "#a8e6a3",
    ambientIntensity: 0.7,
    dirIntensity: 1.1,
    dirColor: "#c8f0c0",
  },
  neon: {
    sky: "#0d0d1a",
    fog: "#1a1a3e",
    ambient: "#6600cc",
    ambientIntensity: 0.5,
    dirIntensity: 0.6,
    dirColor: "#00e5ff",
  },
};

function SceneBackground() {
  const { scene } = useThree();
  const selectedBackground = useGameStore((s) => s.selectedBackground);

  useEffect(() => {
    const theme = BG_THEMES[selectedBackground];
    scene.background = new THREE.Color(theme.sky);
    scene.fog = new THREE.Fog(theme.fog, 40, 120);
    return () => {
      scene.fog = null;
    };
  }, [scene, selectedBackground]);

  return null;
}

function GameCamera() {
  const { camera } = useThree();
  useFrame(() => {
    const { playerTargetX, playerY } = useGameStore.getState();
    camera.position.x = THREE.MathUtils.lerp(
      camera.position.x,
      playerTargetX * 0.4,
      0.08,
    );
    camera.position.y = THREE.MathUtils.lerp(
      camera.position.y,
      4 + playerY * 0.3,
      0.1,
    );
    camera.position.z = 9;
    camera.lookAt(playerTargetX * 0.2, playerY * 0.5 + 1, -5);
  });
  return null;
}

export default function GameScene() {
  const selectedBackground = useGameStore((s) => s.selectedBackground);
  const theme = BG_THEMES[selectedBackground];

  useFrame((_, delta) => {
    useGameStore.getState().tick(delta);
  });

  return (
    <>
      <SceneBackground />
      <GameCamera />

      {/* Lighting */}
      <ambientLight intensity={theme.ambientIntensity} color={theme.ambient} />
      <directionalLight
        position={[10, 20, 5]}
        intensity={theme.dirIntensity}
        color={theme.dirColor}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight
        position={[-5, 10, -10]}
        intensity={0.3}
        color={selectedBackground === "neon" ? "#ff00ff" : "#a0c4ff"}
      />
      {selectedBackground === "neon" && (
        <pointLight
          position={[0, 5, 0]}
          intensity={3}
          color="#00e5ff"
          distance={30}
        />
      )}

      <Track />
      <Player />
      <Obstacles />
      <Coins />
      <Powerups />
    </>
  );
}
