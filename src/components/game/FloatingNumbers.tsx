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
          className="fixed z-50 float-number text-[#2d6a4f] font-black text-2xl pointer-events-none"
          style={{
            left: n.x - 10,
            top: n.y - 20,
            textShadow: "0 0 10px rgba(45, 106, 79, 0.4)",
          }}
        >
          +{n.value}
        </div>
      ))}
    </>
  );
}
