const { BattleAnalytics } = require('../src/battleAnalytics');
const { Battle } = require('../src/battle');
const { Pokemon } = require('../src/pokemon');
const { getMoveById } = require('../src/moves');

function createPokemon(name, types, overrides = {}) {
  return new Pokemon({
    name,
    types,
    baseStats: { hp: 80, attack: 100, defense: 80, specialAttack: 100, specialDefense: 80, speed: 90 },
    level: 50,
    moves: overrides.moves || ['tackle', 'flamethrower'],
    ...overrides,
  });
}

describe('BattleAnalytics', () => {
  let battle, analytics;

  beforeEach(() => {
    const p1 = [createPokemon('Charizard', ['fire', 'flying'], { moves: ['flamethrower', 'earthquake'] })];
    const p2 = [createPokemon('Blastoise', ['water'], { moves: ['surf', 'iceBeam'] })];
    battle = new Battle(p1, p2);
    analytics = new BattleAnalytics(battle);
  });

  test('initializes with empty stats', () => {
    expect(analytics.stats.player1.totalDamageDealt).toBe(0);
    expect(analytics.stats.player2.totalDamageDealt).toBe(0);
    expect(analytics.moveHistory).toEqual([]);
    expect(analytics.knockouts).toEqual([]);
    expect(analytics.damageLog).toEqual([]);
  });

  test('recordMove tracks move usage', () => {
    const move = getMoveById('flamethrower');
    const attacker = battle.player1.active;
    const defender = battle.player2.active;

    analytics.recordMove('player1', attacker, defender, move, 'hit');

    expect(analytics.stats.player1.movesUsed.flamethrower).toBeDefined();
    expect(analytics.stats.player1.movesUsed.flamethrower.used).toBe(1);
    expect(analytics.moveHistory).toHaveLength(1);
    expect(analytics.moveHistory[0].attacker).toBe('Charizard');
  });

  test('recordHit tracks damage and effectiveness', () => {
    const move = getMoveById('flamethrower');
    const attacker = battle.player1.active;
    const defender = battle.player2.active;

    analytics.recordMove('player1', attacker, defender, move, 'hit');
    analytics.recordHit('player1', attacker, defender, move, {
      damage: 50,
      effectiveness: 0.5,
      isCrit: false,
      stab: true,
    });

    expect(analytics.stats.player1.totalDamageDealt).toBe(50);
    expect(analytics.stats.player2.totalDamageReceived).toBe(50);
    expect(analytics.stats.player1.notVeryEffectiveHits).toBe(1);
    expect(analytics.stats.player1.moveHits).toBe(1);
    expect(analytics.damageLog).toHaveLength(1);
  });

  test('recordHit tracks critical hits', () => {
    const move = getMoveById('flamethrower');
    analytics.recordMove('player1', battle.player1.active, battle.player2.active, move, 'hit');
    analytics.recordHit('player1', battle.player1.active, battle.player2.active, move, {
      damage: 75,
      effectiveness: 1,
      isCrit: true,
      stab: true,
    });

    expect(analytics.stats.player1.criticalHits).toBe(1);
  });

  test('recordHit tracks super effective hits', () => {
    const move = getMoveById('surf');
    analytics.recordMove('player2', battle.player2.active, battle.player1.active, move, 'hit');
    analytics.recordHit('player2', battle.player2.active, battle.player1.active, move, {
      damage: 120,
      effectiveness: 2,
      isCrit: false,
      stab: true,
    });

    expect(analytics.stats.player2.superEffectiveHits).toBe(1);
  });

  test('recordHit tracks immune hits', () => {
    const move = getMoveById('earthquake');
    analytics.recordMove('player1', battle.player1.active, battle.player2.active, move, 'hit');
    analytics.recordHit('player1', battle.player1.active, battle.player2.active, move, {
      damage: 0,
      effectiveness: 0,
      isCrit: false,
      stab: false,
    });

    expect(analytics.stats.player1.immuneHits).toBe(1);
  });

  test('recordMiss tracks misses', () => {
    const move = getMoveById('flamethrower');
    analytics.recordMove('player1', battle.player1.active, battle.player2.active, move, 'miss');
    analytics.recordMiss('player1', move);

    expect(analytics.stats.player1.moveMisses).toBe(1);
    expect(analytics.stats.player1.movesUsed.flamethrower.misses).toBe(1);
  });

  test('recordKnockout tracks KOs for both sides', () => {
    analytics.recordKnockout('player1', battle.player2.active);

    expect(analytics.stats.player1.knockoutsScored).toBe(1);
    expect(analytics.stats.player2.pokemonLost).toBe(1);
    expect(analytics.knockouts).toHaveLength(1);
    expect(analytics.knockouts[0].scorer).toBe('player1');
    expect(analytics.knockouts[0].fainted).toBe('Blastoise');
  });

  test('recordSwitch tracks switches', () => {
    const from = battle.player1.active;
    const to = createPokemon('Pikachu', ['electric']);
    analytics.recordSwitch('player1', from, to);

    expect(analytics.stats.player1.switchCount).toBe(1);
    expect(analytics.switchHistory).toHaveLength(1);
    expect(analytics.switchHistory[0].from).toBe('Charizard');
    expect(analytics.switchHistory[0].to).toBe('Pikachu');
  });

  test('recordStatus tracks status inflictions', () => {
    analytics.recordStatus('player1', battle.player2.active, 'burn');
    analytics.recordStatus('player1', battle.player2.active, 'burn');

    expect(analytics.stats.player1.statusInflicted.burn).toBe(2);
  });

  test('recordHealing tracks healing', () => {
    analytics.recordHealing('player1', 40);
    expect(analytics.stats.player1.totalHealing).toBe(40);
  });

  test('recordTurnSnapshot captures state', () => {
    battle.turn = 1;
    analytics.recordTurnSnapshot();

    expect(analytics.turnSnapshots).toHaveLength(1);
    expect(analytics.turnSnapshots[0].turn).toBe(1);
    expect(analytics.turnSnapshots[0].state).toBeDefined();
    expect(analytics.stats.player1.turnsActive['Charizard']).toBe(1);
  });

  test('getPlayerStats calculates derived stats', () => {
    const move = getMoveById('flamethrower');
    analytics.recordMove('player1', battle.player1.active, battle.player2.active, move, 'hit');
    analytics.recordHit('player1', battle.player1.active, battle.player2.active, move, {
      damage: 60, effectiveness: 1, isCrit: false, stab: true,
    });
    analytics.recordMove('player1', battle.player1.active, battle.player2.active, move, 'miss');
    analytics.recordMiss('player1', move);

    const stats = analytics.getPlayerStats('player1');
    expect(stats.accuracy).toBe('50.0%');
    expect(stats.avgDamagePerHit).toBe(60);
  });

  test('getPlayerStats returns N/A for no moves', () => {
    const stats = analytics.getPlayerStats('player1');
    expect(stats.accuracy).toBe('N/A');
    expect(stats.critRate).toBe('N/A');
    expect(stats.avgDamagePerHit).toBe(0);
  });

  test('getMoveBreakdown returns sorted move data', () => {
    const flame = getMoveById('flamethrower');
    const quake = getMoveById('earthquake');

    analytics.recordMove('player1', battle.player1.active, battle.player2.active, flame, 'hit');
    analytics.recordHit('player1', battle.player1.active, battle.player2.active, flame, {
      damage: 50, effectiveness: 1, isCrit: false, stab: true,
    });
    analytics.recordMove('player1', battle.player1.active, battle.player2.active, quake, 'hit');
    analytics.recordHit('player1', battle.player1.active, battle.player2.active, quake, {
      damage: 100, effectiveness: 1, isCrit: false, stab: false,
    });

    const breakdown = analytics.getMoveBreakdown('player1');
    expect(breakdown).toHaveLength(2);
    expect(breakdown[0].name).toBe('Earthquake'); // Higher damage first
    expect(breakdown[0].totalDamage).toBe(100);
  });

  test('getDamageTimeline groups damage by turn', () => {
    battle.turn = 1;
    analytics.damageLog.push({ turn: 1, player: 'player1', damage: 50 });
    analytics.damageLog.push({ turn: 1, player: 'player2', damage: 30 });
    analytics.damageLog.push({ turn: 2, player: 'player1', damage: 40 });

    const timeline = analytics.getDamageTimeline();
    expect(timeline[1].player1Damage).toBe(50);
    expect(timeline[1].player2Damage).toBe(30);
    expect(timeline[2].player1Damage).toBe(40);
  });

  test('getMomentumScore calculates momentum based on stats', () => {
    analytics.turnSnapshots.push({ turn: 1 }); // Need at least one snapshot
    analytics.stats.player1.knockoutsScored = 2;
    analytics.stats.player1.superEffectiveHits = 3;
    analytics.stats.player1.totalDamageDealt = 200;
    analytics.stats.player1.totalDamageReceived = 100;

    const momentum = analytics.getMomentumScore();
    expect(momentum.player1).toBeGreaterThan(0);
  });

  test('getMomentumScore returns zeros with no snapshots', () => {
    const momentum = analytics.getMomentumScore();
    expect(momentum.player1).toBe(0);
    expect(momentum.player2).toBe(0);
  });

  test('getBattleSummary returns comprehensive summary', () => {
    const summary = analytics.getBattleSummary();
    expect(summary).toHaveProperty('totalTurns');
    expect(summary).toHaveProperty('player1');
    expect(summary).toHaveProperty('player2');
    expect(summary).toHaveProperty('knockouts');
    expect(summary).toHaveProperty('momentum');
    expect(summary).toHaveProperty('damageTimeline');
  });
});
