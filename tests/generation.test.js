const { GENERATIONS, getGeneration, getGenerationByYear, listGenerations, getYearForGeneration, isGenerationValid } = require('../src/generation');

describe('Generation Module', () => {
  describe('GENERATIONS', () => {
    test('contains all 9 generations', () => {
      expect(Object.keys(GENERATIONS)).toHaveLength(9);
    });

    test('each generation has required fields', () => {
      for (const gen of Object.values(GENERATIONS)) {
        expect(gen).toHaveProperty('name');
        expect(gen).toHaveProperty('region');
        expect(gen).toHaveProperty('year');
        expect(gen).toHaveProperty('games');
        expect(Array.isArray(gen.games)).toBe(true);
        expect(gen.games.length).toBeGreaterThan(0);
      }
    });

    test('generation years are in ascending order', () => {
      const years = Object.values(GENERATIONS).map(g => g.year);
      for (let i = 1; i < years.length; i++) {
        expect(years[i]).toBeGreaterThan(years[i - 1]);
      }
    });
  });

  describe('getGeneration', () => {
    test('returns correct generation data', () => {
      const gen1 = getGeneration(1);
      expect(gen1.name).toBe('Generation I');
      expect(gen1.region).toBe('Kanto');
      expect(gen1.year).toBe(1996);
    });

    test('returns null for invalid generation', () => {
      expect(getGeneration(0)).toBeNull();
      expect(getGeneration(10)).toBeNull();
      expect(getGeneration(-1)).toBeNull();
    });
  });

  describe('getGenerationByYear', () => {
    test('returns Gen I for 1996', () => {
      const result = getGenerationByYear(1996);
      expect(result.generation).toBe(1);
      expect(result.region).toBe('Kanto');
    });

    test('returns Gen IV for 2007 (between Gen IV and V)', () => {
      const result = getGenerationByYear(2007);
      expect(result.generation).toBe(4);
    });

    test('returns Gen IX for 2025', () => {
      const result = getGenerationByYear(2025);
      expect(result.generation).toBe(9);
    });

    test('returns null for year before Pokemon existed', () => {
      expect(getGenerationByYear(1990)).toBeNull();
    });
  });

  describe('listGenerations', () => {
    test('returns all generations with generation number', () => {
      const gens = listGenerations();
      expect(gens).toHaveLength(9);
      expect(gens[0].generation).toBe(1);
      expect(gens[8].generation).toBe(9);
    });
  });

  describe('getYearForGeneration', () => {
    test('returns correct year', () => {
      expect(getYearForGeneration(1)).toBe(1996);
      expect(getYearForGeneration(4)).toBe(2006);
      expect(getYearForGeneration(9)).toBe(2022);
    });

    test('returns null for invalid generation', () => {
      expect(getYearForGeneration(0)).toBeNull();
      expect(getYearForGeneration(10)).toBeNull();
    });
  });

  describe('isGenerationValid', () => {
    test('returns true for valid generations', () => {
      for (let i = 1; i <= 9; i++) {
        expect(isGenerationValid(i)).toBe(true);
      }
    });

    test('returns false for invalid generations', () => {
      expect(isGenerationValid(0)).toBe(false);
      expect(isGenerationValid(10)).toBe(false);
      expect(isGenerationValid(-1)).toBe(false);
    });
  });
});
