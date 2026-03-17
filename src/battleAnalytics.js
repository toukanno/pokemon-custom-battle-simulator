const { getMoveById, MOVE_CATEGORIES } = require('./moves');
const { getEffectiveness } = require('./types');

class BattleAnalytics {
  constructor(battle) {
    this.battle = battle;
    this.stats = {
      player1: this._createPlayerStats(),
      player2: this._createPlayerStats(),
    };
    this.turnSnapshots = [];
    this.moveHistory = [];
    this.switchHistory = [];
    this.knockouts = [];
    this.damageLog = [];
  }

  _createPlayerStats() {
    return {
      totalDamageDealt: 0,
      totalDamageReceived: 0,
      totalHealing: 0,
      movesUsed: {},
      moveHits: 0,
      moveMisses: 0,
      criticalHits: 0,
      superEffectiveHits: 0,
      notVeryEffectiveHits: 0,
      immuneHits: 0,
      knockoutsScored: 0,
      pokemonLost: 0,
      switchCount: 0,
      statusInflicted: {},
      turnsActive: {},
    };
  }

  recordMove(playerKey, attacker, defender, move, result) {
    const stats = this.stats[playerKey];
    const moveId = this._getMoveId(move);

    if (!stats.movesUsed[moveId]) {
      stats.movesUsed[moveId] = { used: 0, hits: 0, misses: 0, totalDamage: 0, crits: 0 };
    }
    stats.movesUsed[moveId].used++;

    this.moveHistory.push({
      turn: this.battle.turn,
      player: playerKey,
      attacker: attacker.name,
      defender: defender.name,
      move: move.name,
      moveId,
      result,
    });
  }

  recordHit(playerKey, attacker, defender, move, damageResult) {
    const stats = this.stats[playerKey];
    const opponentKey = playerKey === 'player1' ? 'player2' : 'player1';
    const moveId = this._getMoveId(move);

    stats.moveHits++;
    if (stats.movesUsed[moveId]) {
      stats.movesUsed[moveId].hits++;
      stats.movesUsed[moveId].totalDamage += damageResult.damage;
    }

    stats.totalDamageDealt += damageResult.damage;
    this.stats[opponentKey].totalDamageReceived += damageResult.damage;

    if (damageResult.isCrit) {
      stats.criticalHits++;
      if (stats.movesUsed[moveId]) stats.movesUsed[moveId].crits++;
    }

    if (damageResult.effectiveness > 1) stats.superEffectiveHits++;
    else if (damageResult.effectiveness === 0) stats.immuneHits++;
    else if (damageResult.effectiveness < 1) stats.notVeryEffectiveHits++;

    this.damageLog.push({
      turn: this.battle.turn,
      player: playerKey,
      attacker: attacker.name,
      defender: defender.name,
      move: move.name,
      damage: damageResult.damage,
      effectiveness: damageResult.effectiveness,
      isCrit: damageResult.isCrit,
      stab: damageResult.stab,
      defenderHpBefore: defender.currentHp + damageResult.damage,
      defenderHpAfter: defender.currentHp,
    });
  }

  recordMiss(playerKey, move) {
    const stats = this.stats[playerKey];
    const moveId = this._getMoveId(move);
    stats.moveMisses++;
    if (stats.movesUsed[moveId]) stats.movesUsed[moveId].misses++;
  }

  recordKnockout(scorerKey, faintedPokemon) {
    this.stats[scorerKey].knockoutsScored++;
    const loserKey = scorerKey === 'player1' ? 'player2' : 'player1';
    this.stats[loserKey].pokemonLost++;

    this.knockouts.push({
      turn: this.battle.turn,
      scorer: scorerKey,
      fainted: faintedPokemon.name,
    });
  }

  recordSwitch(playerKey, fromPokemon, toPokemon) {
    this.stats[playerKey].switchCount++;
    this.switchHistory.push({
      turn: this.battle.turn,
      player: playerKey,
      from: fromPokemon.name,
      to: toPokemon.name,
    });
  }

