"use client";

import { useCombo } from "@/store/gameStore";

export default function ComboMeter() {
  const { count, multiplier, active } = useCombo();

  if (count < 3) return null;

  // Intensity for visual scaling (0-1)
  const intensity = Math.min(count / 50, 1);

  return (
    <div className="flex items-center gap-2 mt-2">
      <div
        className="font-mono font-black text-sm transition-all duration-150"
        style={{
          color: active
            ? `hsl(${120 - intensity * 120}, 100%, ${50 + intensity * 10}%)`
            : "#4ade80",
          textShadow: active
            ? `0 0 ${10 + intensity * 20}px currentColor`
            : "none",
          transform: `scale(${1 + intensity * 0.3})`,
        }}
      >
        COMBO x{count}
      </div>
      {multiplier > 1 && (
        <div
          className="font-mono font-bold text-xs px-2 py-0.5 rounded-full transition-all"
          style={{
            background: `rgba(${Math.floor(255 * intensity)}, ${Math.floor(
              255 * (1 - intensity)
            )}, 0, 0.2)`,
            color: `hsl(${120 - intensity * 120}, 100%, 60%)`,
            border: `1px solid rgba(${Math.floor(
              255 * intensity
            )}, ${Math.floor(255 * (1 - intensity))}, 0, 0.3)`,
          }}
        >
          x{multiplier}
        </div>
      )}
    </div>
  );
}
