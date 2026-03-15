const { MetaAnalyzer } = require('../src/metaAnalyzer');

function makeBattleSummary(winner, p1Stats = {}, p2Stats = {}) {
  return {
    totalTurns: p1Stats.totalTurns || 10,
    winner,
    isOver: true,
    player1: {
      totalDamageDealt: 200,
      totalDamageReceived: 150,
      knockoutsScored: 2,
      pokemonLost: 1,
      movesUsed: {
        flamethrower: { used: 5, hits: 4, misses: 1, totalDamage: 200, crits: 1 },
      },
      ...p1Stats,
    },
    player2: {
      totalDamageDealt: 150,
      totalDamageReceived: 200,
      knockoutsScored: 1,
      pokemonLost: 2,
      movesUsed: {
        surf: { used: 4, hits: 3, misses: 1, totalDamage: 150, crits: 0 },
      },
      ...p2Stats,
    },
  };
}

describe('MetaAnalyzer', () => {
  let meta;

  beforeEach(() => {
    meta = new MetaAnalyzer();
  });

  test('initializes with empty data', () => {
    expect(meta.battleRecords).toEqual([]);
    expect(meta.pokemonStats).toEqual({});
    expect(meta.moveStats).toEqual({});
    expect(meta.teamComps).toEqual([]);
  });

  describe('recordBattle', () => {
    test('records a battle and returns record', () => {
      const summary = makeBattleSummary('player1');
      const record = meta.recordBattle(summary, ['Charizard'], ['Blastoise']);

      expect(record.id).toBe(1);
      expect(record.winner).toBe('player1');
      expect(meta.battleRecords).toHaveLength(1);
    });

    test('updates pokemon stats on win', () => {
      const summary = makeBattleSummary('player1');
      meta.recordBattle(summary, ['Charizard'], ['Blastoise']);

      expect(meta.pokemonStats['Charizard'].wins).toBe(1);
      expect(meta.pokemonStats['Blastoise'].losses).toBe(1);
    });

    test('updates pokemon stats on draw', () => {
      const summary = makeBattleSummary('draw');
      meta.recordBattle(summary, ['Charizard'], ['Blastoise']);

      expect(meta.pokemonStats['Charizard'].draws).toBe(1);
      expect(meta.pokemonStats['Blastoise'].draws).toBe(1);
    });

    test('accumulates stats over multiple battles', () => {
      meta.recordBattle(makeBattleSummary('player1'), ['Charizard'], ['Blastoise']);
      meta.recordBattle(makeBattleSummary('player1'), ['Charizard'], ['Venusaur']);
      meta.recordBattle(makeBattleSummary('player2'), ['Charizard'], ['Garchomp']);

      expect(meta.pokemonStats['Charizard'].battles).toBe(3);
      expect(meta.pokemonStats['Charizard'].wins).toBe(2);
      expect(meta.pokemonStats['Charizard'].losses).toBe(1);
    });

    test('tracks move stats', () => {
      meta.recordBattle(makeBattleSummary('player1'), ['Charizard'], ['Blastoise']);

      expect(meta.moveStats.flamethrower).toBeDefined();
      expect(meta.moveStats.flamethrower.timesUsed).toBe(5);
      expect(meta.moveStats.flamethrower.totalHits).toBe(4);
      expect(meta.moveStats.flamethrower.wins).toBe(1);
    });

    test('records team compositions', () => {
      meta.recordBattle(makeBattleSummary('player1'), ['Charizard', 'Pikachu'], ['Blastoise']);

      expect(meta.teamComps).toHaveLength(2); // Two different teams
      const charizardTeam = meta.teamComps.find(t => t.species.includes('Charizard'));
      expect(charizardTeam.wins).toBe(1);
    });

    test('handles missing movesUsed gracefully', () => {
      const summary = makeBattleSummary('player1', {}, { movesUsed: undefined });
      expect(() => meta.recordBattle(summary, ['A'], ['B'])).not.toThrow();
    });
  });

  describe('getPokemonRankings', () => {
    test('returns sorted rankings by win rate', () => {
      meta.recordBattle(makeBattleSummary('player1'), ['Charizard'], ['Blastoise']);
      meta.recordBattle(makeBattleSummary('player1'), ['Charizard'], ['Blastoise']);
      meta.recordBattle(makeBattleSummary('player2'), ['Pikachu'], ['Gengar']);

      const rankings = meta.getPokemonRankings();
      expect(rankings[0].name).toBe('Charizard');
      expect(rankings[0].winRate).toBe('100.0%');
    });

    test('filters by minimum battles', () => {
      meta.recordBattle(makeBattleSummary('player1'), ['Charizard'], ['Blastoise']);

      const rankings = meta.getPokemonRankings(5);
      expect(rankings).toHaveLength(0);
    });

    test('calculates average stats', () => {
      meta.recordBattle(makeBattleSummary('player1'), ['Charizard'], ['Blastoise']);

      const rankings = meta.getPokemonRankings();
      const charizard = rankings.find(r => r.name === 'Charizard');
      expect(charizard.avgDamageDealt).toBe(200);
      expect(charizard.avgKOs).toBe('2.0');
    });
  });

  describe('getMoveRankings', () => {
    test('returns move rankings', () => {
      meta.recordBattle(makeBattleSummary('player1'), ['Charizard'], ['Blastoise']);

      const rankings = meta.getMoveRankings();
      expect(rankings.length).toBeGreaterThan(0);
      expect(rankings[0]).toHaveProperty('moveId');
      expect(rankings[0]).toHaveProperty('timesUsed');
      expect(rankings[0]).toHaveProperty('accuracy');
      expect(rankings[0]).toHaveProperty('winRate');
    });

    test('filters by minimum uses', () => {
      meta.recordBattle(makeBattleSummary('player1'), ['Charizard'], ['Blastoise']);
      const rankings = meta.getMoveRankings(100);
      expect(rankings).toHaveLength(0);
    });
  });

  describe('getTeamCompRankings', () => {
    test('returns team comp rankings', () => {
      meta.recordBattle(makeBattleSummary('player1'), ['Charizard', 'Pikachu'], ['Blastoise']);
      meta.recordBattle(makeBattleSummary('player1'), ['Charizard', 'Pikachu'], ['Venusaur']);

      const rankings = meta.getTeamCompRankings();
      const cpTeam = rankings.find(r => r.species.includes('Charizard') && r.species.includes('Pikachu'));
      expect(cpTeam).toBeDefined();
      expect(cpTeam.battles).toBe(2);
      expect(cpTeam.winRate).toBe('100.0%');
    });
  });

  describe('getMetaSummary', () => {
    test('returns comprehensive meta summary', () => {
      meta.recordBattle(makeBattleSummary('player1'), ['Charizard'], ['Blastoise']);
      meta.recordBattle(makeBattleSummary('player2'), ['Pikachu'], ['Gengar']);
      meta.recordBattle(makeBattleSummary('draw', { totalTurns: 20 }), ['Dragonite'], ['Garchomp']);

      const summary = meta.getMetaSummary();
      expect(summary.totalBattles).toBe(3);
      expect(summary.averageTurns).toBeGreaterThan(0);
      expect(summary).toHaveProperty('player1WinRate');
      expect(summary).toHaveProperty('player2WinRate');
      expect(summary).toHaveProperty('drawRate');
      expect(summary).toHaveProperty('topPokemon');
      expect(summary).toHaveProperty('topMoves');
      expect(summary).toHaveProperty('topTeams');
    });

    test('returns zeros when no battles recorded', () => {
      const summary = meta.getMetaSummary();
      expect(summary.totalBattles).toBe(0);
      expect(summary.averageTurns).toBe(0);
      expect(summary.player1WinRate).toBe('0%');
    });
  });
});
