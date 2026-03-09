const { getEffectiveness } = require('./types');
const { MOVE_CATEGORIES } = require('./moves');

function calculateDamage(attacker, defender, move, options = {}) {
  if (move.category === MOVE_CATEGORIES.STATUS) return 0;

  const level = attacker.level;
  const power = move.power;

  let attack, defense;
  if (move.category === MOVE_CATEGORIES.PHYSICAL) {
    attack = attacker.getEffectiveStat('attack');
    defense = defender.getEffectiveStat('defense');
  } else {
    attack = attacker.getEffectiveStat('specialAttack');
    defense = defender.getEffectiveStat('specialDefense');
  }

  // Burn halves physical attack damage
  if (attacker.status === 'burn' && move.category === MOVE_CATEGORIES.PHYSICAL) {
    attack = Math.floor(attack * 0.5);
  }

  const baseDamage = Math.floor(((2 * level / 5 + 2) * power * attack / defense) / 50) + 2;

  // STAB (Same Type Attack Bonus)
  const stab = attacker.types.includes(move.type) ? 1.5 : 1;

  // Type effectiveness
  const effectiveness = getEffectiveness(move.type, defender.types);

  // Critical hit
  const critChance = getCriticalHitChance(move.critRatio || 0);
  const isCrit = options.forceCrit || (!options.noCrit && Math.random() < critChance);
  const critMultiplier = isCrit ? 1.5 : 1;

  // Random factor (0.85 - 1.0)
  const random = options.fixedRandom || (0.85 + Math.random() * 0.15);

  const damage = Math.floor(baseDamage * stab * effectiveness * critMultiplier * random);

  return {
    damage: Math.max(1, damage),
    effectiveness,
    isCrit,
    stab: stab > 1,
  };
}

function getCriticalHitChance(stage) {
  const chances = [1 / 24, 1 / 8, 1 / 2, 1];
  return chances[Math.min(stage, 3)];
}

function calculateRecoilDamage(attacker, damageDealt, recoilFraction) {
  return Math.max(1, Math.floor(damageDealt * recoilFraction));
}

function calculateConfusionDamage(pokemon) {
  const level = pokemon.level;
  const attack = pokemon.getEffectiveStat('attack');
  const defense = pokemon.getEffectiveStat('defense');
  return Math.floor(((2 * level / 5 + 2) * 40 * attack / defense) / 50) + 2;
}

module.exports = { calculateDamage, getCriticalHitChance, calculateRecoilDamage, calculateConfusionDamage };
