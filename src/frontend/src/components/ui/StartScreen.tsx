import { useGameStore } from "../../store/gameStore";
import type { BackgroundType, SkinType } from "../../store/gameStore";
import { resetCoins } from "../game/Coins";
import { resetObstacles } from "../game/Obstacles";
import { resetPowerups } from "../game/Powerups";

const SKINS: SkinType[] = ["male", "female"];
const SKIN_LABELS: Record<SkinType, string> = {
  male: "Male Runner",
  female: "Female Runner",
};
const SKIN_IMAGES: Record<SkinType, string> = {
  male: "/assets/generated/character-runner-transparent.dim_120x160.png",
  female: "/assets/generated/character-female-transparent.dim_120x160.png",
};

const BACKGROUNDS: BackgroundType[] = ["city", "jungle", "neon"];
const BG_LABELS: Record<BackgroundType, string> = {
  city: "🏙️ City Street",
  jungle: "🌿 Jungle",
  neon: "🌃 Neon City",
};
const BG_IMAGES: Record<BackgroundType, string> = {
  city: "/assets/generated/bg-city-street.dim_1920x600.jpg",
  jungle: "/assets/generated/bg-jungle.dim_1920x600.jpg",
  neon: "/assets/generated/bg-neon-city.dim_1920x600.jpg",
};

export default function StartScreen() {
  const startGame = useGameStore((s) => s.startGame);
  const highScore = useGameStore((s) => s.highScore);
  const selectedSkin = useGameStore((s) => s.selectedSkin);
  const selectedBackground = useGameStore((s) => s.selectedBackground);
  const selectSkin = useGameStore((s) => s.selectSkin);
  const selectBackground = useGameStore((s) => s.selectBackground);

  function handleStart() {
    resetObstacles();
    resetCoins();
    resetPowerups();
    startGame();
  }

  function cycleSkin(dir: 1 | -1) {
    const idx = SKINS.indexOf(selectedSkin);
    const next = (idx + dir + SKINS.length) % SKINS.length;
    selectSkin(SKINS[next]);
  }

  function cycleBg(dir: 1 | -1) {
    const idx = BACKGROUNDS.indexOf(selectedBackground);
    const next = (idx + dir + BACKGROUNDS.length) % BACKGROUNDS.length;
    selectBackground(BACKGROUNDS[next]);
  }

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center backdrop-blur-sm"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,30,0.85)), url('${BG_IMAGES[selectedBackground]}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-7xl font-black text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)] tracking-tight mb-2">
          STREET
        </h1>
        <h1 className="text-7xl font-black text-yellow-400 drop-shadow-[0_4px_24px_rgba(255,200,0,0.6)] tracking-tight">
          RUSH
        </h1>
        {highScore > 0 && (
          <p className="text-white/70 mt-3 text-lg">
            Best: {highScore.toLocaleString()}
          </p>
        )}
      </div>

      {/* Play button */}
      <button
        type="button"
        data-ocid="start.primary_button"
        onClick={handleStart}
        className="bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-black font-black text-2xl px-14 py-5 rounded-full shadow-[0_8px_32px_rgba(255,200,0,0.5)] transition-all duration-150 uppercase tracking-wider mb-8"
      >
        Play
      </button>

      {/* Customization panel */}
      <div className="bg-black/50 backdrop-blur-md rounded-3xl p-5 w-80 space-y-4 border border-white/10">
        {/* Skin Selector */}
        <div>
          <p className="text-white/60 text-xs uppercase tracking-widest mb-2 text-center">
            Character
          </p>
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              data-ocid="skin.toggle"
              onClick={() => cycleSkin(-1)}
              className="bg-white/10 hover:bg-white/20 text-white rounded-full w-9 h-9 flex items-center justify-center text-lg font-bold transition-colors"
            >
              ‹
            </button>
            <div className="flex flex-col items-center flex-1">
              <img
                src={SKIN_IMAGES[selectedSkin]}
                alt={SKIN_LABELS[selectedSkin]}
                className="h-16 w-auto object-contain drop-shadow-lg"
              />
              <span className="text-white text-sm font-semibold mt-1">
                {SKIN_LABELS[selectedSkin]}
              </span>
            </div>
            <button
              type="button"
              data-ocid="skin.toggle"
              onClick={() => cycleSkin(1)}
              className="bg-white/10 hover:bg-white/20 text-white rounded-full w-9 h-9 flex items-center justify-center text-lg font-bold transition-colors"
            >
              ›
            </button>
          </div>
        </div>

        <div className="border-t border-white/10" />

        {/* Background Selector */}
        <div>
          <p className="text-white/60 text-xs uppercase tracking-widest mb-2 text-center">
            Background
          </p>
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              data-ocid="background.toggle"
              onClick={() => cycleBg(-1)}
              className="bg-white/10 hover:bg-white/20 text-white rounded-full w-9 h-9 flex items-center justify-center text-lg font-bold transition-colors"
            >
              ‹
            </button>
            <div className="flex flex-col items-center flex-1">
              <div
                className="w-full h-12 rounded-xl overflow-hidden"
                style={{
                  backgroundImage: `url('${BG_IMAGES[selectedBackground]}')`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <span className="text-white text-sm font-semibold mt-1">
                {BG_LABELS[selectedBackground]}
              </span>
            </div>
            <button
              type="button"
              data-ocid="background.toggle"
              onClick={() => cycleBg(1)}
              className="bg-white/10 hover:bg-white/20 text-white rounded-full w-9 h-9 flex items-center justify-center text-lg font-bold transition-colors"
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* Powerup hints */}
      <div className="mt-5 flex gap-3 text-xs text-white/50">
        <span>⚡ Speed</span>
        <span>🛡️ Shield</span>
        <span>🧲 Magnet</span>
      </div>

      <div className="mt-4 text-white/40 text-xs text-center space-y-1">
        <p>Arrow Keys or WASD to control</p>
        <p>Swipe on mobile</p>
      </div>
    </div>
  );
}
