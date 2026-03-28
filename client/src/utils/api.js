const BASE = '';

export async function fetchPokedex() {
  const res = await fetch(`${BASE}/api/pokedex`);
  if (!res.ok) throw new Error('Failed to fetch pokedex');
  const data = await res.json();
  return data.pokemon;
}

export async function fetchMoves() {
  const res = await fetch(`${BASE}/api/moves`);
  if (!res.ok) throw new Error('Failed to fetch moves');
  const data = await res.json();
  return data.moves;
}

export async function startBattle(playerTeam, opponentTeam) {
  const res = await fetch(`${BASE}/api/battle/preview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerTeam, opponentTeam }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to start battle');
  }
  return res.json();
}

export async function simulateTurn(playerTeam, opponentTeam, playerAction, opponentAction) {
  const res = await fetch(`${BASE}/api/battle/simulate-turn`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerTeam, opponentTeam, playerAction, opponentAction }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to simulate turn');
  }
  return res.json();
}
