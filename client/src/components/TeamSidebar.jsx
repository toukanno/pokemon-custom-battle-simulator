import TypeBadge from './TypeBadge';
import { getTypeCoverage } from '../utils/moveScoring';
import TYPE_COLORS from '../utils/typeColors';

const MAX_TEAM = 3;

export default function TeamSidebar({ team, allMoves, onRemove, onEditMoves, onStartBattle }) {
  // Gather all move types across the team for coverage
  const allMoveTypes = [];
  for (const member of team) {
    for (const moveId of member.moves) {
      const move = allMoves[moveId];
      if (move && move.type) allMoveTypes.push(move.type);
    }
  }
  const coverage = getTypeCoverage(allMoveTypes);
  const allTypes = Object.keys(TYPE_COLORS);
  const isReady = team.length === MAX_TEAM && team.every((m) => m.moves.length > 0);

  return (
    <div className="sidebar">
      <h2>Your Team ({team.length}/{MAX_TEAM})</h2>

      {Array.from({ length: MAX_TEAM }).map((_, i) => {
        const member = team[i];
        if (!member) {
          return (
            <div key={i} className="sidebar-slot empty">
              Slot {i + 1} -- Select a Pokemon
            </div>
          );
        }
        return (
          <div key={member.id} className="sidebar-slot">
            <div className="slot-header">
              <span className="slot-name">{member.name}</span>
              <button className="remove-btn" onClick={() => onRemove(member.id)}>
                Remove
              </button>
            </div>
            <div className="type-badges" style={{ marginBottom: 4 }}>
              {member.types.map((t) => (
                <TypeBadge key={t} type={t} />
              ))}
            </div>
            <div className="slot-moves">
              {member.moves.length === 0 ? (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No moves</span>
              ) : (
                member.moves.map((moveId) => {
                  const move = allMoves[moveId];
                  return move ? (
                    <TypeBadge key={moveId} type={move.type} />
                  ) : null;
                })
              )}
            </div>
            <button className="edit-moves-btn" onClick={() => onEditMoves(member.id)}>
              Edit Moves ({member.moves.length}/4)
            </button>
          </div>
        );
      })}

      {team.length > 0 && (
        <div className="coverage-section">
          <h3>Type Coverage</h3>
          <div className="coverage-types">
            {allTypes.map((type) => (
              <TypeBadge
                key={type}
                type={type}
                className={coverage.covered.includes(type) ? '' : 'uncovered'}
              />
            ))}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>
            {coverage.covered.length}/{coverage.total} types covered
          </div>
        </div>
      )}

      <div className="start-battle-btn">
        <button disabled={!isReady} onClick={onStartBattle}>
          Start Battle
        </button>
      </div>
    </div>
  );
}
