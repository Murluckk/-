"use client";

import { useState, useEffect, useCallback } from "react";

const GOAL = 1_000_000;

export default function MarketCapBar() {
  const [mcap, setMcap] = useState<number | null>(null);

  const fetchMcap = useCallback(async () => {
    try {
      const res = await fetch("/api/market-cap");
      const data = await res.json();
      if (data.marketCap) setMcap(data.marketCap);
    } catch {
      /* silent */
    }
  }, []);

  useEffect(() => {
    fetchMcap();
    const id = setInterval(fetchMcap, 30_000);
    return () => clearInterval(id);
  }, [fetchMcap]);

  const pct = mcap ? Math.min((mcap / GOAL) * 100, 100) : 0;

  const formatMcap = (n: number) => {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
    if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
    return `$${n.toFixed(0)}`;
  };

  return (
    <div className="fixed right-5 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-3">
      {/* Goal label */}
      <span className="text-sm font-mono font-black text-[#2d6a4f] drop-shadow-[0_0_6px_rgba(45,106,79,0.3)]">
        $1M
      </span>

      {/* Vertical track */}
      <div className="relative w-7 h-[70vh] max-h-[500px] bg-white/80 border-2 border-[#2d6a4f]/40 rounded-full overflow-hidden shadow-xl backdrop-blur-sm">
        {/* Tick marks with labels */}
        {[
          { pct: 25, label: "$250K" },
          { pct: 50, label: "$500K" },
          { pct: 75, label: "$750K" },
        ].map((tick) => (
          <div key={tick.pct} className="absolute left-0 w-full" style={{ bottom: `${tick.pct}%` }}>
            <div className="border-t border-[#2d6a4f]/15 w-full" />
            <span className="absolute right-full mr-1.5 -translate-y-1/2 text-[8px] font-mono text-gray-400 whitespace-nowrap">
              {tick.label}
            </span>
          </div>
        ))}
        {/* Fill from bottom */}
        <div
          className="absolute bottom-0 left-0 w-full rounded-full transition-all duration-1000 ease-out"
          style={{
            height: `${pct}%`,
            background:
              pct >= 100
                ? "linear-gradient(0deg, #40c057, #2d6a4f)"
                : "linear-gradient(0deg, #52b788, #2d6a4f)",
            boxShadow: "0 0 12px rgba(45, 106, 79, 0.5), inset 0 0 8px rgba(255,255,255,0.2)",
          }}
        />
      </div>

      {/* Current value */}
      <div className="flex flex-col items-center">
        <span className="text-sm font-mono font-black text-[#2d6a4f] drop-shadow-[0_0_6px_rgba(45,106,79,0.3)]">
          {mcap !== null ? formatMcap(mcap) : "..."}
        </span>
        <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-0.5">
          mcap
        </span>
      </div>

      {pct >= 100 && (
        <span className="text-sm font-mono font-black text-[#2d6a4f] animate-pulse">
          GOAL!
        </span>
      )}
    </div>
  );
}
