import TYPE_COLORS from '../utils/typeColors';

export default function TypeBadge({ type, className = '' }) {
  const bg = TYPE_COLORS[type] || '#888';
  return (
    <span
      className={`type-badge ${className}`}
      style={{ backgroundColor: bg }}
    >
      {type}
    </span>
  );
}
