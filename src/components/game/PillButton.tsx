"use client";

import { useState, useCallback, useRef } from "react";
import Image from "next/image";
import { useGameStore, usePillEvolution, useHasGoldenPill } from "@/store/gameStore";
import FloatingNumbers from "./FloatingNumbers";
import type { FloatingNumber } from "@/types/game";

const EVOLUTION_STYLES: Record<string, string> = {
  normal: "drop-shadow(0 0 20px rgba(74, 222, 128, 0.3))",
  glowing: "drop-shadow(0 0 30px rgba(74, 222, 128, 0.6)) drop-shadow(0 0 60px rgba(74, 222, 128, 0.2))",
  angry: "drop-shadow(0 0 25px rgba(239, 68, 68, 0.5)) hue-rotate(-30deg) saturate(1.3)",
  demonic: "drop-shadow(0 0 30px rgba(239, 68, 68, 0.7)) hue-rotate(-40deg) saturate(1.5) brightness(0.9)",
  divine: "drop-shadow(0 0 40px rgba(250, 204, 21, 0.7)) drop-shadow(0 0 80px rgba(250, 204, 21, 0.3)) saturate(0.5) brightness(1.3) sepia(0.4)",
};

const EVOLUTION_CLASSES: Record<string, string> = {
  normal: "",
  glowing: "pill-glowing",
  angry: "pill-angry",
  demonic: "pill-demonic",
  divine: "pill-divine",
};

export default function PillButton() {
  const performClick = useGameStore((s) => s.performClick);
  const hasGolden = useHasGoldenPill();
  const evolution = usePillEvolution();

  const [isAnimating, setIsAnimating] = useState(false);
  const [floatingNumbers, setFloatingNumbers] = useState<FloatingNumber[]>([]);
  const floatIdRef = useRef(0);

  const handleClick = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();

      const value = performClick();

      // Get click position
      let clientX: number, clientY: number;
      if ("touches" in e) {
        clientX = e.touches[0]?.clientX ?? 0;
        clientY = e.touches[0]?.clientY ?? 0;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      // Floating number
      const id = floatIdRef.current++;
      setFloatingNumbers((prev) => [
        ...prev,
        { id, x: clientX, y: clientY, value },
      ]);
      setTimeout(() => {
        setFloatingNumbers((prev) => prev.filter((n) => n.id !== id));
      }, 800);

      // Click animation
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 150);
    },
    [performClick]
  );

  const pillFilter = hasGolden
    ? EVOLUTION_STYLES.divine
    : EVOLUTION_STYLES[evolution] || EVOLUTION_STYLES.normal;

  const pillClass = hasGolden
    ? EVOLUTION_CLASSES.divine
    : EVOLUTION_CLASSES[evolution] || "";

  return (
    <>
      <div
        className={`cursor-pointer active:cursor-grabbing select-none transition-transform ${
          isAnimating ? "click-animate" : ""
        } ${pillClass}`}
        onClick={handleClick}
        onTouchStart={handleClick}
        style={{
          filter: pillFilter,
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <Image
          src="/images/14k-pill.png"
          alt="14k Pill"
          width={280}
          height={380}
          priority
          draggable={false}
          className="pointer-events-none"
        />
      </div>

      <FloatingNumbers numbers={floatingNumbers} />
    </>
  );
}
