import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { useGameStore } from "../../store/gameStore";

const SKIN_URLS: Record<string, string> = {
  male: "/assets/generated/character-runner-transparent.dim_120x160.png",
  female: "/assets/generated/character-female-transparent.dim_120x160.png",
};

function PlayerMesh({ skin }: { skin: string }) {
  const texture = useTexture(SKIN_URLS[skin] || SKIN_URLS.male);
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    const {
      playerTargetX,
      playerY,
      isSliding,
      isJumping,
      gameState,
      isShielded,
    } = useGameStore.getState();
    if (!groupRef.current || !meshRef.current) return;

    // Smooth lane switch
    groupRef.current.position.x = THREE.MathUtils.lerp(
      groupRef.current.position.x,
      playerTargetX,
      Math.min(1, delta * 15),
    );
    groupRef.current.position.y = playerY;

    // Billboard: always face camera
    groupRef.current.rotation.y = 0;

    // Slide squish
    const targetScaleY = isSliding ? 0.5 : 1;
    groupRef.current.scale.y = THREE.MathUtils.lerp(
      groupRef.current.scale.y,
      targetScaleY,
      Math.min(1, delta * 12),
    );

    // Bob animation while running
    if (gameState === "playing" && !isSliding && !isJumping) {
      const t = Date.now() * 0.008;
      meshRef.current.position.y = 1.2 + Math.sin(t) * 0.05;
    } else {
      meshRef.current.position.y = 1.2;
    }

    // Shield glow effect
    const mat = meshRef.current.material as THREE.MeshBasicMaterial;
    if (isShielded) {
      const pulse = 0.7 + Math.sin(Date.now() * 0.01) * 0.3;
      mat.opacity = pulse;
      mat.color.setHex(0x44ddff);
    } else {
      mat.opacity = 1;
      mat.color.setHex(0xffffff);
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <mesh ref={meshRef} position={[0, 1.2, 0]}>
        <planeGeometry args={[1.6, 2.4]} />
        <meshBasicMaterial
          map={texture}
          transparent
          side={THREE.DoubleSide}
          alphaTest={0.05}
        />
      </mesh>
    </group>
  );
}

export default function Player() {
  const selectedSkin = useGameStore((s) => s.selectedSkin);
  return <PlayerMesh skin={selectedSkin} />;
}
