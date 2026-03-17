const { Pokemon } = require('./pokemon');
const { MOVES, validateMoveset } = require('./moves');
const { TYPES } = require('./types');
const { isGenerationValid } = require('./generation');

const POKEDEX = {
  charizard: {
    name: 'Charizard',
    types: [TYPES.FIRE, TYPES.FLYING],
    baseStats: { hp: 78, attack: 84, defense: 78, specialAttack: 109, specialDefense: 85, speed: 100 },
    generation: 1,
  },
  blastoise: {
    name: 'Blastoise',
    types: [TYPES.WATER],
    baseStats: { hp: 79, attack: 83, defense: 100, specialAttack: 85, specialDefense: 105, speed: 78 },
    generation: 1,
  },
  venusaur: {
    name: 'Venusaur',
    types: [TYPES.GRASS, TYPES.POISON],
    baseStats: { hp: 80, attack: 82, defense: 83, specialAttack: 100, specialDefense: 100, speed: 80 },
    generation: 1,
  },
  pikachu: {
    name: 'Pikachu',
    types: [TYPES.ELECTRIC],
    baseStats: { hp: 35, attack: 55, defense: 40, specialAttack: 50, specialDefense: 50, speed: 90 },
    generation: 1,
  },
  gengar: {
    name: 'Gengar',
    types: [TYPES.GHOST, TYPES.POISON],
    baseStats: { hp: 60, attack: 65, defense: 60, specialAttack: 130, specialDefense: 75, speed: 110 },
    generation: 1,
  },
  dragonite: {
    name: 'Dragonite',
    types: [TYPES.DRAGON, TYPES.FLYING],
    baseStats: { hp: 91, attack: 134, defense: 95, specialAttack: 100, specialDefense: 100, speed: 80 },
    generation: 1,
  },
  snorlax: {
    name: 'Snorlax',
    types: [TYPES.NORMAL],
    baseStats: { hp: 160, attack: 110, defense: 65, specialAttack: 65, specialDefense: 110, speed: 30 },
    generation: 1,
  },
  garchomp: {
    name: 'Garchomp',
    types: [TYPES.DRAGON, TYPES.GROUND],
    baseStats: { hp: 108, attack: 130, defense: 95, specialAttack: 80, specialDefense: 85, speed: 102 },
    generation: 4,
  },
  lucario: {
    name: 'Lucario',
    types: [TYPES.FIGHTING, TYPES.STEEL],
    baseStats: { hp: 70, attack: 110, defense: 70, specialAttack: 115, specialDefense: 70, speed: 90 },
    generation: 4,
  },
  togekiss: {
    name: 'Togekiss',
    types: [TYPES.FAIRY, TYPES.FLYING],
    baseStats: { hp: 85, attack: 50, defense: 95, specialAttack: 120, specialDefense: 115, speed: 80 },
    generation: 4,
  },
};

function buildPokemon(speciesId, config = {}) {
  const species = POKEDEX[speciesId];
  if (!species) return null;

  const moves = config.moves || [];
  if (!validateMoveset(moves)) return null;

  // Validate moves exist
  for (const moveId of moves) {
    if (!MOVES[moveId]) return null;
  }

  return new Pokemon({
    name: species.name,
    types: species.types,
    baseStats: species.baseStats,
    level: config.level || 50,
    moves: moves,
    nature: config.nature || 'hardy',
    evs: config.evs || {},
    ivs: config.ivs || {},
    generation: species.generation,
  });
}

function buildTeam(teamConfig) {
  if (!Array.isArray(teamConfig) || teamConfig.length === 0 || teamConfig.length > 6) {
    return null;
  }

  const team = [];
  for (const config of teamConfig) {
    const pokemon = buildPokemon(config.species, config);
    if (!pokemon) return null;
    team.push(pokemon);
  }

  return team;
}

function validateTeam(team) {
  const errors = [];

  if (!team || team.length === 0) {
    errors.push('Team must have at least 1 Pokemon');
    return { valid: false, errors };
  }

  if (team.length > 6) {
    errors.push('Team cannot have more than 6 Pokemon');
    return { valid: false, errors };
  }

  for (const pokemon of team) {
    // Validate EV total
    const evTotal = Object.values(pokemon.evs).reduce((sum, v) => sum + v, 0);
    if (evTotal > 510) {
      errors.push(`${pokemon.name} has too many EVs (${evTotal}/510)`);
    }

    // Validate individual EVs
    for (const [stat, value] of Object.entries(pokemon.evs)) {
      if (value > 252) {
        errors.push(`${pokemon.name} has too many EVs in ${stat} (${value}/252)`);
      }
    }

    // Validate IVs
    for (const [stat, value] of Object.entries(pokemon.ivs)) {
      if (value < 0 || value > 31) {
        errors.push(`${pokemon.name} has invalid IV in ${stat} (${value})`);
      }
    }

    // Validate level
    if (pokemon.level < 1 || pokemon.level > 100) {
      errors.push(`${pokemon.name} has invalid level (${pokemon.level})`);
    }
  }

  return { valid: errors.length === 0, errors };
}

function getPokedexEntry(speciesId) {
  return POKEDEX[speciesId] || null;
}

function listAvailablePokemon() {
  return Object.keys(POKEDEX);
}

function listPokemonByGeneration(genNumber) {
  if (!isGenerationValid(genNumber)) return [];
  return Object.entries(POKEDEX)
    .filter(([, entry]) => entry.generation === genNumber)
    .map(([id]) => id);
}

function filterPokedexByGeneration(genNumber) {
  if (!isGenerationValid(genNumber)) return {};
  const filtered = {};
  for (const [id, entry] of Object.entries(POKEDEX)) {
    if (entry.generation === genNumber) {
      filtered[id] = entry;
    }
  }
  return filtered;
}

function listPokemonUpToGeneration(maxGen) {
  if (!isGenerationValid(maxGen)) return [];
  return Object.entries(POKEDEX)
    .filter(([, entry]) => entry.generation <= maxGen)
    .map(([id]) => id);
}

module.exports = { POKEDEX, buildPokemon, buildTeam, validateTeam, getPokedexEntry, listAvailablePokemon, listPokemonByGeneration, filterPokedexByGeneration, listPokemonUpToGeneration };
