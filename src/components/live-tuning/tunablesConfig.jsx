/**
 * Live Tuning Configuration
 * Defines all tunable parameters available in the world
 */

export const TUNABLES = [
  {
    key: "world.gravity",
    type: "number",
    label: "Gravity",
    default: 9.8,
    min: 2,
    max: 20,
    step: 0.5,
    description: "How fast objects fall"
  },
  {
    key: "player.jumpHeight",
    type: "number",
    label: "Jump Height",
    default: 1.0,
    min: 0.5,
    max: 3.0,
    step: 0.1,
    description: "How high the player can jump"
  },
  {
    key: "player.moveSpeed",
    type: "number",
    label: "Move Speed",
    default: 4.0,
    min: 1.0,
    max: 8.0,
    step: 0.5,
    description: "How fast the player moves"
  },
  {
    key: "player.maxJumps",
    type: "number",
    label: "Max Jumps",
    default: 1,
    min: 1,
    max: 2,
    step: 1,
    description: "Number of jumps allowed (1 = normal, 2 = double jump)"
  },
  {
    key: "player.fallDamage",
    type: "boolean",
    label: "Fall Damage",
    default: true,
    description: "Whether falling causes damage"
  }
];

export function getTunableByKey(key) {
  return TUNABLES.find(t => t.key === key);
}

export function getDefaultValues() {
  return TUNABLES.reduce((acc, tunable) => {
    acc[tunable.key] = tunable.default;
    return acc;
  }, {});
}