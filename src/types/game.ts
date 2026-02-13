// ─── Core Game State ────────────────────────────────
export interface GameState {
  clicks: number;             // Total lifetime clicks (never resets except prestige)
  currentClicks: number;      // Spendable clicks (currency)
  clickPower: number;         // Base clicks per tap (before multipliers)
  level: number;              // Derived from total clicks (every 1000)
}

// ─── Upgrades ───────────────────────────────────────
export type UpgradeId =
  | "auto-1"
  | "auto-5"
  | "auto-20"
  | "multi-2"
  | "multi-5"
  | "multi-10"
  | "golden-pill";

export type UpgradeCategory = "auto" | "multiplier" | "cosmetic";

export interface UpgradeEffect {
  type: "auto-click" | "click-multiplier" | "cosmetic";
  value: number;
}

export interface UpgradeDefinition {
  id: UpgradeId;
  name: string;
  description: string;
  baseCost: number;
  costMultiplier: number;
  maxLevel: number;
  effect: UpgradeEffect;
  icon: string;
  category: UpgradeCategory;
}

export interface OwnedUpgrade {
  id: UpgradeId;
  level: number;
  currentCost: number;
}

// ─── Combo ──────────────────────────────────────────
export interface ComboState {
  count: number;
  multiplier: number;
  lastClickTime: number;
  isActive: boolean;
  highestCombo: number;
}

// ─── Boss ───────────────────────────────────────────
export interface BossDefinition {
  id: string;
  name: string;
  baseHp: number;
  sprite: string;
  defeatBonus: number;
  burnSuggestion: number;
  taunt: string;
}

export interface BossState {
  isActive: boolean;
  currentBoss: BossDefinition | null;
  hp: number;
  maxHp: number;
  timeRemaining: number;
  bossLevel: number;
  bossesDefeated: number;
  lastBossAt: number;
}

// ─── Prestige ───────────────────────────────────────
export interface PrestigeState {
  count: number;
  multiplier: number;
  nextThreshold: number;
}

// ─── Rage Mode ──────────────────────────────────────
export interface RageState {
  isActive: boolean;
  intensity: number; // 0-1 based on combo level
}

// ─── Pill Evolution ─────────────────────────────────
export type PillEvolution =
  | "normal"     // Level 0-5
  | "glowing"    // Level 6-10
  | "angry"      // Level 11-20
  | "demonic"    // Level 21-50
  | "divine";    // Level 50+

// ─── UI State ───────────────────────────────────────
export interface UIState {
  shopOpen: boolean;
  soundEnabled: boolean;
  pillEvolution: PillEvolution;
  triggeredEasterEggs: number[];
}

// ─── Floating Numbers ───────────────────────────────
export interface FloatingNumber {
  id: number;
  x: number;
  y: number;
  value: number;
}
