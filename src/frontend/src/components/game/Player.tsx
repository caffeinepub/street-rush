import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { useGameStore } from "../../store/gameStore";

const SKIN_COLORS: Record<
  string,
  { skin: string; hair: string; shirt: string; pants: string; shoe: string }
> = {
  male: {
    skin: "#e8a87c",
    hair: "#3d2b1f",
    shirt: "#cc3333",
    pants: "#1a3a6e",
    shoe: "#111111",
  },
  female: {
    skin: "#f0b090",
    hair: "#8b2500",
    shirt: "#2255cc",
    pants: "#1a1a3a",
    shoe: "#222222",
  },
};

function RunnerCharacter({ skin }: { skin: string }) {
  const colors = SKIN_COLORS[skin] || SKIN_COLORS.male;
  const groupRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftForearmRef = useRef<THREE.Group>(null);
  const rightForearmRef = useRef<THREE.Group>(null);
  const leftUpperArmRef = useRef<THREE.Group>(null);
  const rightUpperArmRef = useRef<THREE.Group>(null);
  const torsoRef = useRef<THREE.Group>(null);
  const hipRef = useRef<THREE.Group>(null);
  const shieldRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Group>(null);

  const skinMat = new THREE.MeshStandardMaterial({
    color: colors.skin,
    roughness: 0.7,
  });
  const shirtMat = new THREE.MeshStandardMaterial({
    color: colors.shirt,
    roughness: 0.8,
  });
  const pantsMat = new THREE.MeshStandardMaterial({
    color: colors.pants,
    roughness: 0.8,
  });
  const hairMat = new THREE.MeshStandardMaterial({
    color: colors.hair,
    roughness: 0.9,
  });
  const shoeMat = new THREE.MeshStandardMaterial({
    color: colors.shoe,
    roughness: 0.5,
  });
  const eyeMat = new THREE.MeshStandardMaterial({ color: "#111111" });
  const whiteMat = new THREE.MeshStandardMaterial({ color: "#ffffff" });

  useFrame((_, delta) => {
    const {
      playerTargetX,
      playerY,
      isSliding,
      isJumping,
      gameState,
      isShielded,
      speed,
    } = useGameStore.getState();
    if (!groupRef.current) return;

    // Lateral movement with slight lean
    const targetX = playerTargetX;
    const prevX = groupRef.current.position.x;
    groupRef.current.position.x = THREE.MathUtils.lerp(
      prevX,
      targetX,
      Math.min(1, delta * 14),
    );
    const xDiff = targetX - prevX;
    groupRef.current.rotation.z = THREE.MathUtils.lerp(
      groupRef.current.rotation.z,
      -xDiff * 0.8,
      delta * 10,
    );
    groupRef.current.position.y = playerY;

    const t = Date.now() * 0.001;
    const runFreq = Math.min(4.5, 1.8 + speed * 0.08);
    const cycle = t * runFreq * Math.PI * 2;

    if (isSliding) {
      groupRef.current.scale.y = THREE.MathUtils.lerp(
        groupRef.current.scale.y,
        0.55,
        delta * 12,
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        0.15,
        delta * 10,
      );
      if (leftLegRef.current)
        leftLegRef.current.rotation.x = THREE.MathUtils.lerp(
          leftLegRef.current.rotation.x,
          0.4,
          delta * 10,
        );
      if (rightLegRef.current)
        rightLegRef.current.rotation.x = THREE.MathUtils.lerp(
          rightLegRef.current.rotation.x,
          -0.4,
          delta * 10,
        );
      if (leftUpperArmRef.current) leftUpperArmRef.current.rotation.x = 0.6;
      if (rightUpperArmRef.current) rightUpperArmRef.current.rotation.x = 0.6;
      if (torsoRef.current) torsoRef.current.rotation.x = 0.1;
    } else if (isJumping) {
      groupRef.current.scale.y = THREE.MathUtils.lerp(
        groupRef.current.scale.y,
        1,
        delta * 10,
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        -0.08,
        delta * 10,
      );
      if (leftLegRef.current)
        leftLegRef.current.rotation.x = THREE.MathUtils.lerp(
          leftLegRef.current.rotation.x,
          -0.7,
          delta * 8,
        );
      if (rightLegRef.current)
        rightLegRef.current.rotation.x = THREE.MathUtils.lerp(
          rightLegRef.current.rotation.x,
          -0.7,
          delta * 8,
        );
      if (leftUpperArmRef.current)
        leftUpperArmRef.current.rotation.x = THREE.MathUtils.lerp(
          leftUpperArmRef.current.rotation.x,
          -0.7,
          delta * 8,
        );
      if (rightUpperArmRef.current)
        rightUpperArmRef.current.rotation.x = THREE.MathUtils.lerp(
          rightUpperArmRef.current.rotation.x,
          -0.7,
          delta * 8,
        );
      if (torsoRef.current) torsoRef.current.rotation.x = -0.1;
    } else if (gameState === "playing") {
      groupRef.current.scale.y = THREE.MathUtils.lerp(
        groupRef.current.scale.y,
        1,
        delta * 12,
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        0.05,
        delta * 8,
      );
      const legSwing = Math.sin(cycle) * 0.75;
      const armSwing = Math.sin(cycle) * 0.6;
      if (leftLegRef.current)
        leftLegRef.current.rotation.x = THREE.MathUtils.lerp(
          leftLegRef.current.rotation.x,
          legSwing,
          delta * 20,
        );
      if (rightLegRef.current)
        rightLegRef.current.rotation.x = THREE.MathUtils.lerp(
          rightLegRef.current.rotation.x,
          -legSwing,
          delta * 20,
        );
      if (leftUpperArmRef.current)
        leftUpperArmRef.current.rotation.x = THREE.MathUtils.lerp(
          leftUpperArmRef.current.rotation.x,
          -armSwing,
          delta * 20,
        );
      if (rightUpperArmRef.current)
        rightUpperArmRef.current.rotation.x = THREE.MathUtils.lerp(
          rightUpperArmRef.current.rotation.x,
          armSwing,
          delta * 20,
        );
      // Shoulder counter-rotation for naturalness
      if (torsoRef.current) {
        torsoRef.current.rotation.y = Math.sin(cycle) * 0.06;
        torsoRef.current.rotation.x = -0.05;
      }
      // Hip sway
      if (hipRef.current) {
        hipRef.current.rotation.y = -Math.sin(cycle) * 0.06;
        hipRef.current.position.y = 0.42 + Math.abs(Math.sin(cycle)) * 0.04;
      }
      // Head bob
      if (headRef.current) {
        headRef.current.position.y = 0.52 + Math.abs(Math.sin(cycle)) * 0.03;
      }
      // Subtle body bounce
      if (groupRef.current) {
        groupRef.current.position.y =
          playerY + Math.abs(Math.sin(cycle)) * 0.04;
      }
    } else {
      groupRef.current.scale.y = THREE.MathUtils.lerp(
        groupRef.current.scale.y,
        1,
        delta * 8,
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        0,
        delta * 5,
      );
      if (leftLegRef.current)
        leftLegRef.current.rotation.x = THREE.MathUtils.lerp(
          leftLegRef.current.rotation.x,
          0,
          delta * 5,
        );
      if (rightLegRef.current)
        rightLegRef.current.rotation.x = THREE.MathUtils.lerp(
          rightLegRef.current.rotation.x,
          0,
          delta * 5,
        );
      if (leftUpperArmRef.current)
        leftUpperArmRef.current.rotation.x = THREE.MathUtils.lerp(
          leftUpperArmRef.current.rotation.x,
          0,
          delta * 5,
        );
      if (rightUpperArmRef.current)
        rightUpperArmRef.current.rotation.x = THREE.MathUtils.lerp(
          rightUpperArmRef.current.rotation.x,
          0,
          delta * 5,
        );
    }

    if (shieldRef.current) {
      shieldRef.current.visible = isShielded;
      if (isShielded) {
        const pulse = 0.3 + Math.sin(Date.now() * 0.005) * 0.15;
        (shieldRef.current.material as THREE.MeshBasicMaterial).opacity = pulse;
      }
    }
  });

  return (
    // Outer pivot rotates character 180° so it faces forward (toward camera)
    <group rotation={[0, Math.PI, 0]}>
      <group ref={groupRef} position={[0, 0, 0]}>
        {/* Shield bubble */}
        <mesh ref={shieldRef} visible={false}>
          <sphereGeometry args={[1.3, 20, 20]} />
          <meshBasicMaterial
            color="#44ddff"
            transparent
            opacity={0.3}
            side={THREE.FrontSide}
          />
        </mesh>

        {/* === HEAD GROUP === */}
        <group ref={headRef} position={[0, 0.52, 0]}>
          {/* Neck */}
          <mesh position={[0, -0.05, 0]} material={skinMat}>
            <cylinderGeometry args={[0.1, 0.11, 0.14, 10]} />
          </mesh>
          {/* Head */}
          <mesh position={[0, 0.22, 0]} castShadow material={skinMat}>
            <sphereGeometry args={[0.22, 14, 12]} />
          </mesh>
          {/* Hair cap */}
          <mesh position={[0, 0.32, 0]} material={hairMat}>
            <sphereGeometry
              args={[0.225, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.55]}
            />
          </mesh>
          {/* Eyes */}
          <mesh position={[0.09, 0.22, 0.19]} material={whiteMat}>
            <sphereGeometry args={[0.04, 8, 8]} />
          </mesh>
          <mesh position={[-0.09, 0.22, 0.19]} material={whiteMat}>
            <sphereGeometry args={[0.04, 8, 8]} />
          </mesh>
          <mesh position={[0.09, 0.22, 0.22]} material={eyeMat}>
            <sphereGeometry args={[0.025, 8, 8]} />
          </mesh>
          <mesh position={[-0.09, 0.22, 0.22]} material={eyeMat}>
            <sphereGeometry args={[0.025, 8, 8]} />
          </mesh>
          {/* Nose */}
          <mesh position={[0, 0.19, 0.22]} material={skinMat}>
            <sphereGeometry args={[0.028, 6, 6]} />
          </mesh>
        </group>

        {/* === TORSO GROUP === */}
        <group ref={torsoRef} position={[0, 0.5, 0]}>
          {/* Upper torso / chest */}
          <mesh position={[0, 0, 0]} castShadow material={shirtMat}>
            <cylinderGeometry args={[0.22, 0.2, 0.42, 10]} />
          </mesh>
          {/* Collar */}
          <mesh position={[0, 0.19, 0.1]} material={shirtMat}>
            <boxGeometry args={[0.2, 0.05, 0.05]} />
          </mesh>

          {/* Left upper arm */}
          <group ref={leftUpperArmRef} position={[0.27, 0.1, 0]}>
            <mesh position={[0.1, -0.15, 0]} material={shirtMat}>
              <cylinderGeometry args={[0.075, 0.07, 0.32, 8]} />
            </mesh>
            {/* Left forearm */}
            <group ref={leftForearmRef} position={[0.1, -0.33, 0]}>
              <mesh position={[0, -0.13, 0]} material={skinMat}>
                <cylinderGeometry args={[0.065, 0.06, 0.26, 8]} />
              </mesh>
              {/* Hand */}
              <mesh position={[0, -0.29, 0]} material={skinMat}>
                <sphereGeometry args={[0.07, 8, 8]} />
              </mesh>
            </group>
          </group>

          {/* Right upper arm */}
          <group ref={rightUpperArmRef} position={[-0.27, 0.1, 0]}>
            <mesh position={[-0.1, -0.15, 0]} material={shirtMat}>
              <cylinderGeometry args={[0.075, 0.07, 0.32, 8]} />
            </mesh>
            {/* Right forearm */}
            <group ref={rightForearmRef} position={[-0.1, -0.33, 0]}>
              <mesh position={[0, -0.13, 0]} material={skinMat}>
                <cylinderGeometry args={[0.065, 0.06, 0.26, 8]} />
              </mesh>
              {/* Hand */}
              <mesh position={[0, -0.29, 0]} material={skinMat}>
                <sphereGeometry args={[0.07, 8, 8]} />
              </mesh>
            </group>
          </group>
        </group>

        {/* === HIPS === */}
        <group ref={hipRef} position={[0, 0.42, 0]}>
          <mesh position={[0, -0.12, 0]} material={pantsMat}>
            <cylinderGeometry args={[0.2, 0.18, 0.24, 10]} />
          </mesh>

          {/* Left leg */}
          <group ref={leftLegRef} position={[0.12, -0.26, 0]}>
            {/* Upper leg */}
            <mesh position={[0, -0.17, 0]} material={pantsMat} castShadow>
              <cylinderGeometry args={[0.1, 0.09, 0.36, 8]} />
            </mesh>
            {/* Lower leg */}
            <mesh position={[0, -0.42, 0]} material={pantsMat} castShadow>
              <cylinderGeometry args={[0.085, 0.075, 0.34, 8]} />
            </mesh>
            {/* Shoe */}
            <mesh position={[0, -0.64, 0.07]} material={shoeMat}>
              <boxGeometry args={[0.18, 0.1, 0.32]} />
            </mesh>
          </group>

          {/* Right leg */}
          <group ref={rightLegRef} position={[-0.12, -0.26, 0]}>
            {/* Upper leg */}
            <mesh position={[0, -0.17, 0]} material={pantsMat} castShadow>
              <cylinderGeometry args={[0.1, 0.09, 0.36, 8]} />
            </mesh>
            {/* Lower leg */}
            <mesh position={[0, -0.42, 0]} material={pantsMat} castShadow>
              <cylinderGeometry args={[0.085, 0.075, 0.34, 8]} />
            </mesh>
            {/* Shoe */}
            <mesh position={[0, -0.64, 0.07]} material={shoeMat}>
              <boxGeometry args={[0.18, 0.1, 0.32]} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}

export default function Player() {
  const selectedSkin = useGameStore((s) => s.selectedSkin);
  return <RunnerCharacter skin={selectedSkin} />;
}
