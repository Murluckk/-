import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createClickSlice, ClickSlice } from "./slices/clickSlice";
import { createShopSlice, ShopSlice } from "./slices/shopSlice";
import { createComboSlice, ComboSlice } from "./slices/comboSlice";
import { createPrestigeSlice, PrestigeSlice } from "./slices/prestigeSlice";
import { createUISlice, UISlice } from "./slices/uiSlice";
import { UPGRADES } from "@/lib/upgrades";

export type GameStore = ClickSlice &
  ShopSlice &
  ComboSlice &
  PrestigeSlice &
  UISlice;

export const useGameStore = create<GameStore>()(
  persist(
    (...args) => ({
      ...createClickSlice(...args),
      ...createShopSlice(...args),
      ...createComboSlice(...args),
      ...createPrestigeSlice(...args),
      ...createUISlice(...args),
    }),
    {
      name: "14k-game-state",
      skipHydration: true,
      partialize: (state) => ({
        clicks: state.clicks,
        currentClicks: state.currentClicks,
        clickPower: state.clickPower,
        level: state.level,
        ownedUpgrades: state.ownedUpgrades,
        prestigeCount: state.prestigeCount,
        prestigeMultiplier: state.prestigeMultiplier,
        highestCombo: state.highestCombo,
        soundEnabled: state.soundEnabled,
        triggeredEasterEggs: state.triggeredEasterEggs,
        pillEvolution: state.pillEvolution,
      }),
    }
  )
);

// ─── Pure selectors (no method calls, no new objects) ───
export const useClicks = () => useGameStore((s) => s.clicks);
export const useCurrentClicks = () => useGameStore((s) => s.currentClicks);
export const useLevel = () => useGameStore((s) => s.level);
export const useShopOpen = () => useGameStore((s) => s.shopOpen);
export const usePillEvolution = () => useGameStore((s) => s.pillEvolution);
export const useComboCount = () => useGameStore((s) => s.comboCount);
export const useComboMultiplier = () => useGameStore((s) => s.comboMultiplier);
export const useComboActive = () => useGameStore((s) => s.comboActive);
export const useRageActive = () => useGameStore((s) => s.rageActive);
export const useRageIntensity = () => useGameStore((s) => s.rageIntensity);
export const usePrestigeCount = () => useGameStore((s) => s.prestigeCount);

// ─── Derived selectors (compute inline from state s, never call get()) ───
export const useAutoClickRate = () =>
  useGameStore((s) => {
    let rate = 0;
    for (const def of UPGRADES) {
      if (def.effect.type === "auto-click") {
        const owned = s.ownedUpgrades[def.id];
        if (owned) rate += def.effect.value * owned.level;
      }
    }
    return rate;
  });

export const useClickMultiplier = () =>
  useGameStore((s) => {
    let multi = 1;
    for (const def of UPGRADES) {
      if (def.effect.type === "click-multiplier") {
        const owned = s.ownedUpgrades[def.id];
        if (owned && owned.level > 0) multi *= def.effect.value;
      }
    }
    return multi;
  });

export const useHasGoldenPill = () =>
  useGameStore((s) => {
    const owned = s.ownedUpgrades["golden-pill"];
    return !!owned && owned.level > 0;
  });

export const useEffectiveMultiplier = () =>
  useGameStore((s) => {
    let shopMulti = 1;
    for (const def of UPGRADES) {
      if (def.effect.type === "click-multiplier") {
        const owned = s.ownedUpgrades[def.id];
        if (owned && owned.level > 0) shopMulti *= def.effect.value;
      }
    }
    return shopMulti * s.comboMultiplier * s.prestigeMultiplier * (s.rageActive ? 2 : 1);
  });

export const useCanAffordUpgrade = (upgradeId: string) =>
  useGameStore((s) => {
    const def = UPGRADES.find((u) => u.id === upgradeId);
    if (!def) return false;
    const owned = s.ownedUpgrades[upgradeId];
    const currentLevel = owned?.level ?? 0;
    if (currentLevel >= def.maxLevel) return false;
    const cost = owned?.currentCost ?? def.baseCost;
    return s.currentClicks >= cost;
  });
