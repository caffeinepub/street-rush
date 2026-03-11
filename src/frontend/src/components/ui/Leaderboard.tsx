import { useQuery } from "@tanstack/react-query";
import type { ScoreEntry } from "../../backend";
import { useActor } from "../../hooks/useActor";
import { useGameStore } from "../../store/gameStore";

export default function Leaderboard() {
  const setGameState = useGameStore((s) => s.setGameState);
  const { actor } = useActor();

  const { data: entries, isLoading } = useQuery<ScoreEntry[]>({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLeaderboard();
    },
    enabled: !!actor,
    staleTime: 30_000,
  });

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="bg-gray-900/95 rounded-3xl p-6 w-full max-w-sm mx-4 text-white shadow-2xl border border-white/10 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-black">Leaderboard</h2>
          <button
            type="button"
            data-ocid="leaderboard.close_button"
            onClick={() => setGameState("start")}
            className="text-white/50 hover:text-white transition-colors text-lg"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto flex-1" data-ocid="leaderboard.list">
          {isLoading && (
            <div
              data-ocid="leaderboard.loading_state"
              className="text-center text-white/50 py-8"
            >
              Loading...
            </div>
          )}
          {!isLoading && (!entries || entries.length === 0) && (
            <div
              data-ocid="leaderboard.empty_state"
              className="text-center text-white/50 py-8"
            >
              No scores yet. Be the first!
            </div>
          )}
          {entries?.map((entry, i) => (
            <div
              key={`${entry.playerName}-${String(entry.score)}`}
              data-ocid={`leaderboard.item.${i + 1}`}
              className="flex items-center gap-3 py-2.5 border-b border-white/10 last:border-0"
            >
              <span
                className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-black ${
                  i === 0
                    ? "bg-yellow-400 text-black"
                    : i === 1
                      ? "bg-gray-400 text-black"
                      : i === 2
                        ? "bg-amber-700 text-white"
                        : "bg-white/10 text-white/60"
                }`}
              >
                {i + 1}
              </span>
              <span className="flex-1 font-semibold truncate">
                {entry.playerName}
              </span>
              <span className="text-yellow-400 font-black tabular-nums">
                {Number(entry.score).toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        <button
          type="button"
          data-ocid="leaderboard.primary_button"
          onClick={() => setGameState("start")}
          className="mt-4 w-full bg-yellow-400 hover:bg-yellow-300 text-black font-black py-3 rounded-2xl transition-colors"
        >
          Play
        </button>
      </div>
    </div>
  );
}
