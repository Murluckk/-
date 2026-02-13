"use client";

import { useLevel, useClicks } from "@/store/gameStore";

export default function HpBar() {
  const clicks = useClicks();
  const level = useLevel();

  const hpMax = 1000;
  const hpCurrent = clicks % hpMax;
  const hpPercent = (hpCurrent / hpMax) * 100;

  return (
    <div className="relative z-10 w-full max-w-sm px-6 pb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono text-gray-500">
          HP {hpCurrent}/{hpMax}
        </span>
        {level > 0 && (
          <span className="text-xs font-mono text-green-400 font-bold">
            LVL {level}
          </span>
        )}
      </div>
      <div className="hp-bar-container h-4 w-full">
        <div
          className="hp-bar-fill h-full rounded-lg"
          style={{ width: `${hpPercent}%` }}
        />
      </div>
      <p className="text-[10px] text-gray-700 mt-2 text-center font-mono">
        {level < 5
          ? "fill the bar. something happens at LVL UP..."
          : level < 20
          ? "the pill grows stronger with each level"
          : "you are becoming the pill"}
      </p>
    </div>
  );
}
