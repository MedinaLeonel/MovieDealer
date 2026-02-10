import type { Movie } from '../lib/types';
import { AdSlot } from './AdSlot';
import './Winner.css';

interface WinnerProps {
    movie: Movie;
    onReset: () => void;
}

export function Winner({ movie, onReset }: WinnerProps) {
    return (
        <div className="winner-overlay">
            <div className="winner-backdrop" style={{ backgroundImage: `url(${movie.poster})` }}></div>
            <div className="winner-content">
                <h1>Esta gana hoy</h1>
                <div className="winner-card">
                    <img src={movie.poster} alt={movie.title} />
                </div>
                <h2>{movie.title} ({movie.year})</h2>
                <p className="winner-overview">{movie.overview}</p>

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
