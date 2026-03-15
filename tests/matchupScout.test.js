const { MatchupScout } = require('../src/matchupScout');
const { Pokemon } = require('../src/pokemon');

function makePokemon(name, types, moves, baseStats = {}) {
  return new Pokemon({
    name,
    types,
    baseStats: {
      hp: 80, attack: 100, defense: 80, specialAttack: 100, specialDefense: 80, speed: 90,
      ...baseStats,
    },
    level: 50,
    moves,
  });
}

describe('MatchupScout', () => {
  let scout;

  beforeEach(() => {
    scout = new MatchupScout();
  });

  describe('analyzeTypeMatchup', () => {
    test('returns offensive and defensive results', () => {
      const result = scout.analyzeTypeMatchup(['fire'], ['grass']);
      expect(result.offensive.fire).toBe(2); // fire SE against grass
    });

    test('handles dual types', () => {
      const result = scout.analyzeTypeMatchup(['ice'], ['dragon', 'flying']);
      expect(result.offensive.ice).toBe(4); // 4x against dragon/flying
    });
  });

  describe('getTypeWeaknesses', () => {
    test('finds weaknesses for fire type', () => {
      const result = scout.getTypeWeaknesses(['fire']);
      const weakTypes = result.weaknesses.map(w => w.type);
      expect(weakTypes).toContain('water');
      expect(weakTypes).toContain('rock');
      expect(weakTypes).toContain('ground');
    });

    test('finds resistances', () => {
      const result = scout.getTypeWeaknesses(['steel']);
      expect(result.resistances.length).toBeGreaterThan(0);
    });

    test('finds immunities', () => {
      const result = scout.getTypeWeaknesses(['ghost']);
      const immuneTypes = result.immunities.map(i => i.type);
      expect(immuneTypes).toContain('normal');
      expect(immuneTypes).toContain('fighting');
    });

    test('handles dual type weaknesses', () => {
      const result = scout.getTypeWeaknesses(['fire', 'flying']);
      const weakTypes = result.weaknesses.map(w => w.type);
      expect(weakTypes).toContain('rock'); // 4x
      const rockWeak = result.weaknesses.find(w => w.type === 'rock');
      expect(rockWeak.multiplier).toBe(4);
    });
  });

  describe('scoutPokemon', () => {
    test('returns complete scout report', () => {
      const pokemon = makePokemon('Charizard', ['fire', 'flying'], ['flamethrower', 'earthquake']);
      const report = scout.scoutPokemon(pokemon);

      expect(report.name).toBe('Charizard');
      expect(report.types).toEqual(['fire', 'flying']);
      expect(report.weaknesses.length).toBeGreaterThan(0);
      expect(report.resistances.length).toBeGreaterThan(0);
      expect(report.moves).toHaveLength(2);
      expect(report.stats).toHaveProperty('role');
      expect(report).toHaveProperty('hpPercent');
    });

    test('identifies STAB moves', () => {
      const pokemon = makePokemon('Charizard', ['fire', 'flying'], ['flamethrower', 'earthquake']);
      const report = scout.scoutPokemon(pokemon);

      const flame = report.moves.find(m => m.name === 'Flamethrower');
      const quake = report.moves.find(m => m.name === 'Earthquake');
      expect(flame.hasStab).toBe(true);
      expect(quake.hasStab).toBe(false);
    });

    test('calculates effective power with STAB', () => {
      const pokemon = makePokemon('Charizard', ['fire'], ['flamethrower']);
      const report = scout.scoutPokemon(pokemon);
      const flame = report.moves[0];
      expect(flame.effectivePower).toBe(135); // 90 * 1.5
    });

    test('reports current HP and status', () => {
      const pokemon = makePokemon('Charizard', ['fire'], ['flamethrower']);
      pokemon.currentHp = Math.floor(pokemon.stats.hp / 2);
      pokemon.status = 'burn';

      const report = scout.scoutPokemon(pokemon);
      expect(report.hpPercent).toBeCloseTo(50, -1);
      expect(report.status).toBe('burn');
    });
  });

  describe('_inferRole', () => {
    test('identifies sweeper (high speed + offense)', () => {
      const pokemon = makePokemon('Fast', ['fire'], ['tackle'], {
        hp: 60, attack: 130, defense: 60, specialAttack: 130, specialDefense: 60, speed: 120,
      });
      const report = scout.scoutPokemon(pokemon);
      expect(report.stats.role).toBe('sweeper');
    });

    test('identifies wall (high defense + HP)', () => {
      const pokemon = makePokemon('Wall', ['steel'], ['tackle'], {
        hp: 120, attack: 40, defense: 150, specialAttack: 40, specialDefense: 150, speed: 30,
      });
      const report = scout.scoutPokemon(pokemon);
      expect(report.stats.role).toBe('wall');
    });
  });

  describe('scoutTeam', () => {
    test('returns team analysis', () => {
      const team = [
        makePokemon('Charizard', ['fire', 'flying'], ['flamethrower', 'earthquake']),
        makePokemon('Blastoise', ['water'], ['surf', 'iceBeam']),
        makePokemon('Venusaur', ['grass', 'poison'], ['leafBlade', 'toxic']),
      ];

      const report = scout.scoutTeam(team);
      expect(report.pokemon).toHaveLength(3);
      expect(report.typeCoverage.length).toBeGreaterThan(0);
      expect(report).toHaveProperty('teamWeaknesses');
      expect(report).toHaveProperty('roleDistribution');
      expect(report.aliveCount).toBe(3);
      expect(report.totalHpPercent).toBe(100);
    });

    test('excludes fainted pokemon', () => {
      const team = [
        makePokemon('Charizard', ['fire'], ['flamethrower']),
        makePokemon('Blastoise', ['water'], ['surf']),
      ];
      team[1].currentHp = 0;
      team[1].isAlive = false;

      const report = scout.scoutTeam(team);
      expect(report.aliveCount).toBe(1);
    });

    test('identifies shared team weaknesses', () => {
      // All weak to ground
      const team = [
        makePokemon('Pikachu', ['electric'], ['thunderbolt']),
        makePokemon('Jolteon', ['electric'], ['thunderbolt']),
        makePokemon('Magneton', ['electric', 'steel'], ['thunderbolt']),
      ];

      const report = scout.scoutTeam(team);
      expect(report.teamWeaknesses).toHaveProperty('ground');
    });

    test('handles empty alive team', () => {
      const team = [makePokemon('X', ['fire'], ['tackle'])];
      team[0].isAlive = false;
      const report = scout.scoutTeam(team);
      expect(report.aliveCount).toBe(0);
      expect(report.totalHpPercent).toBe(0);
    });
  });

  describe('compareMatchup', () => {
    test('returns matchup comparison', () => {
      const p1 = makePokemon('Charizard', ['fire'], ['flamethrower', 'earthquake']);
      const p2 = makePokemon('Blastoise', ['water'], ['surf', 'iceBeam']);

      const result = scout.compareMatchup(p1, p2);
      expect(result.pokemon1.name).toBe('Charizard');
      expect(result.pokemon2.name).toBe('Blastoise');
      expect(result).toHaveProperty('speedAdvantage');
      expect(result).toHaveProperty('favored');
    });

    test('favors pokemon with type advantage', () => {
      const p1 = makePokemon('Venusaur', ['grass'], ['leafBlade']);
      const p2 = makePokemon('Blastoise', ['water'], ['tackle']);

      const result = scout.compareMatchup(p1, p2);
      expect(result.favored).toBe('Venusaur');
    });

    test('identifies speed advantage', () => {
      const p1 = makePokemon('Fast', ['fire'], ['tackle'], { speed: 150 });
      const p2 = makePokemon('Slow', ['water'], ['tackle'], { speed: 30 });

      const result = scout.compareMatchup(p1, p2);
      expect(result.speedAdvantage).toBe('Fast');
    });

    test('handles speed tie', () => {
      const p1 = makePokemon('A', ['fire'], ['tackle'], { speed: 90 });
      const p2 = makePokemon('B', ['water'], ['tackle'], { speed: 90 });

      const result = scout.compareMatchup(p1, p2);
      expect(result.speedAdvantage).toBe('tie');
    });
  });

  describe('findBestCounter', () => {
    test('finds best counter from team', () => {
      const target = makePokemon('Blastoise', ['water'], ['surf', 'iceBeam']);
      const team = [
        makePokemon('Charizard', ['fire'], ['flamethrower']),
        makePokemon('Venusaur', ['grass', 'poison'], ['leafBlade']),
        makePokemon('Pikachu', ['electric'], ['thunderbolt']),
      ];

      const counters = scout.findBestCounter(target, team);
      expect(counters.length).toBe(3);
      // Venusaur or Pikachu should be top counter (resists water / SE against water)
      const topCounter = counters[0];
      expect(['Venusaur', 'Pikachu']).toContain(topCounter.name);
    });

    test('excludes fainted pokemon', () => {
      const target = makePokemon('Blastoise', ['water'], ['surf']);
      const team = [
        makePokemon('Pikachu', ['electric'], ['thunderbolt']),
        makePokemon('Charizard', ['fire'], ['flamethrower']),
      ];
      team[0].isAlive = false;

      const counters = scout.findBestCounter(target, team);
      expect(counters).toHaveLength(1);
      expect(counters[0].name).toBe('Charizard');
    });

    test('returns hp percent for each counter', () => {
      const target = makePokemon('Blastoise', ['water'], ['surf']);
      const team = [makePokemon('Pikachu', ['electric'], ['thunderbolt'])];

      const counters = scout.findBestCounter(target, team);
      expect(counters[0].hpPercent).toBe(100);
    });
  });
});
