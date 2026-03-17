const { calculateDamage } = require('./damage');
const { getEffectivenessMessage } = require('./types');
const { MOVE_CATEGORIES, getMoveById } = require('./moves');

class Battle {
  constructor(player1Team, player2Team, options = {}) {
    this.player1 = {
      team: player1Team,
      active: player1Team[0],
      hazards: {},
    };
    this.player2 = {
      team: player2Team,
      active: player2Team[0],
      hazards: {},
    };
    this.turn = 0;
    this.log = [];
    this.weather = null;
    this.weatherTurns = 0;
    this.terrain = null;
    this.terrainTurns = 0;
    this.isOver = false;
    this.winner = null;
    this.options = options;
    this.faintedPokemon = new Set();
  }

  addLog(message) {
    this.log.push(message);
  }

  getOpponent(player) {
    return player === this.player1 ? this.player2 : this.player1;
  }

  executeTurn(player1Action, player2Action) {
    if (this.isOver) return;
    this.turn++;
    this.addLog(`--- Turn ${this.turn} ---`);

    const actions = this.determineOrder(player1Action, player2Action);

    for (const action of actions) {
      if (this.isOver) break;
      this.executeAction(action.player, action.action);
      this.checkFainted();
    }

    this.applyEndOfTurnEffects();
    this.checkWinCondition();
  }

  determineOrder(p1Action, p2Action) {
    const actions = [
      { player: this.player1, action: p1Action },
      { player: this.player2, action: p2Action },
    ];

    // Switches always go first
    if (p1Action.type === 'switch' && p2Action.type !== 'switch') {
      return actions;
    }
    if (p2Action.type === 'switch' && p1Action.type !== 'switch') {
      return [actions[1], actions[0]];
    }

    // Compare priority for moves
    if (p1Action.type === 'move' && p2Action.type === 'move') {
      const move1 = getMoveById(p1Action.moveId);
      const move2 = getMoveById(p2Action.moveId);
      if (move1 && move2 && move1.priority !== move2.priority) {
        return move1.priority > move2.priority ? actions : [actions[1], actions[0]];
      }
    }

    // Speed check
    const speed1 = this.player1.active.getEffectiveStat('speed');
    const speed2 = this.player2.active.getEffectiveStat('speed');

    if (speed1 !== speed2) {
      return speed1 > speed2 ? actions : [actions[1], actions[0]];
    }

    // Speed tie - random
    return Math.random() < 0.5 ? actions : [actions[1], actions[0]];
  }

  executeAction(player, action) {
    if (!player.active.isAlive) {
      return;
    }

    const opponent = this.getOpponent(player);

    if (action.type === 'switch') {
      this.switchPokemon(player, action.pokemonIndex);
    } else if (action.type === 'move') {
      this.executeMove(player, opponent, action.moveId);
    }
  }

  executeMove(player, opponent, moveId) {
    const attacker = player.active;
    const defender = opponent.active;
    const move = getMoveById(moveId);

    if (!move) {
      this.addLog(`${attacker.name} tried to use an unknown move!`);
      return;
    }

    if (!attacker.canMove()) {
      if (attacker.status === 'paralysis') this.addLog(`${attacker.name} is paralyzed! It can't move!`);
      else if (attacker.status === 'freeze') this.addLog(`${attacker.name} is frozen solid!`);
      else if (attacker.status === 'sleep') this.addLog(`${attacker.name} is fast asleep!`);
      else if (attacker.volatileStatus.has('confusion')) this.addLog(`${attacker.name} hurt itself in confusion!`);
      else if (attacker.volatileStatus.has('flinch')) this.addLog(`${attacker.name} flinched and couldn't move!`);
      return;
    }

    this.addLog(`${attacker.name} used ${move.name}!`);

    // Accuracy check
    if (move.accuracy !== null) {
      const accuracyStat = attacker.getEffectiveStat('accuracy') || 1;
      const evasionStat = defender.getEffectiveStat('evasion') || 1;
      const hitChance = (move.accuracy / 100) * (accuracyStat / evasionStat);
      if (Math.random() > hitChance) {
        this.addLog(`${attacker.name}'s attack missed!`);
        return;
      }
    }

    // Handle protect
    if (defender.volatileStatus.has('protect')) {
      this.addLog(`${defender.name} protected itself!`);
      return;
    }

    if (move.category !== MOVE_CATEGORIES.STATUS) {
      const result = calculateDamage(attacker, defender, move);
      defender.takeDamage(result.damage);
      this.addLog(`${defender.name} took ${result.damage} damage!`);

      if (result.isCrit) this.addLog('A critical hit!');
      const effMsg = getEffectivenessMessage(result.effectiveness);
      if (effMsg) this.addLog(effMsg);
    }

    // Apply move effects
    this.applyMoveEffects(attacker, defender, move, player, opponent);
  }

  applyMoveEffects(attacker, defender, move, player, opponent) {
    for (const effect of move.effects) {
      if (effect.chance && Math.random() * 100 > effect.chance) continue;

      const target = effect.target === 'self' ? attacker : defender;

      switch (effect.type) {
        case 'status':
          if (target.setStatus(effect.status)) {
            this.addLog(`${target.name} was ${this.getStatusMessage(effect.status)}!`);
          }
          break;
        case 'stat':
          this.addLog(target.modifyStat(effect.stat, effect.stages));
          break;
        case 'heal':
          const healed = attacker.heal(Math.floor(attacker.stats.hp * effect.amount));
          if (healed > 0) this.addLog(`${attacker.name} restored ${healed} HP!`);
          break;
        case 'protect':
          attacker.volatileStatus.add('protect');
          this.addLog(`${attacker.name} is protecting itself!`);
          break;
        case 'hazard':
          const targetSide = effect.target === 'opponent' ? opponent : player;
          if (!targetSide.hazards[effect.hazard]) {
            targetSide.hazards[effect.hazard] = 1;
            this.addLog(`${effect.hazard} was set on the opponent's side!`);
          } else if (effect.hazard === 'toxicSpikes' && targetSide.hazards[effect.hazard] < 2) {
            targetSide.hazards[effect.hazard]++;
            this.addLog(`${effect.hazard} was added to the opponent's side!`);
          }
          break;
      }
    }
  }

