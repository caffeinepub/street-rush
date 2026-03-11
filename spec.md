# Street Rush

## Current State
- 3D endless runner with Three.js/React Three Fiber
- Blocky geometric player character (box meshes)
- Single sky-blue background/fog
- No power-ups
- Coins, obstacles, leaderboard, jump/slide/lane controls

## Requested Changes (Diff)

### Add
- **Power-ups**: Three types spawn on track (like coins), each with a glowing visual:
  - Speed Boost (lightning): temporarily reduces game speed slightly for easier dodging, shown in HUD with timer
  - Shield (star): grants 3-second invincibility, blocks one collision, shown in HUD
  - Coin Magnet (magnet): auto-collects all coins on screen for 5 seconds, shown in HUD
- **Character Skins**: Two human sprite skins (male runner in red hoodie, female runner in blue jacket) using generated images as billboard textures on a plane mesh. Selectable on the Start Screen with left/right arrows and a preview.
- **Background Themes**: Three backgrounds selectable on Start Screen:
  - City Street (default, daytime urban)
  - Jungle (green tropical)
  - Neon City (dark cyberpunk)
  - Each theme changes fog color, ambient light color, sky color in GameScene

### Modify
- `gameStore.ts`: Add powerup state (activePowerup, powerupTimer, selectedSkin, selectedBackground)
- `Player.tsx`: Replace box-mesh character with a sprite billboard that swaps image based on selectedSkin; keep running/jump/slide animation via scale/rotation
- `GameScene.tsx`: Accept background theme to change fog and lighting colors
- `StartScreen.tsx`: Add skin selector and background selector UI
- `HUD.tsx`: Show active powerup badge with countdown timer
- Add new `Powerups.tsx` component (pool-based, like Coins/Obstacles) for spawning and collecting powerup items

### Remove
- Nothing removed

## Implementation Plan
1. Update `gameStore.ts` with powerup/skin/background state and actions
2. Create `Powerups.tsx` component for spawning/collecting powerup items on the track
3. Update `Player.tsx` to use sprite billboard textures with skin switching
4. Update `GameScene.tsx` to use background theme colors
5. Update `StartScreen.tsx` with skin + background selectors
6. Update `HUD.tsx` to show active powerup and timer
7. Wire everything in `Game.tsx` (import Powerups, pass skin/bg to scene)
