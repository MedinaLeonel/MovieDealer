import type { Movie } from '../lib/types';
import { MovieCard } from './MovieCard';
import './Hand.css';

interface HandProps {
    cards: Movie[];
    selectedIds: number[];
    onToggle: (id: number) => void;
}

export function Hand({ cards, selectedIds, onToggle }: HandProps) {
    return (
        <div className="hand-container">
            {cards.map((movie) => (
                <MovieCard
                    key={movie.id}
                    movie={movie}
                    selected={selectedIds.includes(movie.id)}
                    onToggle={onToggle}
                    // specific disable logic logic? Always enabled to select/deselect
                    disabled={false}
                />
            ))}
        </div>
    );
}
