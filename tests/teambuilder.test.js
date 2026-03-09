const { buildPokemon, buildTeam, validateTeam, getPokedexEntry, listAvailablePokemon } = require('../src/teambuilder');

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
