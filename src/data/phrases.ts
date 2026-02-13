// General clicker phrases
export const GENERAL_PHRASES = [
  "This pill hits different",
  "We're all gonna make it",
  "Dev doesn't sleep, dev clicks",
  "1000x or nothing",
  "Your portfolio needs this pill",
  "Not financial advice... or is it?",
  "The pill knows all",
  "Keep clicking, wealth is loading",
  "14k is the way",
  "One more click won't hurt",
  "Pill > everything",
  "Trust the pill, not the chart",
  "Click harder, pump faster",
  "This is the cheapest it'll ever be",
  "The pill remembers every click",
  "Ser, this is a clicker game",
  "Wen moon? When you click harder",
  "Diamond hands, diamond clicks",
  "The flippening starts here",
  "Number go up technology",
];

// Alon-style grandiose/trenches phrases
export const ALON_PHRASES = [
  "Alon is not gonna make it",
  "Alon can't stop this",
  "Alon wishes he had this pill",
  "The trenches forge legends, not followers",
  "You're not clicking — you're building civilization",
  "Every click is a vote against mediocrity",
  "The market rewards the obsessed",
  "You don't need permission to be early",
  "This isn't a game, it's a paradigm shift",
  "The pill doesn't care about your feelings",
  "We're not degens. We're pioneers.",
  "Conviction is clicking when others scroll",
  "Your grandchildren will ask about this moment",
  "The trenches are not for tourists",
  "History is written by clickers",
  "Sleep is just unrealized clicks",
  "I didn't come here to be reasonable",
  "The protocol doesn't lie. The pill doesn't lie.",
  "You are the liquidity",
  "The meta is the pill. The pill is the meta.",
  "They laughed at Bitcoin too",
  "Touch grass? I'd rather touch pill",
  "The pill is the asymmetric bet of our generation",
  "Some click for fun. Legends click for fate.",
  "Cope, seethe, or click — choose wisely",
  "Imagine not clicking in the current year",
  "This is the most important thing happening on the internet",
  "The pill separates signal from noise",
  "First they ignore your clicks. Then they fear them.",
  "You're either clicking or you're ngmi",
];

// Boss fight phrases
export const BOSS_PHRASES = [
  "Boss incoming! CLICK OR DIE",
  "The boss fears your click power",
  "Your clicks deal MASSIVE DAMAGE",
  "Keep going! The boss is weakening!",
  "FINISH HIM",
  "The boss has paper hands",
  "Critical hit! The rug is pulling... on them",
  "You click with the force of a thousand degens",
];

// Prestige phrases
export const PRESTIGE_PHRASES = [
  "You die a degen or live long enough to become the whale",
  "Rebirth complete. The cycle continues.",
  "The pill transcends time. So do you.",
  "Reset the matrix. Keep the power.",
  "What was lost in clicks was gained in wisdom",
  "Ascension protocol initiated",
  "The old you is gone. The new you clicks harder.",
  "Prestige is not the end. It's the beginning.",
];

// Rage mode phrases
export const RAGE_PHRASES = [
  "UNLIMITED POWER",
  "THE BLOCKCHAIN TREMBLES",
  "RAGE MODE ACTIVATED",
  "UNSTOPPABLE",
  "MAXIMUM OVERDRIVE",
  "BERSERKER CLICKING",
  "THE PILL IS ON FIRE",
  "ABSOLUTE MADMAN",
  "CLICKING TRANSCENDENCE",
  "CAN'T STOP WON'T STOP",
];

// Combo phrases
export const COMBO_PHRASES = [
  "Combo x{n}! Keep going!",
  "INSANE combo!",
  "Your fingers are on fire",
  "The pill feeds on your speed",
  "Faster! FASTER!",
];

// Easter egg phrases
export const EASTER_EGG_PHRASES: Record<number, string> = {
  69: "Nice.",
  420: "Blaze it, anon",
  1337: "h4x0r detected",
  6969: "Nice. Nice. Double nice.",
  14000: "THE SACRED NUMBER",
  42069: "The chosen one has arrived",
  69420: "You've unlocked the forbidden click",
  100000: "100K club. You're certified.",
};

// Get a random phrase from any general category
export function getRandomPhrase(): string {
  const all = [...GENERAL_PHRASES, ...ALON_PHRASES];
  return all[Math.floor(Math.random() * all.length)];
}

// Get a random phrase from a specific category
export function getRandomPhraseFrom(phrases: string[]): string {
  return phrases[Math.floor(Math.random() * phrases.length)];
}
