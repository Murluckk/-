"use client";

import { useGameStore, useCanAffordUpgrade } from "@/store/gameStore";
import type { UpgradeDefinition } from "@/types/game";
import { formatNumber } from "@/components/game/ClickCounter";

interface UpgradeCardProps {
  upgrade: UpgradeDefinition;
}

export default function UpgradeCard({ upgrade }: UpgradeCardProps) {
  const purchaseUpgrade = useGameStore((s) => s.purchaseUpgrade);
  const owned = useGameStore((s) => s.ownedUpgrades[upgrade.id]);
  const affordable = useCanAffordUpgrade(upgrade.id);

  const level = owned?.level ?? 0;
  const cost = owned?.currentCost ?? upgrade.baseCost;
  const maxed = level >= upgrade.maxLevel;

  return (
    <button
      onClick={() => purchaseUpgrade(upgrade.id)}
      disabled={maxed || !affordable}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        maxed
          ? "bg-[#eef5f0] border border-[#2d6a4f]/20 opacity-60"
          : affordable
          ? "bg-white border border-[#2d6a4f]/20 hover:border-[#2d6a4f]/40 hover:bg-[#f0f7f2] active:scale-[0.98] cursor-pointer shadow-sm"
          : "bg-gray-50 border border-gray-200 opacity-50 cursor-not-allowed"
      }`}
    >
      <div className="text-2xl w-10 h-10 flex items-center justify-center rounded-lg bg-[#eef5f0]">
        {upgrade.icon}
      </div>

      <div className="flex-1 text-left">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-700">
            {upgrade.name}
          </span>
          {level > 0 && !maxed && (
            <span className="text-xs text-[#2d6a4f] font-mono">
              Lv.{level}
            </span>
          )}
          {maxed && (
            <span className="text-xs text-[#2d6a4f] font-mono font-bold">
              MAX
            </span>
          )}
        </div>
        <div className="text-xs text-gray-400">{upgrade.description}</div>
      </div>

      {!maxed && (
        <div
          className={`text-sm font-mono font-bold ${
            affordable ? "text-[#2d6a4f]" : "text-gray-400"
          }`}
        >
          {formatNumber(cost)}
        </div>
      )}
    </button>
  );
}
