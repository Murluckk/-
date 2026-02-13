"use client";

import { useRage } from "@/store/gameStore";

export default function RageOverlay() {
  const { active, intensity } = useRage();

  if (!active) return null;

  return (
    <div
      className="fixed inset-0 z-30 pointer-events-none rage-overlay"
      style={{
        background: `radial-gradient(ellipse at center, transparent 30%, rgba(239, 68, 68, ${
          intensity * 0.15
        }) 100%)`,
        animation: `rageShake ${0.1 - intensity * 0.05}s ease-in-out infinite`,
      }}
    >
      {/* Vignette effect */}
      <div
        className="absolute inset-0"
        style={{
          boxShadow: `inset 0 0 ${80 + intensity * 60}px rgba(239, 68, 68, ${
            intensity * 0.3
          })`,
        }}
      />
    </div>
  );
}
