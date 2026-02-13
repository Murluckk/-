import { StateCreator } from "zustand";
import type { GameStore } from "../gameStore";

export interface ClickSlice {
  // State
  clicks: number;
  currentClicks: number;
  clickPower: number;
  level: number;

  // Actions
  performClick: () => number; // returns total value of this click
  addClicks: (amount: number) => void;
  spendClicks: (amount: number) => boolean;
  resetForPrestige: () => void;
}

export const createClickSlice: StateCreator<GameStore, [], [], ClickSlice> = (
  set,
  get
) => ({
  clicks: 0,
  currentClicks: 0,
  clickPower: 1,
  level: 0,

  performClick: () => {
    const state = get();
    // Effective click value = clickPower * shopMultiplier * comboMultiplier * prestigeMultiplier
    const shopMulti = state.getClickMultiplier();
    const comboMulti = state.comboMultiplier;
    const prestigeMulti = state.prestigeMultiplier;
    const rageModeBonus = state.rageActive ? 2 : 1;

    const totalValue = Math.floor(
      state.clickPower * shopMulti * comboMulti * prestigeMulti * rageModeBonus
    );

    set((s) => {
      const newClicks = s.clicks + totalValue;
      return {
        clicks: newClicks,
        currentClicks: s.currentClicks + totalValue,
        level: Math.floor(newClicks / 1000),
      };
    });

    // Update combo
    state.registerClick();

    return totalValue;
  },

  addClicks: (amount: number) => {
    set((s) => {
      const newClicks = s.clicks + amount;
      return {
        clicks: newClicks,
        currentClicks: s.currentClicks + amount,
        level: Math.floor(newClicks / 1000),
      };
    });
  },

  spendClicks: (amount: number) => {
    const state = get();
    if (state.currentClicks < amount) return false;
    set((s) => ({
      currentClicks: s.currentClicks - amount,
    }));
    return true;
  },

  resetForPrestige: () => {
    set({
      clicks: 0,
      currentClicks: 0,
      clickPower: 1,
      level: 0,
    });
  },
});
