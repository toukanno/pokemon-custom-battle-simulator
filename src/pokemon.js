const { TYPES } = require('./types');

class Pokemon {
  constructor({ name, types, baseStats, level = 50, moves = [], nature = 'hardy', evs = {}, ivs = {}, generation = null }) {
    this.name = name;
    this.types = types;
    this.baseStats = baseStats;
    this.level = level;
    this.moves = moves;
    this.nature = nature;
    this.generation = generation;

    this.evs = {
      hp: evs.hp || 0,
      attack: evs.attack || 0,
      defense: evs.defense || 0,
      specialAttack: evs.specialAttack || 0,
      specialDefense: evs.specialDefense || 0,
      speed: evs.speed || 0,
    };

    this.ivs = {
      hp: ivs.hp !== undefined ? ivs.hp : 31,
      attack: ivs.attack !== undefined ? ivs.attack : 31,
      defense: ivs.defense !== undefined ? ivs.defense : 31,
      specialAttack: ivs.specialAttack !== undefined ? ivs.specialAttack : 31,
      specialDefense: ivs.specialDefense !== undefined ? ivs.specialDefense : 31,
      speed: ivs.speed !== undefined ? ivs.speed : 31,
    };

    this.stats = this.calculateStats();
    this.currentHp = this.stats.hp;
    this.status = null;
    this.statModifiers = { attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0, accuracy: 0, evasion: 0 };
    this.isAlive = true;
    this.volatileStatus = new Set();
  }

  calculateStats() {
    const natureModifiers = this.getNatureModifiers();
    return {
      hp: this.calculateHp(),
      attack: this.calculateStat('attack', natureModifiers),
      defense: this.calculateStat('defense', natureModifiers),
      specialAttack: this.calculateStat('specialAttack', natureModifiers),
      specialDefense: this.calculateStat('specialDefense', natureModifiers),
      speed: this.calculateStat('speed', natureModifiers),
    };
  }

  calculateHp() {
    const base = this.baseStats.hp;
    const iv = this.ivs.hp;
    const ev = this.evs.hp;
    return Math.floor(((2 * base + iv + Math.floor(ev / 4)) * this.level) / 100) + this.level + 10;
  }

  calculateStat(stat, natureModifiers) {
    const base = this.baseStats[stat];
    const iv = this.ivs[stat];
    const ev = this.evs[stat];
    const value = Math.floor(((2 * base + iv + Math.floor(ev / 4)) * this.level) / 100) + 5;
    return Math.floor(value * (natureModifiers[stat] || 1));
  }

  getNatureModifiers() {
    const natures = {
      hardy: {},
      lonely: { attack: 1.1, defense: 0.9 },
      brave: { attack: 1.1, speed: 0.9 },
      adamant: { attack: 1.1, specialAttack: 0.9 },
      naughty: { attack: 1.1, specialDefense: 0.9 },
      bold: { defense: 1.1, attack: 0.9 },
      relaxed: { defense: 1.1, speed: 0.9 },
      impish: { defense: 1.1, specialAttack: 0.9 },
      lax: { defense: 1.1, specialDefense: 0.9 },
      timid: { speed: 1.1, attack: 0.9 },
      hasty: { speed: 1.1, defense: 0.9 },
      jolly: { speed: 1.1, specialAttack: 0.9 },
      naive: { speed: 1.1, specialDefense: 0.9 },
      modest: { specialAttack: 1.1, attack: 0.9 },
      mild: { specialAttack: 1.1, defense: 0.9 },
      quiet: { specialAttack: 1.1, speed: 0.9 },
      rash: { specialAttack: 1.1, specialDefense: 0.9 },
      calm: { specialDefense: 1.1, attack: 0.9 },
      gentle: { specialDefense: 1.1, defense: 0.9 },
      sassy: { specialDefense: 1.1, speed: 0.9 },
      careful: { specialDefense: 1.1, specialAttack: 0.9 },
      bashful: {},
      quirky: {},
      serious: {},
      docile: {},
    };
    return natures[this.nature] || {};
  }

  getEffectiveStat(stat) {
    const stage = this.statModifiers[stat];
    let multiplier;
    if (stat === 'accuracy') {
      multiplier = stage >= 0 ? (3 + stage) / 3 : 3 / (3 - stage);
      return multiplier;
    } else if (stat === 'evasion') {
      multiplier = stage >= 0 ? 3 / (3 + stage) : (3 - stage) / 3;
      return multiplier;
    } else {
      multiplier = stage >= 0 ? (2 + stage) / 2 : 2 / (2 - stage);
    }
    return Math.floor(this.stats[stat] * multiplier);
  }

  modifyStat(stat, stages) {
    const oldStage = this.statModifiers[stat];
    this.statModifiers[stat] = Math.max(-6, Math.min(6, oldStage + stages));
    const newStage = this.statModifiers[stat];

    if (newStage === oldStage && stages > 0) return `${this.name}'s ${stat} won't go any higher!`;
    if (newStage === oldStage && stages < 0) return `${this.name}'s ${stat} won't go any lower!`;

    const magnitude = Math.abs(stages);
    let descriptor;
    if (magnitude === 1) descriptor = stages > 0 ? 'rose' : 'fell';
    else if (magnitude === 2) descriptor = stages > 0 ? 'rose sharply' : 'harshly fell';
    else descriptor = stages > 0 ? 'rose drastically' : 'severely fell';

    return `${this.name}'s ${stat} ${descriptor}!`;
  }

  takeDamage(amount) {
    this.currentHp = Math.max(0, this.currentHp - amount);
    if (this.currentHp === 0) {
      this.isAlive = false;
    }
    return this.currentHp;
  }

  heal(amount) {
    if (!this.isAlive) return 0;
    const maxHeal = this.stats.hp - this.currentHp;
    const healed = Math.min(amount, maxHeal);
    this.currentHp += healed;
    return healed;
  }

  setStatus(status) {
    if (this.status !== null) return false;
    if (status === 'burn' && this.types.includes(TYPES.FIRE)) return false;
    if (status === 'freeze' && this.types.includes(TYPES.ICE)) return false;
    if (status === 'paralysis' && this.types.includes(TYPES.ELECTRIC)) return false;
    if ((status === 'poison' || status === 'toxic') && (this.types.includes(TYPES.POISON) || this.types.includes(TYPES.STEEL))) return false;
    this.status = status;
    return true;
  }

  clearStatus() {
    if (this.status === 'toxic') {
      this.toxicCounter = 0;
    }
    this.status = null;
  }

  resetStatModifiers() {
    this.statModifiers = { attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0, accuracy: 0, evasion: 0 };
  }

  getHpPercentage() {
    return (this.currentHp / this.stats.hp) * 100;
  }

  canMove() {
    if (!this.isAlive) return { able: false, reason: 'fainted' };
    if (this.volatileStatus.has('flinch')) {
      this.volatileStatus.delete('flinch');
      return { able: false, reason: 'flinch' };
    }
    if (this.status === 'paralysis' && Math.random() < 0.25) return { able: false, reason: 'paralysis' };
    if (this.status === 'freeze') {
      if (Math.random() < 0.2) {
        this.clearStatus();
        return { able: true };
      }
      return { able: false, reason: 'freeze' };
    }
    if (this.status === 'sleep') {
      if (Math.random() < 0.33) {
        this.clearStatus();
        return { able: true };
      }
      return { able: false, reason: 'sleep' };
    }
    if (this.volatileStatus.has('confusion') && Math.random() < 0.33) return { able: false, reason: 'confusion' };
    return { able: true };
  }
}

module.exports = { Pokemon };
