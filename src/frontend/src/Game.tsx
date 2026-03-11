import { Canvas } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import GameScene from "./components/game/GameScene";
import GameOverScreen from "./components/ui/GameOverScreen";
import HUD from "./components/ui/HUD";
import Leaderboard from "./components/ui/Leaderboard";
import StartScreen from "./components/ui/StartScreen";
import { useGameStore } from "./store/gameStore";

export default function Game() {
  const gameState = useGameStore((s) => s.gameState);
  const { jump, slide, setPlayerLane, playerLane } = useGameStore();
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Keyboard controls
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (gameState !== "playing") return;
      switch (e.key) {
        case "ArrowLeft":
        case "a":
        case "A":
          setPlayerLane(playerLane - 1);
          break;
        case "ArrowRight":
        case "d":
        case "D":
          setPlayerLane(playerLane + 1);
          break;
        case "ArrowUp":
        case "w":
        case "W":
        case " ":
          jump();
          break;
        case "ArrowDown":
        case "s":
        case "S":
          slide();
          break;
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [gameState, playerLane, jump, slide, setPlayerLane]);

  // Touch/swipe controls
  function handleTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY };
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (!touchStartRef.current || gameState !== "playing") return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartRef.current.x;
    const dy = t.clientY - touchStartRef.current.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    const threshold = 30;

    if (absDx > threshold || absDy > threshold) {
      if (absDx > absDy) {
        // Swipe right -> move right (lane + 1), swipe left -> move left (lane - 1)
        if (dx > 0) setPlayerLane(useGameStore.getState().playerLane + 1);
        else setPlayerLane(useGameStore.getState().playerLane - 1);
      } else {
        if (dy < 0) jump();
        else slide();
      }
    }
    touchStartRef.current = null;
  }

  return (
    <div
      className="w-full h-screen relative overflow-hidden select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <Canvas
        shadows
        camera={{ position: [0, 4, 9], fov: 70 }}
        style={{ background: "#87CEEB" }}
        data-ocid="game.canvas_target"
      >
        <GameScene />
      </Canvas>

      {gameState === "playing" && <HUD />}
      {gameState === "start" && <StartScreen />}
      {gameState === "gameover" && <GameOverScreen />}
      {gameState === "leaderboard" && <Leaderboard />}
    </div>
  );
}
