import { StateCreator } from "zustand";
import type { GameStore } from "../gameStore";
import type { PillEvolution } from "@/types/game";

export interface UISlice {
  // State
  shopOpen: boolean;
  soundEnabled: boolean;
  rageActive: boolean;
  rageIntensity: number;
  pillEvolution: PillEvolution;
  triggeredEasterEggs: number[];

  // Actions
  toggleShop: () => void;
  toggleSound: () => void;
  setRageMode: (active: boolean, intensity?: number) => void;
  updatePillEvolution: () => void;
  triggerEasterEgg: (threshold: number) => void;
}

function getPillEvolution(level: number): PillEvolution {
  if (level >= 50) return "divine";
  if (level >= 21) return "demonic";
  if (level >= 11) return "angry";
  if (level >= 6) return "glowing";
  return "normal";
}

export const createUISlice: StateCreator<GameStore, [], [], UISlice> = (
  set,
  get
) => ({
  shopOpen: false,
  soundEnabled: true,
  rageActive: false,
  rageIntensity: 0,
  pillEvolution: "normal",
  triggeredEasterEggs: [],

  toggleShop: () => set((s) => ({ shopOpen: !s.shopOpen })),
  toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),

  setRageMode: (active: boolean, intensity = 0) => {
    set({ rageActive: active, rageIntensity: intensity });
  },

  updatePillEvolution: () => {
    const state = get();
    const evolution = getPillEvolution(state.level);
    if (evolution !== state.pillEvolution) {
      set({ pillEvolution: evolution });
    }
  },

  triggerEasterEgg: (threshold: number) => {
    set((s) => ({
      triggeredEasterEggs: [...s.triggeredEasterEggs, threshold],
    }));
  },
});
