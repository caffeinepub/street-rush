import { useGameStore } from "../../store/gameStore";
import type { PowerupType } from "../../store/gameStore";

const POWERUP_STYLES: Record<
  PowerupType,
  { bg: string; label: string; icon: string }
> = {
  speed: { bg: "bg-yellow-400/90", label: "Speed Boost", icon: "⚡" },
  shield: { bg: "bg-cyan-400/90", label: "Shield", icon: "🛡️" },
  magnet: { bg: "bg-purple-500/90", label: "Magnet", icon: "🧲" },
};

export default function HUD() {
  const score = useGameStore((s) => s.score);
  const coins = useGameStore((s) => s.coins);
  const distance = useGameStore((s) => s.distance);
  const highScore = useGameStore((s) => s.highScore);
  const activePowerup = useGameStore((s) => s.activePowerup);
  const powerupTimer = useGameStore((s) => s.powerupTimer);
  const isShielded = useGameStore((s) => s.isShielded);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex justify-between items-start p-4">
        <div className="bg-black/50 backdrop-blur-sm rounded-2xl px-4 py-2 text-white">
          <div className="text-xs text-white/70 uppercase tracking-wider">
            Score
          </div>
          <div className="text-2xl font-bold tabular-nums">
            {score.toLocaleString()}
          </div>
        </div>
        <div className="bg-black/50 backdrop-blur-sm rounded-2xl px-4 py-2 text-white text-center">
          <div className="text-xs text-white/70 uppercase tracking-wider">
            Best
          </div>
          <div className="text-xl font-bold tabular-nums">
            {highScore.toLocaleString()}
          </div>
        </div>
        <div className="bg-black/50 backdrop-blur-sm rounded-2xl px-4 py-2 text-white text-right">
          <div className="text-xs text-white/70 uppercase tracking-wider">
            Coins
          </div>
          <div className="text-2xl font-bold text-yellow-400 tabular-nums">
            🪙 {coins}
          </div>
        </div>
      </div>

      {/* Powerup badge */}
      {activePowerup && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2">
          <div
            data-ocid="hud.powerup.panel"
            className={`${POWERUP_STYLES[activePowerup].bg} backdrop-blur-sm rounded-full px-5 py-2 flex items-center gap-2 shadow-lg text-black font-bold text-sm`}
          >
            <span className="text-lg">
              {POWERUP_STYLES[activePowerup].icon}
            </span>
            <span>{POWERUP_STYLES[activePowerup].label}</span>
            <span className="ml-1 tabular-nums">
              {powerupTimer.toFixed(1)}s
            </span>
          </div>
        </div>
      )}

      {/* Shield indicator */}
      {isShielded && !activePowerup && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2">
          <div className="bg-cyan-400/90 backdrop-blur-sm rounded-full px-5 py-2 flex items-center gap-2 shadow-lg text-black font-bold text-sm">
            <span className="text-lg">🛡️</span>
            <span>Shielded</span>
          </div>
        </div>
      )}

      {/* Distance */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
        <div className="bg-black/40 backdrop-blur-sm rounded-full px-6 py-2 text-white/80 text-sm font-medium">
          {Math.floor(distance)}m
        </div>
      </div>

      {/* Controls hint */}
      <div className="absolute bottom-6 right-4 text-white/40 text-xs text-right leading-relaxed">
        <div>← → Lane</div>
        <div>↑ Jump</div>
        <div>↓ Slide</div>
      </div>
    </div>
  );
}
