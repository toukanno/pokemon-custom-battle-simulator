const { SPRITES, ANGEL, getSprite, getAngel, battleCard } = require('../src/art');

describe('Art Module', () => {
  describe('SPRITES', () => {
    it('should have sprites for all 10 Pokedex Pokemon', () => {
      const expected = [
        'togekiss', 'charizard', 'blastoise', 'venusaur', 'pikachu',
        'gengar', 'dragonite', 'snorlax', 'garchomp', 'lucario',
      ];
      expected.forEach(name => {
        expect(SPRITES[name]).toBeDefined();
        expect(typeof SPRITES[name]).toBe('string');
        expect(SPRITES[name].length).toBeGreaterThan(0);
      });
    });
  });

  describe('ANGEL', () => {
    it('should contain the angel ASCII art', () => {
      expect(typeof ANGEL).toBe('string');
      expect(ANGEL).toContain('最強の天使');
      expect(ANGEL).toContain('The Strongest Angel');
    });
  });

  describe('getSprite', () => {
    it('should return the correct sprite for a known Pokemon', () => {
      expect(getSprite('Togekiss')).toBe(SPRITES.togekiss);
      expect(getSprite('CHARIZARD')).toBe(SPRITES.charizard);
      expect(getSprite('pikachu')).toBe(SPRITES.pikachu);
    });

    it('should return a default message for an unknown Pokemon', () => {
      const result = getSprite('MissingNo');
      expect(result).toContain('No sprite available');
      expect(result).toContain('MissingNo');
    });
  });

  describe('getAngel', () => {
    it('should return the ANGEL art', () => {
      expect(getAngel()).toBe(ANGEL);
    });
  });

  describe('battleCard', () => {
    it('should format a battle card with sprite and stats', () => {
      const pokemon = {
        name: 'Togekiss',
        types: ['Fairy', 'Flying'],
        currentHp: 120,
        stats: { hp: 150 },
      };
      const card = battleCard(pokemon);
      expect(card).toContain('Togekiss');
      expect(card).toContain('Fairy/Flying');
      expect(card).toContain('120');
      expect(card).toContain('150');
      expect(card).toContain('╔');
      expect(card).toContain('╚');
    });

    it('should handle missing stats gracefully', () => {
      const pokemon = { name: 'Unknown' };
      const card = battleCard(pokemon);
      expect(card).toContain('Unknown');
      expect(card).toContain('???');
    });
  });
});
