const { calculateDamage, getCriticalHitChance } = require('../src/damage');
const { Pokemon } = require('../src/pokemon');
const { MOVES } = require('../src/moves');
const { TYPES } = require('../src/types');

function createAttacker(overrides = {}) {
  return new Pokemon({
    name: 'Charizard',
    types: [TYPES.FIRE, TYPES.FLYING],
    baseStats: { hp: 78, attack: 84, defense: 78, specialAttack: 109, specialDefense: 85, speed: 100 },
    level: 50,
    moves: ['flamethrower'],
    ...overrides,
  });
}

function createDefender(overrides = {}) {
  return new Pokemon({
    name: 'Blastoise',
    types: [TYPES.WATER],
    baseStats: { hp: 79, attack: 83, defense: 100, specialAttack: 85, specialDefense: 105, speed: 78 },
    level: 50,
    moves: ['surf'],
    ...overrides,
  });
}

describe('calculateDamage', () => {
  test('returns 0 for status moves', () => {
    const attacker = createAttacker();
    const defender = createDefender();
    expect(calculateDamage(attacker, defender, MOVES.swordsDance)).toBe(0);
  });

  test('calculates damage for special moves', () => {
    const attacker = createAttacker();
    const defender = createDefender();
    const result = calculateDamage(attacker, defender, MOVES.flamethrower, { noCrit: true, fixedRandom: 1 });
    expect(result.damage).toBeGreaterThan(0);
    expect(result.stab).toBe(true); // Charizard is fire type using flamethrower
  });

  test('applies STAB bonus', () => {
    const attacker = createAttacker();
    // Use a neutral defender so type effectiveness doesn't interfere
    const neutralDefender = new Pokemon({
      name: 'Snorlax',
      types: ['normal'],
      baseStats: { hp: 160, attack: 110, defense: 65, specialAttack: 65, specialDefense: 110, speed: 30 },
      level: 50,
      moves: ['tackle'],
    });
    const stabResult = calculateDamage(attacker, neutralDefender, MOVES.flamethrower, { noCrit: true, fixedRandom: 1 });
    const noStabResult = calculateDamage(attacker, neutralDefender, MOVES.thunderbolt, { noCrit: true, fixedRandom: 1 });
    // Flamethrower should do more with STAB (both 90bp special moves, neutral target)
    expect(stabResult.damage).toBeGreaterThan(noStabResult.damage);
    expect(stabResult.stab).toBe(true);
    expect(noStabResult.stab).toBe(false);
  });

  test('applies type effectiveness', () => {
    const attacker = createAttacker();
    const grassDefender = new Pokemon({
      name: 'Venusaur',
      types: [TYPES.GRASS, TYPES.POISON],
      baseStats: { hp: 80, attack: 82, defense: 83, specialAttack: 100, specialDefense: 100, speed: 80 },
      level: 50,
      moves: ['tackle'],
    });
    const result = calculateDamage(attacker, grassDefender, MOVES.flamethrower, { noCrit: true, fixedRandom: 1 });
    expect(result.effectiveness).toBe(2);
  });

  test('critical hit increases damage', () => {
    const attacker = createAttacker();
    const defender = createDefender();
    const normalResult = calculateDamage(attacker, defender, MOVES.flamethrower, { noCrit: true, fixedRandom: 1 });
    const critResult = calculateDamage(attacker, defender, MOVES.flamethrower, { forceCrit: true, fixedRandom: 1 });
    expect(critResult.damage).toBeGreaterThan(normalResult.damage);
    expect(critResult.isCrit).toBe(true);
  });
});

describe('getCriticalHitChance', () => {
  test('returns correct base crit chance', () => {
    expect(getCriticalHitChance(0)).toBeCloseTo(1 / 24);
  });

  test('returns higher chance at higher stages', () => {
    expect(getCriticalHitChance(1)).toBeCloseTo(1 / 8);
    expect(getCriticalHitChance(2)).toBeCloseTo(1 / 2);
    expect(getCriticalHitChance(3)).toBe(1);
  });
});
