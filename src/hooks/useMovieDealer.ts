import { useState, useEffect, useCallback, useRef } from 'react';
import type { Movie, GameState, DifficultyLevel } from '../lib/types';
import { FAKE_MOVIES } from '../data/fakeMovies';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || 'PLACEHOLDER_KEY';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export function useMovieDealer() {
    const [gameState, setGameState] = useState<GameState>('idle');
    const [hand, setHand] = useState<Movie[]>([]);
    const [winner, setWinner] = useState<Movie | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Game Logic State
    const [round, setRound] = useState(1);
    const [streak, setStreak] = useState(0);
    const [difficulty, setDifficulty] = useState<DifficultyLevel>(1);

    // Cache to avoid multi-fetching same difficulty in same session
    const moviePool = useRef<Movie[]>([]);

    useEffect(() => {
        const storedStreak = localStorage.getItem('movieDealerStreak');
        if (storedStreak) {
            setStreak(parseInt(storedStreak, 10));
        }
    }, []);

    const fetchMoviesByDifficulty = useCallback(async (level: DifficultyLevel): Promise<Movie[]> => {
        let url = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=es-ES&sort_by=popularity.desc&include_adult=false&page=${Math.floor(Math.random() * 5) + 1}`;

        if (level <= 2) {
            // Mainstream
            url += '&vote_count.gte=5000&popularity.gte=500';
        } else if (level <= 4) {
            // Medium
            url += '&vote_average.gte=7&popularity.lte=500&popularity.gte=100';
        } else {
            // Hidden Gems
            url += '&vote_count.lte=1000&vote_average.gte=7.5&vote_count.gte=50';
        }

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('API Error');
            const data = await response.json();

            return data.results.map((m: any) => ({
                id: m.id,
                title: m.title,
                year: m.release_date?.split('-')[0] || 'N/A',
                rating: m.vote_average,
                poster: m.poster_path ? `${POSTER_BASE_URL}${m.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Poster',
                overview: m.overview,
                popularity: m.popularity,
                vote_count: m.vote_count,
                genre: [] // Could map genre IDs if needed
            }));
        } catch (err) {
            console.error(err);
            throw err;
        }
    }, []);

    const dealHand = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const movies = await fetchMoviesByDifficulty(difficulty);
            if (movies.length < 5) throw new Error('Not enough movies found');

            const shuffled = [...movies].sort(() => 0.5 - Math.random());
            moviePool.current = shuffled.slice(5); // Keep rest in pool
            setHand(shuffled.slice(0, 5));
            setGameState('playing');
            setWinner(null);
            setRound(1);
        } catch (err) {
            console.warn('API Error, falling back to fakeMovies:', err);
            // Fallback to fakeMovies filtered by difficulty
            const fallbackMovies = FAKE_MOVIES.filter(m => m.difficulty === difficulty);
            const selectedMovies = fallbackMovies.length >= 5
                ? fallbackMovies
                : FAKE_MOVIES; // If not enough for this level, take any

            const shuffled = [...selectedMovies].sort(() => 0.5 - Math.random());
            moviePool.current = shuffled.slice(5);
            setHand(shuffled.slice(0, 5));
            setGameState('playing');
            setWinner(null);
            setRound(1);
        } finally {
            setLoading(false);
        }
    }, [difficulty, fetchMoviesByDifficulty]);

    const getMaxDiscards = () => {
        if (round === 1) return 4;
        if (round === 2) return 3;
        if (round === 3) return 2;
        return 0;
    };

    const swapCards = useCallback((idsToDiscard: number[]) => {
        const max = getMaxDiscards();
        if (idsToDiscard.length > max) return;

        const replacements = moviePool.current.slice(0, idsToDiscard.length);
        moviePool.current = moviePool.current.slice(idsToDiscard.length);

        setHand(prevHand => {
            const kept = prevHand.filter(m => !idsToDiscard.includes(m.id));
            return [...kept, ...replacements];
        });

        setRound(prev => prev + 1);
    }, [round, moviePool.current]);

    const stand = useCallback(() => {
        if (hand.length === 0) return;
        const winningIndex = Math.floor(Math.random() * hand.length);
        const chosen = hand[winningIndex];
        setWinner(chosen);
        setGameState('won');

        const today = new Date().toDateString();
        const lastPlayed = localStorage.getItem('movieDealerLastPlayed');
        if (lastPlayed !== today) {
            const newStreak = streak + 1;
            setStreak(newStreak);
            localStorage.setItem('movieDealerStreak', newStreak.toString());
            localStorage.setItem('movieDealerLastPlayed', today);
        }
    }, [hand, streak]);

    const resetGame = () => {
        setGameState('idle');
        setHand([]);
        setWinner(null);
        setRound(1);
        moviePool.current = [];
    }

    return {
        gameState,
        hand,
        winner,
        streak,
        round,
        loading,
        error,
        maxDiscards: getMaxDiscards(),
        difficulty,
        setDifficulty,
        dealHand,
        swapCards,
        stand,
        resetGame
    };
}
