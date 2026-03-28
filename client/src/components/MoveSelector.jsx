import { useState, useMemo } from 'react';
import TypeBadge from './TypeBadge';
import { autoSelectMoves } from '../utils/moveScoring';

const MAX_MOVES = 4;

export default function MoveSelector({ pokemon, allMoves, initialMoves, onConfirm, onClose }) {
  const [selected, setSelected] = useState(() => {
    if (initialMoves && initialMoves.length > 0) return [...initialMoves];
    return autoSelectMoves(allMoves, pokemon.types);
  });

  const moveList = useMemo(() => {
    return Object.entries(allMoves)
      .filter(([, m]) => m.power > 0 || m.category === 'status')
      .map(([id, m]) => ({ id, ...m }))
      .sort((a, b) => {
        // STAB first, then by power desc
        const aStab = pokemon.types.includes(a.type) ? 1 : 0;
        const bStab = pokemon.types.includes(b.type) ? 1 : 0;
        if (bStab !== aStab) return bStab - aStab;
        return (b.power || 0) - (a.power || 0);
      });
  }, [allMoves, pokemon.types]);

  function toggleMove(moveId) {
    setSelected((prev) => {
      if (prev.includes(moveId)) {
        return prev.filter((id) => id !== moveId);
      }
      if (prev.length >= MAX_MOVES) return prev;
      return [...prev, moveId];
    });
  }

  return (
    <div className="move-selector-overlay" onClick={onClose}>
      <div className="move-selector" onClick={(e) => e.stopPropagation()}>
        <div className="move-selector-header">
          <h3>Select moves for {pokemon.name} ({selected.length}/{MAX_MOVES})</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="move-selector-body">
          <div className="move-grid">
            {moveList.map((move) => {
              const isSel = selected.includes(move.id);
              const isFull = selected.length >= MAX_MOVES && !isSel;
              return (
                <div
                  key={move.id}
                  className={`move-item ${isSel ? 'selected' : ''} ${isFull ? 'disabled' : ''}`}
                  onClick={() => !isFull && toggleMove(move.id)}
                >
                  <div className="move-name">{move.name}</div>
                  <div className="move-details">
                    <TypeBadge type={move.type} />
                    <span className="move-category">{move.category}</span>
                    {move.power > 0 && <span>Pow: {move.power}</span>}
                    <span>Acc: {move.accuracy}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="move-selector-footer">
          <span className="selected-moves-summary">
            {selected.length === 0
              ? 'No moves selected'
              : selected.map((id) => allMoves[id]?.name || id).join(', ')}
          </span>
          <button
            className="play-again-btn"
            style={{ padding: '8px 24px', fontSize: '0.85rem' }}
            onClick={() => onConfirm(selected)}
            disabled={selected.length === 0}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
