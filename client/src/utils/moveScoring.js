// Simple type effectiveness chart for STAB + coverage scoring
const TYPE_CHART = {
  fire: { grass: 2, water: 0.5, fire: 0.5, ice: 2, bug: 2, steel: 2, rock: 0.5, dragon: 0.5 },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  grass: { water: 2, fire: 0.5, grass: 0.5, ground: 2, rock: 2, flying: 0.5, poison: 0.5, bug: 0.5, steel: 0.5, dragon: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  ice: { grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, fire: 0.5, water: 0.5, steel: 0.5 },
  fighting: { normal: 2, ice: 2, rock: 2, dark: 2, steel: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, ghost: 0, fairy: 0.5 },
  poison: { grass: 2, fairy: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0 },
  ground: { fire: 2, electric: 2, poison: 2, rock: 2, steel: 2, grass: 0.5, bug: 0.5, flying: 0 },
  flying: { grass: 2, fighting: 2, bug: 2, electric: 0.5, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, steel: 0.5, dark: 0 },
  bug: { grass: 2, psychic: 2, dark: 2, fire: 0.5, fighting: 0.5, poison: 0.5, flying: 0.5, ghost: 0.5, steel: 0.5, fairy: 0.5 },
  rock: { fire: 2, ice: 2, flying: 2, bug: 2, fighting: 0.5, ground: 0.5, steel: 0.5 },
  ghost: { psychic: 2, ghost: 2, normal: 0, dark: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  dark: { psychic: 2, ghost: 2, fighting: 0.5, dark: 0.5, fairy: 0.5 },
  steel: { ice: 2, rock: 2, fairy: 2, fire: 0.5, water: 0.5, electric: 0.5, steel: 0.5 },
  fairy: { fighting: 2, dragon: 2, dark: 2, fire: 0.5, poison: 0.5, steel: 0.5 },
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
};

/**
 * Score a move for a Pokemon based on power, STAB, and type coverage.
 * Higher = better default pick.
 */
export function scoreMove(move, pokemonTypes) {
  if (!move || move.category === 'status') {
    // Status moves get a flat moderate score
    return 40;
  }

  let score = move.power || 0;

  // STAB bonus
  if (pokemonTypes.includes(move.type)) {
    score *= 1.5;
  }

  // Coverage bonus: count how many types this move is super-effective against
  const chart = TYPE_CHART[move.type];
  if (chart) {
    const superEffectiveCount = Object.values(chart).filter((v) => v >= 2).length;
    score += superEffectiveCount * 5;
  }

  return score;
}

/**
 * Auto-select the best 4 moves for a Pokemon from available moves.
 */
export function autoSelectMoves(allMoves, pokemonTypes) {
  const moveEntries = Object.entries(allMoves)
    .filter(([, m]) => m.power > 0 || m.category === 'status')
    .map(([id, m]) => ({ id, ...m, score: scoreMove(m, pokemonTypes) }));

  // Sort by score descending, take top 4
  moveEntries.sort((a, b) => b.score - a.score);

  // Prefer type diversity: pick moves of different types when scores are close
  const selected = [];
  const selectedTypes = new Set();

  // First pass: STAB moves
  for (const move of moveEntries) {
    if (selected.length >= 2) break;
    if (pokemonTypes.includes(move.type) && !selectedTypes.has(move.type)) {
      selected.push(move.id);
      selectedTypes.add(move.type);
    }
  }

  // Second pass: coverage moves
  for (const move of moveEntries) {
    if (selected.length >= 4) break;
    if (!selected.includes(move.id) && !selectedTypes.has(move.type)) {
      selected.push(move.id);
      selectedTypes.add(move.type);
    }
  }

  // Fill remaining slots
  for (const move of moveEntries) {
    if (selected.length >= 4) break;
    if (!selected.includes(move.id)) {
      selected.push(move.id);
    }
  }

  return selected;
}

/**
 * Calculate type coverage: which types can this team hit super-effectively?
 */
export function getTypeCoverage(teamMoveTypes) {
  const allTypes = Object.keys(TYPE_CHART);
  const covered = new Set();

  for (const attackType of teamMoveTypes) {
    const chart = TYPE_CHART[attackType];
    if (!chart) continue;
    for (const [defType, mult] of Object.entries(chart)) {
      if (mult >= 2) covered.add(defType);
    }
  }

  return {
    covered: [...covered],
    uncovered: allTypes.filter((t) => !covered.has(t)),
    total: allTypes.length,
  };
}
