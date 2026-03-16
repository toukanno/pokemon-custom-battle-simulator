const { Pokemon } = require('./pokemon');
const { Battle } = require('./battle');
const { MOVES, MOVE_CATEGORIES, getMoveById, validateMoveset } = require('./moves');
const { TYPES, TYPE_EFFECTIVENESS, getEffectiveness, getEffectivenessMessage } = require('./types');
const { calculateDamage, getCriticalHitChance, calculateRecoilDamage, calculateConfusionDamage } = require('./damage');
const {
  POKEDEX,
  buildPokemon,
  buildTeam,
  validateTeam,
  getPokedexEntry,
  listAvailablePokemon,
  calculateBaseStatTotal,
  buildStJohnsSystemTeam,
} = require('./teambuilder');

module.exports = {
  Pokemon,
  Battle,
  MOVES,
  MOVE_CATEGORIES,
  getMoveById,
  validateMoveset,
  TYPES,
  TYPE_EFFECTIVENESS,
  getEffectiveness,
  getEffectivenessMessage,
  calculateDamage,
  getCriticalHitChance,
  calculateRecoilDamage,
  calculateConfusionDamage,
  POKEDEX,
  buildPokemon,
  buildTeam,
  validateTeam,
  getPokedexEntry,
  listAvailablePokemon,
  calculateBaseStatTotal,
  buildStJohnsSystemTeam,
};
