"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";

const PHRASES = [
  "Alon is not gonna make it",
  "This pill hits different",
  "Buy the dip, anon",
  "Rug? What rug?",
  "We're all gonna make it",
  "Dev doesn't sleep, dev clicks",
  "1000x or nothing",
  "Your portfolio needs this pill",
  "Not financial advice... or is it?",
  "The pill knows all",
  "Keep clicking, wealth is loading",
  "Alon can't stop this",
  "14k is the way",
  "One more click won't hurt",
  "Pill > everything",
  "Trust the pill, not the chart",
  "Alon wishes he had this pill",
  "Click harder, pump faster",
  "This is the cheapest it'll ever be",
  "The pill remembers every click",
];

const PHRASE_INTERVAL = 50;
const SAVE_KEY = "14k-clicks";

interface FloatingNumber {
  id: number;
  x: number;
  y: number;
}

export default function Home() {
  const [clicks, setClicks] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [floatingNumbers, setFloatingNumbers] = useState<FloatingNumber[]>([]);
  const [currentPhrase, setCurrentPhrase] = useState<string | null>(null);
  const [counterPulse, setCounterPulse] = useState(false);
  const [shaking, setShaking] = useState(false);
  const floatIdRef = useRef(0);
  const pillRef = useRef<HTMLDivElement>(null);
  const phraseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [mounted, setMounted] = useState(false);

  // Load saved clicks on mount
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed)) setClicks(parsed);
    }
  }, []);

  // Save clicks to localStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem(SAVE_KEY, clicks.toString());
    }
  }, [clicks, mounted]);

  const handleClick = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();

      const newClicks = clicks + 1;
      setClicks(newClicks);

      // Floating +1 at click position
      let clientX: number, clientY: number;
      if ("touches" in e) {
        clientX = e.touches[0]?.clientX ?? 0;
        clientY = e.touches[0]?.clientY ?? 0;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const id = floatIdRef.current++;
      setFloatingNumbers((prev) => [...prev, { id, x: clientX, y: clientY }]);
      setTimeout(() => {
        setFloatingNumbers((prev) => prev.filter((n) => n.id !== id));
      }, 800);

      // Click animation
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 150);

      // Counter pulse
      setCounterPulse(true);
      setTimeout(() => setCounterPulse(false), 300);

      // Phrase every N clicks
      if (newClicks % PHRASE_INTERVAL === 0) {
        const phrase = PHRASES[Math.floor(Math.random() * PHRASES.length)];
        setCurrentPhrase(phrase);
        setShaking(true);
        setTimeout(() => setShaking(false), 500);

        if (phraseTimeoutRef.current) clearTimeout(phraseTimeoutRef.current);
        phraseTimeoutRef.current = setTimeout(() => {
          setCurrentPhrase(null);
        }, 3000);
      }
    },
    [clicks]
  );

  const formatNumber = (n: number): string => {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
    if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
    return n.toString();
  };

  // HP percentage (resets every 1000 clicks for gamification)
  const hpMax = 1000;
  const hpCurrent = clicks % hpMax;
  const hpPercent = (hpCurrent / hpMax) * 100;
  const hpLevel = Math.floor(clicks / hpMax);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0b0f]">
        <div className="text-2xl text-green-400 font-mono animate-pulse">
          Loading 14k...
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-between bg-[#0b0b0f] relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0b0b0f] via-[#0d1a0d] to-[#0b0b0f] pointer-events-none" />

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-green-500/10"
            style={{
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              left: `${Math.random() * 100}%`,
              animation: `drift ${Math.random() * 10 + 8}s linear infinite`,
              animationDelay: `${Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 w-full flex flex-col items-center pt-8 pb-4 px-4">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight">
          <span className="text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]">
            14k
          </span>
        </h1>
        <p className="text-sm text-gray-500 mt-1 font-mono">
          click the pill. earn your fate.
        </p>
      </header>

      {/* Click counter */}
      <div className="relative z-10 flex flex-col items-center">
        <div
          className={`text-5xl md:text-7xl font-black font-mono text-green-400 transition-all ${
            counterPulse ? "counter-pulse" : ""
          }`}
          style={{
            textShadow: "0 0 20px rgba(74, 222, 128, 0.4)",
          }}
        >
          {formatNumber(clicks)}
        </div>
        <div className="text-xs text-gray-600 mt-1 font-mono">CLICKS</div>
      </div>

      {/* Pill character - main clicker */}
      <div className="relative z-10 flex flex-col items-center flex-1 justify-center">
        {/* Phrase popup */}
        {currentPhrase && (
          <div className="absolute -top-16 z-20 phrase-popup">
            <div className="bg-[#1a1a2e] border border-green-500/30 rounded-xl px-5 py-3 text-green-300 font-bold text-sm md:text-base shadow-[0_0_20px_rgba(74,222,128,0.2)] max-w-[280px] text-center">
              &ldquo;{currentPhrase}&rdquo;
            </div>
          </div>
        )}

        <div
          ref={pillRef}
          className={`cursor-pointer active:cursor-grabbing select-none transition-transform ${
            isAnimating ? "click-animate" : ""
          } ${shaking ? "shake" : ""}`}
          onClick={handleClick}
          onTouchStart={handleClick}
          style={{
            filter: "drop-shadow(0 0 20px rgba(74, 222, 128, 0.3))",
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

        <p className="text-xs text-gray-600 mt-4 font-mono animate-pulse">
          tap to click
        </p>
      </div>

      {/* HP Bar */}
      <div className="relative z-10 w-full max-w-sm px-6 pb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono text-gray-500">
            HP {hpCurrent}/{hpMax}
          </span>
          {hpLevel > 0 && (
            <span className="text-xs font-mono text-green-400">
              LVL {hpLevel}
            </span>
          )}
        </div>
        <div className="hp-bar-container h-4 w-full">
          <div
            className="hp-bar-fill h-full rounded-lg"
            style={{ width: `${hpPercent}%` }}
          />
        </div>
        <p className="text-[10px] text-gray-700 mt-2 text-center font-mono">
          fill the bar. something happens at LVL UP...
        </p>
      </div>

      {/* Floating +1 numbers */}
      {floatingNumbers.map((n) => (
        <div
          key={n.id}
          className="fixed z-50 float-number text-green-400 font-black text-2xl pointer-events-none"
          style={{
            left: n.x - 10,
            top: n.y - 20,
            textShadow: "0 0 10px rgba(74, 222, 128, 0.6)",
          }}
        >
          +1
        </div>
      ))}

      {/* Footer */}
      <footer className="relative z-10 pb-4 text-center">
        <p className="text-[10px] text-gray-700 font-mono">
          built on pump.fun
        </p>
      </footer>
    </div>
  );
}
