import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip } from './ui/Tooltip';
import type { FilterSettings } from '../lib/types';
import './FilterMenu.css';

interface FilterMenuProps {
    filters: FilterSettings;
    onFiltersChange: (filters: FilterSettings) => void;
    onConfirm: () => void;
    onBack: () => void;
    onResetProfile: () => void;
}

const GENRES = [
    { id: '28', name: 'Acción' },
    { id: '12', name: 'Aventura' },
    { id: '16', name: 'Animación' },
    { id: '35', name: 'Comedia' },
    { id: '80', name: 'Crimen' },
    { id: '18', name: 'Drama' },
    { id: '14', name: 'Fantasía' },
    { id: '36', name: 'Historia' },
    { id: '27', name: 'Terror' },
    { id: '10402', name: 'Música' },
    { id: '9648', name: 'Misterio' },
    { id: '10749', name: 'Romance' },
    { id: '878', name: 'Sci-Fi' },
    { id: '53', name: 'Thriller' },
    { id: '10752', name: 'Guerra' },
    { id: '37', name: 'Western' },
    { id: '99', name: 'Documental' },
    { id: '10751', name: 'Familia' },
    { id: '10770', name: 'TV Movie' },
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
    { id: '1940', name: '40s' },
    { id: '1930', name: '30s' },
];

export function FilterMenu({ filters, onFiltersChange, onConfirm, onBack, onResetProfile }: FilterMenuProps) {
    const [personSearch, setPersonSearch] = useState('');
    const [searchResults, setSearchResults] = useState<{ id: number; name: string; known_for_department: string }[]>([]);

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
        const newGenres = filters.genres.includes(id)
            ? filters.genres.filter(g => g !== id)
            : [...filters.genres, id];
        onFiltersChange({ ...filters, genres: newGenres });
    };

    const handleToggleDecade = (id: string) => {
        const newDecades = filters.decades.includes(id)
            ? filters.decades.filter(d => d !== id)
            : [...filters.decades, id];
        onFiltersChange({ ...filters, decades: newDecades });
    };

    return (
        <div className="filter-menu-container">
            <h2 className="setup-title">Personaliza</h2>

            <div className="filter-scroll-area">
                <motion.section
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="filter-section"
                >
                    <h3 className="filter-title">GÉNEROS</h3>
                    <div className="filter-chips">
                        {GENRES.map((g, i) => (
                            <motion.button
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: i * 0.02 }}
                                whileTap={{ scale: 0.95 }}
                                key={g.id}
                                className={`filter-chip ${filters.genres.includes(g.id) ? 'active' : ''}`}
                                onClick={() => handleToggleGenre(g.id)}
                            >
                                {g.name}
                            </motion.button>
                        ))}
                    </div>
                </motion.section>

                <motion.section
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="filter-section"
                >
                    <h3 className="filter-title">DÉCADAS</h3>
                    <div className="filter-chips">
                        {DECADES.map((d, i) => (
                            <motion.button
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.2 + (i * 0.02) }}
                                whileTap={{ scale: 0.95 }}
                                key={d.id}
                                className={`filter-chip ${filters.decades.includes(d.id) ? 'active' : ''}`}
                                onClick={() => handleToggleDecade(d.id)}
                            >
                                {d.name}
                            </motion.button>
                        ))}
                    </div>
                </motion.section>

                <motion.section
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="filter-section"
                >
                    <h3 className="filter-title">TAMAÑO DEL POOL</h3>
                    <div className="pool-slider-container">
                        <input
                            type="range"
                            min="60"
                            max="200"
                            step="null" // We handle discrete values manually or just use range with list
                            list="pool-sizes"
                            value={filters.poolSize || 120}
                            onChange={(e) => {
                                const val = Number(e.target.value);
                                // Snap to closest
                                let snapped = 120;
                                if (val < 90) snapped = 60;
                                else if (val > 160) snapped = 200;
                                else snapped = 120;
                                onFiltersChange({ ...filters, poolSize: snapped as 60 | 120 | 200 });
                            }}
                            className="pool-slider"
                        />
                        <datalist id="pool-sizes">
                            <option value="60"></option>
                            <option value="120"></option>
                            <option value="200"></option>
                        </datalist>
                        <div className="pool-labels">
                            <span className={filters.poolSize === 60 ? 'active' : ''}>60 (Rápido)</span>
                            <span className={filters.poolSize === 120 || !filters.poolSize ? 'active' : ''}>120 (Equilibrado)</span>
                            <span className={filters.poolSize === 200 ? 'active' : ''}>200 (Deep)</span>
                        </div>
                        <p className="pool-description">
                            {filters.poolSize === 60 && "Partida rápida, hits garantizados."}
                            {(filters.poolSize === 120 || !filters.poolSize) && "Exploración equilibrada."}
                            {filters.poolSize === 200 && "Experiencia cinematográfica total (requiere carga)."}
                        </p>
                    </div>
                </motion.section>

                <motion.section
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="filter-section"
                >
                    <h3 className="filter-title">MOOD MODE</h3>
                    <div className="mood-grid">
                        {[
                            { id: 'adventure', label: 'Aventura', icon: '🎲', desc: "El Dealer prioriza la sorpresa sobre tus gustos." },
                            { id: 'chill', label: 'Chill', icon: '🍿', desc: "Relájate con títulos populares y fáciles de disfrutar." },
                            { id: 'purist', label: 'Purista', icon: '✒️', desc: "Cine de culto, clásicos y joyas críticas." }
                        ].map((m) => (
                            <Tooltip key={m.id} text={m.desc} position="top">
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    className={`mood-card ${filters.moodMode === m.id ? 'active' : ''}`}
                                    onClick={() => onFiltersChange({ ...filters, moodMode: m.id as any })}
                                >
                                    <span className="mood-icon">{m.icon}</span>
                                    <span className="mood-label">{m.label}</span>
                                </motion.button>
                            </Tooltip>
                        ))}
                    </div>
                </motion.section>

                <motion.section
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="filter-section"
                >
                    <h3 className="filter-title">DIRECTOR O ACTOR</h3>
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Buscar nombre..."
                            value={filters.person?.name || personSearch}
                            onChange={(e) => {
                                if (filters.person) onFiltersChange({ ...filters, person: undefined });
                                setPersonSearch(e.target.value);
                            }}
                            className="filter-search-input"
                        />
                        <AnimatePresence>
                            {searchResults.length > 0 && !filters.person && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="search-dropdown"
                                >
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
                                            {p.name} <small>({p.known_for_department === 'Directing' ? 'Dir' : 'Act'})</small>
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                        {filters.person && (
                            <button className="clear-btn" onClick={() => onFiltersChange({ ...filters, person: undefined })}>✕</button>
                        )}
                    </div>
                </motion.section>
            </div>

            <div className="setup-actions">
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="btn-secondary"
                    onClick={onBack}
                >
                    ATRÁS
                </motion.button>
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="btn-primary"
                    onClick={onConfirm}
                >
                    REPARTIR
                </motion.button>
            </div>

            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                whileHover={{ opacity: 1 }}
                className="reset-profile-btn"
                onClick={() => {
                    if (window.confirm("¿Estás seguro? Esto borrará todo tu historial de películas vistas y aprendizaje del Dealer.")) {
                        onResetProfile();
                    }
                }}
            >
                ↻ Reset Dealer Memory
            </motion.button>
        </div>
    );
}