  recordStatus(playerKey, target, status) {
    const stats = this.stats[playerKey];
    stats.statusInflicted[status] = (stats.statusInflicted[status] || 0) + 1;
  }

  recordHealing(playerKey, amount) {
    this.stats[playerKey].totalHealing += amount;
  }

  recordTurnSnapshot() {
    this.turnSnapshots.push({
      turn: this.battle.turn,
      state: this.battle.getBattleState(),
      timestamp: Date.now(),
    });

    for (const key of ['player1', 'player2']) {
      const activeName = this.battle[key].active.name;
      const stats = this.stats[key];
      stats.turnsActive[activeName] = (stats.turnsActive[activeName] || 0) + 1;
    }
  }

  getPlayerStats(playerKey) {
    const stats = this.stats[playerKey];
    const totalMoves = stats.moveHits + stats.moveMisses;
    return {
      ...stats,
      accuracy: totalMoves > 0 ? (stats.moveHits / totalMoves * 100).toFixed(1) + '%' : 'N/A',
      critRate: stats.moveHits > 0 ? (stats.criticalHits / stats.moveHits * 100).toFixed(1) + '%' : 'N/A',
      avgDamagePerHit: stats.moveHits > 0 ? Math.round(stats.totalDamageDealt / stats.moveHits) : 0,
      netDamage: stats.totalDamageDealt - stats.totalDamageReceived,
    };
  }

  getMoveBreakdown(playerKey) {
    const stats = this.stats[playerKey];
    const breakdown = [];

    for (const [moveId, data] of Object.entries(stats.movesUsed)) {
      const move = getMoveById(moveId);
      breakdown.push({
        moveId,
        name: move ? move.name : moveId,
        type: move ? move.type : 'unknown',
        timesUsed: data.used,
        hits: data.hits,
        misses: data.misses,
        accuracy: data.used > 0 ? (data.hits / data.used * 100).toFixed(1) + '%' : 'N/A',
        totalDamage: data.totalDamage,
        avgDamage: data.hits > 0 ? Math.round(data.totalDamage / data.hits) : 0,
        crits: data.crits,
      });
    }

    return breakdown.sort((a, b) => b.totalDamage - a.totalDamage);
  }

  getDamageTimeline() {
    const timeline = {};
    for (const entry of this.damageLog) {
      if (!timeline[entry.turn]) {
        timeline[entry.turn] = { player1Damage: 0, player2Damage: 0 };
      }
      timeline[entry.turn][`${entry.player}Damage`] += entry.damage;
    }
    return timeline;
  }

  getMomentumScore() {
    if (this.turnSnapshots.length === 0) return { player1: 0, player2: 0 };

    const scores = { player1: 0, player2: 0 };

    for (const key of ['player1', 'player2']) {
      const stats = this.stats[key];
      const opponentKey = key === 'player1' ? 'player2' : 'player1';

      scores[key] += stats.knockoutsScored * 30;
      scores[key] -= stats.pokemonLost * 25;
      scores[key] += stats.superEffectiveHits * 5;
      scores[key] += stats.criticalHits * 8;
      scores[key] -= stats.moveMisses * 3;
      scores[key] += (stats.totalDamageDealt - stats.totalDamageReceived) * 0.05;
    }

    return scores;
  }

  getBattleSummary() {
    return {
      totalTurns: this.battle.turn,
      winner: this.battle.winner,
      isOver: this.battle.isOver,
      player1: this.getPlayerStats('player1'),
      player2: this.getPlayerStats('player2'),
      knockouts: this.knockouts,
      momentum: this.getMomentumScore(),
      damageTimeline: this.getDamageTimeline(),
    };
  }

  _getMoveId(move) {
    if (typeof move === 'string') return move;
    if (move && move.name) {
      const id = Object.entries(require('./moves').MOVES).find(([, m]) => m.name === move.name);
      return id ? id[0] : move.name;
    }
    return 'unknown';
  }
}

module.exports = { BattleAnalytics };
