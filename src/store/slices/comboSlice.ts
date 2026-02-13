import { StateCreator } from "zustand";
import type { GameStore } from "../gameStore";

export interface ComboSlice {
  // State
  comboCount: number;
  comboMultiplier: number;
  lastClickTime: number;
  comboActive: boolean;
  highestCombo: number;

  // Actions
  registerClick: () => void;
  resetCombo: () => void;
}

// Combo multiplier tiers
function getComboMulti(count: number): number {
  if (count >= 50) return 20;
  if (count >= 20) return 10;
  if (count >= 10) return 5;
  if (count >= 5) return 3;
  if (count >= 3) return 2;
  return 1;
}

const COMBO_WINDOW_MS = 500; // Max time between clicks to maintain combo

export const createComboSlice: StateCreator<GameStore, [], [], ComboSlice> = (
  set,
  get
) => ({
  comboCount: 0,
  comboMultiplier: 1,
  lastClickTime: 0,
  comboActive: false,
  highestCombo: 0,

  registerClick: () => {
    const now = Date.now();
    const state = get();
    const gap = now - state.lastClickTime;

    if (state.lastClickTime > 0 && gap < COMBO_WINDOW_MS) {
      // Continue combo
      const newCount = state.comboCount + 1;
      const newMulti = getComboMulti(newCount);
      set({
        comboCount: newCount,
        comboMultiplier: newMulti,
        lastClickTime: now,
        comboActive: true,
        highestCombo: Math.max(newCount, state.highestCombo),
      });
    } else {
      // Reset or start combo
      set({
        comboCount: 1,
        comboMultiplier: 1,
        lastClickTime: now,
        comboActive: false,
      });
    }
  },

  resetCombo: () => {
    set({
      comboCount: 0,
      comboMultiplier: 1,
      comboActive: false,
    });
  },
});

export { COMBO_WINDOW_MS };
