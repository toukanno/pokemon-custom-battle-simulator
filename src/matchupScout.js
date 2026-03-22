const { getEffectiveness } = require('./types');
const { getMoveById, MOVE_CATEGORIES } = require('./moves');
const { calculateDamage } = require('./damage');

const ALL_TYPES = ['normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting',
  'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'];

class MatchupScout {
  constructor() {}

  analyzeTypeMatchup(attackerTypes, defenderTypes) {
    const offensiveResults = {};
    const defensiveResults = {};

    // What types are effective against the defender?
    for (const atkType of attackerTypes) {
      offensiveResults[atkType] = getEffectiveness(atkType, defenderTypes);
    }

    // What types are effective against us?
    for (const defType of defenderTypes) {
      defensiveResults[defType] = getEffectiveness(defType, attackerTypes);
    }

    return { offensive: offensiveResults, defensive: defensiveResults };
  }

  getTypeWeaknesses(types) {
    const allTypes = ALL_TYPES;

    const weaknesses = [];
    const resistances = [];
    const immunities = [];

    for (const atkType of allTypes) {
      const eff = getEffectiveness(atkType, types);
      if (eff > 1) weaknesses.push({ type: atkType, multiplier: eff });
      else if (eff === 0) immunities.push({ type: atkType });
      else if (eff < 1) resistances.push({ type: atkType, multiplier: eff });
    }

    return { weaknesses, resistances, immunities };
  }

  scoutPokemon(pokemon) {
    const typeInfo = this.getTypeWeaknesses(pokemon.types);

    const moveAnalysis = pokemon.moves.map(moveId => {
      const move = getMoveById(moveId);
      if (!move) return null;
      const hasStab = pokemon.types.includes(move.type);
      return {
        moveId,
        name: move.name,
        type: move.type,
        category: move.category,
        power: move.power,
        accuracy: move.accuracy,
        priority: move.priority,
        hasStab,
        effectivePower: hasStab ? Math.floor(move.power * 1.5) : move.power,
        effects: move.effects.map(e => e.type),
      };
    }).filter(Boolean);

    const statProfile = {
      hp: pokemon.stats.hp,
      attack: pokemon.stats.attack,
      defense: pokemon.stats.defense,
      specialAttack: pokemon.stats.specialAttack,
      specialDefense: pokemon.stats.specialDefense,
      speed: pokemon.stats.speed,
      bestStat: this._getBestStat(pokemon.stats),
      role: this._inferRole(pokemon),
    };

    return {
      name: pokemon.name,
      types: pokemon.types,
      level: pokemon.level,
      ...typeInfo,
      moves: moveAnalysis,
      stats: statProfile,
      currentHp: pokemon.currentHp,
      hpPercent: Math.round(pokemon.getHpPercentage()),
      status: pokemon.status,
    };
  }

  _getBestStat(stats) {
    let best = null;
    let bestVal = 0;
    for (const [stat, val] of Object.entries(stats)) {
      if (val > bestVal) {
        bestVal = val;
        best = stat;
      }
    }
    return best;
  }

  _inferRole(pokemon) {
    const { attack, specialAttack, defense, specialDefense, speed, hp } = pokemon.stats;
    const offensiveTotal = attack + specialAttack;
    const defensiveTotal = defense + specialDefense + hp;

    if (speed > 100 && offensiveTotal > defensiveTotal) return 'sweeper';
    if (defensiveTotal > offensiveTotal + 100) return 'wall';
    if (defense + specialDefense > 180 && hp > 80) return 'tank';
    if (speed > 90 && offensiveTotal > 180) return 'attacker';
    return 'balanced';
  }

