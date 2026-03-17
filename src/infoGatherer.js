const { calculateDamage, getCriticalHitChance } = require('./damage');
const { getEffectiveness } = require('./types');
const { getMoveById, MOVE_CATEGORIES } = require('./moves');

class InfoGatherer {
  constructor(battle) {
    this.battle = battle;
  }

  getThreatAssessment(playerKey) {
    const player = this.battle[playerKey];
    const opponentKey = playerKey === 'player1' ? 'player2' : 'player1';
    const opponent = this.battle[opponentKey];

    const myActive = player.active;
    const theirActive = opponent.active;

    const threats = [];
    const opportunities = [];

    // Assess each of opponent's moves against our active
    for (const moveId of theirActive.moves) {
      const move = getMoveById(moveId);
      if (!move || move.category === MOVE_CATEGORIES.STATUS) continue;

      const effectiveness = getEffectiveness(move.type, myActive.types);
      const result = calculateDamage(theirActive, myActive, move, { noCrit: true, fixedRandom: 1.0 });
      const hpPercent = (result.damage / myActive.stats.hp) * 100;

      if (effectiveness > 1 || hpPercent > 40) {
        threats.push({
          move: move.name,
          moveId,
          type: move.type,
          estimatedDamage: result.damage,
          damagePercent: Math.round(hpPercent),
          effectiveness,
          canKO: result.damage >= myActive.currentHp,
        });
      }
    }

    // Assess our moves against their active
    for (const moveId of myActive.moves) {
      const move = getMoveById(moveId);
      if (!move || move.category === MOVE_CATEGORIES.STATUS) continue;

      const effectiveness = getEffectiveness(move.type, theirActive.types);
      const result = calculateDamage(myActive, theirActive, move, { noCrit: true, fixedRandom: 1.0 });
      const hpPercent = (result.damage / theirActive.stats.hp) * 100;

      if (effectiveness > 1 || hpPercent > 30) {
        opportunities.push({
          move: move.name,
          moveId,
          type: move.type,
          estimatedDamage: result.damage,
          damagePercent: Math.round(hpPercent),
          effectiveness,
          canKO: result.damage >= theirActive.currentHp,
        });
      }
    }

    threats.sort((a, b) => b.damagePercent - a.damagePercent);
    opportunities.sort((a, b) => b.damagePercent - a.damagePercent);

    const threatLevel = this._calculateThreatLevel(threats, myActive);

    return { threats, opportunities, threatLevel };
  }

  _calculateThreatLevel(threats, myPokemon) {
    if (threats.some(t => t.canKO)) return 'critical';
    const maxDmgPercent = threats.reduce((max, t) => Math.max(max, t.damagePercent), 0);
    if (maxDmgPercent > 60) return 'high';
    if (maxDmgPercent > 30) return 'moderate';
    return 'low';
  }

  getBestMove(playerKey) {
    const player = this.battle[playerKey];
    const opponentKey = playerKey === 'player1' ? 'player2' : 'player1';
    const opponent = this.battle[opponentKey];

    const myActive = player.active;
    const theirActive = opponent.active;

    const moveScores = [];

    for (const moveId of myActive.moves) {
      const move = getMoveById(moveId);
      if (!move) continue;

      let score = 0;

      if (move.category !== MOVE_CATEGORIES.STATUS) {
        const result = calculateDamage(myActive, theirActive, move, { noCrit: true, fixedRandom: 0.925 });
        const effectiveness = getEffectiveness(move.type, theirActive.types);

        score += result.damage;

        // Bonus for KO potential
        if (result.damage >= theirActive.currentHp) score += 200;

        // Bonus for super effective
        if (effectiveness > 1) score += 50;
        // Penalty for not very effective
        if (effectiveness < 1 && effectiveness > 0) score -= 30;
        // Heavy penalty for immune
        if (effectiveness === 0) score -= 500;

        // STAB bonus consideration
        if (result.stab) score += 20;

        // Accuracy factor
        if (move.accuracy !== null) {
          score *= move.accuracy / 100;
        }
      } else {
        // Status move scoring
        for (const effect of move.effects) {
          if (effect.type === 'status' && !theirActive.status) {
            if (effect.status === 'burn' && !theirActive.types.includes('fire')) score += 80;
            else if (effect.status === 'paralysis' && !theirActive.types.includes('electric')) score += 70;
            else if (effect.status === 'toxic' && !theirActive.types.includes('poison') && !theirActive.types.includes('steel')) score += 90;
            else if (effect.status === 'sleep') score += 100;
          }
          if (effect.type === 'stat' && effect.target === 'self' && effect.stages > 0) {
            score += effect.stages * 40;
          }
          if (effect.type === 'heal') {
            const missingHp = myActive.stats.hp - myActive.currentHp;
            const healAmount = Math.floor(myActive.stats.hp * effect.amount);
            score += Math.min(missingHp, healAmount) * 0.5;
          }
          if (effect.type === 'hazard') score += 60;
          if (effect.type === 'protect') score += 30;
        }

        // Lower score for status if already applied
        if (theirActive.status) {
          score *= 0.3;
        }

        // Accuracy factor
        if (move.accuracy !== null) {
          score *= move.accuracy / 100;
        }
      }

      moveScores.push({
        moveId,
        name: move.name,
        type: move.type,
        category: move.category,
        score: Math.round(score),
        estimatedDamage: move.category !== MOVE_CATEGORIES.STATUS
          ? calculateDamage(myActive, theirActive, move, { noCrit: true, fixedRandom: 0.925 }).damage
          : 0,
      });
    }

    moveScores.sort((a, b) => b.score - a.score);
    return moveScores;
  }

