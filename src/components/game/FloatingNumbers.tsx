"use client";

import type { FloatingNumber } from "@/types/game";

interface FloatingNumbersProps {
  numbers: FloatingNumber[];
}

export default function FloatingNumbers({ numbers }: FloatingNumbersProps) {
  return (
    <>
      {numbers.map((n) => (
        <div
          key={n.id}
          className="fixed z-50 float-number text-green-400 font-black text-2xl pointer-events-none"
          style={{
            left: n.x - 10,
            top: n.y - 20,
            textShadow: "0 0 10px rgba(74, 222, 128, 0.6)",
          }}
        >
          +{n.value}
        </div>
      ))}
    </>
  );
}
