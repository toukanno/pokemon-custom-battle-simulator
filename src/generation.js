const GENERATIONS = {
  1: {
    name: 'Generation I',
    region: 'Kanto',
    year: 1996,
    games: ['Red', 'Blue', 'Yellow'],
  },
  2: {
    name: 'Generation II',
    region: 'Johto',
    year: 1999,
    games: ['Gold', 'Silver', 'Crystal'],
  },
  3: {
    name: 'Generation III',
    region: 'Hoenn',
    year: 2002,
    games: ['Ruby', 'Sapphire', 'Emerald'],
  },
  4: {
    name: 'Generation IV',
    region: 'Sinnoh',
    year: 2006,
    games: ['Diamond', 'Pearl', 'Platinum'],
  },
  5: {
    name: 'Generation V',
    region: 'Unova',
    year: 2010,
    games: ['Black', 'White', 'Black 2', 'White 2'],
  },
  6: {
    name: 'Generation VI',
    region: 'Kalos',
    year: 2013,
    games: ['X', 'Y'],
  },
  7: {
    name: 'Generation VII',
    region: 'Alola',
    year: 2016,
    games: ['Sun', 'Moon', 'Ultra Sun', 'Ultra Moon'],
  },
  8: {
    name: 'Generation VIII',
    region: 'Galar',
    year: 2019,
    games: ['Sword', 'Shield'],
  },
  9: {
    name: 'Generation IX',
    region: 'Paldea',
    year: 2022,
    games: ['Scarlet', 'Violet'],
  },
};

function getGeneration(genNumber) {
  return GENERATIONS[genNumber] || null;
}

function getGenerationByYear(year) {
  const entries = Object.entries(GENERATIONS);
  for (let i = entries.length - 1; i >= 0; i--) {
    const [genNum, gen] = entries[i];
    if (gen.year <= year) {
      return { generation: Number(genNum), ...gen };
    }
  }
  return null;
}

function listGenerations() {
  return Object.entries(GENERATIONS).map(([num, gen]) => ({
    generation: Number(num),
    ...gen,
  }));
}

function getYearForGeneration(genNumber) {
  const gen = GENERATIONS[genNumber];
  return gen ? gen.year : null;
}

function isGenerationValid(genNumber) {
  return genNumber >= 1 && genNumber <= 9 && GENERATIONS[genNumber] !== undefined;
}

module.exports = { GENERATIONS, getGeneration, getGenerationByYear, listGenerations, getYearForGeneration, isGenerationValid };
