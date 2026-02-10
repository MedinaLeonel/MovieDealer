import { useState, useEffect } from 'react';
import type { FilterSettings } from '../lib/types';
import './FilterMenu.css';

interface FilterMenuProps {
    filters: FilterSettings;
    onFiltersChange: (filters: FilterSettings) => void;
    onConfirm: () => void;
    onBack: () => void;
}

const GENRES = [
    { id: '28', name: 'Acción' },
    { id: '35', name: 'Comedia' },
    { id: '18', name: 'Drama' },
    { id: '27', name: 'Terror' },
    { id: '878', name: 'Sci-Fi' },
    { id: '10749', name: 'Romance' },
    { id: '530', name: 'Thriller' },
    { id: '16', name: 'Animación' },
];

const DECADES = [
    { id: '2020', name: '2020s' },
    { id: '2010', name: '2010s' },
    { id: '2000', name: '2000s' },
    { id: '1990', name: '90s' },
    { id: '1980', name: '80s' },
    { id: '1970', name: '70s' },
    { id: '1960', name: '60s' },
    { id: '1950', name: '50s' },
];

export function FilterMenu({ filters, onFiltersChange, onConfirm, onBack }: FilterMenuProps) {
    const [personSearch, setPersonSearch] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);

    useEffect(() => {
        const searchPerson = async () => {
            if (personSearch.length < 3) {
                setSearchResults([]);
                return;
            }
            const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
            try {
                const res = await fetch(`https://api.themoviedb.org/3/search/person?api_key=${TMDB_API_KEY}&query=${personSearch}&language=es-ES`);
                const data = await res.json();
                setSearchResults(data.results.slice(0, 5));
            } catch (e) {
                console.error(e);
            }
        };

        const timer = setTimeout(searchPerson, 500);
        return () => clearTimeout(timer);
    }, [personSearch]);

    const handleToggleGenre = (id: string) => {
        onFiltersChange({ ...filters, genre: filters.genre === id ? undefined : id });
    };

    const handleToggleDecade = (id: string) => {
        onFiltersChange({ ...filters, decade: filters.decade === id ? undefined : id });
    };

    return (
        <div className="filter-menu-container">
            <h2 className="setup-title">Personaliza tu Mano</h2>

            <section className="filter-section">
                <h3>Género</h3>
                <div className="chip-group">
                    {GENRES.map(g => (
                        <button
                            key={g.id}
                            className={`chip ${filters.genre === g.id ? 'active' : ''}`}
                            onClick={() => handleToggleGenre(g.id)}
                        >
                            {g.name}
                        </button>
                    ))}
                </div>
            </section>

            <section className="filter-section">
                <h3>Década</h3>
                <div className="chip-group">
                    {DECADES.map(d => (
                        <button
                            key={d.id}
                            className={`chip ${filters.decade === d.id ? 'active' : ''}`}
                            onClick={() => handleToggleDecade(d.id)}
                        >
                            {d.name}
                        </button>
                    ))}
                </div>
            </section>

            <section className="filter-section">
                <h3>Actor o Director</h3>
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Ej: Tarantino, Di Caprio..."
                        value={filters.person?.name || personSearch}
                        onChange={(e) => {
                            if (filters.person) onFiltersChange({ ...filters, person: undefined });
                            setPersonSearch(e.target.value);
                        }}
                        className="filter-input"
                    />
                    {searchResults.length > 0 && !filters.person && (
                        <div className="search-dropdown">
                            {searchResults.map(p => (
                                <div
                                    key={p.id}
                                    className="search-item"
                                    onClick={() => {
                                        onFiltersChange({
                                            ...filters,
                                            person: { id: p.id, name: p.name, type: p.known_for_department === 'Directing' ? 'director' : 'actor' }
                                        });
                                        setPersonSearch('');
                                        setSearchResults([]);
                                    }}
                                >
                                    {p.name} <small>({p.known_for_department === 'Directing' ? 'Director' : 'Actor'})</small>
                                </div>
                            ))}
                        </div>
                    )}
                    {filters.person && (
                        <button className="clear-btn" onClick={() => onFiltersChange({ ...filters, person: undefined })}>✕</button>
                    )}
                </div>
            </section>

            <div className="setup-actions">
                <button className="btn-secondary" onClick={onBack}>Atrás</button>
                <button className="btn-primary" onClick={onConfirm}>Start Game</button>
            </div>
        </div>
    );
}
