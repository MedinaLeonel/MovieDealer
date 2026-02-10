import { useState } from 'react';
import type { Movie } from '../lib/types';
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
        <div
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
                    <h3>{movie.title}</h3>
                    <p>{movie.year}</p>
                    <div className="rating">★ {movie.rating.toFixed(1)}</div>
                </div>
            </div>
            {selected && <div className="discard-badge">DISCARD</div>}
        </div>
    );
}
