import { useState, useEffect } from 'react';
import type { Movie } from '../lib/types';
import { WatchProviders } from './WatchProviders';
import { useStreaming } from '../context/StreamingContext';
import { motion } from 'framer-motion';
import './Winner.css';

interface WinnerProps {
    movie: Movie;
    hand: Movie[];
    onReset: () => void;
}

export function Winner({ movie, hand, onReset }: WinnerProps) {
    const [runtime, setRuntime] = useState<number | null>(null);
    const [showContent, setShowContent] = useState(false);
    const { openStream, openDealerCinemaMode } = useStreaming();

    useEffect(() => {
        // En v0.2.2 forzamos experiencia single-screen sin scroll global
        window.scrollTo(0, 0);
        const timer = setTimeout(() => setShowContent(true), 300);
        return () => clearTimeout(timer);
    }, []);

    const others = hand.filter(m => m.id !== movie.id);

    const handleStreamNow = () => {
        // Ensure media_type is set before calling openStream
        if (movie.media_type) {
            openStream(movie.id, movie.media_type);
        } else {
            console.error('Winner: movie.media_type is missing', movie);
        }
    };

    const handleDealerCinemaMode = () => {
        // Ensure media_type is set before calling openDealerCinemaMode
        if (movie.media_type) {
            openDealerCinemaMode(movie.id, movie.media_type);
        } else {
            console.error('Winner: movie.media_type is missing for Dealer Cinema Mode', movie);
        }
    };

    return (
        <div className={`winner-view ${showContent ? 'is-active' : ''}`}>
            {/* Capa 1: Fondo Cinemático con Depth y Blur */}
            <div className="winner-background">
                {movie.poster && movie.poster !== 'https://image.tmdb.org/t/p/w500null' && (
                    <div className="poster-bloom" style={{ backgroundImage: `url(${movie.poster})` }}></div>
                )}
                <div className="dynamic-vignette"></div>
            </div>

            {/* Capa 2: Discarded Cards como textura de fondo */}
            <div className="discarded-stagger-stack">
                {others.map((m, i) => (
                    <motion.div
                        key={m.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 0.1, scale: 1 }}
                        transition={{ delay: i * 0.2 }}
                        className="discarded-phantom-card"
                    >
                        <img src={m.poster} alt="" />
                    </motion.div>
                ))}
            </div>

            <div className="winner-content-layout">
                {/* Header Fijo */}
                <motion.header
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="winner-header-fixed"
                >
                    <span className="technical-tag">DEALER CHOICE</span>
                    <h1 className="massive-title">{movie.title.toUpperCase()}</h1>
                </motion.header>

                {/* Poster & Stats Section (Fijo/Sticky) */}
                <div className="winner-hero-visual">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="master-card-mini"
                    >
                        {movie.poster && movie.poster !== 'https://image.tmdb.org/t/p/w500null' ? (
                            <img src={movie.poster} alt={movie.title} />
                        ) : (
                            <div className="no-poster-fallback">
                                <span className="fallback-icon">🍿</span>
                                <span className="fallback-text">SIN IMAGEN</span>
                            </div>
                        )}
                    </motion.div>

                    <div className="winner-stats-mini">
                        <div className="stat-pill">
                            <span className="stat-label">RATING</span>
                            <span className="stat-value">★ {movie.rating.toFixed(1)}</span>
                        </div>
                        <div className="stat-pill">
                            <span className="stat-label">YEAR</span>
                            <span className="stat-value">{movie.year}</span>
                        </div>
                        {runtime && (
                            <div className="stat-pill">
                                <span className="stat-label">DURATION</span>
                                <span className="stat-value">{runtime}m</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Synopsis Scroll Area */}
                <div className="winner-body-scroll">
                    <div className="narrative-wrapper">
                        <h3 className="section-label">LA HISTORIA</h3>
                        <p className="technical-synopsis">{movie.overview}</p>
                    </div>

                    <div className="integration-wrapper">
                        <WatchProviders movieId={movie.id} onRuntimeFetch={setRuntime} />
                    </div>
                </div>

                {/* Footer Fijo */}
                <motion.footer
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="winner-footer-fixed"
                >
                    <div className="cta-grid">
                        <button className="btn-primary" onClick={() => window.open(`https://www.youtube.com/results?search_query=${movie.title}+trailer`, '_blank')}>
                            TRAILER ▶
                        </button>
                        <button className="btn-primary" onClick={handleStreamNow}>
                            VER AHORA 🎬
                        </button>
                        <button className="btn-primary dealer-cinema-btn" onClick={handleDealerCinemaMode}>
                            🎬 Watch Dealer Pick
                        </button>
                        <button className="btn-secondary" onClick={onReset}>
                            VOLVER
                        </button>
                    </div>
                </motion.footer>
            </div>
        </div>
    );
}
