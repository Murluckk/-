"use client";

import { useState, useEffect } from "react";
import { useClicks, useCurrentClicks, useEffectiveMultiplier } from "@/store/gameStore";

function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + "B";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

export default function ClickCounter() {
  const clicks = useClicks();
  const currentClicks = useCurrentClicks();
  const multiplier = useEffectiveMultiplier();
  const [pulse, setPulse] = useState(false);
  const [prevClicks, setPrevClicks] = useState(clicks);

  // Pulse on click change
  useEffect(() => {
    if (clicks !== prevClicks) {
      setPulse(true);
      setPrevClicks(clicks);
      const t = setTimeout(() => setPulse(false), 300);
      return () => clearTimeout(t);
    }
  }, [clicks, prevClicks]);

  return (
    <div className="relative z-10 flex flex-col items-center">
      <div
        className={`text-5xl md:text-7xl font-black font-mono text-green-400 transition-all ${
          pulse ? "counter-pulse" : ""
        }`}
        style={{
          textShadow: "0 0 20px rgba(74, 222, 128, 0.4)",
        }}
      >
        {formatNumber(clicks)}
      </div>
      <div className="flex items-center gap-3 mt-1">
        <span className="text-xs text-gray-600 font-mono">CLICKS</span>
        {multiplier > 1 && (
          <span className="text-xs text-yellow-400 font-mono font-bold">
            x{multiplier}
          </span>
        )}
      </div>
      {currentClicks !== clicks && (
        <div className="text-xs text-gray-500 font-mono mt-0.5">
          {formatNumber(currentClicks)} spendable
        </div>
      )}
    </div>
  );
}

export { formatNumber };
