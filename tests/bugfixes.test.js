const { Pokemon } = require('../src/pokemon');
const { Battle } = require('../src/battle');
const { TYPES } = require('../src/types');
const { buildPokemon } = require('../src/teambuilder');

function createTestPokemon(overrides = {}) {
  return new Pokemon({
    name: 'Charizard',
    types: [TYPES.FIRE, TYPES.FLYING],
    baseStats: { hp: 78, attack: 84, defense: 78, specialAttack: 109, specialDefense: 85, speed: 100 },
    level: 50,
    moves: ['flamethrower', 'earthquake'],
    ...overrides,
  });
}

describe('Bug fix: accuracy/evasion stat stages', () => {
  test('getEffectiveStat returns a valid multiplier for accuracy', () => {
    const pokemon = createTestPokemon();
    const result = pokemon.getEffectiveStat('accuracy');
    expect(result).not.toBeNaN();
    expect(result).toBe(1); // base stage 0 = 1x multiplier
  });

  test('getEffectiveStat returns a valid multiplier for evasion', () => {
    const pokemon = createTestPokemon();
    const result = pokemon.getEffectiveStat('evasion');
    expect(result).not.toBeNaN();
    expect(result).toBe(1);
  });

  test('accuracy stage +1 increases accuracy multiplier', () => {
    const pokemon = createTestPokemon();
    pokemon.modifyStat('accuracy', 1);
    const result = pokemon.getEffectiveStat('accuracy');
    expect(result).toBeGreaterThan(1);
    expect(result).toBeCloseTo(4 / 3);
  });

  test('evasion stage +1 decreases evasion multiplier (harder to hit)', () => {
    const pokemon = createTestPokemon();
    pokemon.modifyStat('evasion', 1);
    const result = pokemon.getEffectiveStat('evasion');
    expect(result).toBeLessThan(1);
    expect(result).toBeCloseTo(3 / 4);
  });
});

describe('Bug fix: flinch message logging', () => {
  test('canMove returns reason for flinch', () => {
    const pokemon = createTestPokemon();
    pokemon.volatileStatus.add('flinch');
    const result = pokemon.canMove();
    expect(result.able).toBe(false);
    expect(result.reason).toBe('flinch');
  });

  test('canMove clears flinch after checking', () => {
    const pokemon = createTestPokemon();
    pokemon.volatileStatus.add('flinch');
    pokemon.canMove();
    expect(pokemon.volatileStatus.has('flinch')).toBe(false);
  });

  test('canMove returns able:true for healthy pokemon', () => {
    const pokemon = createTestPokemon();
    const result = pokemon.canMove();
    expect(result.able).toBe(true);
  });
});

describe('Bug fix: Stealth Rock type effectiveness', () => {
  test('Stealth Rock deals more damage to fire/flying (4x weak to rock)', () => {
    const charizard = buildPokemon('charizard', { moves: ['flamethrower'] });
    const blastoise = buildPokemon('blastoise', { moves: ['surf'] });

    const team1 = [charizard, blastoise];
    const team2 = [buildPokemon('pikachu', { moves: ['thunderbolt'] })];

    const battle = new Battle(team1, team2);
    battle.player1.hazards.stealthRock = 1;

    const charizardHpBefore = charizard.currentHp;
    battle.switchPokemon(battle.player1, 1); // switch to blastoise
    const blastoiseHpBefore = blastoise.currentHp;

    battle.switchPokemon(battle.player1, 0); // switch back to charizard
    const charizardDamage = charizardHpBefore - charizard.currentHp;

    // Charizard: Fire/Flying, 4x weak to Rock => 50% HP
    // damage = max(1, floor(hp * 4 * 0.125)) = floor(hp * 0.5)
    expect(charizardDamage).toBe(Math.floor(charizard.stats.hp * 4 * 0.125));
  });
});

describe('Bug fix: toxicCounter reset', () => {
  test('toxicCounter resets when status is cleared', () => {
    const pokemon = createTestPokemon({ types: [TYPES.NORMAL] });
    pokemon.setStatus('toxic');
    pokemon.toxicCounter = 5;
    pokemon.clearStatus();
    expect(pokemon.toxicCounter).toBe(0);
    expect(pokemon.status).toBeNull();
  });

  test('toxicCounter resets on switch out', () => {
    const poke1 = buildPokemon('snorlax', { moves: ['tackle'] });
    const poke2 = buildPokemon('pikachu', { moves: ['thunderbolt'] });
    const team2 = [buildPokemon('charizard', { moves: ['flamethrower'] })];

    const battle = new Battle([poke1, poke2], team2);
    poke1.toxicCounter = 5;

    battle.switchPokemon(battle.player1, 1);
    expect(poke1.toxicCounter).toBe(0);
  });
});

describe('Bug fix: cannot switch to active Pokemon', () => {
  test('switching to the same active Pokemon fails', () => {
    const poke1 = buildPokemon('charizard', { moves: ['flamethrower'] });
    const poke2 = buildPokemon('pikachu', { moves: ['thunderbolt'] });
    const team2 = [buildPokemon('blastoise', { moves: ['surf'] })];

    const battle = new Battle([poke1, poke2], team2);

    // poke1 is at index 0 and is active
    const result = battle.switchPokemon(battle.player1, 0);
    expect(result).toBe(false);
    // Stat modifiers should NOT have been reset
    poke1.modifyStat('attack', 2);
    const result2 = battle.switchPokemon(battle.player1, 0);
    expect(result2).toBe(false);
    expect(poke1.statModifiers.attack).toBe(2); // preserved
  });
});
