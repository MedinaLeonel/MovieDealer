import { useState, useEffect, useCallback, useRef } from 'react';
import type { Movie, GameState, DifficultyLevel, FilterSettings } from '../lib/types';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || 'PLACEHOLDER_KEY';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export function useMovieDealer() {
    const [gameState, setGameState] = useState<GameState>('idle');
    const [hand, setHand] = useState<Movie[]>([]);
    const [winner, setWinner] = useState<Movie | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Debugging: Check if API Key is loaded in production
    useEffect(() => {
        if (import.meta.env.PROD) {
            console.log('Production Environment Detected');
            console.log('TMDB API Key configured:', !!import.meta.env.VITE_TMDB_API_KEY);
        }
    }, []);

    // Game Logic State
    const [round, setRound] = useState(1);
    const [streak, setStreak] = useState(0);
    const [difficulty, setDifficulty] = useState<DifficultyLevel>(1);
    const [filters, setFilters] = useState<FilterSettings>({});

    // Cache to avoid multi-fetching same difficulty in same session
    const moviePool = useRef<Movie[]>([]);

    useEffect(() => {
        const storedStreak = localStorage.getItem('movieDealerStreak');
        if (storedStreak) {
            setStreak(parseInt(storedStreak, 10));
        }
    }, []);

    const fetchMoviesByDifficulty = useCallback(async (level: DifficultyLevel, gameFilters: FilterSettings): Promise<Movie[]> => {
        if (!TMDB_API_KEY || TMDB_API_KEY === 'PLACEHOLDER_KEY') {
            throw new Error('API Key faltante o inválida.');
        }

        let url = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=es-ES&sort_by=popularity.desc&include_adult=false`;

        // Apply Difficulty Base
        if (level <= 2) {
            url += '&vote_count.gte=5000&popularity.gte=500';
        } else if (level <= 4) {
            url += '&vote_average.gte=7&popularity.lte=500&popularity.gte=100';
        } else {
            url += '&vote_count.lte=1000&vote_average.gte=7.5&vote_count.gte=50';
        }

        // Apply Dynamic Filters
        if (gameFilters.genre) {
            url += `&with_genres=${gameFilters.genre}`;
        }
        if (gameFilters.decade) {
            const year = parseInt(gameFilters.decade);
            url += `&primary_release_date.gte=${year}-01-01&primary_release_date.lte=${year + 9}-12-31`;
        }
        if (gameFilters.person) {
            url += `&with_people=${gameFilters.person.id}`;
        }
        if (gameFilters.minRating) {
            url += `&vote_average.gte=${gameFilters.minRating}`;
        }

        // Randomize page slightly to avoid repetition
        url += `&page=${Math.floor(Math.random() * 3) + 1}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                if (response.status === 401) throw new Error('Error 401: API Key inválida.');
                throw new Error(`Error de API: ${response.status}`);
            }
            const data = await response.json();

            if (!data.results || data.results.length === 0) {
                // If specific filters returned nothing, try without some or warn
                throw new Error('No se encontraron películas para esta combinación de filtros.');
            }

            return data.results.map((m: any) => ({
                id: m.id,
                title: m.title,
                year: m.release_date?.split('-')[0] || 'N/A',
                rating: m.vote_average,
                poster: m.poster_path ? `${POSTER_BASE_URL}${m.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Poster',
                overview: m.overview,
                popularity: m.popularity,
                vote_count: m.vote_count,
                genre: m.genre_ids?.map(String) || []
            }));
        } catch (err) {
            console.error('Fetch error:', err);
            throw err;
        }
    }, []);

    const goToConfig = () => setGameState('configuring');

    const dealHand = useCallback(async () => {
        setLoading(true);
        setError(null);
        setGameState('dealing');
        try {
            const movies = await fetchMoviesByDifficulty(difficulty, filters);
            if (movies.length < 5) throw new Error('No hay suficientes películas con estos filtros. Intenta suavizar tu búsqueda.');

            const shuffled = [...movies].sort(() => 0.5 - Math.random());
            moviePool.current = shuffled.slice(5); // Keep rest in pool
            setHand(shuffled.slice(0, 5));
            setGameState('playing');
            setWinner(null);
            setRound(1);
        } catch (err: any) {
            console.error('Game Error:', err);
            setError(err.message || 'Error desconocido al cargar películas.');
            setGameState('configuring'); // Fallback to config
        } finally {
            setLoading(false);
        }
    }, [difficulty, filters, fetchMoviesByDifficulty]);

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
        setFilters({});
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
        filters,
        setFilters,
        goToConfig,
        dealHand,
        swapCards,
        stand,
        resetGame
    };
}
