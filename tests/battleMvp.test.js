const { Battle } = require('../src/battle');
const { buildPokemon } = require('../src/teambuilder');

function createPokemon(species, moves) {
  return buildPokemon(species, { moves, level: 50 });
}

describe('Battle MVP flow', () => {
  test('battle ends immediately when the last opposing Pokemon faints before end-of-turn effects', () => {
    const player1 = [createPokemon('pikachu', ['quickAttack'])];
    const player2 = [createPokemon('gengar', ['shadowBall'])];

    player1[0].status = 'burn';
    player2[0].currentHp = 1;

    const battle = new Battle(player1, player2);

    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);

    battle.executeTurn(
      { type: 'move', moveId: 'quickAttack' },
      { type: 'move', moveId: 'shadowBall' }
    );

    randomSpy.mockRestore();

    expect(battle.isOver).toBe(true);
    expect(battle.winner).toBe('player1');
    expect(battle.player1.active.isAlive).toBe(true);
    expect(battle.log).not.toContainEqual(expect.stringContaining('was hurt by its burn'));
    expect(battle.log).toContain('Player 1 wins!');
  });
});
