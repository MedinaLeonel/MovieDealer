import { useState, useEffect, useCallback, useRef } from 'react';
import type { Movie, GameState, DifficultyLevel, FilterSettings } from '../lib/types';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || 'PLACEHOLDER_KEY';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w500';

interface UserPreferences {
    genres: Record<string, number>;
    decades: Record<string, number>;
}

export function useMovieDealer() {
    const [gameState, setGameState] = useState<GameState>('idle');
    const [hand, setHand] = useState<Movie[]>([]);
    const [winner, setWinner] = useState<Movie | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // History and Preferences
    const [seenMovieIds, setSeenMovieIds] = useState<number[]>([]);
    const [preferences, setPreferences] = useState<UserPreferences>({ genres: {}, decades: {} });

    // Game Logic State
    const [round, setRound] = useState(1);
    const [streak, setStreak] = useState(0);
    const [tokens, setTokens] = useState(100);
    const [difficulty, setDifficulty] = useState<DifficultyLevel>(1);
    const [filters, setFilters] = useState<FilterSettings>({ genres: [], decades: [] });
    const [discarded, setDiscarded] = useState<Movie[]>([]);

    // Cache to avoid multi-fetching same difficulty in same session
    const moviePool = useRef<Movie[]>([]);

    useEffect(() => {
        const storedStreak = localStorage.getItem('movieDealerStreak');
        if (storedStreak) setStreak(parseInt(storedStreak, 10));

        const storedSeen = localStorage.getItem('movieDealerSeen');
        if (storedSeen) setSeenMovieIds(JSON.parse(storedSeen));

        const storedTokens = localStorage.getItem('movieDealerTokens');
        if (storedTokens) setTokens(parseInt(storedTokens, 10));
    }, []);

    useEffect(() => {
        localStorage.setItem('movieDealerTokens', tokens.toString());
    }, [tokens]);

    const saveSeenToStorage = useCallback((ids: number[]) => {
        setSeenMovieIds(prev => {
            const updated = Array.from(new Set([...prev, ...ids])).slice(-200);
            localStorage.setItem('movieDealerSeen', JSON.stringify(updated));
            return updated;
        });
    }, []);

    const fetchMoviesByDifficulty = useCallback(async (
        level: DifficultyLevel,
        gameFilters: FilterSettings,
        extraParams: string = ''
    ): Promise<Movie[]> => {
        if (!TMDB_API_KEY || TMDB_API_KEY === 'PLACEHOLDER_KEY') {
            throw new Error('API Key faltante o inválida.');
        }

        let url = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=es-ES&sort_by=popularity.desc&include_adult=false`;

        if (level <= 2) {
            url += '&vote_count.gte=8000&popularity.gte=400';
        } else if (level <= 4) {
            url += '&vote_average.gte=7&popularity.lte=1000&popularity.gte=100';
        } else {
            url += '&vote_count.gte=500&vote_average.gte=7.5&sort_by=vote_average.desc';
        }

        if (gameFilters.genres && gameFilters.genres.length > 0) {
            url += `&with_genres=${gameFilters.genres.join('|')}`;
        }

        if (gameFilters.decades && gameFilters.decades.length > 0) {
            const years = gameFilters.decades.map(d => parseInt(d));
            const minYear = Math.min(...years);
            const maxYear = Math.max(...years) + 9;
            url += `&primary_release_date.gte=${minYear}-01-01&primary_release_date.lte=${maxYear}-12-31`;
        }

        if (gameFilters.minRating) {
            url += `&vote_average.gte=${gameFilters.minRating}`;
        }

        url += extraParams;
        const randomPage = Math.floor(Math.random() * 10) + 1;
        url += `&page=${randomPage}`;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Error de API: ${response.status}`);
            const data = await response.json();

            if (!data.results || data.results.length === 0) return [];

            return data.results
                .filter((m: { id: number }) => !seenMovieIds.includes(m.id))
                .map((m: any) => ({
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
    }, [seenMovieIds]);

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

    // All-in Trigger
    useEffect(() => {
        if (tokens <= 0 && gameState === 'playing') {
            stand();
        }
    }, [tokens, gameState, stand]);

    const executeDealerBurn = useCallback((currentHand: Movie[]) => {
        if (currentHand.length === 0) return currentHand;
        const sortedHand = [...currentHand].sort((a, b) => a.rating - b.rating);
        const lowestRated = sortedHand[0];
        setDiscarded(prev => [...prev, lowestRated]);
        return currentHand.filter(m => m.id !== lowestRated.id);
    }, []);

    const dealHand = useCallback(async () => {
        setLoading(true);
        setError(null);
        setGameState('dealing');
        try {
            let initialPool = await fetchMoviesByDifficulty(difficulty, filters);
            if (initialPool.length < 10) {
                const fallbackPool = await fetchMoviesByDifficulty(difficulty, filters, '&page=2');
                initialPool = [...initialPool, ...fallbackPool];
            }

            if (initialPool.length < 5) {
                throw new Error('El Dealer no encontró suficientes películas. Prueba a relajar los filtros.');
            }

            const selectedHand: Movie[] = [];
            const usedGenres = new Set<string>();
            const usedDecades = new Set<number>();
            const shuffled = initialPool.sort(() => 0.5 - Math.random());

            for (const movie of shuffled) {
                const decade = Math.floor(Number(movie.year) / 10) * 10;
                const hasNewGenre = movie.genre.some(g => !usedGenres.has(g));
                const isNewDecade = !usedDecades.has(decade);

                if (selectedHand.length < 5 && (hasNewGenre || isNewDecade)) {
                    selectedHand.push(movie);
                    movie.genre.forEach(g => usedGenres.add(g));
                    usedDecades.add(decade);
                }
            }

            while (selectedHand.length < 5 && shuffled.length > 0) {
                const movie = shuffled.pop()!;
                if (!selectedHand.find((m: Movie) => m.id === movie.id)) {
                    selectedHand.push(movie);
                }
            }

            moviePool.current = shuffled.filter(m => !selectedHand.find(s => s.id === m.id));
            setHand(selectedHand);
            setDiscarded([]);
            setGameState('playing');
            setWinner(null);
            setRound(1);
            saveSeenToStorage(selectedHand.map(m => m.id));
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error al repartir la mano.';
            setError(message);
            setGameState('idle');
        } finally {
            setLoading(false);
        }
    }, [difficulty, filters, fetchMoviesByDifficulty, saveSeenToStorage]);

    const getMaxDiscards = useCallback(() => {
        if (tokens <= 0) return 0;
        if (round === 1) return 4;
        if (round === 2) return 3;
        if (round === 3) return 2;
        return 0;
    }, [round, tokens]);

    const swapCards = useCallback(async (idsToDiscard: number[]) => {
        const max = getMaxDiscards();
        if (idsToDiscard.length > max || idsToDiscard.length === 0) return;

        setLoading(true);
        const keptCards = hand.filter(m => !idsToDiscard.includes(m.id));
        const keptGenres = keptCards.flatMap(m => m.genre);
        const keptDecades = keptCards.map(m => Math.floor(Number(m.year) / 10) * 10);

        const newPrefs = { ...preferences };
        keptGenres.forEach(g => newPrefs.genres[g] = (newPrefs.genres[g] || 0) + 1);
        keptDecades.forEach(d => newPrefs.decades[d] = (newPrefs.decades[d] || 0) + 1);
        setPreferences(newPrefs);

        let replacements: Movie[] = [];
        replacements = moviePool.current
            .filter(m => {
                const decade = Math.floor(Number(m.year) / 10) * 10;
                return keptGenres.some(g => m.genre.includes(g)) || keptDecades.includes(decade);
            })
            .slice(0, idsToDiscard.length);

        if (replacements.length < idsToDiscard.length) {
            try {
                const topGenre = Object.entries(newPrefs.genres).sort((a, b) => b[1] - a[1])[0]?.[0];
                const topDecade = Object.entries(newPrefs.decades).sort((a, b) => b[1] - a[1])[0]?.[0];

                const dynamicFilters = { ...filters };
                if (topGenre && !dynamicFilters.genres.includes(topGenre)) {
                    dynamicFilters.genres = [...dynamicFilters.genres, topGenre];
                }
                if (topDecade && !dynamicFilters.decades.includes(topDecade)) {
                    dynamicFilters.decades = [...dynamicFilters.decades, topDecade];
                }

                const extra = await fetchMoviesByDifficulty(difficulty, dynamicFilters, `&page=${Math.floor(Math.random() * 5) + 1}`);
                const extraReplacements = extra.filter(m => !hand.find(h => h.id === m.id)).slice(0, idsToDiscard.length - replacements.length);
                replacements = [...replacements, ...extraReplacements];
            } catch {
                replacements = [...replacements, ...moviePool.current.slice(0, idsToDiscard.length - replacements.length)];
            }
        }

        if (replacements.length < idsToDiscard.length) {
            const needed = idsToDiscard.length - replacements.length;
            replacements = [...replacements, ...moviePool.current.slice(0, needed)];
        }

        let newHand = [...keptCards, ...replacements];
        saveSeenToStorage(replacements.map(m => m.id));

        // Update Tokens: 10 tokens per card swapped
        setTokens(prev => Math.max(0, prev - (idsToDiscard.length * 10)));

        const nextRound = round + 1;
        setRound(nextRound);

        // Auto Dealer Burn at Round 2
        if (nextRound === 2) {
            newHand = executeDealerBurn(newHand);
        }

        setHand(newHand);
        setLoading(false);
    }, [hand, filters, difficulty, preferences, fetchMoviesByDifficulty, saveSeenToStorage, getMaxDiscards, round, executeDealerBurn]);

    const goToConfig = () => setGameState('configuring');

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
        tokens,
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
        resetGame,
        discarded
    };
}

