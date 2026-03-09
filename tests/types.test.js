const { TYPES, getEffectiveness, getEffectivenessMessage } = require('../src/types');

describe('Type Effectiveness', () => {
  test('fire is super effective against grass', () => {
    expect(getEffectiveness('fire', ['grass'])).toBe(2);
  });

  test('water is super effective against fire', () => {
    expect(getEffectiveness('water', ['fire'])).toBe(2);
  });

  test('grass is super effective against water', () => {
    expect(getEffectiveness('grass', ['water'])).toBe(2);
  });

  test('electric has no effect on ground', () => {
    expect(getEffectiveness('electric', ['ground'])).toBe(0);
  });

  test('normal has no effect on ghost', () => {
    expect(getEffectiveness('normal', ['ghost'])).toBe(0);
  });

  test('dual type multiplies effectiveness', () => {
    // ground is 2x against fire, 2x against electric => 4x
    expect(getEffectiveness('ground', ['fire', 'electric'])).toBe(4);
  });

  test('neutral matchup returns 1', () => {
    expect(getEffectiveness('normal', ['fire'])).toBe(1);
  });
});

describe('getEffectivenessMessage', () => {
  test('returns super effective message for multiplier > 1', () => {
    expect(getEffectivenessMessage(2)).toBe("It's super effective!");
  });

  test('returns not very effective for multiplier < 1', () => {
    expect(getEffectivenessMessage(0.5)).toBe("It's not very effective...");
  });

  test('returns no effect message for 0', () => {
    expect(getEffectivenessMessage(0)).toBe('It had no effect!');
  });

  test('returns null for neutral effectiveness', () => {
    expect(getEffectivenessMessage(1)).toBeNull();
  });
});
