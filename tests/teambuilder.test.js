const { ALLOWED_ICON_SOURCES, buildPokemon, buildTeam, validateTeam, getPokedexEntry, listAvailablePokemon, normalizeIcon } = require('../src/teambuilder');

describe('buildPokemon', () => {
  test('builds a valid Pokemon from species ID', () => {
    const pokemon = buildPokemon('charizard', { moves: ['flamethrower', 'earthquake'] });
    expect(pokemon).not.toBeNull();
    expect(pokemon.name).toBe('Charizard');
  });

  test('assigns PKHeX icon metadata from the pokedex by default', () => {
    const pokemon = buildPokemon('charizard', { moves: ['flamethrower'] });
    expect(pokemon.icon).toEqual({ source: 'pkhex', path: 'pkhex://6/charizard', alt: 'Charizard icon' });
  });

  test('allows overriding the icon with PKHeX metadata', () => {
    const pokemon = buildPokemon('pikachu', {
      moves: ['thunderbolt'],
      icon: { source: 'pkhex', path: 'pkhex://172/pichu', alt: 'Pichu icon' },
    });
    expect(pokemon.icon).toEqual({ source: 'pkhex', path: 'pkhex://172/pichu', alt: 'Pichu icon' });
  });

  test('accepts simple custom icon paths', () => {
    const pokemon = buildPokemon('charizard', {
      moves: ['flamethrower'],
      icon: '/assets/icons/charizard.png',
    });
    expect(pokemon.icon).toEqual({
      source: 'custom',
      path: '/assets/icons/charizard.png',
      alt: 'Charizard icon',
    });
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
    expect(entry.icon.source).toBe('pkhex');
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

describe('normalizeIcon', () => {
  test('includes pkhex in the allowed icon sources', () => {
    expect(ALLOWED_ICON_SOURCES).toContain('pkhex');
  });

  test('normalizes object icons and fills alt text', () => {
    expect(normalizeIcon({ source: 'pkhex', path: 'pkhex://25/pikachu' }, 'Pikachu icon')).toEqual({
      source: 'pkhex',
      path: 'pkhex://25/pikachu',
      alt: 'Pikachu icon',
    });
  });

  test('rejects unsupported icon sources', () => {
    expect(normalizeIcon({ source: 'foo', path: '/foo.png' }, 'Foo')).toBeNull();
  });
});
