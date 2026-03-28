import { useState, useRef, useEffect } from 'react';
import TypeBadge from './TypeBadge';
import TYPE_COLORS from '../utils/typeColors';
import { simulateTurn } from '../utils/api';

export default function BattleScreen({ playerTeamConfig, opponentTeamConfig, initialState, onBattleEnd }) {
  const [battleState, setBattleState] = useState(initialState.battleState);
  const [log, setLog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [turnCount, setTurnCount] = useState(0);
  const logRef = useRef(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [log]);

  const player = battleState.player1;
  const opponent = battleState.player2;
  const activePokemon = player.team[player.activePokemonIndex];
  const opponentPokemon = opponent.team[opponent.activePokemonIndex];
  const isOver = battleState.winner !== null && battleState.winner !== undefined;

  useEffect(() => {
    if (isOver) {
      const playerRemaining = player.team.filter((p) => p.isAlive).length;
      const opponentRemaining = opponent.team.filter((p) => p.isAlive).length;
      onBattleEnd({
        winner: battleState.winner === 'player1' ? 'You' : 'Opponent',
        turns: turnCount,
        playerRemaining,
        opponentRemaining,
      });
    }
  }, [isOver]);

  async function handleAction(action) {
    if (loading || isOver) return;
    setLoading(true);
    setError(null);

    try {
      // Pick a random move for the opponent AI
      const oppActive = opponentTeamConfig[opponent.activePokemonIndex];
      const oppMoves = oppActive?.moves || [];
      const randomMove = oppMoves[Math.floor(Math.random() * oppMoves.length)] || oppMoves[0];

      let opponentAction = { type: 'move', moveId: randomMove };

      // If opponent active is fainted, switch to first alive
      const oppTeam = opponent.team;
      if (!oppTeam[opponent.activePokemonIndex].isAlive) {
        const nextAlive = oppTeam.findIndex((p, i) => p.isAlive && i !== opponent.activePokemonIndex);
        if (nextAlive >= 0) {
          opponentAction = { type: 'switch', pokemonIndex: nextAlive };
        }
      }

      const result = await simulateTurn(
        playerTeamConfig,
        opponentTeamConfig,
        action,
        opponentAction
      );

      setBattleState(result.battleState);
      setLog((prev) => [...prev, ...result.log]);
      setTurnCount((c) => c + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleMove(moveId) {
    handleAction({ type: 'move', moveId });
  }

  function handleSwitch(index) {
    handleAction({ type: 'switch', pokemonIndex: index });
  }

  function getHpClass(current, max) {
    const pct = max > 0 ? current / max : 0;
    if (pct > 0.5) return 'hp-high';
    if (pct > 0.2) return 'hp-mid';
    return 'hp-low';
  }

  const playerMoves = playerTeamConfig[player.activePokemonIndex]?.moves || [];

  return (
    <div className="battle-screen">
      {error && <div className="error-message">{error}</div>}

      <div className="battle-field">
        <PokemonDisplay
          label="Your Pokemon"
          pokemon={activePokemon}
          className="player"
          getHpClass={getHpClass}
        />
        <PokemonDisplay
          label="Opponent"
          pokemon={opponentPokemon}
          className="opponent"
          getHpClass={getHpClass}
        />
      </div>

      {!isOver && (
        <>
          <div className="battle-actions">
            {playerMoves.map((moveId) => {
              const move = initialState.intel?.moveAnalysis?.[moveId] || {};
              const bgColor = TYPE_COLORS[move.type] || '#555';
              return (
                <button
                  key={moveId}
                  className="move-btn"
                  style={{ backgroundColor: bgColor }}
                  onClick={() => handleMove(moveId)}
                  disabled={loading || !activePokemon.isAlive}
                >
                  <div>{move.name || moveId}</div>
                  <div className="move-btn-details">
                    {move.power > 0 && `Pow: ${move.power} `}
                    {move.category}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="switch-panel">
            <h3>Switch Pokemon</h3>
            <div className="switch-options">
              {player.team.map((p, i) => (
                <button
                  key={i}
                  className="switch-btn"
                  disabled={
                    loading ||
                    i === player.activePokemonIndex ||
                    !p.isAlive
                  }
                  onClick={() => handleSwitch(i)}
                >
                  {p.name}
                  <span className="switch-hp">
                    {p.currentHp}/{p.stats?.hp || '?'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="battle-log" ref={logRef}>
        <h3>Battle Log</h3>
        {log.length === 0 && (
          <div className="log-entry info">Battle started! Choose your move.</div>
        )}
        {log.map((entry, i) => {
          const cls = classifyLogEntry(entry);
          return (
            <div key={i} className={`log-entry ${cls}`}>
              {entry}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PokemonDisplay({ label, pokemon, className, getHpClass }) {
  const maxHp = pokemon.stats?.hp || pokemon.currentHp || 1;
  const currentHp = Math.max(0, pokemon.currentHp || 0);
  const hpPct = Math.max(0, Math.min(100, (currentHp / maxHp) * 100));

  return (
    <div className={`battle-pokemon ${className}`}>
      <div className="pokemon-label">{label}</div>
      <div className="pokemon-battle-name">{pokemon.name}</div>
      <div className="type-badges" style={{ marginBottom: 8 }}>
        {pokemon.types?.map((t) => (
          <TypeBadge key={t} type={t} />
        ))}
      </div>
      <div className="hp-bar-container">
        <div className="hp-bar-label">
          <span>HP</span>
          <span>{currentHp} / {maxHp}</span>
        </div>
        <div className="hp-bar">
          <div
            className={`hp-bar-fill ${getHpClass(currentHp, maxHp)}`}
            style={{ width: `${hpPct}%` }}
          />
        </div>
      </div>
      {pokemon.status && (
        <span className="status-badge">{pokemon.status}</span>
      )}
    </div>
  );
}

function classifyLogEntry(text) {
  const lower = text.toLowerCase();
  if (lower.includes('damage') || lower.includes('hit') || lower.includes('fainted') || lower.includes('lost')) return 'damage';
  if (lower.includes('heal') || lower.includes('restored')) return 'heal';
  if (lower.includes('burn') || lower.includes('poison') || lower.includes('paralyz') || lower.includes('sleep') || lower.includes('froze') || lower.includes('confus')) return 'status';
  return 'info';
}
