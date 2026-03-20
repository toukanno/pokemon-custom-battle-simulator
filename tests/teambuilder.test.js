const {
  buildPokemon,
  buildTeam,
  validateTeam,
  getPokedexEntry,
  listAvailablePokemon,
  listPokemonByGeneration,
  filterPokedexByGeneration,
  listPokemonUpToGeneration,
  calculateBaseStatTotal,
  buildStJohnsSystemTeam,
} = require('../src/teambuilder');

describe('buildPokemon', () => {
  test('builds a valid Pokemon from species ID', () => {
    const pokemon = buildPokemon('charizard', { moves: ['flamethrower', 'earthquake'] });
    expect(pokemon).not.toBeNull();
    expect(pokemon.name).toBe('Charizard');
  });

  test('returns null for unknown species', () => {
    expect(buildPokemon('mewtwo', { moves: ['tackle'] })).toBeNull();
  });

  test('returns null for invalid moveset', () => {
    expect(buildPokemon('charizard', { moves: [] })).toBeNull();
  });

  test('returns null for nonexistent move', () => {
    expect(buildPokemon('charizard', { moves: ['hyperbeam'] })).toBeNull();
  });

  test('applies custom level', () => {
    const pokemon = buildPokemon('charizard', { moves: ['flamethrower'], level: 100 });
    expect(pokemon.level).toBe(100);
  });

  test('preserves explicit invalid levels for downstream validation', () => {
    const pokemon = buildPokemon('charizard', { moves: ['flamethrower'], level: 0 });
    expect(pokemon.level).toBe(0);
  });
});

describe('buildTeam', () => {
  test('builds a valid team', () => {
    const team = buildTeam([
      { species: 'charizard', moves: ['flamethrower'] },
      { species: 'blastoise', moves: ['surf'] },
    ]);
    expect(team).not.toBeNull();
    expect(team).toHaveLength(2);
  });

  test('returns null for empty team config', () => {
    expect(buildTeam([])).toBeNull();
  });

  test('returns null for team larger than 6', () => {
    const configs = Array(7).fill({ species: 'pikachu', moves: ['thunderbolt'] });
    expect(buildTeam(configs)).toBeNull();
  });
});

describe('getPokedexEntry', () => {
  test('returns entry for valid species', () => {
    const entry = getPokedexEntry('pikachu');
    expect(entry).not.toBeNull();
    expect(entry.name).toBe('Pikachu');
  });

  test('returns null for unknown species', () => {
    expect(getPokedexEntry('mewtwo')).toBeNull();
  });
});

describe('listAvailablePokemon', () => {
  test('returns array of species IDs', () => {
    const list = listAvailablePokemon();
    expect(Array.isArray(list)).toBe(true);
    expect(list).toContain('charizard');
    expect(list).toContain('pikachu');
  });
});

describe('Generation features in teambuilder', () => {
  test('buildPokemon includes generation property', () => {
    const pokemon = buildPokemon('charizard', { moves: ['flamethrower'] });
    expect(pokemon.generation).toBe(1);
  });

  test('buildPokemon includes generation for Gen IV Pokemon', () => {
    const pokemon = buildPokemon('garchomp', { moves: ['earthquake'] });
    expect(pokemon.generation).toBe(4);
  });

  test('Pokedex entries have generation field', () => {
    const entry = getPokedexEntry('charizard');
    expect(entry.generation).toBe(1);
    const entry2 = getPokedexEntry('lucario');
    expect(entry2.generation).toBe(4);
  });

  describe('listPokemonByGeneration', () => {
    test('returns Gen 1 Pokemon', () => {
      const gen1 = listPokemonByGeneration(1);
      expect(gen1).toContain('charizard');
      expect(gen1).toContain('pikachu');
      expect(gen1).toContain('gengar');
      expect(gen1).not.toContain('garchomp');
    });

    test('returns Gen 4 Pokemon', () => {
      const gen4 = listPokemonByGeneration(4);
      expect(gen4).toContain('garchomp');
      expect(gen4).toContain('lucario');
      expect(gen4).toContain('togekiss');
      expect(gen4).not.toContain('charizard');
    });

    test('returns empty array for invalid generation', () => {
      expect(listPokemonByGeneration(0)).toEqual([]);
      expect(listPokemonByGeneration(10)).toEqual([]);
    });

    test('returns empty array for generation with no Pokemon in Pokedex', () => {
      expect(listPokemonByGeneration(8)).toEqual([]);
    });
  });

  describe('filterPokedexByGeneration', () => {
    test('returns only Pokemon from specified generation', () => {
      const gen1Dex = filterPokedexByGeneration(1);
      expect(Object.keys(gen1Dex)).toContain('charizard');
      expect(Object.keys(gen1Dex)).not.toContain('garchomp');
      expect(gen1Dex.charizard.name).toBe('Charizard');
    });

    test('returns empty object for invalid generation', () => {
      expect(filterPokedexByGeneration(0)).toEqual({});
    });
  });

  describe('listPokemonUpToGeneration', () => {
    test('returns all Pokemon up to Gen 1', () => {
      const upTo1 = listPokemonUpToGeneration(1);
      expect(upTo1).toContain('charizard');
      expect(upTo1).not.toContain('garchomp');
    });

    test('returns all Pokemon up to Gen 4', () => {
      const upTo4 = listPokemonUpToGeneration(4);
      expect(upTo4).toContain('charizard');
      expect(upTo4).toContain('garchomp');
      expect(upTo4).toContain('lucario');
    });

    test('returns empty array for invalid generation', () => {
      expect(listPokemonUpToGeneration(0)).toEqual([]);
    });
  });
});

describe('calculateBaseStatTotal', () => {
  test('sums all base stats for a species', () => {
    const entry = getPokedexEntry('charizard');
    expect(calculateBaseStatTotal(entry)).toBe(534);
  });
});

describe('buildStJohnsSystemTeam', () => {
  test('builds a full optimized team by default', () => {
    const team = buildStJohnsSystemTeam();
    expect(team).not.toBeNull();
    expect(team).toHaveLength(6);
    for (const pokemon of team) {
      expect(pokemon.moves).toHaveLength(4);
    }
  });

  test('supports custom team size and level', () => {
    const team = buildStJohnsSystemTeam({ teamSize: 3, level: 100 });
    expect(team).toHaveLength(3);
    for (const pokemon of team) {
      expect(pokemon.level).toBe(100);
    }
  });

  test('returns null for invalid team size', () => {
    expect(buildStJohnsSystemTeam({ teamSize: 0 })).toBeNull();
    expect(buildStJohnsSystemTeam({ teamSize: 7 })).toBeNull();
  });
});


describe('validateTeam', () => {
  test('rejects non-array team input', () => {
    expect(validateTeam(null)).toEqual({
      valid: false,
      errors: ['Team must have at least 1 Pokemon'],
    });
  });

  test('rejects negative EV values', () => {
    const pokemon = buildPokemon('charizard', {
      moves: ['flamethrower'],
      evs: { speed: -4 },
    });

    expect(validateTeam([pokemon])).toEqual({
      valid: false,
      errors: ["Charizard has invalid EV in speed (-4)"],
    });
  });

  test('rejects explicit out-of-range level values', () => {
    const pokemon = buildPokemon('charizard', { moves: ['flamethrower'], level: 0 });
    expect(validateTeam([pokemon])).toEqual({
      valid: false,
      errors: ['Charizard has invalid level (0)'],
    });
  });
});
