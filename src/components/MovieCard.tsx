import { useState } from 'react';
import type { Movie } from '../lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { WatchProviders } from './WatchProviders';
import './MovieCard.css';

interface MovieCardProps {
    movie: Movie;
    selected?: boolean;
    onToggle: (id: number) => void;
    disabled?: boolean;
}

export function MovieCard({ movie, selected, onToggle, disabled }: MovieCardProps) {
    const [imgLoaded, setImgLoaded] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleCardClick = () => {
        if (disabled) return;
        // Clicking the card now ONLY toggles selection
        onToggle(movie.id);
    };

    const handleOpenDetails = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (disabled) return;
        setIsExpanded(true);
    };

    const handleCloseDetails = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsExpanded(false);
    };

    const handleKeepMovie = (e: React.MouseEvent) => {
        e.stopPropagation();
        onToggle(movie.id); // Deselect it
        setIsExpanded(false);
    };

    return (
        <AnimatePresence>
            <motion.div
                layout
                className={`movie-card-wrapper ${isExpanded ? 'is-expanded' : ''}`}
            >
                <motion.div
                    whileHover={!isExpanded && !movie.isMystery ? {
                        y: -15,
                        scale: 1.05,
                        boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
                    } : {}}
                    whileTap={!isExpanded && !movie.isMystery ? { scale: 0.95 } : {}}
                    className={`movie-card ${isExpanded ? 'is-expanded' : ''} 
                               ${selected ? 'selected' : ''}
                               ${disabled ? 'disabled' : ''}`}
                    onClick={handleCardClick}
                >
                    {/* Discard Badge for small view */}
                    {selected && !isExpanded && (
                        <div className="discard-badge">MARCADA</div>
                    )}

                    {/* View Button (New) */}
                    {!isExpanded && !movie.isMystery && (
                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="view-card-btn"
                            onClick={handleOpenDetails}
                            title="Ver detalles"
                        >
                            👁️
                        </motion.button>
                    )}

                    <div className={`poster-wrapper ${!imgLoaded && !movie.isMystery ? 'skeleton' : ''}`}>
                        {!movie.isMystery ? (
                            (movie.poster && movie.poster !== 'https://image.tmdb.org/t/p/w500null') ? (
                                <img
                                    src={movie.poster}
                                    alt={movie.title}
                                    onLoad={() => setImgLoaded(true)}
                                    onError={(e) => {
                                        setImgLoaded(true);
                                        (e.target as HTMLImageElement).src = ''; // Force fallback
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                    style={{ opacity: imgLoaded ? 1 : 0 }}
                                />
                            ) : null
                        ) : (
                            <div className="mystery-poster">
                                <span className="mystery-icon">?</span>
                                <span className="mystery-text">CARTA DE MISTERIO</span>
                            </div>
                        )}
                        {!movie.isMystery && (!movie.poster || movie.poster === 'https://image.tmdb.org/t/p/w500null' || (imgLoaded && !document.querySelector(`img[src="${movie.poster}"]`))) && (
                            <div className="no-poster-fallback">
                                <span className="fallback-icon">🍿</span>
                                <span className="fallback-text">SIN IMAGEN</span>
                            </div>
                        )}

                        <div className={`overlay ${!movie.isMystery ? 'show' : ''} ${isExpanded ? 'hide-overlay' : ''}`}>
                            <div className="overlay-content">
                                <h3>{movie.title}</h3>
                                <div className="card-meta">
                                    <span>{movie.year}</span>
                                    <span className="rating">★ {movie.rating.toFixed(1)}</span>
                                </div>
                                {movie.genre && (
                                    <div className="card-genres">
                                        {movie.genre.slice(0, 2).join(' • ')}
                                    </div>
                                )}
                                <p className="overview">{movie.overview}</p>
                            </div>
                        </div>
                    </div>

                    {isExpanded && (
                        <div className="expanded-details" onClick={(e) => e.stopPropagation()}>
                            <div className="expanded-header">
                                <span className="discard-badge-large">MARCADA PARA DESCARTAR</span>
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    className="close-expanded"
                                    onClick={handleCloseDetails}
                                >
                                    ✕
                                </motion.button>
                            </div>

                            <div className="expanded-scroller">
                                <div className="expanded-content">
                                    <h2>{movie.title} <small>({movie.year})</small></h2>
                                    <div className="expanded-meta">
                                        <span className="rating">★ {movie.rating.toFixed(1)}</span>
                                        {movie.popularity && <span className="pop-rank">🔥 Pop: {Math.round(movie.popularity)}</span>}
                                        {movie.genre && <span className="genres">{movie.genre.join(', ')}</span>}
                                    </div>

                                    <p className="full-overview">{movie.overview}</p>

                                    <WatchProviders movieId={movie.id} />
                                </div>
                            </div>

                            <div className="expanded-actions">
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    className="btn-primary expanded-trailer-btn"
                                    onClick={(e) => { e.stopPropagation(); window.open(`https://www.youtube.com/results?search_query=${movie.title}+trailer`, '_blank'); }}
                                >
                                    Ver Trailer ▶
                                </motion.button>
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    className="btn-secondary expanded-keep-btn"
                                    onClick={handleKeepMovie}
                                >
                                    Conservar Película
                                </motion.button>
                            </div>
                        </div>
                    )}

                </motion.div>
                {isExpanded && <div className="expanded-backdrop" onClick={handleCloseDetails} />}
            </motion.div>
        </AnimatePresence>
    );
}
