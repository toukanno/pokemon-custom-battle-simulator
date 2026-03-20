const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const { POKEDEX, MOVES, buildTeam, validateTeam } = require('./src');
const { Battle } = require('./src/battle');
const { InfoGatherer } = require('./src/infoGatherer');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
};

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

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        reject(new Error('Payload too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': MIME_TYPES['.json'],
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(payload, null, 2));
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
    return {
      error: 'Team validation failed.',
      details: {
        player: playerValidation.errors,
        opponent: opponentValidation.errors,
      },
    };
  }

  return { playerTeam, opponentTeam };
}

function buildBattlePreview(body) {
  const normalized = normalizeBattleRequest(body);
  if (normalized.error) {
    return { statusCode: 400, payload: normalized };
  }

  const battle = new Battle(normalized.playerTeam, normalized.opponentTeam);
  const intel = new InfoGatherer(battle).getFullIntel('player1');

  return {
    statusCode: 200,
    payload: {
      battleState: battle.getBattleState(),
      intel,
    },
  };
}

function buildTurnSimulation(body) {
  const normalized = normalizeBattleRequest(body);
  if (normalized.error) {
    return { statusCode: 400, payload: normalized };
  }

  const battle = new Battle(normalized.playerTeam, normalized.opponentTeam);
  const playerAction = body.playerAction || { type: 'move', moveId: normalized.playerTeam[0].moves[0] };
  const opponentAction = body.opponentAction || { type: 'move', moveId: normalized.opponentTeam[0].moves[0] };

  battle.executeTurn(playerAction, opponentAction);

  return {
    statusCode: 200,
    payload: {
      battleState: battle.getBattleState(),
      log: battle.log,
      intel: new InfoGatherer(battle).getFullIntel('player1'),
    },
  };
}

async function handleApiRequest(req, res, pathname) {
  if (req.method === 'GET' && pathname === '/api/health') {
    sendJson(res, 200, { ok: true });
    return true;
  }

  if (req.method === 'GET' && pathname === '/api/pokedex') {
    sendJson(res, 200, { pokemon: buildCatalog() });
    return true;
  }

  if (req.method === 'GET' && pathname === '/api/moves') {
    sendJson(res, 200, { moves: MOVES });
    return true;
  }

  if (req.method === 'POST' && pathname === '/api/teams/validate') {
    const body = await readJsonBody(req);
    const team = buildTeam(body.team || []);
    if (!team) {
      sendJson(res, 400, { valid: false, errors: ['Invalid team payload.'] });
      return true;
    }
    sendJson(res, 200, validateTeam(team));
    return true;
  }

  if (req.method === 'POST' && pathname === '/api/battle/preview') {
    const result = buildBattlePreview(await readJsonBody(req));
    sendJson(res, result.statusCode, result.payload);
    return true;
  }

  if (req.method === 'POST' && pathname === '/api/battle/simulate-turn') {
    const result = buildTurnSimulation(await readJsonBody(req));
    sendJson(res, result.statusCode, result.payload);
    return true;
  }

  return false;
}

function resolveStaticPath(pathname) {
  const relativePath = pathname === '/' ? '/index.html' : pathname;
  const safePath = path.normalize(relativePath).replace(/^\.+/, '');
  return path.join(__dirname, safePath);
}

function serveStaticFile(res, pathname) {
  const filePath = resolveStaticPath(pathname);
  if (!filePath.startsWith(__dirname)) {
    sendJson(res, 403, { error: 'Forbidden' });
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      sendJson(res, 404, { error: 'Not found' });
      return;
    }

    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

function createServer() {
  return http.createServer(async (req, res) => {
    try {
      const { pathname } = new URL(req.url, 'http://localhost');
      const handled = await handleApiRequest(req, res, pathname);
      if (!handled) {
        serveStaticFile(res, pathname);
      }
    } catch (error) {
      sendJson(res, 500, { error: error.message || 'Internal server error' });
    }
  });
}

function startServer(port = Number(process.env.PORT) || 3000) {
  const server = createServer();
  server.listen(port, () => {
    console.log(`Pokemon Custom Battle Simulator listening on http://localhost:${port}`);
  });
  return server;
}

if (require.main === module) {
  startServer();
}

module.exports = {
  buildCatalog,
  buildBattlePreview,
  buildTurnSimulation,
  createServer,
  startServer,
};
