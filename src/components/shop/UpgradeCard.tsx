"use client";

import { useGameStore } from "@/store/gameStore";
import type { UpgradeDefinition } from "@/types/game";
import { formatNumber } from "@/components/game/ClickCounter";

interface UpgradeCardProps {
  upgrade: UpgradeDefinition;
}

export default function UpgradeCard({ upgrade }: UpgradeCardProps) {
  const purchaseUpgrade = useGameStore((s) => s.purchaseUpgrade);
  const canAfford = useGameStore((s) => s.canAfford);
  const owned = useGameStore((s) => s.ownedUpgrades[upgrade.id]);

  const level = owned?.level ?? 0;
  const cost = owned?.currentCost ?? upgrade.baseCost;
  const maxed = level >= upgrade.maxLevel;
  const affordable = canAfford(upgrade.id);

  return (
    <button
      onClick={() => purchaseUpgrade(upgrade.id)}
      disabled={maxed || !affordable}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        maxed
          ? "bg-green-900/20 border border-green-500/20 opacity-60"
          : affordable
          ? "bg-[#1a1a2e] border border-green-500/30 hover:border-green-400/50 hover:bg-[#1f1f35] active:scale-[0.98] cursor-pointer"
          : "bg-[#141419] border border-[#1f1f2a] opacity-50 cursor-not-allowed"
      }`}
    >
      {/* Icon */}
      <div className="text-2xl w-10 h-10 flex items-center justify-center rounded-lg bg-black/30">
        {upgrade.icon}
      </div>

      {/* Info */}
      <div className="flex-1 text-left">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-200">
            {upgrade.name}
          </span>
          {level > 0 && !maxed && (
            <span className="text-xs text-green-400 font-mono">
              Lv.{level}
            </span>
          )}
          {maxed && (
            <span className="text-xs text-green-400 font-mono font-bold">
              MAX
            </span>
          )}
        </div>
        <div className="text-xs text-gray-500">{upgrade.description}</div>
      </div>

      {/* Cost */}
      {!maxed && (
        <div
          className={`text-sm font-mono font-bold ${
            affordable ? "text-green-400" : "text-gray-600"
          }`}
        >
          {formatNumber(cost)}
        </div>
      )}
    </button>
  );
}