  scoutTeam(team) {
    const scouts = team.filter(p => p.isAlive).map(p => this.scoutPokemon(p));

    // Type coverage analysis
    const typeCoverage = new Set();
    for (const scout of scouts) {
      for (const move of scout.moves) {
        if (move.category !== MOVE_CATEGORIES.STATUS && move.power > 0) {
          typeCoverage.add(move.type);
        }
      }
    }

    // Team weaknesses
    const allTypes = ALL_TYPES;

    const teamWeaknesses = {};
    for (const type of allTypes) {
      let weakCount = 0;
      let resistCount = 0;
      for (const scout of scouts) {
        const eff = getEffectiveness(type, scout.types);
        if (eff > 1) weakCount++;
        if (eff < 1) resistCount++;
      }
      if (weakCount >= 2) {
        teamWeaknesses[type] = { weakCount, resistCount };
      }
    }

    // Role distribution
    const roles = {};
    for (const scout of scouts) {
      const role = scout.stats.role;
      roles[role] = (roles[role] || 0) + 1;
    }

    return {
      pokemon: scouts,
      typeCoverage: [...typeCoverage],
      teamWeaknesses,
      roleDistribution: roles,
      aliveCount: scouts.length,
      totalHpPercent: scouts.length > 0
        ? Math.round(scouts.reduce((sum, s) => sum + s.hpPercent, 0) / scouts.length)
        : 0,
    };
  }

  compareMatchup(pokemon1, pokemon2) {
    const scout1 = this.scoutPokemon(pokemon1);
    const scout2 = this.scoutPokemon(pokemon2);

    // Best damage each can do to the other
    let best1to2 = { damage: 0, move: null };
    let best2to1 = { damage: 0, move: null };

    for (const moveId of pokemon1.moves) {
      const move = getMoveById(moveId);
      if (!move || move.category === MOVE_CATEGORIES.STATUS) continue;
      const result = calculateDamage(pokemon1, pokemon2, move, { noCrit: true, fixedRandom: 0.925 });
      if (result.damage > best1to2.damage) {
        best1to2 = { damage: result.damage, move: move.name, effectiveness: result.effectiveness };
      }
    }

    for (const moveId of pokemon2.moves) {
      const move = getMoveById(moveId);
      if (!move || move.category === MOVE_CATEGORIES.STATUS) continue;
      const result = calculateDamage(pokemon2, pokemon1, move, { noCrit: true, fixedRandom: 0.925 });
      if (result.damage > best2to1.damage) {
        best2to1 = { damage: result.damage, move: move.name, effectiveness: result.effectiveness };
      }
    }

    const speedAdvantage = pokemon1.stats.speed > pokemon2.stats.speed ? pokemon1.name
      : pokemon2.stats.speed > pokemon1.stats.speed ? pokemon2.name
      : 'tie';

    // Calculate who has the advantage
    const p1Score = best1to2.damage / pokemon2.stats.hp;
    const p2Score = best2to1.damage / pokemon1.stats.hp;

    let favoredPokemon;
    if (p1Score > p2Score * 1.2) favoredPokemon = pokemon1.name;
    else if (p2Score > p1Score * 1.2) favoredPokemon = pokemon2.name;
    else favoredPokemon = speedAdvantage !== 'tie' ? speedAdvantage : 'even';

    return {
      pokemon1: { name: pokemon1.name, types: pokemon1.types, bestMove: best1to2 },
      pokemon2: { name: pokemon2.name, types: pokemon2.types, bestMove: best2to1 },
      speedAdvantage,
      favored: favoredPokemon,
    };
  }

  findBestCounter(targetPokemon, team) {
    const results = [];

    for (let i = 0; i < team.length; i++) {
      const pokemon = team[i];
      if (!pokemon.isAlive || pokemon === targetPokemon) continue;

      const matchup = this.compareMatchup(pokemon, targetPokemon);
      const typeInfo = this.getTypeWeaknesses(pokemon.types);

      // How much does the target threaten this pokemon?
      let threatScore = 0;
      for (const moveId of targetPokemon.moves) {
        const move = getMoveById(moveId);
        if (!move || move.category === MOVE_CATEGORIES.STATUS) continue;
        const eff = getEffectiveness(move.type, pokemon.types);
        if (eff > 1) threatScore += eff;
        else if (eff < 1) threatScore -= 0.5;
      }

      results.push({
        index: i,
        name: pokemon.name,
        favored: matchup.favored === pokemon.name,
        bestMove: matchup.pokemon1.bestMove,
        threatFromTarget: threatScore,
        hpPercent: Math.round(pokemon.getHpPercentage()),
      });
    }

    return results.sort((a, b) => {
      if (a.favored && !b.favored) return -1;
      if (!a.favored && b.favored) return 1;
      return a.threatFromTarget - b.threatFromTarget;
    });
  }
}

module.exports = { MatchupScout };
