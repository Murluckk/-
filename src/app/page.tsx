"use client";

import { useState, useEffect } from "react";
import { useGameStore, useAutoClickRate } from "@/store/gameStore";
import { useAutoClicker } from "@/hooks/useAutoClicker";
import { useComboDecay } from "@/hooks/useComboDecay";
import PillButton from "@/components/game/PillButton";
import ClickCounter from "@/components/game/ClickCounter";
import HpBar from "@/components/game/HpBar";
import PhrasePopup from "@/components/game/PhrasePopup";
import ComboMeter from "@/components/game/ComboMeter";
import RageOverlay from "@/components/game/RageOverlay";
import ShopPanel from "@/components/shop/ShopPanel";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const toggleShop = useGameStore((s) => s.toggleShop);
  const updatePillEvolution = useGameStore((s) => s.updatePillEvolution);
  const level = useGameStore((s) => s.level);
  const autoRate = useAutoClickRate();

  // Initialize hooks
  useAutoClicker();
  useComboDecay();

  useEffect(() => {
    // Manually rehydrate from localStorage after mount (SSR-safe)
    useGameStore.persist.rehydrate();
    setMounted(true);
  }, []);

  // Update pill evolution on level change
  useEffect(() => {
    if (mounted) updatePillEvolution();
  }, [level, mounted, updatePillEvolution]);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0b0f]">
        <div className="text-2xl text-green-400 font-mono animate-pulse">
          Loading 14k...
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-between bg-[#0b0b0f] relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0b0b0f] via-[#0d1a0d] to-[#0b0b0f] pointer-events-none" />

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-green-500/10"
            style={{
              width: `${3 + (i % 5)}px`,
              height: `${3 + (i % 5)}px`,
              left: `${(i * 7) % 100}%`,
              animation: `drift ${8 + (i % 10)}s linear infinite`,
              animationDelay: `${(i * 1.3) % 10}s`,
            }}
          />
        ))}
      </div>

      {/* Rage overlay */}
      <RageOverlay />

      {/* Header */}
      <header className="relative z-10 w-full flex flex-col items-center pt-8 pb-4 px-4">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight">
          <span className="text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]">
            14k
          </span>
        </h1>
        <p className="text-sm text-gray-500 mt-1 font-mono">
          click the pill. earn your fate.
        </p>
      </header>

      {/* Click counter */}
      <ClickCounter />

      {/* Combo meter */}
      <ComboMeter />

      {/* Pill character - main clicker */}
      <div className="relative z-10 flex flex-col items-center flex-1 justify-center">
        <PhrasePopup />
        <PillButton />
        <p className="text-xs text-gray-600 mt-4 font-mono animate-pulse">
          tap to click
        </p>
      </div>

      {/* HP Bar */}
      <HpBar />

      {/* Bottom bar: Shop + stats */}
      <div className="relative z-10 w-full max-w-sm px-6 pb-4 flex items-center justify-between">
        <button
          onClick={toggleShop}
          className="bg-[#1a1a2e] border border-green-500/30 rounded-xl px-5 py-2.5 text-green-400 font-mono font-bold text-sm hover:border-green-400/50 hover:bg-[#1f1f35] active:scale-95 transition-all"
        >
          SHOP
        </button>
        {autoRate > 0 && (
          <span className="text-xs text-gray-500 font-mono">
            +{autoRate}/sec
          </span>
        )}
      </div>

      {/* Shop panel */}
      <ShopPanel />

      {/* Footer */}
      <footer className="relative z-10 pb-4 text-center">
        <p className="text-[10px] text-gray-700 font-mono">
          built on pump.fun
        </p>
      </footer>
    </div>
  );
}
