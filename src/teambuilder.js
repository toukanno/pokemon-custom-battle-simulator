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
  // Generation 1
  bulbasaur: {
    name: 'Bulbasaur',
    types: [TYPES.GRASS, TYPES.POISON],
    baseStats: { hp: 45, attack: 49, defense: 49, specialAttack: 65, specialDefense: 65, speed: 45 },
    generation: 1,
  },
  charmander: {
    name: 'Charmander',
    types: [TYPES.FIRE],
    baseStats: { hp: 39, attack: 52, defense: 43, specialAttack: 60, specialDefense: 50, speed: 65 },
    generation: 1,
  },
  squirtle: {
    name: 'Squirtle',
    types: [TYPES.WATER],
    baseStats: { hp: 44, attack: 48, defense: 65, specialAttack: 50, specialDefense: 64, speed: 43 },
    generation: 1,
  },
  butterfree: {
    name: 'Butterfree',
    types: [TYPES.BUG, TYPES.FLYING],
    baseStats: { hp: 60, attack: 45, defense: 50, specialAttack: 90, specialDefense: 80, speed: 70 },
    generation: 1,
  },
  beedrill: {
    name: 'Beedrill',
    types: [TYPES.BUG, TYPES.POISON],
    baseStats: { hp: 65, attack: 90, defense: 40, specialAttack: 45, specialDefense: 80, speed: 75 },
    generation: 1,
  },
  pidgeot: {
    name: 'Pidgeot',
    types: [TYPES.NORMAL, TYPES.FLYING],
    baseStats: { hp: 83, attack: 80, defense: 75, specialAttack: 70, specialDefense: 70, speed: 101 },
    generation: 1,
  },
  raichu: {
    name: 'Raichu',
    types: [TYPES.ELECTRIC],
    baseStats: { hp: 60, attack: 90, defense: 55, specialAttack: 90, specialDefense: 80, speed: 110 },
    generation: 1,
  },
  nidoking: {
    name: 'Nidoking',
    types: [TYPES.POISON, TYPES.GROUND],
    baseStats: { hp: 81, attack: 102, defense: 77, specialAttack: 85, specialDefense: 75, speed: 85 },
    generation: 1,
  },
  nidoqueen: {
    name: 'Nidoqueen',
    types: [TYPES.POISON, TYPES.GROUND],
    baseStats: { hp: 90, attack: 92, defense: 87, specialAttack: 75, specialDefense: 85, speed: 76 },
    generation: 1,
  },
  clefable: {
    name: 'Clefable',
    types: [TYPES.FAIRY],
    baseStats: { hp: 95, attack: 70, defense: 73, specialAttack: 95, specialDefense: 90, speed: 60 },
    generation: 1,
  },
  arcanine: {
    name: 'Arcanine',
    types: [TYPES.FIRE],
    baseStats: { hp: 90, attack: 110, defense: 80, specialAttack: 100, specialDefense: 80, speed: 95 },
    generation: 1,
  },
  alakazam: {
    name: 'Alakazam',
    types: [TYPES.PSYCHIC],
    baseStats: { hp: 55, attack: 50, defense: 45, specialAttack: 135, specialDefense: 95, speed: 120 },
    generation: 1,
  },
  machamp: {
    name: 'Machamp',
    types: [TYPES.FIGHTING],
    baseStats: { hp: 90, attack: 130, defense: 80, specialAttack: 65, specialDefense: 85, speed: 55 },
    generation: 1,
  },
  golem: {
    name: 'Golem',
    types: [TYPES.ROCK, TYPES.GROUND],
    baseStats: { hp: 80, attack: 120, defense: 130, specialAttack: 55, specialDefense: 65, speed: 45 },
    generation: 1,
  },
  slowbro: {
    name: 'Slowbro',
    types: [TYPES.WATER, TYPES.PSYCHIC],
    baseStats: { hp: 95, attack: 75, defense: 110, specialAttack: 100, specialDefense: 80, speed: 30 },
    generation: 1,
  },
  magneton: {
    name: 'Magneton',
    types: [TYPES.ELECTRIC, TYPES.STEEL],
    baseStats: { hp: 50, attack: 60, defense: 95, specialAttack: 120, specialDefense: 70, speed: 70 },
    generation: 1,
  },
  muk: {
    name: 'Muk',
    types: [TYPES.POISON],
    baseStats: { hp: 105, attack: 105, defense: 75, specialAttack: 65, specialDefense: 100, speed: 50 },
    generation: 1,
  },
  cloyster: {
    name: 'Cloyster',
    types: [TYPES.WATER, TYPES.ICE],
    baseStats: { hp: 50, attack: 95, defense: 180, specialAttack: 85, specialDefense: 45, speed: 70 },
    generation: 1,
  },
  hypno: {
    name: 'Hypno',
    types: [TYPES.PSYCHIC],
    baseStats: { hp: 85, attack: 73, defense: 70, specialAttack: 115, specialDefense: 115, speed: 67 },
    generation: 1,
  },
  exeggutor: {
    name: 'Exeggutor',
    types: [TYPES.GRASS, TYPES.PSYCHIC],
    baseStats: { hp: 95, attack: 95, defense: 85, specialAttack: 125, specialDefense: 75, speed: 55 },
    generation: 1,
  },
  hitmonlee: {
    name: 'Hitmonlee',
    types: [TYPES.FIGHTING],
    baseStats: { hp: 50, attack: 120, defense: 53, specialAttack: 35, specialDefense: 110, speed: 87 },
    generation: 1,
  },
  weezing: {
    name: 'Weezing',
    types: [TYPES.POISON],
    baseStats: { hp: 65, attack: 90, defense: 120, specialAttack: 85, specialDefense: 70, speed: 60 },
    generation: 1,
  },
  kangaskhan: {
    name: 'Kangaskhan',
    types: [TYPES.NORMAL],
    baseStats: { hp: 105, attack: 95, defense: 80, specialAttack: 40, specialDefense: 80, speed: 90 },
    generation: 1,
  },
  starmie: {
    name: 'Starmie',
    types: [TYPES.WATER, TYPES.PSYCHIC],
    baseStats: { hp: 60, attack: 75, defense: 85, specialAttack: 100, specialDefense: 85, speed: 115 },
    generation: 1,
  },
  mrMime: {
    name: 'Mr. Mime',
    types: [TYPES.PSYCHIC, TYPES.FAIRY],
    baseStats: { hp: 40, attack: 45, defense: 65, specialAttack: 100, specialDefense: 120, speed: 90 },
    generation: 1,
  },
  jynx: {
    name: 'Jynx',
    types: [TYPES.ICE, TYPES.PSYCHIC],
    baseStats: { hp: 65, attack: 50, defense: 35, specialAttack: 115, specialDefense: 95, speed: 95 },
    generation: 1,
  },
  electabuzz: {
    name: 'Electabuzz',
    types: [TYPES.ELECTRIC],
    baseStats: { hp: 65, attack: 83, defense: 57, specialAttack: 95, specialDefense: 85, speed: 105 },
    generation: 1,
  },
  magmar: {
    name: 'Magmar',
    types: [TYPES.FIRE],
    baseStats: { hp: 65, attack: 95, defense: 57, specialAttack: 100, specialDefense: 85, speed: 93 },
    generation: 1,
  },
  tauros: {
    name: 'Tauros',
    types: [TYPES.NORMAL],
    baseStats: { hp: 75, attack: 100, defense: 95, specialAttack: 40, specialDefense: 70, speed: 110 },
    generation: 1,
  },
  gyarados: {
    name: 'Gyarados',
    types: [TYPES.WATER, TYPES.FLYING],
    baseStats: { hp: 95, attack: 125, defense: 79, specialAttack: 60, specialDefense: 100, speed: 81 },
    generation: 1,
  },
  lapras: {
    name: 'Lapras',
    types: [TYPES.WATER, TYPES.ICE],
    baseStats: { hp: 130, attack: 85, defense: 80, specialAttack: 85, specialDefense: 95, speed: 60 },
    generation: 1,
  },
  vaporeon: {
    name: 'Vaporeon',
    types: [TYPES.WATER],
    baseStats: { hp: 130, attack: 65, defense: 60, specialAttack: 110, specialDefense: 95, speed: 65 },
    generation: 1,
  },
  jolteon: {
    name: 'Jolteon',
    types: [TYPES.ELECTRIC],
    baseStats: { hp: 65, attack: 65, defense: 60, specialAttack: 110, specialDefense: 95, speed: 130 },
    generation: 1,
  },
  flareon: {
    name: 'Flareon',
    types: [TYPES.FIRE],
    baseStats: { hp: 65, attack: 130, defense: 60, specialAttack: 95, specialDefense: 110, speed: 65 },
    generation: 1,
  },
  aerodactyl: {
    name: 'Aerodactyl',
    types: [TYPES.ROCK, TYPES.FLYING],
    baseStats: { hp: 80, attack: 105, defense: 65, specialAttack: 60, specialDefense: 75, speed: 150 },
    generation: 1,
  },
  // Generation 2
  typhlosion: {
    name: 'Typhlosion',
    types: [TYPES.FIRE],
    baseStats: { hp: 78, attack: 84, defense: 78, specialAttack: 109, specialDefense: 85, speed: 100 },
    generation: 2,
  },
  feraligatr: {
    name: 'Feraligatr',
    types: [TYPES.WATER],
    baseStats: { hp: 85, attack: 105, defense: 100, specialAttack: 79, specialDefense: 83, speed: 78 },
    generation: 2,
  },
  meganium: {
    name: 'Meganium',
    types: [TYPES.GRASS],
    baseStats: { hp: 80, attack: 82, defense: 100, specialAttack: 83, specialDefense: 100, speed: 80 },
    generation: 2,
  },
  ampharos: {
    name: 'Ampharos',
    types: [TYPES.ELECTRIC],
    baseStats: { hp: 90, attack: 75, defense: 85, specialAttack: 115, specialDefense: 90, speed: 55 },
    generation: 2,
  },
  espeon: {
    name: 'Espeon',
    types: [TYPES.PSYCHIC],
    baseStats: { hp: 65, attack: 65, defense: 60, specialAttack: 130, specialDefense: 95, speed: 110 },
    generation: 2,
  },
  umbreon: {
    name: 'Umbreon',
    types: [TYPES.DARK],
    baseStats: { hp: 95, attack: 65, defense: 110, specialAttack: 60, specialDefense: 130, speed: 65 },
    generation: 2,
  },
  scizor: {
    name: 'Scizor',
    types: [TYPES.BUG, TYPES.STEEL],
    baseStats: { hp: 70, attack: 130, defense: 100, specialAttack: 55, specialDefense: 80, speed: 65 },
    generation: 2,
  },
  heracross: {
    name: 'Heracross',
    types: [TYPES.BUG, TYPES.FIGHTING],
    baseStats: { hp: 80, attack: 125, defense: 75, specialAttack: 40, specialDefense: 95, speed: 85 },
    generation: 2,
  },
  skarmory: {
    name: 'Skarmory',
    types: [TYPES.STEEL, TYPES.FLYING],
    baseStats: { hp: 65, attack: 80, defense: 140, specialAttack: 40, specialDefense: 70, speed: 70 },
    generation: 2,
  },
  houndoom: {
    name: 'Houndoom',
    types: [TYPES.DARK, TYPES.FIRE],
    baseStats: { hp: 75, attack: 90, defense: 50, specialAttack: 110, specialDefense: 80, speed: 95 },
    generation: 2,
  },
  kingdra: {
    name: 'Kingdra',
    types: [TYPES.WATER, TYPES.DRAGON],
    baseStats: { hp: 75, attack: 95, defense: 95, specialAttack: 95, specialDefense: 95, speed: 85 },
    generation: 2,
  },
  donphan: {
    name: 'Donphan',
    types: [TYPES.GROUND],
    baseStats: { hp: 90, attack: 120, defense: 120, specialAttack: 60, specialDefense: 60, speed: 50 },
    generation: 2,
  },
  tyranitar: {
    name: 'Tyranitar',
    types: [TYPES.ROCK, TYPES.DARK],
    baseStats: { hp: 100, attack: 134, defense: 110, specialAttack: 95, specialDefense: 100, speed: 61 },
    generation: 2,
  },
  blissey: {
    name: 'Blissey',
    types: [TYPES.NORMAL],
    baseStats: { hp: 255, attack: 10, defense: 10, specialAttack: 75, specialDefense: 135, speed: 55 },
    generation: 2,
  },
  steelix: {
    name: 'Steelix',
    types: [TYPES.STEEL, TYPES.GROUND],
    baseStats: { hp: 75, attack: 85, defense: 200, specialAttack: 55, specialDefense: 65, speed: 30 },
    generation: 2,
  },
  // Generation 3
  blaziken: {
    name: 'Blaziken',
    types: [TYPES.FIRE, TYPES.FIGHTING],
    baseStats: { hp: 80, attack: 120, defense: 70, specialAttack: 110, specialDefense: 70, speed: 80 },
    generation: 3,
  },
  swampert: {
    name: 'Swampert',
    types: [TYPES.WATER, TYPES.GROUND],
    baseStats: { hp: 100, attack: 110, defense: 90, specialAttack: 85, specialDefense: 90, speed: 60 },
    generation: 3,
  },
  sceptile: {
    name: 'Sceptile',
    types: [TYPES.GRASS],
    baseStats: { hp: 70, attack: 85, defense: 65, specialAttack: 105, specialDefense: 85, speed: 120 },
    generation: 3,
  },
  gardevoir: {
    name: 'Gardevoir',
    types: [TYPES.PSYCHIC, TYPES.FAIRY],
    baseStats: { hp: 68, attack: 65, defense: 65, specialAttack: 125, specialDefense: 115, speed: 80 },
    generation: 3,
  },
  aggron: {
    name: 'Aggron',
    types: [TYPES.STEEL, TYPES.ROCK],
    baseStats: { hp: 70, attack: 110, defense: 180, specialAttack: 60, specialDefense: 60, speed: 50 },
    generation: 3,
  },
  flygon: {
    name: 'Flygon',
    types: [TYPES.GROUND, TYPES.DRAGON],
    baseStats: { hp: 80, attack: 100, defense: 80, specialAttack: 80, specialDefense: 80, speed: 100 },
    generation: 3,
  },
  milotic: {
    name: 'Milotic',
    types: [TYPES.WATER],
    baseStats: { hp: 95, attack: 60, defense: 79, specialAttack: 100, specialDefense: 125, speed: 81 },
    generation: 3,
  },
  salamence: {
    name: 'Salamence',
    types: [TYPES.DRAGON, TYPES.FLYING],
    baseStats: { hp: 95, attack: 135, defense: 80, specialAttack: 110, specialDefense: 80, speed: 100 },
    generation: 3,
  },
  metagross: {
    name: 'Metagross',
    types: [TYPES.STEEL, TYPES.PSYCHIC],
    baseStats: { hp: 80, attack: 135, defense: 130, specialAttack: 95, specialDefense: 90, speed: 70 },
    generation: 3,
  },
  absol: {
    name: 'Absol',
    types: [TYPES.DARK],
    baseStats: { hp: 65, attack: 130, defense: 60, specialAttack: 75, specialDefense: 60, speed: 75 },
    generation: 3,
  },
  manectric: {
    name: 'Manectric',
    types: [TYPES.ELECTRIC],
    baseStats: { hp: 70, attack: 75, defense: 60, specialAttack: 105, specialDefense: 60, speed: 105 },
    generation: 3,
  },
  breloom: {
    name: 'Breloom',
    types: [TYPES.GRASS, TYPES.FIGHTING],
    baseStats: { hp: 60, attack: 130, defense: 80, specialAttack: 60, specialDefense: 60, speed: 70 },
    generation: 3,
  },
  wailord: {
    name: 'Wailord',
    types: [TYPES.WATER],
    baseStats: { hp: 170, attack: 90, defense: 45, specialAttack: 90, specialDefense: 45, speed: 60 },
    generation: 3,
  },
  camerupt: {
    name: 'Camerupt',
    types: [TYPES.FIRE, TYPES.GROUND],
    baseStats: { hp: 70, attack: 100, defense: 70, specialAttack: 105, specialDefense: 75, speed: 40 },
    generation: 3,
  },
  banette: {
    name: 'Banette',
    types: [TYPES.GHOST],
    baseStats: { hp: 64, attack: 115, defense: 65, specialAttack: 83, specialDefense: 63, speed: 65 },
    generation: 3,
  },
  // Generation 4
  infernape: {
    name: 'Infernape',
    types: [TYPES.FIRE, TYPES.FIGHTING],
    baseStats: { hp: 76, attack: 104, defense: 71, specialAttack: 104, specialDefense: 71, speed: 108 },
    generation: 4,
  },
  empoleon: {
    name: 'Empoleon',
    types: [TYPES.WATER, TYPES.STEEL],
    baseStats: { hp: 84, attack: 86, defense: 88, specialAttack: 111, specialDefense: 101, speed: 60 },
    generation: 4,
  },
  torterra: {
    name: 'Torterra',
    types: [TYPES.GRASS, TYPES.GROUND],
    baseStats: { hp: 95, attack: 109, defense: 105, specialAttack: 75, specialDefense: 85, speed: 56 },
    generation: 4,
  },
  staraptor: {
    name: 'Staraptor',
    types: [TYPES.NORMAL, TYPES.FLYING],
    baseStats: { hp: 85, attack: 120, defense: 70, specialAttack: 50, specialDefense: 60, speed: 100 },
    generation: 4,
  },
  luxray: {
    name: 'Luxray',
    types: [TYPES.ELECTRIC],
    baseStats: { hp: 80, attack: 120, defense: 79, specialAttack: 95, specialDefense: 79, speed: 70 },
    generation: 4,
  },
  roserade: {
    name: 'Roserade',
    types: [TYPES.GRASS, TYPES.POISON],
    baseStats: { hp: 60, attack: 70, defense: 65, specialAttack: 125, specialDefense: 105, speed: 90 },
    generation: 4,
  },
  gastrodon: {
    name: 'Gastrodon',
    types: [TYPES.WATER, TYPES.GROUND],
    baseStats: { hp: 111, attack: 83, defense: 68, specialAttack: 92, specialDefense: 82, speed: 39 },
    generation: 4,
  },
  spiritomb: {
    name: 'Spiritomb',
    types: [TYPES.GHOST, TYPES.DARK],
    baseStats: { hp: 50, attack: 92, defense: 108, specialAttack: 92, specialDefense: 108, speed: 35 },
    generation: 4,
  },
  weavile: {
    name: 'Weavile',
    types: [TYPES.DARK, TYPES.ICE],
    baseStats: { hp: 70, attack: 120, defense: 65, specialAttack: 45, specialDefense: 85, speed: 125 },
    generation: 4,
  },
  magnezone: {
    name: 'Magnezone',
    types: [TYPES.ELECTRIC, TYPES.STEEL],
    baseStats: { hp: 70, attack: 70, defense: 115, specialAttack: 130, specialDefense: 90, speed: 60 },
    generation: 4,
  },
  electivire: {
    name: 'Electivire',
    types: [TYPES.ELECTRIC],
    baseStats: { hp: 75, attack: 123, defense: 67, specialAttack: 95, specialDefense: 85, speed: 95 },
    generation: 4,
  },
  magmortar: {
    name: 'Magmortar',
    types: [TYPES.FIRE],
    baseStats: { hp: 75, attack: 95, defense: 67, specialAttack: 125, specialDefense: 95, speed: 83 },
    generation: 4,
  },
  gliscor: {
    name: 'Gliscor',
    types: [TYPES.GROUND, TYPES.FLYING],
    baseStats: { hp: 75, attack: 95, defense: 125, specialAttack: 45, specialDefense: 75, speed: 95 },
    generation: 4,
  },
  mamoswine: {
    name: 'Mamoswine',
    types: [TYPES.ICE, TYPES.GROUND],
    baseStats: { hp: 110, attack: 130, defense: 80, specialAttack: 70, specialDefense: 60, speed: 80 },
    generation: 4,
  },
  gallade: {
    name: 'Gallade',
    types: [TYPES.PSYCHIC, TYPES.FIGHTING],
    baseStats: { hp: 68, attack: 125, defense: 65, specialAttack: 65, specialDefense: 115, speed: 80 },
    generation: 4,
  },
  // Generation 5
  haxorus: {
    name: 'Haxorus',
    types: [TYPES.DRAGON],
    baseStats: { hp: 76, attack: 147, defense: 90, specialAttack: 60, specialDefense: 70, speed: 97 },
    generation: 5,
  },
  hydreigon: {
    name: 'Hydreigon',
    types: [TYPES.DARK, TYPES.DRAGON],
    baseStats: { hp: 92, attack: 105, defense: 90, specialAttack: 125, specialDefense: 90, speed: 98 },
    generation: 5,
  },
  volcarona: {
    name: 'Volcarona',
    types: [TYPES.BUG, TYPES.FIRE],
    baseStats: { hp: 85, attack: 60, defense: 65, specialAttack: 135, specialDefense: 105, speed: 100 },
    generation: 5,
  },
  excadrill: {
    name: 'Excadrill',
    types: [TYPES.GROUND, TYPES.STEEL],
    baseStats: { hp: 110, attack: 135, defense: 60, specialAttack: 50, specialDefense: 65, speed: 88 },
    generation: 5,
  },
  chandelure: {
    name: 'Chandelure',
    types: [TYPES.GHOST, TYPES.FIRE],
    baseStats: { hp: 60, attack: 55, defense: 90, specialAttack: 145, specialDefense: 90, speed: 80 },
    generation: 5,
  },
  conkeldurr: {
    name: 'Conkeldurr',
    types: [TYPES.FIGHTING],
    baseStats: { hp: 105, attack: 140, defense: 95, specialAttack: 55, specialDefense: 65, speed: 45 },
    generation: 5,
  },
  reuniclus: {
    name: 'Reuniclus',
    types: [TYPES.PSYCHIC],
    baseStats: { hp: 110, attack: 65, defense: 75, specialAttack: 125, specialDefense: 85, speed: 30 },
    generation: 5,
  },
  ferrothorn: {
    name: 'Ferrothorn',
    types: [TYPES.GRASS, TYPES.STEEL],
    baseStats: { hp: 74, attack: 94, defense: 131, specialAttack: 54, specialDefense: 116, speed: 20 },
    generation: 5,
  },
  bisharp: {
    name: 'Bisharp',
    types: [TYPES.DARK, TYPES.STEEL],
    baseStats: { hp: 65, attack: 125, defense: 100, specialAttack: 60, specialDefense: 70, speed: 70 },
    generation: 5,
  },
  zoroark: {
    name: 'Zoroark',
    types: [TYPES.DARK],
    baseStats: { hp: 60, attack: 105, defense: 60, specialAttack: 120, specialDefense: 60, speed: 105 },
    generation: 5,
  },
  // Generation 6
  greninja: {
    name: 'Greninja',
    types: [TYPES.WATER, TYPES.DARK],
    baseStats: { hp: 72, attack: 95, defense: 67, specialAttack: 103, specialDefense: 71, speed: 122 },
    generation: 6,
  },
  talonflame: {
    name: 'Talonflame',
    types: [TYPES.FIRE, TYPES.FLYING],
    baseStats: { hp: 78, attack: 81, defense: 71, specialAttack: 74, specialDefense: 69, speed: 126 },
    generation: 6,
  },
  aegislash: {
    name: 'Aegislash',
    types: [TYPES.STEEL, TYPES.GHOST],
    baseStats: { hp: 60, attack: 50, defense: 140, specialAttack: 50, specialDefense: 140, speed: 60 },
    generation: 6,
  },
  goodra: {
    name: 'Goodra',
    types: [TYPES.DRAGON],
    baseStats: { hp: 90, attack: 100, defense: 70, specialAttack: 110, specialDefense: 150, speed: 80 },
    generation: 6,
  },
  sylveon: {
    name: 'Sylveon',
    types: [TYPES.FAIRY],
    baseStats: { hp: 95, attack: 65, defense: 65, specialAttack: 110, specialDefense: 130, speed: 60 },
    generation: 6,
  },
  // Generation 7
  mimikyu: {
    name: 'Mimikyu',
    types: [TYPES.GHOST, TYPES.FAIRY],
    baseStats: { hp: 55, attack: 90, defense: 80, specialAttack: 50, specialDefense: 105, speed: 96 },
    generation: 7,
  },
  toxapex: {
    name: 'Toxapex',
    types: [TYPES.POISON, TYPES.WATER],
    baseStats: { hp: 50, attack: 63, defense: 152, specialAttack: 53, specialDefense: 142, speed: 35 },
    generation: 7,
  },
  kommoo: {
    name: 'Kommo-o',
    types: [TYPES.DRAGON, TYPES.FIGHTING],
    baseStats: { hp: 75, attack: 110, defense: 125, specialAttack: 100, specialDefense: 105, speed: 85 },
    generation: 7,
  },
  decidueye: {
    name: 'Decidueye',
    types: [TYPES.GRASS, TYPES.GHOST],
    baseStats: { hp: 78, attack: 107, defense: 75, specialAttack: 100, specialDefense: 100, speed: 70 },
    generation: 7,
  },
  primarina: {
    name: 'Primarina',
    types: [TYPES.WATER, TYPES.FAIRY],
    baseStats: { hp: 80, attack: 74, defense: 74, specialAttack: 126, specialDefense: 116, speed: 60 },
    generation: 7,
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
    level: config.level ?? 50,
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

  if (!Array.isArray(team) || team.length === 0) {
    errors.push('Team must have at least 1 Pokemon');
    return { valid: false, errors };
  }

  if (team.length > 6) {
    errors.push('Team cannot have more than 6 Pokemon');
    return { valid: false, errors };
  }

  for (const pokemon of team) {
    if (!pokemon || typeof pokemon !== 'object') {
      errors.push('Team contains an invalid Pokemon entry');
      continue;
    }

    // Validate EV total
    const evTotal = Object.values(pokemon.evs || {}).reduce((sum, v) => sum + v, 0);
    if (evTotal > 510) {
      errors.push(`${pokemon.name} has too many EVs (${evTotal}/510)`);
    }

    // Validate individual EVs
    for (const [stat, value] of Object.entries(pokemon.evs || {})) {
      if (value < 0 || value > 252) {
        errors.push(`${pokemon.name} has invalid EV in ${stat} (${value})`);
      }
    }

    // Validate IVs
    for (const [stat, value] of Object.entries(pokemon.ivs || {})) {
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

function calculateBaseStatTotal(species) {
  return Object.values(species.baseStats).reduce((sum, value) => sum + value, 0);
}

function selectBestMovesForSpecies(species, movePool, moveCount = 4) {
  const scoredMoves = movePool
    .map(([moveId, move]) => {
      const stabBonus = species.types.includes(move.type) ? 1.5 : 1;
      const adjustedPower = (move.power || 0) * (move.accuracy ? move.accuracy / 100 : 1);
      return { moveId, score: adjustedPower * stabBonus };
    })
    .sort((a, b) => b.score - a.score);

  return scoredMoves.slice(0, moveCount).map(({ moveId }) => moveId);
}

function buildStJohnsSystemTeam(options = {}) {
  const teamSize = options.teamSize ?? 6;
  const level = options.level ?? 50;

  if (teamSize < 1 || teamSize > 6) return null;

  const movePool = Object.entries(MOVES).filter(([, move]) => move.power > 0);

  const rankedSpecies = Object.entries(POKEDEX)
    .map(([speciesId, species]) => ({
      speciesId,
      species,
      bst: calculateBaseStatTotal(species),
    }))
    .sort((a, b) => b.bst - a.bst);

  const selected = [];
  const coveredTypes = new Set();

  for (const candidate of rankedSpecies) {
    if (selected.length >= teamSize) break;

    const introducesNewType = candidate.species.types.some((type) => !coveredTypes.has(type));
    if (introducesNewType || selected.length + (rankedSpecies.length - selected.length) <= teamSize) {
      selected.push(candidate);
      for (const type of candidate.species.types) coveredTypes.add(type);
    }
  }

  while (selected.length < teamSize) {
    const next = rankedSpecies.find((candidate) => !selected.some((picked) => picked.speciesId === candidate.speciesId));
    if (!next) break;
    selected.push(next);
  }

  return buildTeam(
    selected.map(({ speciesId, species }) => ({
      species: speciesId,
      level,
      moves: selectBestMovesForSpecies(species, movePool, 4),
    }))
  );
}

module.exports = {
  POKEDEX,
  buildPokemon,
  buildTeam,
  validateTeam,
  getPokedexEntry,
  listAvailablePokemon,
  listPokemonByGeneration,
  filterPokedexByGeneration,
  listPokemonUpToGeneration,
  calculateBaseStatTotal,
  buildStJohnsSystemTeam,
};
