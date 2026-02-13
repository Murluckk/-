import { UpgradeDefinition } from "@/types/game";

export const UPGRADES: UpgradeDefinition[] = [
  // Auto-clickers
  {
    id: "auto-1",
    name: "Intern Clicker",
    description: "+1 click/sec automatically",
    baseCost: 50,
    costMultiplier: 1.15,
    maxLevel: Infinity,
    effect: { type: "auto-click", value: 1 },
    icon: "🖱️",
    category: "auto",
  },
  {
    id: "auto-5",
    name: "Bot Army",
    description: "+5 clicks/sec automatically",
    baseCost: 500,
    costMultiplier: 1.15,
    maxLevel: Infinity,
    effect: { type: "auto-click", value: 5 },
    icon: "🤖",
    category: "auto",
  },
  {
    id: "auto-20",
    name: "Quantum Clicker",
    description: "+20 clicks/sec automatically",
    baseCost: 5000,
    costMultiplier: 1.15,
    maxLevel: Infinity,
    effect: { type: "auto-click", value: 20 },
    icon: "⚛️",
    category: "auto",
  },
  // Click multipliers
  {
    id: "multi-2",
    name: "Double Dose",
    description: "Each click counts x2",
    baseCost: 100,
    costMultiplier: 1,
    maxLevel: 1,
    effect: { type: "click-multiplier", value: 2 },
    icon: "💊",
    category: "multiplier",
  },
  {
    id: "multi-5",
    name: "Mega Pill",
    description: "Each click counts x5",
    baseCost: 2000,
    costMultiplier: 1,
    maxLevel: 1,
    effect: { type: "click-multiplier", value: 5 },
    icon: "💎",
    category: "multiplier",
  },
  {
    id: "multi-10",
    name: "God Mode",
    description: "Each click counts x10",
    baseCost: 25000,
    costMultiplier: 1,
    maxLevel: 1,
    effect: { type: "click-multiplier", value: 10 },
    icon: "👑",
    category: "multiplier",
  },
  // Cosmetics
  {
    id: "golden-pill",
    name: "Golden Pill",
    description: "Flex on the peasants",
    baseCost: 10000,
    costMultiplier: 1,
    maxLevel: 1,
    effect: { type: "cosmetic", value: 0 },
    icon: "✨",
    category: "cosmetic",
  },
];

export function getUpgrade(id: string): UpgradeDefinition | undefined {
  return UPGRADES.find((u) => u.id === id);
}
