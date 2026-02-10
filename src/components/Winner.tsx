import { useState } from 'react';
import type { Movie } from '../lib/types';
import { AdSlot } from './AdSlot';
import { WatchProviders } from './WatchProviders';
import './Winner.css';

interface WinnerProps {
    movie: Movie;
    onReset: () => void;
}

export function Winner({ movie, onReset }: WinnerProps) {
    const [runtime, setRuntime] = useState<number | null>(null);

    return (
        <div className="winner-overlay">
            <div className="winner-backdrop" style={{ backgroundImage: `url(${movie.poster})` }}></div>
            <div className="winner-content">
                <span className="winner-badge">EL DEALER HA HABLADO</span>
                <h1>Esta gana hoy</h1>
                <div className="winner-card">
                    <img src={movie.poster} alt={movie.title} />
                </div>
                <h2>{movie.title} ({movie.year}) {runtime && <span className="winner-runtime">| {runtime} min</span>}</h2>
                <p className="winner-overview">{movie.overview}</p>

                <WatchProviders movieId={movie.id} onRuntimeFetch={setRuntime} />

                <div className="winner-actions">
                    <button className="btn-primary" onClick={() => window.open(`https://www.youtube.com/results?search_query=${movie.title}+trailer`, '_blank')}>
                        Ver Trailer ▶
                    </button>
                    <button className="btn-secondary" onClick={onReset}>
                        Jugar otra vez
                    </button>
                </div>
                <AdSlot active={false} />
            </div>
        </div>
    );
}
