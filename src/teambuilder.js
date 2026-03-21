const { Pokemon } = require('./pokemon');
const { MOVES, validateMoveset } = require('./moves');
const { TYPES } = require('./types');

const ALLOWED_ICON_SOURCES = ['pkhex', 'custom'];

function normalizeIcon(icon, fallbackAlt) {
  if (!icon) return null;

  if (typeof icon === 'string') {
    return {
      source: 'custom',
      path: icon,
      alt: fallbackAlt,
    };
  }

  if (typeof icon !== 'object' || Array.isArray(icon)) return null;

  const source = icon.source || 'custom';
  if (!ALLOWED_ICON_SOURCES.includes(source)) return null;
  if (typeof icon.path !== 'string' || icon.path.trim().length === 0) return null;

  return {
    source,
    path: icon.path,
    alt: icon.alt || fallbackAlt,
  };
}

const POKEDEX = {
  charizard: {
    name: 'Charizard',
    types: [TYPES.FIRE, TYPES.FLYING],
    baseStats: { hp: 78, attack: 84, defense: 78, specialAttack: 109, specialDefense: 85, speed: 100 },
    icon: { source: 'pkhex', path: 'pkhex://6/charizard', alt: 'Charizard icon' },
  },
  blastoise: {
    name: 'Blastoise',
    types: [TYPES.WATER],
    baseStats: { hp: 79, attack: 83, defense: 100, specialAttack: 85, specialDefense: 105, speed: 78 },
    icon: { source: 'pkhex', path: 'pkhex://9/blastoise', alt: 'Blastoise icon' },
  },
  venusaur: {
    name: 'Venusaur',
    types: [TYPES.GRASS, TYPES.POISON],
    baseStats: { hp: 80, attack: 82, defense: 83, specialAttack: 100, specialDefense: 100, speed: 80 },
    icon: { source: 'pkhex', path: 'pkhex://3/venusaur', alt: 'Venusaur icon' },
  },
  pikachu: {
    name: 'Pikachu',
    types: [TYPES.ELECTRIC],
    baseStats: { hp: 35, attack: 55, defense: 40, specialAttack: 50, specialDefense: 50, speed: 90 },
    icon: { source: 'pkhex', path: 'pkhex://25/pikachu', alt: 'Pikachu icon' },
  },
  gengar: {
    name: 'Gengar',
    types: [TYPES.GHOST, TYPES.POISON],
    baseStats: { hp: 60, attack: 65, defense: 60, specialAttack: 130, specialDefense: 75, speed: 110 },
    icon: { source: 'pkhex', path: 'pkhex://94/gengar', alt: 'Gengar icon' },
  },
  dragonite: {
    name: 'Dragonite',
    types: [TYPES.DRAGON, TYPES.FLYING],
    baseStats: { hp: 91, attack: 134, defense: 95, specialAttack: 100, specialDefense: 100, speed: 80 },
    icon: { source: 'pkhex', path: 'pkhex://149/dragonite', alt: 'Dragonite icon' },
  },
  snorlax: {
    name: 'Snorlax',
    types: [TYPES.NORMAL],
    baseStats: { hp: 160, attack: 110, defense: 65, specialAttack: 65, specialDefense: 110, speed: 30 },
    icon: { source: 'pkhex', path: 'pkhex://143/snorlax', alt: 'Snorlax icon' },
  },
  garchomp: {
    name: 'Garchomp',
    types: [TYPES.DRAGON, TYPES.GROUND],
    baseStats: { hp: 108, attack: 130, defense: 95, specialAttack: 80, specialDefense: 85, speed: 102 },
    icon: { source: 'pkhex', path: 'pkhex://445/garchomp', alt: 'Garchomp icon' },
  },
  lucario: {
    name: 'Lucario',
    types: [TYPES.FIGHTING, TYPES.STEEL],
    baseStats: { hp: 70, attack: 110, defense: 70, specialAttack: 115, specialDefense: 70, speed: 90 },
    icon: { source: 'pkhex', path: 'pkhex://448/lucario', alt: 'Lucario icon' },
  },
  togekiss: {
    name: 'Togekiss',
    types: [TYPES.FAIRY, TYPES.FLYING],
    baseStats: { hp: 85, attack: 50, defense: 95, specialAttack: 120, specialDefense: 115, speed: 80 },
    icon: { source: 'pkhex', path: 'pkhex://468/togekiss', alt: 'Togekiss icon' },
  },
};

function buildPokemon(speciesId, config = {}) {
  const species = POKEDEX[speciesId];
  if (!species) return null;

  const moves = config.moves || [];
  if (!validateMoveset(moves)) return null;

  for (const moveId of moves) {
    if (!MOVES[moveId]) return null;
  }

  const icon = normalizeIcon(config.icon, `${species.name} icon`) || species.icon;

  return new Pokemon({
    name: species.name,
    types: species.types,
    baseStats: species.baseStats,
    level: config.level || 50,
    moves,
    nature: config.nature || 'hardy',
    evs: config.evs || {},
    ivs: config.ivs || {},
    icon,
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
    const evTotal = Object.values(pokemon.evs).reduce((sum, v) => sum + v, 0);
    if (evTotal > 510) {
      errors.push(`${pokemon.name} has too many EVs (${evTotal}/510)`);
    }

    for (const [stat, value] of Object.entries(pokemon.evs)) {
      if (value > 252) {
        errors.push(`${pokemon.name} has too many EVs in ${stat} (${value}/252)`);
      }
    }

    for (const [stat, value] of Object.entries(pokemon.ivs)) {
      if (value < 0 || value > 31) {
        errors.push(`${pokemon.name} has invalid IV in ${stat} (${value})`);
      }
    }

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

module.exports = {
  ALLOWED_ICON_SOURCES,
  POKEDEX,
  buildPokemon,
  buildTeam,
  validateTeam,
  getPokedexEntry,
  listAvailablePokemon,
  normalizeIcon,
};
