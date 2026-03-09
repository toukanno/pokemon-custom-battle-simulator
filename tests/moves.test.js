const { MOVES, getMoveById, validateMoveset, MOVE_CATEGORIES } = require('../src/moves');

describe('getMoveById', () => {
  test('returns a move by its ID', () => {
    const move = getMoveById('flamethrower');
    expect(move).not.toBeNull();
    expect(move.name).toBe('Flamethrower');
    expect(move.type).toBe('fire');
    expect(move.category).toBe(MOVE_CATEGORIES.SPECIAL);
  });

  test('returns null for unknown move', () => {
    expect(getMoveById('nonexistent')).toBeNull();
  });
});

describe('validateMoveset', () => {
  test('accepts valid moveset of 1-4 moves', () => {
    expect(validateMoveset(['flamethrower'])).toBe(true);
    expect(validateMoveset(['flamethrower', 'thunderbolt'])).toBe(true);
    expect(validateMoveset(['flamethrower', 'thunderbolt', 'earthquake', 'iceBeam'])).toBe(true);
  });

  test('rejects empty moveset', () => {
    expect(validateMoveset([])).toBe(false);
  });

  test('rejects moveset with more than 4 moves', () => {
    expect(validateMoveset(['flamethrower', 'thunderbolt', 'earthquake', 'iceBeam', 'surf'])).toBe(false);
  });

  test('rejects duplicate moves', () => {
    expect(validateMoveset(['flamethrower', 'flamethrower'])).toBe(false);
  });

  test('rejects non-array input', () => {
    expect(validateMoveset('flamethrower')).toBe(false);
    expect(validateMoveset(null)).toBe(false);
  });
});
