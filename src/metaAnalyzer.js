class MetaAnalyzer {
  constructor() {
    this.battleRecords = [];
    this.pokemonStats = {};
    this.moveStats = {};
    this.teamComps = [];
  }

  recordBattle(battleSummary, team1Species, team2Species) {
    const record = {
      id: this.battleRecords.length + 1,
      timestamp: Date.now(),
      winner: battleSummary.winner,
      totalTurns: battleSummary.totalTurns,
      player1: battleSummary.player1,
      player2: battleSummary.player2,
      team1Species,
      team2Species,
    };

    this.battleRecords.push(record);

    this._updatePokemonStats(team1Species, 'player1', battleSummary);
    this._updatePokemonStats(team2Species, 'player2', battleSummary);
    this._updateMoveStats(battleSummary, 'player1');
    this._updateMoveStats(battleSummary, 'player2');
    this._recordTeamComp(team1Species, battleSummary.winner === 'player1');
    this._recordTeamComp(team2Species, battleSummary.winner === 'player2');

    return record;
  }

  _updatePokemonStats(species, playerKey, summary) {
    for (const name of species) {
      if (!this.pokemonStats[name]) {
        this.pokemonStats[name] = {
          battles: 0,
          wins: 0,
          losses: 0,
          draws: 0,
          totalDamageDealt: 0,
          totalDamageReceived: 0,
          totalKOs: 0,
          totalFaints: 0,
        };
      }

      const stats = this.pokemonStats[name];
      stats.battles++;

      if (summary.winner === playerKey) stats.wins++;
      else if (summary.winner === 'draw') stats.draws++;
      else stats.losses++;

      const playerStats = summary[playerKey];
      stats.totalDamageDealt += playerStats.totalDamageDealt;
      stats.totalDamageReceived += playerStats.totalDamageReceived;
      stats.totalKOs += playerStats.knockoutsScored;
      stats.totalFaints += playerStats.pokemonLost;
    }
  }

  _updateMoveStats(summary, playerKey) {
    const playerStats = summary[playerKey];
    if (!playerStats.movesUsed) return;

    for (const [moveId, data] of Object.entries(playerStats.movesUsed)) {
      if (!this.moveStats[moveId]) {
        this.moveStats[moveId] = {
          timesUsed: 0,
          totalHits: 0,
          totalMisses: 0,
          totalDamage: 0,
          totalCrits: 0,
          battles: 0,
          wins: 0,
        };
      }

      const ms = this.moveStats[moveId];
      ms.timesUsed += data.used;
      ms.totalHits += data.hits;
      ms.totalMisses += data.misses;
      ms.totalDamage += data.totalDamage;
      ms.totalCrits += data.crits;
      ms.battles++;
      if (summary.winner === playerKey) ms.wins++;
    }
  }

  _recordTeamComp(species, won) {
    const key = [...species].sort().join(',');
    let existing = this.teamComps.find(t => t.key === key);
    if (!existing) {
      existing = { key, species: [...species].sort(), battles: 0, wins: 0 };
      this.teamComps.push(existing);
    }
    existing.battles++;
    if (won) existing.wins++;
  }

  getPokemonRankings(minBattles = 1) {
    const rankings = [];

    for (const [name, stats] of Object.entries(this.pokemonStats)) {
      if (stats.battles < minBattles) continue;

      rankings.push({
        name,
        battles: stats.battles,
        winRate: stats.battles > 0 ? (stats.wins / stats.battles * 100).toFixed(1) + '%' : '0%',
        winRateNum: stats.battles > 0 ? stats.wins / stats.battles : 0,
        avgDamageDealt: stats.battles > 0 ? Math.round(stats.totalDamageDealt / stats.battles) : 0,
        avgDamageReceived: stats.battles > 0 ? Math.round(stats.totalDamageReceived / stats.battles) : 0,
        avgKOs: stats.battles > 0 ? (stats.totalKOs / stats.battles).toFixed(1) : '0',
        avgFaints: stats.battles > 0 ? (stats.totalFaints / stats.battles).toFixed(1) : '0',
      });
    }

    return rankings.sort((a, b) => b.winRateNum - a.winRateNum);
  }

  getMoveRankings(minUses = 1) {
    const rankings = [];

    for (const [moveId, stats] of Object.entries(this.moveStats)) {
      if (stats.timesUsed < minUses) continue;

      rankings.push({
        moveId,
        timesUsed: stats.timesUsed,
        accuracy: stats.timesUsed > 0 ? ((stats.totalHits / (stats.totalHits + stats.totalMisses)) * 100).toFixed(1) + '%' : 'N/A',
        avgDamage: stats.totalHits > 0 ? Math.round(stats.totalDamage / stats.totalHits) : 0,
        critRate: stats.totalHits > 0 ? ((stats.totalCrits / stats.totalHits) * 100).toFixed(1) + '%' : '0%',
        winRate: stats.battles > 0 ? ((stats.wins / stats.battles) * 100).toFixed(1) + '%' : '0%',
        winRateNum: stats.battles > 0 ? stats.wins / stats.battles : 0,
      });
    }

    return rankings.sort((a, b) => b.winRateNum - a.winRateNum);
  }

  getTeamCompRankings(minBattles = 1) {
    return this.teamComps
      .filter(t => t.battles >= minBattles)
      .map(t => ({
        species: t.species,
        battles: t.battles,
        winRate: t.battles > 0 ? ((t.wins / t.battles) * 100).toFixed(1) + '%' : '0%',
        winRateNum: t.battles > 0 ? t.wins / t.battles : 0,
      }))
      .sort((a, b) => b.winRateNum - a.winRateNum);
  }

  getMetaSummary() {
    const totalBattles = this.battleRecords.length;
    const avgTurns = totalBattles > 0
      ? (this.battleRecords.reduce((sum, r) => sum + r.totalTurns, 0) / totalBattles).toFixed(1)
      : 0;

    const p1Wins = this.battleRecords.filter(r => r.winner === 'player1').length;
    const p2Wins = this.battleRecords.filter(r => r.winner === 'player2').length;
    const draws = this.battleRecords.filter(r => r.winner === 'draw').length;

    return {
      totalBattles,
      averageTurns: Number(avgTurns),
      player1WinRate: totalBattles > 0 ? ((p1Wins / totalBattles) * 100).toFixed(1) + '%' : '0%',
      player2WinRate: totalBattles > 0 ? ((p2Wins / totalBattles) * 100).toFixed(1) + '%' : '0%',
      drawRate: totalBattles > 0 ? ((draws / totalBattles) * 100).toFixed(1) + '%' : '0%',
      topPokemon: this.getPokemonRankings().slice(0, 5),
      topMoves: this.getMoveRankings().slice(0, 5),
      topTeams: this.getTeamCompRankings().slice(0, 3),
    };
  }
}

module.exports = { MetaAnalyzer };
