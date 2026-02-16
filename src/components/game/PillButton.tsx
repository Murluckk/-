"use client";

import { useState, useCallback, useRef } from "react";
import { useGameStore, usePillEvolution, useHasGoldenPill } from "@/store/gameStore";
import FloatingNumbers from "./FloatingNumbers";
import type { FloatingNumber } from "@/types/game";

const EVOLUTION_STYLES: Record<string, string> = {
  normal: "drop-shadow(0 0 20px rgba(45, 106, 79, 0.3))",
  glowing: "drop-shadow(0 0 30px rgba(45, 106, 79, 0.6)) drop-shadow(0 0 60px rgba(45, 106, 79, 0.2))",
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

function PillCharacterSVG() {
  return (
    <svg
      width="220"
      height="220"
      viewBox="0 0 220 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="pointer-events-none"
    >
      {/* Outer ring */}
      <circle cx="110" cy="110" r="105" fill="#f0f0f0" stroke="#2d5a3d" strokeWidth="8" />

      {/* Inner background */}
      <circle cx="110" cy="110" r="90" fill="white" />

      {/* Pill body - capsule shape */}
      {/* Top half (white) */}
      <path
        d="M70 115 C70 115 70 60 110 55 C150 60 150 115 150 115 Z"
        fill="#f8f8f8"
        stroke="#2d5a3d"
        strokeWidth="3"
      />
      {/* Light reflection on top */}
      <path
        d="M85 115 C85 115 85 70 108 65 C100 65 80 75 80 115 Z"
        fill="rgba(200,210,220,0.3)"
      />

      {/* Bottom half (green) */}
      <path
        d="M70 115 C70 115 70 170 110 175 C150 170 150 115 150 115 Z"
        fill="#5a9a6a"
        stroke="#2d5a3d"
        strokeWidth="3"
      />
      {/* Green reflection */}
      <path
        d="M80 115 C80 115 80 165 108 170 C100 168 78 160 78 115 Z"
        fill="rgba(80,140,90,0.4)"
      />

      {/* Sweat drop */}
      <ellipse cx="95" cy="82" rx="4" ry="7" fill="#a8d8ea" />
      <ellipse cx="95" cy="80" rx="2" ry="3" fill="#d4eef8" />

      {/* Eyes */}
      <circle cx="93" cy="100" r="6" fill="#1a1a1a" />
      <circle cx="127" cy="100" r="6" fill="#1a1a1a" />
      {/* Eye highlights */}
      <circle cx="91" cy="98" r="2.5" fill="white" />
      <circle cx="125" cy="98" r="2.5" fill="white" />

      {/* Eyebrows */}
      <path d="M84 90 Q89 87 98 90" stroke="#2d3a2d" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M122 90 Q131 87 136 90" stroke="#2d3a2d" strokeWidth="2" strokeLinecap="round" fill="none" />

      {/* Mouth - open smile */}
      <path
        d="M100 110 Q110 122 120 110"
        fill="#2d2d2d"
        stroke="#2d2d2d"
        strokeWidth="1.5"
      />
      {/* Tongue */}
      <ellipse cx="110" cy="114" rx="5" ry="3" fill="#e8707a" />

      {/* 14k text on green part */}
      <text
        x="110"
        y="152"
        textAnchor="middle"
        fill="white"
        fontFamily="Arial, sans-serif"
        fontWeight="900"
        fontSize="26"
        letterSpacing="1"
      >
        14k
      </text>
    </svg>
  );
}

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
        <PillCharacterSVG />
      </div>

      <FloatingNumbers numbers={floatingNumbers} />
    </>
  );
}
