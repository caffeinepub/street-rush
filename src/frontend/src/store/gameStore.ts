import { create } from "zustand";

export type GameState = "start" | "playing" | "gameover" | "leaderboard";
export type PowerupType = "speed" | "shield" | "magnet";
export type SkinType = "male" | "female";
export type BackgroundType = "city" | "jungle" | "neon";

interface GameStore {
  gameState: GameState;
  score: number;
  coins: number;
  highScore: number;
  speed: number;
  playerLane: number;
  playerTargetX: number;
  playerY: number;
  playerVY: number;
  isJumping: boolean;
  isSliding: boolean;
  slideTimer: number;
  distance: number;

  // Powerups
  activePowerup: null | PowerupType;
  powerupTimer: number;
  isShielded: boolean;

  // Customization
  selectedSkin: SkinType;
  selectedBackground: BackgroundType;

  setGameState: (state: GameState) => void;
  startGame: () => void;
  endGame: () => void;
  addCoin: () => void;
  incrementScore: (pts: number) => void;
  setPlayerLane: (lane: number) => void;
  jump: () => void;
  slide: () => void;
  tick: (dt: number) => void;
  activatePowerup: (type: PowerupType) => void;
  selectSkin: (skin: SkinType) => void;
  selectBackground: (bg: BackgroundType) => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: "start",
  score: 0,
  coins: 0,
  highScore: 0,
  speed: 12,
  playerLane: 0,
  playerTargetX: 0,
  playerY: 0,
  playerVY: 0,
  isJumping: false,
  isSliding: false,
  slideTimer: 0,
  distance: 0,

  activePowerup: null,
  powerupTimer: 0,
  isShielded: false,

  selectedSkin: "male",
  selectedBackground: "city",

  setGameState: (state) => set({ gameState: state }),

  startGame: () =>
    set((s) => ({
      gameState: "playing",
      score: 0,
      coins: 0,
      speed: 12,
      playerLane: 0,
      playerTargetX: 0,
      playerY: 0,
      playerVY: 0,
      isJumping: false,
      isSliding: false,
      slideTimer: 0,
      distance: 0,
      activePowerup: null,
      powerupTimer: 0,
      isShielded: false,
      selectedSkin: s.selectedSkin,
      selectedBackground: s.selectedBackground,
    })),

  endGame: () => {
    const { score, highScore, isShielded } = get();
    if (isShielded) {
      // Shield absorbs the hit
      set({ isShielded: false, activePowerup: null, powerupTimer: 0 });
      return;
    }
    set({
      gameState: "gameover",
      highScore: Math.max(score, highScore),
    });
  },

  addCoin: () => set((s) => ({ coins: s.coins + 1, score: s.score + 10 })),

  incrementScore: (pts) => set((s) => ({ score: s.score + pts })),

  setPlayerLane: (lane) => {
    const clamped = Math.max(-1, Math.min(1, lane));
    set({ playerLane: clamped, playerTargetX: clamped * 2 });
  },

  jump: () => {
    const { isJumping, isSliding, gameState } = get();
    if (gameState !== "playing") return;
    if (isJumping) return;
    if (isSliding) set({ isSliding: false, slideTimer: 0 });
    set({ isJumping: true, playerVY: 8 });
  },

  slide: () => {
    const { isSliding, isJumping, gameState } = get();
    if (gameState !== "playing") return;
    if (isSliding) return;
    if (isJumping) {
      set({ isJumping: false, playerY: 0, playerVY: 0 });
      return;
    }
    set({ isSliding: true, slideTimer: 1.0 });
  },

  activatePowerup: (type) => {
    const duration = type === "shield" ? 8 : 6;
    set({
      activePowerup: type,
      powerupTimer: duration,
      isShielded: type === "shield",
    });
  },

  selectSkin: (skin) => set({ selectedSkin: skin }),
  selectBackground: (bg) => set({ selectedBackground: bg }),

  tick: (dt: number) => {
    const s = get();
    if (s.gameState !== "playing") return;

    let {
      playerY,
      playerVY,
      isJumping,
      isSliding,
      slideTimer,
      speed,
      distance,
      activePowerup,
      powerupTimer,
    } = s;

    // Jump physics
    if (isJumping) {
      playerVY -= 18 * dt;
      playerY += playerVY * dt;
      if (playerY <= 0) {
        playerY = 0;
        playerVY = 0;
        isJumping = false;
      }
    }

    // Slide timer
    if (isSliding) {
      slideTimer -= dt;
      if (slideTimer <= 0) {
        isSliding = false;
        slideTimer = 0;
      }
    }

    // Powerup timer
    if (activePowerup !== null) {
      powerupTimer -= dt;
      if (powerupTimer <= 0) {
        powerupTimer = 0;
        activePowerup = null;
        // Also clear shield if expired
        set({ isShielded: false });
      }
    }

    // Speed - speed powerup makes it slightly faster (boost)
    let effectiveSpeed = Math.min(30, 12 + distance * 0.002);
    if (activePowerup === "speed") effectiveSpeed *= 1.4;
    speed = effectiveSpeed;
    distance += speed * dt;

    set({
      playerY,
      playerVY,
      isJumping,
      isSliding,
      slideTimer,
      speed,
      distance,
      activePowerup,
      powerupTimer,
      score: Math.floor(distance / 10) + s.coins * 10,
    });
  },
}));
