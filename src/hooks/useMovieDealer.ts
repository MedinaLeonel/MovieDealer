import { useState, useEffect, useCallback, useRef } from 'react';
import type { Movie, GameState, DifficultyLevel, FilterSettings, WinningStats } from '../lib/types';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || 'PLACEHOLDER_KEY';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export function useMovieDealer() {
    const [gameState, setGameState] = useState<GameState>('idle');
    const [hand, setHand] = useState<Movie[]>([]);
    const [winner, setWinner] = useState<Movie | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [burnMessage, setBurnMessage] = useState<string | null>(null);

    // History and Profile
    const [seenMovieIds, setSeenMovieIds] = useState<number[]>([]);
    const [userStats, setUserStats] = useState<WinningStats>({ winningGenres: {} });

    // Game Logic State
    const [round, setRound] = useState(1);
    const [streak, setStreak] = useState(0);
    const [tokens, setTokens] = useState(100);
    const [difficulty, setDifficulty] = useState<DifficultyLevel>(1);
    const [filters, setFilters] = useState<FilterSettings>({ genres: [], decades: [] });
    const [discarded, setDiscarded] = useState<Movie[]>([]);

    const moviePool = useRef<Movie[]>([]);
    const prevFilters = useRef<FilterSettings | null>(null);

    // 1. Load data from LocalStorage
    useEffect(() => {
        const storedStreak = localStorage.getItem('movieDealerStreak');
        if (storedStreak) setStreak(parseInt(storedStreak, 10));

        const storedSeen = localStorage.getItem('movieDealerSeen');
        if (storedSeen) setSeenMovieIds(JSON.parse(storedSeen));

        const storedTokens = localStorage.getItem('movieDealerTokens');
        if (storedTokens) setTokens(parseInt(storedTokens, 10));

        const storedStats = localStorage.getItem('movieDealerStats');
        if (storedStats) setUserStats(JSON.parse(storedStats));
    }, []);

    // 2. Persist Tokens
    useEffect(() => {
        localStorage.setItem('movieDealerTokens', tokens.toString());
    }, [tokens]);

    // Limpieza de memoria si los filtros cambian drásticamente (v0.2.2)
    useEffect(() => {
        if (prevFilters.current) {
            const hasPersonChanged = prevFilters.current.person?.id !== filters.person?.id;
            const haveGenresChanged = JSON.stringify(prevFilters.current.genres) !== JSON.stringify(filters.genres);
            const haveDecadesChanged = JSON.stringify(prevFilters.current.decades) !== JSON.stringify(filters.decades);

            if (hasPersonChanged || haveGenresChanged || haveDecadesChanged) {
                console.log("Filtros cambiaron drásticamente: Limpiando historial de sesión.");
                setSeenMovieIds([]);
            }
        }
        prevFilters.current = filters;
    }, [filters]);

    const saveSeenToStorage = useCallback((ids: number[]) => {
        setSeenMovieIds(prev => {
            const updated = Array.from(new Set([...prev, ...ids])).slice(-500); // Aumentamos historial para v0.2.0
            localStorage.setItem('movieDealerSeen', JSON.stringify(updated));
            return updated;
        });
    }, []);

    const updateWinningStats = useCallback((movie: Movie) => {
        const newStats = { ...userStats };
        movie.genre.forEach(g => {
            newStats.winningGenres[g] = (newStats.winningGenres[g] || 0) + 1;
        });
        setUserStats(newStats);
        localStorage.setItem('movieDealerStats', JSON.stringify(newStats));
    }, [userStats]);

    // 3. Search Engine Parametrizado (v0.2.0)
    const fetchMoviesByDifficulty = useCallback(async (
        level: DifficultyLevel,
        gameFilters: FilterSettings,
        extraParams: string = ''
    ): Promise<Movie[]> => {
        if (!TMDB_API_KEY || TMDB_API_KEY === 'PLACEHOLDER_KEY') {
            throw new Error('API Key faltante o inválida.');
        }

        let url = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=es-ES&include_adult=false`;

        // Especificaciones del algoritmo v0.2.0
        if (level <= 2) {
            // Modo Chill: Hits masivos
            url += '&vote_count.gte=8000&sort_by=popularity.desc';
        } else if (level <= 4) {
            // Modo Sorpréndeme: Calidad con Factor Rareza
            url += '&vote_average.gte=7.0&popularity.lte=500&sort_by=vote_average.desc';
        } else {
            // Modo Leyenda: Foco en Clásicos y Culto
            url += '&vote_average.gte=7.8&primary_release_date.lte=2000-01-01&sort_by=vote_average.desc';
        }

        // Sesgo positivo por perfil (Top 3 géneros ganadores)
        const topGenres = Object.entries(userStats.winningGenres)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(x => x[0]);

        if (topGenres.length > 0 && (!gameFilters.genres || gameFilters.genres.length === 0)) {
            // Solo sesgamos si el usuario no eligió filtros manuales
            url += `&with_genres=${topGenres.join('|')}`;
        }

        if (gameFilters.genres && gameFilters.genres.length > 0) {
            url += `&with_genres=${gameFilters.genres.join('|')}`;
        }

        // 3. Fallback de Décadas (v0.2.1)
        if (gameFilters.decades && gameFilters.decades.length > 0) {
            const years = gameFilters.decades.map(d => parseInt(d));
            const minYear = Math.min(...years);
            const maxYear = Math.max(...years) + 9;
            url += `&primary_release_date.gte=${minYear}-01-01&primary_release_date.lte=${maxYear}-12-31`;
        }

        // Filtro de Personas (v0.2.1)
        if (gameFilters.person) {
            url += `&with_people=${gameFilters.person.id}`;
        }

        if (gameFilters.minRating) {
            url += `&vote_average.gte=${gameFilters.minRating}`;
        }

        url += extraParams;
        const randomPage = Math.floor(Math.random() * 5) + 1;
        url += `&page=${randomPage}`;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Error de API: ${response.status}`);
            let data = await response.json();

            // GRACEFUL FALLBACK (v0.2.1/v0.2.2)
            if ((!data.results || data.results.length < 10) && (gameFilters.decades?.length || gameFilters.person)) {
                console.log("Graceful Fallback: Expandiendo búsqueda...");
                let fallbackUrl = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=es-ES&include_adult=false&sort_by=popularity.desc`;

                if (gameFilters.person) fallbackUrl += `&with_people=${gameFilters.person.id}`;
                if (gameFilters.genres?.length) fallbackUrl += `&with_genres=${gameFilters.genres.join('|')}`;

                if (gameFilters.decades?.length) {
                    const years = gameFilters.decades.map(d => parseInt(d));
                    const minYear = Math.min(...years) - 10;
                    const maxYear = Math.max(...years) + 20;
                    fallbackUrl += `&primary_release_date.gte=${minYear}-01-01&primary_release_date.lte=${maxYear}-12-31`;
                }

                fallbackUrl += `&vote_count.gte=50`;

                const fallbackRes = await fetch(fallbackUrl);
                if (fallbackRes.ok) {
                    data = await fallbackRes.json();
                }
            }

            if (!data.results || data.results.length === 0) return [];

            return data.results
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
    }, [seenMovieIds, userStats.winningGenres]);

    const stand = useCallback(async () => {
        if (hand.length === 0) return;
        setLoading(true);

        try {
            // Analizar la mano para el desempate por streaming
            const candidates = [...hand].sort((a, b) => b.rating - a.rating);
            const topRating = candidates[0].rating;

            // Filtramos las que tienen rating similar (empate técnico si la diferencia es < 0.2)
            const tiedMovies = candidates.filter(m => Math.abs(m.rating - topRating) < 0.2);

            let chosen: Movie;

            if (tiedMovies.length > 1) {
                // Hay empate técnico, revisamos WatchProviders para AR
                const providersPromises = tiedMovies.map(async (m) => {
                    const res = await fetch(`${TMDB_BASE_URL}/movie/${m.id}/watch/providers?api_key=${TMDB_API_KEY}`);
                    const data = await res.json();
                    const resultsAR = data.results?.AR;
                    const hasFlatrate = !!(resultsAR?.flatrate && resultsAR.flatrate.length > 0);
                    return { ...m, hasFlatrate };
                });

                const moviesWithStreaming = await Promise.all(providersPromises);
                const streamWinner = moviesWithStreaming.find(m => m.hasFlatrate);

                chosen = streamWinner || tiedMovies[0]; // Si ninguna tiene streaming, tomamos la de mayor rating
            } else {
                chosen = candidates[0];
            }

            setGameState('revealing');

            // Simular secuencia de revelación (delay para animación en UI)
            setTimeout(() => {
                setWinner(chosen);
                updateWinningStats(chosen);
                setGameState('won');

                const today = new Date().toDateString();
                const lastPlayed = localStorage.getItem('movieDealerLastPlayed');
                if (lastPlayed !== today) {
                    setStreak(prev => {
                        const newStreak = prev + 1;
                        localStorage.setItem('movieDealerStreak', newStreak.toString());
                        localStorage.setItem('movieDealerLastPlayed', today);
                        return newStreak;
                    });
                }
            }, 1500);

        } catch (err) {
            console.error("Error in stand selection:", err);
            // Fallback al primer candidato si algo falla
            setWinner(hand[0]);
            setGameState('won');
        } finally {
            setLoading(false);
        }
    }, [hand, streak, updateWinningStats]);

    // 5. Dealer Burn (Ronda 2)
    const executeDealerBurn = useCallback((currentHand: Movie[]) => {
        if (currentHand.length === 0) return currentHand;

        // El Dealer elimina la de menor vote_average
        const sortedHand = [...currentHand].sort((a, b) => a.rating - b.rating);
        const lowestRated = sortedHand[0];

        setBurnMessage(`Dealer's Choice: Eliminé "${lowestRated.title}" por baja calidad.`);
        setDiscarded(prev => [...prev, lowestRated]);

        // Autoclean message after delay
        setTimeout(() => setBurnMessage(null), 5000);

        return currentHand.filter(m => m.id !== lowestRated.id);
    }, []);

    // 6. Algoritmo de Reparto (Diversidad & Memoria)
    const dealHand = useCallback(async () => {
        setLoading(true);
        setError(null);
        setBurnMessage(null);
        setGameState('dealing');

        try {
            const sessionSeen = new Set<number>(seenMovieIds);
            let initialPool = await fetchMoviesByDifficulty(difficulty, filters);

            // Search Expansion (v0.2.2)
            if (initialPool.length < 15 && filters.person) {
                console.log("Pool pequeño: Eliminando filtro de persona para completar...");
                const expanded = await fetchMoviesByDifficulty(difficulty, { ...filters, person: undefined });
                initialPool = [...initialPool, ...expanded];
            }

            if (initialPool.filter(m => !sessionSeen.has(m.id)).length < 5) {
                console.log("Pool aún pequeño: Relajando rating mínimo...");
                const lowRating = await fetchMoviesByDifficulty(difficulty, { ...filters, minRating: 5 }, '&page=3');
                initialPool = [...initialPool, ...lowRating];
            }

            const selectedHand: Movie[] = [];
            const genreCount: Record<string, number> = {};
            const uniqueIds = new Set<number>();
            const shuffled = initialPool.sort(() => 0.5 - Math.random());

            for (const movie of shuffled) {
                // Validación estricta de duplicados (historial + mano actual)
                if (uniqueIds.has(movie.id) || sessionSeen.has(movie.id)) continue;

                const primaryGenre = movie.genre[0];
                const count = genreCount[primaryGenre] || 0;

                // Priorizamos diversidad de géneros (máximo 2 por género)
                if (selectedHand.length < 5 && count < 2) {
                    selectedHand.push(movie);
                    genreCount[primaryGenre] = count + 1;
                    uniqueIds.add(movie.id);
                }
            }

            // Relleno final garantizando unicidad y sin repetir vistos
            while (selectedHand.length < 5 && shuffled.length > 0) {
                const movie = shuffled.pop()!;
                if (!uniqueIds.has(movie.id) && !sessionSeen.has(movie.id)) {
                    selectedHand.push(movie);
                    uniqueIds.add(movie.id);
                }
            }

            // Fallback Crítico: Mystery Cards (v0.2.2)
            if (selectedHand.length < 5) {
                console.warn("Algoritmo agotado: Insertando Mystery Cards para completar mano.");
                while (selectedHand.length < 5) {
                    selectedHand.push({
                        id: -100 - selectedHand.length,
                        title: "Carta de Misterio",
                        year: "????",
                        rating: 0,
                        poster: "", // Se maneja en el CSS/Componente
                        genre: [],
                        overview: "El Dealer está barajando... esta carta se revelará como un comodín en futuras versiones o simplemente representa el límite de tu búsqueda actual.",
                        isMystery: true
                    });
                }
            }

            moviePool.current = shuffled.filter(m => !uniqueIds.has(m.id));
            setHand(selectedHand);
            setDiscarded([]);
            setGameState('playing');
            setWinner(null);
            setRound(1);
            saveSeenToStorage(selectedHand.filter(m => !m.isMystery).map(m => m.id));
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error al repartir la mano.';
            setError(message);
            setGameState('idle');
        } finally {
            setLoading(false);
        }
    }, [difficulty, filters, fetchMoviesByDifficulty, saveSeenToStorage, seenMovieIds]);

    // 7. Swapping Adaptativo
    const swapCards = useCallback(async (idsToDiscard: number[]) => {
        const max = (round === 1) ? 4 : (round === 2) ? 3 : (round === 3) ? 2 : 0;
        if (tokens <= 0 || idsToDiscard.length > max || idsToDiscard.length === 0) return;

        setLoading(true);
        const keptCards = hand.filter(m => !idsToDiscard.includes(m.id));
        const handIds = new Set(keptCards.map(m => m.id));
        const sessionSeen = new Set(seenMovieIds);

        const keptGenres = Array.from(new Set(keptCards.flatMap(m => m.genre)));
        const bestMovie = [...keptCards].sort((a, b) => b.rating - a.rating)[0];
        const targetDecade = bestMovie ? Math.floor(Number(bestMovie.year) / 10) * 10 : null;

        let replacements: Movie[] = [];

        // Heurística de reemplazo único
        const validFromPool = moviePool.current.filter(m => !handIds.has(m.id) && !sessionSeen.has(m.id));

        if (keptGenres.length > 0) {
            const intersected = validFromPool.filter(m => {
                const isDecade = targetDecade ? Math.floor(Number(m.year) / 10) * 10 === targetDecade : true;
                const hasGenre = m.genre.some(g => keptGenres.includes(g));
                return isDecade && hasGenre;
            });
            replacements = intersected.slice(0, idsToDiscard.length);
        }

        if (replacements.length < idsToDiscard.length) {
            const stillNeeded = idsToDiscard.length - replacements.length;
            const chosenIds = new Set(replacements.map(r => r.id));

            // Forzamos unicidad total vs mano y vistos
            const fallback = validFromPool
                .filter(m => !chosenIds.has(m.id) && !handIds.has(m.id))
                .slice(0, stillNeeded);

            replacements = [...replacements, ...fallback];
        }

        // Si aún faltan, usamos Mystery Cards
        while (replacements.length < idsToDiscard.length) {
            replacements.push({
                id: -500 - replacements.length,
                title: "Mystery Replacement",
                year: "???",
                rating: 0,
                poster: "",
                genre: [],
                overview: "El mazo está vacío. Esta carta de misterio rellena tu mano para que puedas seguir jugando.",
                isMystery: true
            });
        }

        let newHand = [...keptCards, ...replacements];
        saveSeenToStorage(replacements.filter(m => !m.isMystery).map(m => m.id));

        setTokens(prev => Math.max(0, prev - (idsToDiscard.length * 10)));
        const nextRound = round + 1;
        setRound(nextRound);

        if (nextRound === 2) {
            newHand = executeDealerBurn(newHand);
        }

        setHand(newHand);
        setLoading(false);
    }, [hand, round, tokens, seenMovieIds, executeDealerBurn, saveSeenToStorage]);

    const resetGame = () => {
        setGameState('idle');
        setHand([]);
        setWinner(null);
        setRound(1);
        setBurnMessage(null);
        moviePool.current = [];
    };

    return {
        gameState,
        hand,
        winner,
        streak,
        tokens,
        round,
        loading,
        error,
        burnMessage,
        maxDiscards: (tokens <= 0) ? 0 : (round === 1) ? 4 : (round === 2) ? 3 : (round === 3) ? 2 : 0,
        difficulty,
        setDifficulty,
        filters,
        setFilters,
        goToConfig: () => setGameState('configuring'),
        dealHand,
        swapCards,
        stand,
        resetGame,
        discarded
    };
}

