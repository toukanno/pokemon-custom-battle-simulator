import { useState, useMemo } from 'react';
import PokemonCard from './PokemonCard';
import MoveSelector from './MoveSelector';
import TeamSidebar from './TeamSidebar';
import { autoSelectMoves } from '../utils/moveScoring';

const MAX_TEAM = 3;

export default function TeamBuilder({ pokedex, allMoves, onStartBattle }) {
  const [team, setTeam] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [editingPokemonId, setEditingPokemonId] = useState(null);

  // All unique types from the pokedex
  const allTypes = useMemo(() => {
    const types = new Set();
    pokedex.forEach((p) => p.types.forEach((t) => types.add(t)));
    return [...types].sort();
  }, [pokedex]);

  // Filtered + sorted pokemon list
  const filteredPokemon = useMemo(() => {
    let list = [...pokedex];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }

    if (typeFilter) {
      list = list.filter((p) => p.types.includes(typeFilter));
    }

    switch (sortBy) {
      case 'name':
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'bst':
        list.sort((a, b) => b.baseStatTotal - a.baseStatTotal);
        break;
      case 'type':
        list.sort((a, b) => a.types[0].localeCompare(b.types[0]));
        break;
    }

    return list;
  }, [pokedex, search, typeFilter, sortBy]);

  const selectedIds = team.map((m) => m.id);

  function handleSelectPokemon(pokemon) {
    if (selectedIds.includes(pokemon.id)) {
      // Deselect
      setTeam((prev) => prev.filter((m) => m.id !== pokemon.id));
      return;
    }
    if (team.length >= MAX_TEAM) return;

    // Auto-select best moves
    const defaultMoves = autoSelectMoves(allMoves, pokemon.types);
    setTeam((prev) => [
      ...prev,
      { id: pokemon.id, name: pokemon.name, types: pokemon.types, moves: defaultMoves },
    ]);
  }

  function handleRemove(pokemonId) {
    setTeam((prev) => prev.filter((m) => m.id !== pokemonId));
  }

  function handleEditMoves(pokemonId) {
    setEditingPokemonId(pokemonId);
  }

  function handleConfirmMoves(moves) {
    setTeam((prev) =>
      prev.map((m) => (m.id === editingPokemonId ? { ...m, moves } : m))
    );
    setEditingPokemonId(null);
  }

  function handleStartBattle() {
    // Build team config for the API
    const playerTeam = team.map((m) => ({
      species: m.id,
      moves: m.moves,
    }));

    // Random opponent team
    const available = pokedex.filter((p) => !selectedIds.includes(p.id));
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    const opponentPicks = shuffled.slice(0, 3);
    // If not enough unique, allow duplicates from full pokedex
    while (opponentPicks.length < 3) {
      opponentPicks.push(pokedex[Math.floor(Math.random() * pokedex.length)]);
    }

    const opponentTeam = opponentPicks.map((p) => ({
      species: p.id,
      moves: autoSelectMoves(allMoves, p.types),
    }));

    onStartBattle(playerTeam, opponentTeam);
  }

  const editingMember = team.find((m) => m.id === editingPokemonId);
  const editingPokemon = editingMember
    ? pokedex.find((p) => p.id === editingMember.id)
    : null;

  return (
    <div className="team-builder">
      <div className="main-panel">
        <div className="filter-bar">
          <input
            type="text"
            placeholder="Search Pokemon..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">All Types</option>
            {allTypes.map((t) => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="name">Sort: Name</option>
            <option value="bst">Sort: Base Stat Total</option>
            <option value="type">Sort: Type</option>
          </select>
        </div>

        <div className="pokemon-grid">
          {filteredPokemon.map((p) => (
            <PokemonCard
              key={p.id}
              pokemon={p}
              isSelected={selectedIds.includes(p.id)}
              isDisabled={!selectedIds.includes(p.id) && team.length >= MAX_TEAM}
              onClick={() => handleSelectPokemon(p)}
            />
          ))}
        </div>
      </div>

      <TeamSidebar
        team={team}
        allMoves={allMoves}
        onRemove={handleRemove}
        onEditMoves={handleEditMoves}
        onStartBattle={handleStartBattle}
      />

      {editingPokemon && (
        <MoveSelector
          pokemon={editingPokemon}
          allMoves={allMoves}
          initialMoves={editingMember.moves}
          onConfirm={handleConfirmMoves}
          onClose={() => setEditingPokemonId(null)}
        />
      )}
    </div>
  );
}
