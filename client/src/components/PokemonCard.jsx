import TypeBadge from './TypeBadge';

const STAT_LABELS = {
  hp: 'HP',
  attack: 'Atk',
  defense: 'Def',
  specialAttack: 'SpA',
  specialDefense: 'SpD',
  speed: 'Spe',
};

const STAT_COLORS = {
  hp: '#68d391',
  attack: '#fc8181',
  defense: '#f6e05e',
  specialAttack: '#90cdf4',
  specialDefense: '#b794f4',
  speed: '#f687b3',
};

const MAX_STAT = 160; // for bar scaling

export default function PokemonCard({ pokemon, isSelected, isDisabled, onClick }) {
  const cls = [
    'pokemon-card',
    isSelected && 'selected',
    isDisabled && 'disabled',
  ].filter(Boolean).join(' ');

  return (
    <div className={cls} onClick={isDisabled ? undefined : onClick}>
      {isSelected && <div className="check-mark">&#10003;</div>}
      <div className="pokemon-name">{pokemon.name}</div>
      <div className="type-badges">
        {pokemon.types.map((t) => (
          <TypeBadge key={t} type={t} />
        ))}
      </div>
      <div className="stat-total">
        BST: <strong>{pokemon.baseStatTotal}</strong>
      </div>
      <div className="mini-stats">
        {Object.entries(pokemon.baseStats).map(([key, val]) => (
          <StatRow key={key} label={STAT_LABELS[key]} value={val} color={STAT_COLORS[key]} />
        ))}
      </div>
    </div>
  );
}

function StatRow({ label, value, color }) {
  const pct = Math.min((value / MAX_STAT) * 100, 100);
  return (
    <>
      <span className="stat-label">{label}</span>
      <div className="stat-bar">
        <div
          className="stat-bar-fill"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="stat-value">{value}</span>
    </>
  );
}
