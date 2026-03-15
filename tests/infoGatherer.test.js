const { InfoGatherer } = require('../src/infoGatherer');
const { Battle } = require('../src/battle');
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

describe('InfoGatherer', () => {
  let battle, gatherer;

  beforeEach(() => {
    const p1 = [
      makePokemon('Charizard', ['fire', 'flying'], ['flamethrower', 'earthquake', 'dragonClaw', 'swordsDance']),
      makePokemon('Pikachu', ['electric'], ['thunderbolt', 'quickAttack']),
    ];
    const p2 = [
      makePokemon('Blastoise', ['water'], ['surf', 'iceBeam', 'protect', 'toxic']),
      makePokemon('Venusaur', ['grass', 'poison'], ['leafBlade', 'toxic']),
    ];
    battle = new Battle(p1, p2);
    gatherer = new InfoGatherer(battle);
  });

  describe('getThreatAssessment', () => {
    test('identifies threats against player1', () => {
      const assessment = gatherer.getThreatAssessment('player1');
      expect(assessment.threats).toBeDefined();
      expect(assessment.opportunities).toBeDefined();
      expect(assessment.threatLevel).toBeDefined();
      expect(['critical', 'high', 'moderate', 'low']).toContain(assessment.threatLevel);
    });

    test('surf should be a threat against fire type', () => {
      const assessment = gatherer.getThreatAssessment('player1');
      const surfThreat = assessment.threats.find(t => t.move === 'Surf');
      expect(surfThreat).toBeDefined();
      expect(surfThreat.effectiveness).toBeGreaterThan(1);
    });

    test('identifies KO potential', () => {
      // Damage the Charizard to low HP
      battle.player1.active.currentHp = 10;
      const assessment = gatherer.getThreatAssessment('player1');
      const koThreats = assessment.threats.filter(t => t.canKO);
      expect(koThreats.length).toBeGreaterThan(0);
    });

    test('identifies opportunities for player1', () => {
      const assessment = gatherer.getThreatAssessment('player1');
      // Earthquake against Blastoise might be an opportunity if it does enough damage
      expect(assessment.opportunities).toBeDefined();
    });

    test('threat level is critical when KO possible', () => {
      battle.player1.active.currentHp = 1;
      const assessment = gatherer.getThreatAssessment('player1');
      expect(assessment.threatLevel).toBe('critical');
    });
  });

  describe('getBestMove', () => {
    test('returns scored move list', () => {
      const moves = gatherer.getBestMove('player1');
      expect(moves.length).toBeGreaterThan(0);
      expect(moves[0]).toHaveProperty('moveId');
      expect(moves[0]).toHaveProperty('score');
      expect(moves[0]).toHaveProperty('name');
    });

    test('moves are sorted by score descending', () => {
      const moves = gatherer.getBestMove('player1');
      for (let i = 1; i < moves.length; i++) {
        expect(moves[i - 1].score).toBeGreaterThanOrEqual(moves[i].score);
      }
    });

    test('super effective moves score higher', () => {
      // Make p2 weak to fire by giving it a grass type
      const p1 = [makePokemon('Charizard', ['fire'], ['flamethrower', 'tackle'])];
      const p2 = [makePokemon('Venusaur', ['grass'], ['tackle'])];
      const b = new Battle(p1, p2);
      const g = new InfoGatherer(b);

      const moves = g.getBestMove('player1');
      const flameThrower = moves.find(m => m.moveId === 'flamethrower');
      const tackle = moves.find(m => m.moveId === 'tackle');
      expect(flameThrower.score).toBeGreaterThan(tackle.score);
    });

    test('immune moves get penalized heavily', () => {
      // Ground move against flying type
      const p1 = [makePokemon('Garchomp', ['ground'], ['earthquake', 'tackle'])];
      const p2 = [makePokemon('Togekiss', ['fairy', 'flying'], ['tackle'])];
      const b = new Battle(p1, p2);
      const g = new InfoGatherer(b);

      const moves = g.getBestMove('player1');
      const eq = moves.find(m => m.moveId === 'earthquake');
      expect(eq.score).toBeLessThan(0);
    });

    test('status moves are scored appropriately', () => {
      const moves = gatherer.getBestMove('player2');
      const toxicMove = moves.find(m => m.moveId === 'toxic');
      expect(toxicMove).toBeDefined();
      expect(toxicMove.score).toBeGreaterThan(0);
    });

    test('status moves score lower when opponent already has status', () => {
      battle.player1.active.setStatus('burn');
      const moves = gatherer.getBestMove('player2');
      const toxicMove = moves.find(m => m.moveId === 'toxic');
      // Should have reduced score
      expect(toxicMove.score).toBeLessThan(90); // Base toxic score is ~90
    });

    test('KO potential gives bonus', () => {
      battle.player2.active.currentHp = 1;
      const moves = gatherer.getBestMove('player1');
      // The top move should have KO bonus reflected in high score
      expect(moves[0].score).toBeGreaterThan(100);
    });
  });

  describe('getSwitchRecommendations', () => {
    test('returns recommendations for alive non-active pokemon', () => {
      const recs = gatherer.getSwitchRecommendations('player1');
      expect(recs.length).toBe(1); // Pikachu
      expect(recs[0].name).toBe('Pikachu');
      expect(recs[0]).toHaveProperty('score');
      expect(recs[0]).toHaveProperty('hpPercent');
    });

    test('does not include fainted pokemon', () => {
      battle.player1.team[1].currentHp = 0;
      battle.player1.team[1].isAlive = false;
      const recs = gatherer.getSwitchRecommendations('player1');
      expect(recs.length).toBe(0);
    });

    test('pokemon with type advantage scores higher', () => {
      // Add another pokemon that resists water
      const p1 = [
        makePokemon('Charizard', ['fire'], ['flamethrower']),
        makePokemon('Venusaur', ['grass', 'poison'], ['leafBlade']),
        makePokemon('Snorlax', ['normal'], ['tackle']),
      ];
      const p2 = [makePokemon('Blastoise', ['water'], ['surf'])];
      const b = new Battle(p1, p2);
      const g = new InfoGatherer(b);

      const recs = g.getSwitchRecommendations('player1');
      // Venusaur should rank higher (resists water, SE against water)
      expect(recs[0].name).toBe('Venusaur');
    });
  });

  describe('getFullIntel', () => {
    test('returns complete intelligence report', () => {
      const intel = gatherer.getFullIntel('player1');
      expect(intel).toHaveProperty('threat');
      expect(intel).toHaveProperty('bestMoves');
      expect(intel).toHaveProperty('switchOptions');
      expect(intel).toHaveProperty('fieldState');
      expect(intel.fieldState).toHaveProperty('weather');
      expect(intel.fieldState).toHaveProperty('hazards');
    });
  });

  describe('predictDamageRange', () => {
    test('returns damage range for attacking move', () => {
      const attacker = battle.player1.active;
      const defender = battle.player2.active;
      const range = gatherer.predictDamageRange(attacker, defender, 'flamethrower');

      expect(range.min).toBeGreaterThan(0);
      expect(range.max).toBeGreaterThanOrEqual(range.min);
      expect(range.critMax).toBeGreaterThan(range.max);
      expect(range.avgPercent).toBeGreaterThan(0);
      expect(range).toHaveProperty('turnsToKO');
      expect(range).toHaveProperty('canKO');
      expect(range).toHaveProperty('canKOWithCrit');
      expect(range).toHaveProperty('effectiveness');
      expect(range).toHaveProperty('stab');
    });

    test('returns zeros for status move', () => {
      const attacker = battle.player2.active;
      const defender = battle.player1.active;
      const range = gatherer.predictDamageRange(attacker, defender, 'toxic');

      expect(range.min).toBe(0);
      expect(range.max).toBe(0);
      expect(range.canKO).toBe(false);
    });

    test('canKO is true when min damage exceeds current HP', () => {
      battle.player2.active.currentHp = 1;
      const range = gatherer.predictDamageRange(
        battle.player1.active,
        battle.player2.active,
        'flamethrower'
      );
      expect(range.canKO).toBe(true);
    });

    test('turnsToKO is calculated correctly', () => {
      const range = gatherer.predictDamageRange(
        battle.player1.active,
        battle.player2.active,
        'flamethrower'
      );
      expect(range.turnsToKO).toBeGreaterThanOrEqual(1);
      expect(Number.isFinite(range.turnsToKO)).toBe(true);
    });
  });
});
