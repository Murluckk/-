"use client";

import { useGameStore, useShopOpen, useCurrentClicks, usePrestigeCount } from "@/store/gameStore";
import { UPGRADES } from "@/lib/upgrades";
import UpgradeCard from "./UpgradeCard";
import { formatNumber } from "@/components/game/ClickCounter";

const PRESTIGE_THRESHOLDS = [100_000, 1_000_000, 10_000_000, 100_000_000];

function getPrestigeThreshold(count: number): number {
  if (count < PRESTIGE_THRESHOLDS.length) {
    return PRESTIGE_THRESHOLDS[count];
  }
  return (
    PRESTIGE_THRESHOLDS[PRESTIGE_THRESHOLDS.length - 1] *
    Math.pow(10, count - PRESTIGE_THRESHOLDS.length + 1)
  );
}

export default function ShopPanel() {
  const shopOpen = useShopOpen();
  const toggleShop = useGameStore((s) => s.toggleShop);
  const currentClicks = useCurrentClicks();
  const performPrestige = useGameStore((s) => s.performPrestige);
  const prestigeCount = usePrestigeCount();
  const clicks = useGameStore((s) => s.clicks);

  if (!shopOpen) return null;

  const autoUpgrades = UPGRADES.filter((u) => u.category === "auto");
  const multiUpgrades = UPGRADES.filter((u) => u.category === "multiplier");
  const cosmeticUpgrades = UPGRADES.filter((u) => u.category === "cosmetic");

  const prestigeThreshold = getPrestigeThreshold(prestigeCount);
  const prestigeAvailable = clicks >= prestigeThreshold;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={toggleShop}
      />

      <div className="relative z-50 w-full max-w-md bg-white border-t border-[#2d6a4f]/20 rounded-t-2xl max-h-[70vh] overflow-hidden animate-slide-up shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-bold text-[#1b4332] font-mono">
              UPGRADE SHOP
            </h2>
            <p className="text-xs text-gray-500 font-mono">
              {formatNumber(currentClicks)} clicks to spend
            </p>
          </div>
          <button
            onClick={toggleShop}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(70vh-80px)] px-4 py-3 space-y-4 scrollbar-thin">
          {(prestigeAvailable || prestigeCount > 0) && (
            <div className="space-y-2">
              <h3 className="text-xs font-mono text-amber-600 uppercase tracking-wider">
                Prestige
              </h3>
              <button
                onClick={() => {
                  if (prestigeAvailable && confirm("Reset ALL progress for a permanent x1.5 multiplier? This cannot be undone!")) {
                    performPrestige();
                  }
                }}
                disabled={!prestigeAvailable}
                className={`w-full px-4 py-3 rounded-xl border font-mono text-sm transition-all ${
                  prestigeAvailable
                    ? "bg-amber-50 border-amber-400/40 text-amber-700 hover:border-amber-400/60 hover:bg-amber-100 cursor-pointer animate-pulse"
                    : "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                {prestigeAvailable ? (
                  <>
                    REBIRTH — Permanent x{(1.5 ** (prestigeCount + 1)).toFixed(1)} multiplier
                  </>
                ) : (
                  <>
                    Rebirth at {formatNumber(prestigeThreshold)} clicks
                    {prestigeCount > 0 && ` (x${prestigeCount} rebirths)`}
                  </>
                )}
              </button>
            </div>
          )}

          <div className="space-y-2">
            <h3 className="text-xs font-mono text-gray-400 uppercase tracking-wider">
              Auto-Clickers
            </h3>
            {autoUpgrades.map((u) => (
              <UpgradeCard key={u.id} upgrade={u} />
            ))}
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-mono text-gray-400 uppercase tracking-wider">
              Click Power
            </h3>
            {multiUpgrades.map((u) => (
              <UpgradeCard key={u.id} upgrade={u} />
            ))}
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-mono text-gray-400 uppercase tracking-wider">
              Cosmetics
            </h3>
            {cosmeticUpgrades.map((u) => (
              <UpgradeCard key={u.id} upgrade={u} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
