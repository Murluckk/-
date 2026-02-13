import { StateCreator } from "zustand";
import type { GameStore } from "../gameStore";
import type { OwnedUpgrade, UpgradeId } from "@/types/game";
import { UPGRADES, getUpgrade } from "@/lib/upgrades";

export interface ShopSlice {
  // State
  ownedUpgrades: Record<string, OwnedUpgrade>;

  // Actions
  purchaseUpgrade: (id: UpgradeId) => boolean;
  canAfford: (id: UpgradeId) => boolean;
  getAutoClickRate: () => number;
  getClickMultiplier: () => number;
  hasGoldenPill: () => boolean;
  resetUpgrades: () => void;
}

export const createShopSlice: StateCreator<GameStore, [], [], ShopSlice> = (
  set,
  get
) => ({
  ownedUpgrades: {},

  purchaseUpgrade: (id: UpgradeId) => {
    const state = get();
    const def = getUpgrade(id);
    if (!def) return false;

    const owned = state.ownedUpgrades[id];
    const currentLevel = owned?.level ?? 0;
    const cost = owned?.currentCost ?? def.baseCost;

    // Check max level
    if (currentLevel >= def.maxLevel) return false;

    // Check affordability
    if (!state.spendClicks(cost)) return false;

    // Calculate next cost
    const nextCost = Math.floor(cost * def.costMultiplier);

    set((s) => ({
      ownedUpgrades: {
        ...s.ownedUpgrades,
        [id]: {
          id,
          level: currentLevel + 1,
          currentCost: nextCost,
        },
      },
    }));

    return true;
  },

  canAfford: (id: UpgradeId) => {
    const state = get();
    const def = getUpgrade(id);
    if (!def) return false;

    const owned = state.ownedUpgrades[id];
    const currentLevel = owned?.level ?? 0;
    if (currentLevel >= def.maxLevel) return false;

    const cost = owned?.currentCost ?? def.baseCost;
    return state.currentClicks >= cost;
  },

  getAutoClickRate: () => {
    const state = get();
    let rate = 0;
    for (const def of UPGRADES) {
      if (def.effect.type === "auto-click") {
        const owned = state.ownedUpgrades[def.id];
        if (owned) {
          rate += def.effect.value * owned.level;
        }
      }
    }
    return rate;
  },

  getClickMultiplier: () => {
    const state = get();
    let multi = 1;
    for (const def of UPGRADES) {
      if (def.effect.type === "click-multiplier") {
        const owned = state.ownedUpgrades[def.id];
        if (owned && owned.level > 0) {
          multi *= def.effect.value;
        }
      }
    }
    return multi;
  },

  hasGoldenPill: () => {
    const state = get();
    const owned = state.ownedUpgrades["golden-pill"];
    return !!owned && owned.level > 0;
  },

  resetUpgrades: () => {
    set({ ownedUpgrades: {} });
  },
});
