// Shared avatar gradient palette, used for default avatar assignment and manual selection
export const AVATAR_GRADIENTS = [
  "from-purple-500 to-blue-500",
  "from-orange-400 to-rose-400",
  "from-emerald-400 to-cyan-400",
  "from-pink-500 to-amber-500",
  "from-indigo-500 to-purple-500",
  "from-blue-600 to-violet-600",
  "from-red-500 to-orange-500",
  "from-teal-400 to-blue-500",
];

/** Pick a deterministic gradient based on a user ID (or random if no ID) */
export function getRandomGradient(seed?: string): string {
  if (seed) {
    // Simple hash from user ID for deterministic assignment
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash |= 0;
    }
    return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
  }
  return AVATAR_GRADIENTS[Math.floor(Math.random() * AVATAR_GRADIENTS.length)];
}
