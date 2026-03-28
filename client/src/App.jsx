import { useState, useEffect } from 'react';
import './App.css';
import TeamBuilder from './components/TeamBuilder';
import BattleScreen from './components/BattleScreen';
import ResultScreen from './components/ResultScreen';
import { fetchPokedex, fetchMoves, startBattle } from './utils/api';

const SCREENS = {
  LOADING: 'loading',
  TEAM_BUILDER: 'teamBuilder',
  BATTLE: 'battle',
  RESULT: 'result',
};

function App() {
  const [screen, setScreen] = useState(SCREENS.LOADING);
  const [pokedex, setPokedex] = useState([]);
  const [allMoves, setAllMoves] = useState({});
  const [error, setError] = useState(null);

  // Battle state
  const [playerTeamConfig, setPlayerTeamConfig] = useState(null);
  const [opponentTeamConfig, setOpponentTeamConfig] = useState(null);
  const [battleInitialState, setBattleInitialState] = useState(null);
  const [battleResult, setBattleResult] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [pokemonData, movesData] = await Promise.all([
          fetchPokedex(),
          fetchMoves(),
        ]);
        setPokedex(pokemonData);
        setAllMoves(movesData);
        setScreen(SCREENS.TEAM_BUILDER);
      } catch (err) {
        setError(err.message);
        setScreen(SCREENS.TEAM_BUILDER); // show error on screen
      }
    }
    load();
  }, []);

  async function handleStartBattle(playerTeam, opponentTeam) {
    setError(null);
    try {
      setPlayerTeamConfig(playerTeam);
      setOpponentTeamConfig(opponentTeam);
      const preview = await startBattle(playerTeam, opponentTeam);
      setBattleInitialState(preview);
      setScreen(SCREENS.BATTLE);
    } catch (err) {
      setError(err.message);
    }
  }

  function handleBattleEnd(result) {
    setBattleResult(result);
    setScreen(SCREENS.RESULT);
  }

  function handlePlayAgain() {
    setPlayerTeamConfig(null);
    setOpponentTeamConfig(null);
    setBattleInitialState(null);
    setBattleResult(null);
    setScreen(SCREENS.TEAM_BUILDER);
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Pokemon Battle <span>Simulator</span></h1>
      </header>

      {error && <div className="error-message" style={{ margin: '12px 20px' }}>{error}</div>}

      {screen === SCREENS.LOADING && (
        <div className="loading">
          <div className="loading-spinner" />
          Loading Pokemon data...
        </div>
      )}

      {screen === SCREENS.TEAM_BUILDER && (
        <TeamBuilder
          pokedex={pokedex}
          allMoves={allMoves}
          onStartBattle={handleStartBattle}
        />
      )}

      {screen === SCREENS.BATTLE && battleInitialState && (
        <BattleScreen
          playerTeamConfig={playerTeamConfig}
          opponentTeamConfig={opponentTeamConfig}
          initialState={battleInitialState}
          onBattleEnd={handleBattleEnd}
        />
      )}

      {screen === SCREENS.RESULT && battleResult && (
        <ResultScreen
          result={battleResult}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </div>
  );
}

export default App;
