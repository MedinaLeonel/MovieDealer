import { useState, useEffect } from 'react';
import type { Movie } from '../lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { WatchProviders } from './WatchProviders';
import './MovieCard.css';

interface MovieCardProps {
    movie: Movie;
    selected?: boolean;
    onToggle: (id: number) => void;
    disabled?: boolean;
    isFacedDown?: boolean;
}

export function MovieCard({ movie, selected, onToggle, disabled, isFacedDown }: MovieCardProps) {
    const [imgLoaded, setImgLoaded] = useState(false);
    const [isRevealed, setIsRevealed] = useState(!isFacedDown);
    const [isExpanded, setIsExpanded] = useState(false);

    // Auto-expand when a card is selected (marked for discard) for the first time
    useEffect(() => {
        if (selected) {
            setIsExpanded(true);
        } else {
            setIsExpanded(false);
        }
    }, [selected]);

    const handleCardClick = () => {
        if (disabled) return;
        if (isFacedDown && !isRevealed) {
            setIsRevealed(true);
        } else {
            if (!selected) {
                // If not selected, select it (this will trigger isExpanded via useEffect)
                onToggle(movie.id);
            } else {
                // If already selected but collapsed, expand it
                if (!isExpanded) {
                    setIsExpanded(true);
                } else {
                    // If expanded, backdrop click or secondary click collapses it
                    setIsExpanded(false);
                }
            }
        }
    };

    const handleCloseDetails = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsExpanded(false);
        // We DO NOT call onToggle here, so it remains "selected" (marked for discard)
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
                               ${disabled ? 'disabled' : ''}
                               ${isFacedDown && !isRevealed ? 'faced-down' : ''}`}
                    onClick={handleCardClick}
                >
                    {/* Discard Badge for small view */}
                    {selected && !isExpanded && (
                        <div className="discard-badge">MARCADA</div>
                    )}

                    <div className={`poster-wrapper ${!imgLoaded && !movie.isMystery ? 'skeleton' : ''}`}>
                        {!movie.isMystery ? (
                            <img
                                src={movie.poster}
                                alt={movie.title}
                                onLoad={() => setImgLoaded(true)}
                                style={{ opacity: (imgLoaded && isRevealed) ? 1 : 0 }}
                            />
                        ) : (
                            <div className="mystery-poster">
                                <span className="mystery-icon">?</span>
                                <span className="mystery-text">CARTA DE MISTERIO</span>
                            </div>
                        )}
                        <div className={`overlay ${isRevealed && !movie.isMystery ? 'show' : ''} ${isExpanded ? 'hide-overlay' : ''}`}>
                            <div className="overlay-content">
                                <h3>{movie.title}</h3>
                                <div className="card-meta">
                                    <span>{movie.year}</span>
                                    <span className="rating">★ {movie.rating.toFixed(1)}</span>
                                </div>
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
                {isExpanded && <div className="expanded-backdrop" onClick={handleCardClick} />}
            </motion.div>
        </AnimatePresence>
    );
}
