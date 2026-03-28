const { POKEDEX, MOVES, buildTeam, validateTeam } = require('../src');
const { Battle } = require('../src/battle');
const { InfoGatherer } = require('../src/infoGatherer');

function buildCatalog() {
  return Object.entries(POKEDEX).map(([id, entry]) => ({
    id,
    ...entry,
    moveOptions: Object.entries(MOVES)
      .filter(([, move]) => move.power > 0 || move.category === 'status')
      .map(([moveId, move]) => ({
        id: moveId,
        name: move.name,
        type: move.type,
        category: move.category,
      })),
    baseStatTotal: Object.values(entry.baseStats).reduce((sum, value) => sum + value, 0),
  }));
}

function normalizeBattleRequest(body) {
  const playerTeam = buildTeam(body.playerTeam || []);
  const opponentTeam = buildTeam(body.opponentTeam || []);
  if (!playerTeam || !opponentTeam) {
    return { error: 'Invalid team payload. Check species IDs and moves.' };
  }
  const playerValidation = validateTeam(playerTeam);
  const opponentValidation = validateTeam(opponentTeam);
  if (!playerValidation.valid || !opponentValidation.valid) {
    return { error: 'Team validation failed.', details: { player: playerValidation.errors, opponent: opponentValidation.errors } };
  }
  return { playerTeam, opponentTeam };
}

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  try {
    if (req.method === 'GET' && pathname === '/api/health') {
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'GET' && pathname === '/api/pokedex') {
      return res.status(200).json({ pokemon: buildCatalog() });
    }

    if (req.method === 'GET' && pathname === '/api/moves') {
      return res.status(200).json({ moves: MOVES });
    }

    if (req.method === 'POST' && pathname === '/api/teams/validate') {
      const team = buildTeam(req.body.team || []);
      if (!team) return res.status(400).json({ valid: false, errors: ['Invalid team payload.'] });
      return res.status(200).json(validateTeam(team));
    }

    if (req.method === 'POST' && pathname === '/api/battle/preview') {
      const normalized = normalizeBattleRequest(req.body);
      if (normalized.error) return res.status(400).json(normalized);
      const battle = new Battle(normalized.playerTeam, normalized.opponentTeam);
      const intel = new InfoGatherer(battle).getFullIntel('player1');
      return res.status(200).json({ battleState: battle.getBattleState(), intel });
    }

    if (req.method === 'POST' && pathname === '/api/battle/simulate-turn') {
      const normalized = normalizeBattleRequest(req.body);
      if (normalized.error) return res.status(400).json(normalized);
      const battle = new Battle(normalized.playerTeam, normalized.opponentTeam);
      const playerAction = req.body.playerAction || { type: 'move', moveId: normalized.playerTeam[0].moves[0] };
      const opponentAction = req.body.opponentAction || { type: 'move', moveId: normalized.opponentTeam[0].moves[0] };
      battle.executeTurn(playerAction, opponentAction);
      return res.status(200).json({ battleState: battle.getBattleState(), log: battle.log, intel: new InfoGatherer(battle).getFullIntel('player1') });
    }

    return res.status(404).json({ error: 'Not found' });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
