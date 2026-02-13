"use client";

import { useEffect, useRef } from "react";
import { useGameStore } from "@/store/gameStore";
import { COMBO_WINDOW_MS } from "@/store/slices/comboSlice";

// Resets combo after inactivity and manages rage mode activation
export function useComboDecay() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsub = useGameStore.subscribe((state, prev) => {
      // When combo count changes, reset the decay timer
      if (state.comboCount !== prev.comboCount && state.comboCount > 0) {
        if (timerRef.current) clearTimeout(timerRef.current);

        timerRef.current = setTimeout(() => {
          useGameStore.getState().resetCombo();
          useGameStore.getState().setRageMode(false);
        }, COMBO_WINDOW_MS + 200); // Small buffer beyond combo window

        // Activate rage mode at combo 10+
        if (state.comboCount >= 10) {
          const intensity = Math.min(state.comboCount / 50, 1);
          useGameStore.getState().setRageMode(true, intensity);
        } else {
          useGameStore.getState().setRageMode(false);
        }
      }
    });

    return () => {
      unsub();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);
}
