const { Pokemon } = require('../src/pokemon');
const { TYPES } = require('../src/types');

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

describe('Pokemon', () => {
  describe('constructor', () => {
    test('creates a Pokemon with correct name and types', () => {
      const pokemon = createTestPokemon();
      expect(pokemon.name).toBe('Charizard');
      expect(pokemon.types).toEqual([TYPES.FIRE, TYPES.FLYING]);
    });

    test('stores icon metadata when provided', () => {
      const pokemon = createTestPokemon({
        icon: { source: 'pkhex', path: 'pkhex://6/charizard', alt: 'Charizard icon' },
      });
      expect(pokemon.icon).toEqual({ source: 'pkhex', path: 'pkhex://6/charizard', alt: 'Charizard icon' });
    });

    test('initializes with full HP', () => {
      const pokemon = createTestPokemon();
      expect(pokemon.currentHp).toBe(pokemon.stats.hp);
    });

    test('starts alive with no status', () => {
      const pokemon = createTestPokemon();
      expect(pokemon.isAlive).toBe(true);
      expect(pokemon.status).toBeNull();
    });
  });

  describe('stat calculation', () => {
    test('calculates HP stat correctly', () => {
      const pokemon = createTestPokemon();
      expect(pokemon.stats.hp).toBe(153);
    });

    test('applies nature modifiers to stats', () => {
      const adamant = createTestPokemon({ nature: 'adamant' });
      const modest = createTestPokemon({ nature: 'modest' });
      expect(adamant.stats.attack).toBeGreaterThan(modest.stats.attack);
      expect(modest.stats.specialAttack).toBeGreaterThan(adamant.stats.specialAttack);
    });

    test('applies EVs to stats', () => {
      const noEvs = createTestPokemon();
      const withEvs = createTestPokemon({ evs: { attack: 252 } });
      expect(withEvs.stats.attack).toBeGreaterThan(noEvs.stats.attack);
    });
  });

  describe('takeDamage', () => {
    test('reduces HP by the damage amount', () => {
      const pokemon = createTestPokemon();
      const initialHp = pokemon.currentHp;
      pokemon.takeDamage(50);
      expect(pokemon.currentHp).toBe(initialHp - 50);
    });

    test('HP cannot go below 0', () => {
      const pokemon = createTestPokemon();
      pokemon.takeDamage(9999);
      expect(pokemon.currentHp).toBe(0);
    });

    test('sets isAlive to false when HP reaches 0', () => {
      const pokemon = createTestPokemon();
      pokemon.takeDamage(9999);
      expect(pokemon.isAlive).toBe(false);
    });
  });

  describe('heal', () => {
    test('restores HP', () => {
      const pokemon = createTestPokemon();
      pokemon.takeDamage(50);
      const healed = pokemon.heal(30);
      expect(healed).toBe(30);
      expect(pokemon.currentHp).toBe(pokemon.stats.hp - 20);
    });

    test('does not heal above max HP', () => {
      const pokemon = createTestPokemon();
      pokemon.takeDamage(10);
      const healed = pokemon.heal(100);
      expect(healed).toBe(10);
      expect(pokemon.currentHp).toBe(pokemon.stats.hp);
    });

    test('does not heal fainted pokemon', () => {
      const pokemon = createTestPokemon();
      pokemon.takeDamage(9999);
      const healed = pokemon.heal(50);
      expect(healed).toBe(0);
    });
  });

  describe('setStatus', () => {
    test('sets a status condition', () => {
      const pokemon = createTestPokemon();
      expect(pokemon.setStatus('paralysis')).toBe(true);
      expect(pokemon.status).toBe('paralysis');
    });

    test('cannot apply status if one already exists', () => {
      const pokemon = createTestPokemon({ types: ['normal'] });
      pokemon.setStatus('burn');
      expect(pokemon.setStatus('paralysis')).toBe(false);
      expect(pokemon.status).toBe('burn');
    });

    test('fire types are immune to burn', () => {
      const pokemon = createTestPokemon();
      expect(pokemon.setStatus('burn')).toBe(false);
    });

    test('electric types are immune to paralysis', () => {
      const pokemon = createTestPokemon({ types: [TYPES.ELECTRIC] });
      expect(pokemon.setStatus('paralysis')).toBe(false);
    });
  });

  describe('modifyStat', () => {
    test('increases stat stage', () => {
      const pokemon = createTestPokemon();
      pokemon.modifyStat('attack', 1);
      expect(pokemon.statModifiers.attack).toBe(1);
    });

    test('stat stage cannot exceed +6', () => {
      const pokemon = createTestPokemon();
      pokemon.modifyStat('attack', 6);
      const msg = pokemon.modifyStat('attack', 1);
      expect(pokemon.statModifiers.attack).toBe(6);
      expect(msg).toContain("won't go any higher");
    });

    test('stat stage cannot go below -6', () => {
      const pokemon = createTestPokemon();
      pokemon.modifyStat('defense', -6);
      const msg = pokemon.modifyStat('defense', -1);
      expect(pokemon.statModifiers.defense).toBe(-6);
      expect(msg).toContain("won't go any lower");
    });
  });
});
