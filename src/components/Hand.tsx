import type { Movie } from '../lib/types';
import { MovieCard } from './MovieCard';
import { motion, AnimatePresence } from 'framer-motion';
import './Hand.css';

interface HandProps {
    cards: Movie[];
    selectedIds: number[];
    onToggle: (id: number) => void;
}

export function Hand({ cards, selectedIds, onToggle }: HandProps) {
    return (
        <div className="hand-container">
            <AnimatePresence mode="popLayout">
                {cards.map((movie, index) => (
                    <motion.div
                        key={movie.id}
                        layout
                        initial={{ opacity: 0, scale: 0.8, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, y: -500, rotate: 15, scale: 0.5 }}
                        transition={{
                            type: 'spring',
                            stiffness: 300,
                            damping: 25,
                            delay: index * 0.15
                        }}
                    >
                        <MovieCard
                            movie={movie}
                            selected={selectedIds.includes(movie.id)}
                            onToggle={onToggle}
                            disabled={false}
                        />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
