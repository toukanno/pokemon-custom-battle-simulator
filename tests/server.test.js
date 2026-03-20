const { buildCatalog, buildBattlePreview, buildTurnSimulation } = require('../server');

describe('server helpers', () => {
  test('buildCatalog exposes pokedex entries with BST', () => {
    const catalog = buildCatalog();
    const charizard = catalog.find((entry) => entry.id === 'charizard');

    expect(Array.isArray(catalog)).toBe(true);
    expect(charizard).toBeDefined();
    expect(charizard.baseStatTotal).toBe(534);
    expect(charizard.moveOptions.length).toBeGreaterThan(0);
  });

  test('buildBattlePreview returns intel for valid teams', () => {
    const result = buildBattlePreview({
      playerTeam: [
        { species: 'charizard', moves: ['flamethrower', 'dragonClaw', 'earthquake', 'protect'] },
      ],
      opponentTeam: [
        { species: 'venusaur', moves: ['leafBlade', 'toxic', 'recover', 'earthquake'] },
      ],
    });

    expect(result.statusCode).toBe(200);
    expect(result.payload.battleState.turn).toBe(0);
    expect(result.payload.intel.bestMoves[0].moveId).toBe('flamethrower');
  });

  test('buildTurnSimulation executes one turn and returns log', () => {
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);

    const result = buildTurnSimulation({
      playerTeam: [
        { species: 'pikachu', moves: ['quickAttack', 'thunderbolt', 'ironTail', 'protect'] },
      ],
      opponentTeam: [
        { species: 'gengar', moves: ['shadowBall', 'thunderbolt', 'toxic', 'protect'] },
      ],
      playerAction: { type: 'move', moveId: 'quickAttack' },
      opponentAction: { type: 'move', moveId: 'shadowBall' },
    });

    randomSpy.mockRestore();

    expect(result.statusCode).toBe(200);
    expect(result.payload.battleState.turn).toBe(1);
    expect(result.payload.log).toContain('Pikachu used Quick Attack!');
    expect(result.payload.log.some((entry) => entry.includes('damage'))).toBe(true);
  });

  test('buildBattlePreview rejects invalid team payload', () => {
    const result = buildBattlePreview({
      playerTeam: [{ species: 'missingno', moves: ['tackle'] }],
      opponentTeam: [{ species: 'pikachu', moves: ['thunderbolt'] }],
    });

    expect(result.statusCode).toBe(400);
    expect(result.payload.error).toMatch(/Invalid team payload/);
  });
});
