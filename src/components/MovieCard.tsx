import { useState } from 'react';
import type { Movie } from '../lib/types';
import { motion } from 'framer-motion';
import './MovieCard.css';

interface MovieCardProps {
    movie: Movie;
    selected?: boolean;
    onToggle: (id: number) => void;
    disabled?: boolean;
}

export function MovieCard({ movie, selected, onToggle, disabled }: MovieCardProps) {
    const [imgLoaded, setImgLoaded] = useState(false);

    return (
        <motion.div
            whileHover={{ y: -10, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`movie-card ${selected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
            onClick={() => !disabled && onToggle(movie.id)}
        >
            <div className={`poster-wrapper ${!imgLoaded ? 'skeleton' : ''}`}>
                <img
                    src={movie.poster}
                    alt={movie.title}
                    onLoad={() => setImgLoaded(true)}
                    style={{ opacity: imgLoaded ? 1 : 0 }}
                />
                <div className="overlay">
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
            {selected && <div className="discard-badge">DISCARD</div>}
        </motion.div>
    );
}
