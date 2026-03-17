/**
 * ASCII Art sprites for the Pokemon Battle Simulator.
 * Includes all 10 Pokedex species with an angel-themed Togekiss centerpiece.
 */

const SPRITES = {
  togekiss: `
        .  *  .  *  .
     *    \\  |  /    *
        ---@@@---
       / %%=^=%%  \\
   ~~~/ %%( o o)%% \\~~~
  {   \\%%  \\_v_/ %%/   }
  {    \\%%% |_| %%%/    }
   ~~~  \\%%\\   /%%/  ~~~
    \\    \\%% | %%/    /
     \\    \\  |  /    /
      \\    \\ | /    /
       \\    \\|/    /
    ~~~~\\~~~***~~~~/~~~~
         \\  |||  /
          \\ ||| /
           \\||/
            \\/
    ~ The Angel Pokemon ~
  `,

  charizard: `
                  __       _
                /   \\    /  |
               |     \\__/   |
               |    __  __  |
              /   /    \\/  \\  \\
             |   | (o)  (o)|  |
              \\   \\   /\\   / /
        ~~~    \\   \\_/  \\_/ /
       /   \\    |          |
      / ~~~ \\   | \\~~~~~~/ |
     | /   \\ |  \\  \\~~~~/ /
     |/ ~~~ \\|   \\__\\  /__/
      \\ ~~~ /       /  \\
       \\   /     __/    \\__
        ---    /    \\  /   \\
              |      \\/     |
               \\___________/
  `,

  blastoise: `
           ___________
          /           \\
    ||   |  (o)   (o)  |   ||
    ||   |     ___     |   ||
    ||    \\   /   \\   /    ||
    ||=====\\ | === | /=====||
            \\|     |/
         ____\\_____/____
        /               \\
       /   ~~~~~~~~~~~   \\
      |   |           |   |
      |   |           |   |
       \\  |           |  /
        \\_|___________|_/
          |     |     |
         _|_   _|_   _|_
        /   \\ /   \\ /   \\
  `,

  venusaur: `
        \\  |  |  |  /
         \\_|__|__|_/
     @@  /  ~~~~  \\  @@
    @@@_/ ~~~~~~~~ \\_@@@
    @@/ ~~~~~~~~~~~~ \\@@
      |  (o)    (o)  |
      |    ______    |
       \\  |      |  /
     ___\\  \\____/  /___
    /    \\________/    \\
   /   /            \\   \\
  |   /   ~~~~~~~~   \\   |
  |  |                |  |
   \\_|________________|_/
     |    |      |    |
    _|_  _|_    _|_  _|_
  `,

  pikachu: `
       /\\      /\\
      /  \\    /  \\
     / .. \\  / .. \\
    |      \\/      |
    |   (o)  (o)   |
    |      __      |
     \\    /  \\    /
      \\  | uu |  /
       \\  \\__/  /
        \\______/
       /  |  |  \\
      /   |  |   \\
     / /| |  | |\\ \\
       \\|_|  |_|/
         |    |
        _|    |_
  `,

  gengar: `
      _______________
     /               \\
    /  /\\         /\\  \\
   |  /  \\       /  \\  |
   | | @  |     | @  | |
   |  \\  /       \\  /  |
    \\   \\/    ^    \\/   /
     |   \\  ===  /   |
     |    \\     /    |
      \\    \\___/    /
       \\  /     \\  /
        \\/       \\/
    ~~~ SHADOW ~~~
  `,

  dragonite: `
         ___     ___
        /   \\   /   \\
       | --- | | --- |
        \\___/ | \\___/
          |  _|_  |
         /  / o \\  \\
        |  | \\_/ |  |
     ___/   \\___/   \\___
    /   \\           /   \\
   / ~~~ \\    |    / ~~~ \\
  | /   \\ |   |   | /   \\ |
   \\ ~~~ /    |    \\ ~~~ /
    \\   /  ___|___  \\   /
     ---  |       |  ---
          |  | |  |
          |__|_|__|
  `,

  snorlax: `
       _______________
      /               \\
     /                 \\
    |  ---       ---    |
    |  |x|       |x|    |
    |  ---       ---    |
    |       ___         |
     \\     /   \\       /
      \\   | ZZZ |     /
    ___\\   \\___/   /___
   /                    \\
  |   ~~~~~~~~~~~~~~~~   |
  |   ~~~~~~~~~~~~~~~~   |
  |   ~~~~~~~~~~~~~~~~   |
   \\                    /
    \\__________________/
        |          |
       _|_        _|_
  `,

  garchomp: `
        /\\
       /  \\    __
      / /\\ \\  /  |
     / /  \\ \\/   |
    | |  (x) |   |
    | |   _  /  /
     \\ \\ |_|/  /
      \\ \\____/
    ___\\      /___
   / /  \\    /  \\ \\
  / / /\\ \\  / /\\ \\ \\
  \\ \\ \\/ /  \\ \\/ / /
   \\_\\__/    \\__/_/
      |   /\\   |
      |  /  \\  |
      |_/    \\_|
  `,

  lucario: `
         ___
        /   \\
       | o o |
       |  _  |
    __  \\/ \\/ __
   /  \\__| |__/  \\
  |  /   | |   \\  |
  | |    | |    | |
   \\|   /   \\   |/
    |  |     |  |
    |  | === |  |
     \\  \\   /  /
      \\  \\_/  /
       |  |  |
      /   |   \\
     /___ | ___\\
         |_|
  `,
};

