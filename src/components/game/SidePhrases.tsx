"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useClicks } from "@/store/gameStore";
import { getRandomSidePhrase } from "@/data/phrases";

interface SidePhrase {
  id: number;
  text: string;
  side: "left" | "right";
  y: number; // percentage from top
  size: number; // font size multiplier
  color: string;
}

const COLORS = [
  "text-green-400",
  "text-green-300",
  "text-emerald-400",
  "text-lime-400",
  "text-teal-400",
  "text-cyan-400",
  "text-yellow-400",
  "text-amber-400",
];

const TRIGGER_EVERY = 5; // spawn a side phrase every N clicks
const MAX_VISIBLE = 6; // max phrases on screen at once

export default function SidePhrases() {
  const clicks = useClicks();
  const [phrases, setPhrases] = useState<SidePhrase[]>([]);
  const idRef = useRef(0);
  const prevClicksRef = useRef(clicks);
  const sideToggleRef = useRef(false);

  const spawnPhrase = useCallback(() => {
    const side = sideToggleRef.current ? "left" : "right";
    sideToggleRef.current = !sideToggleRef.current;

    const phrase: SidePhrase = {
      id: idRef.current++,
      text: getRandomSidePhrase(),
      side,
      y: 15 + Math.random() * 60, // 15-75% from top
      size: 0.7 + Math.random() * 0.6, // 0.7x - 1.3x
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    };

    setPhrases((prev) => {
      const next = [...prev, phrase];
      // Cap visible count
      return next.length > MAX_VISIBLE ? next.slice(-MAX_VISIBLE) : next;
    });

    // Remove after animation ends
    setTimeout(() => {
      setPhrases((prev) => prev.filter((p) => p.id !== phrase.id));
    }, 2500);
  }, []);

  useEffect(() => {
    if (clicks === prevClicksRef.current) return;
    const diff = clicks - prevClicksRef.current;
    prevClicksRef.current = clicks;

    // Spawn phrase every TRIGGER_EVERY clicks
    if (clicks > 0 && clicks % TRIGGER_EVERY === 0) {
      spawnPhrase();
    }

    // Extra spawns during fast clicking (diff > 3 = auto-clicker or fast tapping)
    if (diff >= 3 && Math.random() > 0.5) {
      spawnPhrase();
    }
  }, [clicks, spawnPhrase]);

  return (
    <div className="fixed inset-0 z-20 pointer-events-none overflow-hidden">
      {phrases.map((p) => (
        <div
          key={p.id}
          className={`absolute whitespace-nowrap font-black font-mono ${p.color} side-phrase-${p.side}`}
          style={{
            top: `${p.y}%`,
            fontSize: `${p.size}rem`,
            [p.side]: 0,
            textShadow: "0 0 10px currentColor, 0 0 30px rgba(0,0,0,0.5)",
            opacity: 0.85,
          }}
        >
          {p.text}
        </div>
      ))}
    </div>
  );
}