  getStatusMessage(status) {
    const messages = {
      burn: 'burned',
      paralysis: 'paralyzed',
      freeze: 'frozen',
      poison: 'poisoned',
      toxic: 'badly poisoned',
      sleep: 'put to sleep',
    };
    return messages[status] || status;
  }

  switchPokemon(player, index) {
    const pokemon = player.team[index];
    if (!pokemon || !pokemon.isAlive) {
      this.addLog('Cannot switch to that Pokemon!');
      return false;
    }

    const previous = player.active;
    previous.resetStatModifiers();
    previous.volatileStatus.clear();

    player.active = pokemon;
    this.addLog(`${previous.name} was withdrawn! Go, ${pokemon.name}!`);

    // Apply entry hazards
    this.applyEntryHazards(player);
    return true;
  }

  applyEntryHazards(player) {
    const pokemon = player.active;

    if (player.hazards.stealthRock) {
      const damage = Math.floor(pokemon.stats.hp * 0.125);
      pokemon.takeDamage(damage);
      this.addLog(`${pokemon.name} was hurt by Stealth Rock! (${damage} damage)`);
    }

    if (player.hazards.toxicSpikes && !pokemon.types.includes('flying')) {
      if (pokemon.types.includes('poison')) {
        player.hazards.toxicSpikes = 0;
        this.addLog(`${pokemon.name} absorbed the Toxic Spikes!`);
      } else {
        const status = player.hazards.toxicSpikes >= 2 ? 'toxic' : 'poison';
        pokemon.setStatus(status);
        this.addLog(`${pokemon.name} was ${this.getStatusMessage(status)} by Toxic Spikes!`);
      }
    }
  }

  applyEndOfTurnEffects() {
    for (const player of [this.player1, this.player2]) {
      const pokemon = player.active;
      if (!pokemon.isAlive) continue;

      // Remove protect at end of turn
      pokemon.volatileStatus.delete('protect');

      // Status damage
      if (pokemon.status === 'burn') {
        const damage = Math.max(1, Math.floor(pokemon.stats.hp / 16));
        pokemon.takeDamage(damage);
        this.addLog(`${pokemon.name} was hurt by its burn! (${damage} damage)`);
      }

      if (pokemon.status === 'poison') {
        const damage = Math.max(1, Math.floor(pokemon.stats.hp / 8));
        pokemon.takeDamage(damage);
        this.addLog(`${pokemon.name} was hurt by poison! (${damage} damage)`);
      }

      if (pokemon.status === 'toxic') {
        if (!pokemon.toxicCounter) pokemon.toxicCounter = 1;
        const damage = Math.max(1, Math.floor(pokemon.stats.hp * pokemon.toxicCounter / 16));
        pokemon.takeDamage(damage);
        pokemon.toxicCounter++;
        this.addLog(`${pokemon.name} was hurt by poison! (${damage} damage)`);
      }
    }

    // Weather turns
    if (this.weather) {
      this.weatherTurns--;
      if (this.weatherTurns <= 0) {
        this.addLog(`The ${this.weather} subsided.`);
        this.weather = null;
      }
    }
  }

  checkFainted() {
    for (const player of [this.player1, this.player2]) {
      if (!player.active.isAlive && !this.faintedPokemon.has(player.active)) {
        this.addLog(`${player.active.name} fainted!`);
        this.faintedPokemon.add(player.active);
      }
    }
  }

  checkWinCondition() {
    const p1AllFainted = this.player1.team.every(p => !p.isAlive);
    const p2AllFainted = this.player2.team.every(p => !p.isAlive);

    if (p1AllFainted && p2AllFainted) {
      this.isOver = true;
      this.winner = 'draw';
      this.addLog('The battle ended in a draw!');
    } else if (p1AllFainted) {
      this.isOver = true;
      this.winner = 'player2';
      this.addLog('Player 2 wins!');
    } else if (p2AllFainted) {
      this.isOver = true;
      this.winner = 'player1';
      this.addLog('Player 1 wins!');
    }
  }

  setWeather(weather, turns = 5) {
    this.weather = weather;
    this.weatherTurns = turns;
    this.addLog(`The weather changed to ${weather}!`);
  }

  getBattleState() {
    return {
      turn: this.turn,
      player1: {
        active: this.player1.active.name,
        hp: this.player1.active.currentHp,
        maxHp: this.player1.active.stats.hp,
        status: this.player1.active.status,
        teamAlive: this.player1.team.filter(p => p.isAlive).length,
      },
      player2: {
        active: this.player2.active.name,
        hp: this.player2.active.currentHp,
        maxHp: this.player2.active.stats.hp,
        status: this.player2.active.status,
        teamAlive: this.player2.team.filter(p => p.isAlive).length,
      },
      weather: this.weather,
      isOver: this.isOver,
      winner: this.winner,
    };
  }
}

module.exports = { Battle };
