"use client";

import { useEffect, useRef } from "react";
import { useGameStore } from "@/store/gameStore";

export function useAutoClicker() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Check rate every second and adjust interval
    const checkRate = () => {
      const rate = useGameStore.getState().getAutoClickRate();
      const prestigeMulti = useGameStore.getState().prestigeMultiplier;

      // Clear existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      if (rate <= 0) return;

      // Tick 10 times per second, add proportional clicks
      const tickRate = 100; // ms
      const clicksPerTick = (rate * prestigeMulti * tickRate) / 1000;

      intervalRef.current = setInterval(() => {
        const amount = Math.max(1, Math.floor(clicksPerTick));
        useGameStore.getState().addClicks(amount);
      }, tickRate);
    };

    // Initial check
    checkRate();

    // Re-check when store changes (upgrade purchased)
    const unsub = useGameStore.subscribe((state, prev) => {
      if (state.ownedUpgrades !== prev.ownedUpgrades || state.prestigeMultiplier !== prev.prestigeMultiplier) {
        checkRate();
      }
    });

    return () => {
      unsub();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
}
