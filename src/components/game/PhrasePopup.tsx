"use client";

import { useState, useEffect, useRef } from "react";
import { useClicks } from "@/store/gameStore";
import { getRandomPhrase, EASTER_EGG_PHRASES } from "@/data/phrases";

const PHRASE_INTERVAL = 50;

export default function PhrasePopup() {
  const clicks = useClicks();
  const [phrase, setPhrase] = useState<string | null>(null);
  const [shaking, setShaking] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevClicksRef = useRef(clicks);

  useEffect(() => {
    if (clicks === prevClicksRef.current) return;
    prevClicksRef.current = clicks;

    // Check easter egg phrases first
    if (EASTER_EGG_PHRASES[clicks]) {
      setPhrase(EASTER_EGG_PHRASES[clicks]);
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    }
    // Regular phrase every N clicks
    else if (clicks > 0 && clicks % PHRASE_INTERVAL === 0) {
      setPhrase(getRandomPhrase());
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    } else {
      return; // No phrase to show
    }

    // Clear after 3s
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setPhrase(null);
    }, 3000);
  }, [clicks]);

  if (!phrase) return null;

  return (
    <div className={`absolute -top-16 z-20 phrase-popup ${shaking ? "shake" : ""}`}>
      <div className="bg-white border border-[#2d6a4f]/30 rounded-xl px-5 py-3 text-[#1b4332] font-bold text-sm md:text-base shadow-[0_0_20px_rgba(45,106,79,0.15)] max-w-[280px] text-center">
        &ldquo;{phrase}&rdquo;
      </div>
    </div>
  );
}
