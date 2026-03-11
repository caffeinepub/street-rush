import { useState } from "react";
import { useActor } from "../../hooks/useActor";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import { useGameStore } from "../../store/gameStore";
import { resetCoins } from "../game/Coins";
import { resetObstacles } from "../game/Obstacles";

export default function GameOverScreen() {
  const score = useGameStore((s) => s.score);
  const coins = useGameStore((s) => s.coins);
  const highScore = useGameStore((s) => s.highScore);
  const startGame = useGameStore((s) => s.startGame);
  const setGameState = useGameStore((s) => s.setGameState);
  const { actor } = useActor();
  const { identity, login } = useInternetIdentity();
  const [playerName, setPlayerName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function handlePlay() {
    resetObstacles();
    resetCoins();
    startGame();
  }

  async function handleSubmit() {
    if (!actor || !playerName.trim()) return;
    setSubmitting(true);
    try {
      await actor.submitScore(playerName.trim(), BigInt(score));
      setSubmitted(true);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  }

  const isNewHigh = score >= highScore && score > 0;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 backdrop-blur-md">
      <div className="bg-gray-900/95 rounded-3xl p-8 w-full max-w-sm mx-4 text-white shadow-2xl border border-white/10">
        <h2 className="text-4xl font-black text-center mb-1">Game Over</h2>
        {isNewHigh && (
          <p className="text-yellow-400 text-center font-bold text-sm mb-4">
            🏆 New High Score!
          </p>
        )}

        <div className="grid grid-cols-2 gap-3 mb-6 mt-4">
          <div className="bg-white/10 rounded-2xl p-3 text-center">
            <div className="text-xs text-white/60 uppercase tracking-wider">
              Score
            </div>
            <div className="text-2xl font-black text-white">
              {score.toLocaleString()}
            </div>
          </div>
          <div className="bg-white/10 rounded-2xl p-3 text-center">
            <div className="text-xs text-white/60 uppercase tracking-wider">
              Coins
            </div>
            <div className="text-2xl font-black text-yellow-400">{coins}</div>
          </div>
        </div>

        {!submitted ? (
          <div className="mb-4 space-y-2">
            {identity ? (
              <>
                <input
                  data-ocid="gameover.input"
                  type="text"
                  placeholder="Your name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  maxLength={20}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                <button
                  type="button"
                  data-ocid="gameover.submit_button"
                  onClick={handleSubmit}
                  disabled={!playerName.trim() || submitting}
                  className="w-full bg-yellow-400 disabled:opacity-40 text-black font-bold py-2 rounded-xl transition-opacity"
                >
                  {submitting ? "Submitting..." : "Submit to Leaderboard"}
                </button>
              </>
            ) : (
              <button
                type="button"
                data-ocid="gameover.secondary_button"
                onClick={login}
                className="w-full bg-white/10 border border-white/20 text-white/80 font-semibold py-2 rounded-xl hover:bg-white/20 transition-colors"
              >
                Login to Submit Score
              </button>
            )}
          </div>
        ) : (
          <p
            data-ocid="gameover.success_state"
            className="text-green-400 text-center font-semibold mb-4 text-sm"
          >
            Score submitted! ✓
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            data-ocid="gameover.primary_button"
            onClick={handlePlay}
            className="flex-1 bg-yellow-400 hover:bg-yellow-300 text-black font-black py-3 rounded-2xl text-lg transition-colors"
          >
            Play Again
          </button>
          <button
            type="button"
            data-ocid="gameover.leaderboard_button"
            onClick={() => setGameState("leaderboard")}
            className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-2xl transition-colors text-sm"
          >
            Leaderboard
          </button>
        </div>
      </div>
    </div>
  );
}