  getSwitchRecommendations(playerKey) {
    const player = this.battle[playerKey];
    const opponentKey = playerKey === 'player1' ? 'player2' : 'player1';
    const opponent = this.battle[opponentKey];
    const theirActive = opponent.active;

    const recommendations = [];

    for (let i = 0; i < player.team.length; i++) {
      const pokemon = player.team[i];
      if (!pokemon.isAlive || pokemon === player.active) continue;

      let score = 0;

      // Defensive: how well does this pokemon resist opponent's moves?
      for (const moveId of theirActive.moves) {
        const move = getMoveById(moveId);
        if (!move || move.category === MOVE_CATEGORIES.STATUS) continue;
        const effectiveness = getEffectiveness(move.type, pokemon.types);
        if (effectiveness < 1) score += 30;
        if (effectiveness === 0) score += 60;
        if (effectiveness > 1) score -= 25;
      }

      // Offensive: can this pokemon threaten the opponent?
      for (const moveId of pokemon.moves) {
        const move = getMoveById(moveId);
        if (!move || move.category === MOVE_CATEGORIES.STATUS) continue;
        const effectiveness = getEffectiveness(move.type, theirActive.types);
        if (effectiveness > 1) score += 40;
        if (effectiveness === 0) score -= 20;
      }

      // HP factor
      const hpPercent = pokemon.getHpPercentage();
      score += hpPercent * 0.3;

      // Speed advantage
      if (pokemon.stats.speed > theirActive.stats.speed) score += 15;

      // Status penalty
      if (pokemon.status) score -= 20;

      recommendations.push({
        index: i,
        name: pokemon.name,
        types: pokemon.types,
        hpPercent: Math.round(hpPercent),
        score: Math.round(score),
        status: pokemon.status,
      });
    }

    recommendations.sort((a, b) => b.score - a.score);
    return recommendations;
  }

  getFullIntel(playerKey) {
    return {
      threat: this.getThreatAssessment(playerKey),
      bestMoves: this.getBestMove(playerKey),
      switchOptions: this.getSwitchRecommendations(playerKey),
      fieldState: {
        weather: this.battle.weather,
        hazards: {
          player1: { ...this.battle.player1.hazards },
          player2: { ...this.battle.player2.hazards },
        },
      },
    };
  }

  predictDamageRange(attacker, defender, moveId) {
    const move = getMoveById(moveId);
    if (!move || move.category === MOVE_CATEGORIES.STATUS) {
      return { min: 0, max: 0, avgPercent: 0, canKO: false };
    }

    const minResult = calculateDamage(attacker, defender, move, { noCrit: true, fixedRandom: 0.85 });
    const maxResult = calculateDamage(attacker, defender, move, { noCrit: true, fixedRandom: 1.0 });
    const critResult = calculateDamage(attacker, defender, move, { forceCrit: true, fixedRandom: 1.0 });

    const avgDamage = Math.round((minResult.damage + maxResult.damage) / 2);

    return {
      min: minResult.damage,
      max: maxResult.damage,
      critMax: critResult.damage,
      avgPercent: Math.round((avgDamage / defender.stats.hp) * 100),
      minPercent: Math.round((minResult.damage / defender.stats.hp) * 100),
      maxPercent: Math.round((maxResult.damage / defender.stats.hp) * 100),
      canKO: minResult.damage >= defender.currentHp,
      canKOWithCrit: critResult.damage >= defender.currentHp,
      effectiveness: minResult.effectiveness,
      stab: minResult.stab,
      turnsToKO: avgDamage > 0 ? Math.ceil(defender.currentHp / avgDamage) : Infinity,
    };
  }
}

module.exports = { InfoGatherer };
