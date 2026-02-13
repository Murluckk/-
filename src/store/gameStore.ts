import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createClickSlice, ClickSlice } from "./slices/clickSlice";
import { createShopSlice, ShopSlice } from "./slices/shopSlice";
import { createComboSlice, ComboSlice } from "./slices/comboSlice";
import { createPrestigeSlice, PrestigeSlice } from "./slices/prestigeSlice";
import { createUISlice, UISlice } from "./slices/uiSlice";

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
      partialize: (state) => ({
        // Persist game progress
        clicks: state.clicks,
        currentClicks: state.currentClicks,
        clickPower: state.clickPower,
        level: state.level,
        // Persist upgrades
        ownedUpgrades: state.ownedUpgrades,
        // Persist prestige
        prestigeCount: state.prestigeCount,
        prestigeMultiplier: state.prestigeMultiplier,
        // Persist records
        highestCombo: state.highestCombo,
        // Persist preferences
        soundEnabled: state.soundEnabled,
        // Persist easter eggs
        triggeredEasterEggs: state.triggeredEasterEggs,
        // Persist pill evolution
        pillEvolution: state.pillEvolution,
      }),
    }
  )
);

// Selectors for performance - prevents re-renders on unrelated changes
export const useClicks = () => useGameStore((s) => s.clicks);
export const useCurrentClicks = () => useGameStore((s) => s.currentClicks);
export const useLevel = () => useGameStore((s) => s.level);
export const useCombo = () =>
  useGameStore((s) => ({
    count: s.comboCount,
    multiplier: s.comboMultiplier,
    active: s.comboActive,
  }));
export const useShopOpen = () => useGameStore((s) => s.shopOpen);
export const useRage = () =>
  useGameStore((s) => ({
    active: s.rageActive,
    intensity: s.rageIntensity,
  }));
export const usePillEvolution = () => useGameStore((s) => s.pillEvolution);

// Derived: effective multiplier for display
export const useEffectiveMultiplier = () =>
  useGameStore((s) => {
    const shopMulti = s.getClickMultiplier();
    const comboMulti = s.comboMultiplier;
    const prestigeMulti = s.prestigeMultiplier;
    const rageBonus = s.rageActive ? 2 : 1;
    return shopMulti * comboMulti * prestigeMulti * rageBonus;
  });