/**
 * The Angel (天使) - a special mythical sprite
 * representing the ultimate angelic warrior.
 */
const ANGEL = `
              .     *     .
         *         |         *
      .      * --- * --- *      .
           /   \\       /   \\
     *    / ~~~ \\     / ~~~ \\    *
         / ~~~~~ \\   / ~~~~~ \\
        / ~~~~~~~ \\ / ~~~~~~~ \\
   ----/           V           \\----
       |                       |
   .   |     *           *     |   .
       |        \\     /        |
       |         (o o)         |
   *   |          )-(          |   *
       |         /   \\         |
        \\       | === |       /
   .     \\       \\   /       /     .
          \\       | |       /
           \\      | |      /
    --------\\_____|_|_____/--------
                  | |
            ____/ | | \\____
           /     /   \\     \\
          /     /     \\     \\
         /_____/       \\_____\\

     ~ 最強の天使 - The Strongest Angel ~
            あなたは最強です
`;

/**
 * Get the ASCII art sprite for a given Pokemon name.
 * @param {string} name - The Pokemon name (case-insensitive).
 * @returns {string} The ASCII art string, or a default message.
 */
function getSprite(name) {
  const key = name.toLowerCase();
  if (SPRITES[key]) {
    return SPRITES[key];
  }
  return `\n    [No sprite available for ${name}]\n`;
}

/**
 * Get the special Angel sprite.
 * @returns {string} The Angel ASCII art.
 */
function getAngel() {
  return ANGEL;
}

/**
 * Display a battle card showing a Pokemon's sprite and stats.
 * @param {object} pokemon - A Pokemon instance with name, types, and stats.
 * @returns {string} Formatted battle card.
 */
function battleCard(pokemon) {
  const sprite = getSprite(pokemon.name);
  const hp = pokemon.currentHp !== undefined ? pokemon.currentHp : '???';
  const maxHp = pokemon.stats ? pokemon.stats.hp : '???';
  const types = pokemon.types ? pokemon.types.join('/') : '???';

  return [
    '╔══════════════════════════════════╗',
    `║  ${pokemon.name.padEnd(30)}║`,
    `║  Type: ${types.padEnd(26)}║`,
    `║  HP: ${String(hp).padEnd(5)}/ ${String(maxHp).padEnd(22)}║`,
    '╠══════════════════════════════════╣',
    ...sprite.split('\n').map(line => {
      const padded = line.padEnd(34);
      return `║${padded.substring(0, 34)}║`;
    }),
    '╚══════════════════════════════════╝',
  ].join('\n');
}

module.exports = {
  SPRITES,
  ANGEL,
  getSprite,
  getAngel,
  battleCard,
};
