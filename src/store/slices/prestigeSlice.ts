import { StateCreator } from "zustand";
import type { GameStore } from "../gameStore";

export interface PrestigeSlice {
  // State
  prestigeCount: number;
  prestigeMultiplier: number;

  // Actions
  canPrestige: () => boolean;
  performPrestige: () => void;
  getPrestigeThreshold: () => number;
}

const PRESTIGE_THRESHOLDS = [100_000, 1_000_000, 10_000_000, 100_000_000];

export const createPrestigeSlice: StateCreator<
  GameStore,
  [],
  [],
  PrestigeSlice
> = (set, get) => ({
  prestigeCount: 0,
  prestigeMultiplier: 1,

  canPrestige: () => {
    const state = get();
    const threshold = state.getPrestigeThreshold();
    return state.clicks >= threshold;
  },

  performPrestige: () => {
    const state = get();
    if (!state.canPrestige()) return;

    const newCount = state.prestigeCount + 1;
    const newMulti = Math.pow(1.5, newCount);

    set({
      prestigeCount: newCount,
      prestigeMultiplier: newMulti,
    });

    // Reset clicks and upgrades
    state.resetForPrestige();
    state.resetUpgrades();
  },

  getPrestigeThreshold: () => {
    const state = get();
    if (state.prestigeCount < PRESTIGE_THRESHOLDS.length) {
      return PRESTIGE_THRESHOLDS[state.prestigeCount];
    }
    // Beyond defined thresholds: 10x the last one for each additional prestige
    return (
      PRESTIGE_THRESHOLDS[PRESTIGE_THRESHOLDS.length - 1] *
      Math.pow(10, state.prestigeCount - PRESTIGE_THRESHOLDS.length + 1)
    );
  },
});
