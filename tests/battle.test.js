const { Battle } = require('../src/battle');
const { buildPokemon } = require('../src/teambuilder');

function createPokemon(species, moves) {
  return buildPokemon(species, { moves, level: 50 });
}

describe('Battle', () => {
  test('consecutive Protect usage has reduced success chance', () => {
    const player1 = [createPokemon('pikachu', ['protect'])];
    const player2 = [createPokemon('gengar', ['quickAttack'])];

    const battle = new Battle(player1, player2);

    const randomSpy = jest
      .spyOn(Math, 'random')
      .mockReturnValueOnce(0) // turn1 p1 protect success
      .mockReturnValueOnce(0) // turn1 p2 accuracy check
      .mockReturnValueOnce(0.4) // turn2 p1 protect fails (1/3)
      .mockReturnValueOnce(0); // turn2 p2 accuracy check

    battle.executeTurn(
      { type: 'move', moveId: 'protect' },
      { type: 'move', moveId: 'quickAttack' }
    );

    battle.executeTurn(
      { type: 'move', moveId: 'protect' },
      { type: 'move', moveId: 'quickAttack' }
    );

    randomSpy.mockRestore();

    expect(battle.log).toContain("Pikachu's Protect failed!");
    expect(battle.log).toContain('Pikachu is protecting itself!');
  });

  test('fainted Pokemon does not execute its selected move later in the turn', () => {
    const player1 = [createPokemon('pikachu', ['quickAttack'])];
    const player2 = [createPokemon('gengar', ['shadowBall'])];
    player2[0].currentHp = 1;

    const battle = new Battle(player1, player2);

    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);

    battle.executeTurn(
      { type: 'move', moveId: 'quickAttack' },
      { type: 'move', moveId: 'shadowBall' }
    );

    randomSpy.mockRestore();

    expect(battle.player2.active.isAlive).toBe(false);
    expect(battle.log).not.toContain('Gengar used Shadow Ball!');
  });

  test('faint message is logged only once for the same Pokemon across turns', () => {
    const player1 = [createPokemon('pikachu', ['quickAttack'])];
    const player2 = [
      createPokemon('gengar', ['shadowBall']),
      createPokemon('blastoise', ['surf']),
    ];
    player2[0].currentHp = 1;

    const battle = new Battle(player1, player2);

    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);

    battle.executeTurn(
      { type: 'move', moveId: 'quickAttack' },
      { type: 'move', moveId: 'shadowBall' }
    );

    battle.executeTurn(
      { type: 'move', moveId: 'quickAttack' },
      { type: 'move', moveId: 'shadowBall' }
    );

    randomSpy.mockRestore();

    const faintLogs = battle.log.filter((entry) => entry === 'Gengar fainted!');
    expect(faintLogs).toHaveLength(1);
  });
});
