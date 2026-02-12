import { useState, useEffect, useCallback, useRef } from 'react';
import type { Movie, GameState, DifficultyLevel, FilterSettings, WinningStats, SessionPreferences } from '../lib/types';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || 'PLACEHOLDER_KEY';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w342';

/** Energía ilimitada para que los usuarios puedan probar sin agotarla (por el momento). */
const UNLIMITED_TOKENS = 999999;

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
    const [tokens, setTokens] = useState(UNLIMITED_TOKENS); // Energía ilimitada para pruebas
    const [difficulty, setDifficulty] = useState<DifficultyLevel>(1);
    const [filters, setFilters] = useState<FilterSettings>({ genres: [], decades: [] });
    const [discarded, setDiscarded] = useState<Movie[]>([]);
    const [learningMessage, setLearningMessage] = useState<string | null>(null);

    // v0.5.0: Session Preferences (adaptive learning)
    const [sessionPreferences, setSessionPreferences] = useState<SessionPreferences>({
        desiredGenres: {},
        vetoedGenres: {},
        avgRating: 0,
        avgYear: 0,
        totalKept: 0,
        totalDiscarded: 0
    });

    const moviePool = useRef<Movie[]>([]);
    const prevFilters = useRef<FilterSettings | null>(null);

    // 1. Load data from LocalStorage
    useEffect(() => {
        const storedStreak = localStorage.getItem('movieDealerStreak');
        if (storedStreak) setStreak(parseInt(storedStreak, 10));

        const storedSeen = localStorage.getItem('movieDealerSeen');
        if (storedSeen) setSeenMovieIds(JSON.parse(storedSeen));

        // Energía ilimitada: forzar siempre, ignorar localStorage
        setTokens(UNLIMITED_TOKENS);

        const storedStats = localStorage.getItem('movieDealerStats');
        if (storedStats) setUserStats(JSON.parse(storedStats));
    }, []);

    // 2. Persist Tokens (desactivado con energía ilimitada)
    // useEffect(() => {
    //     localStorage.setItem('movieDealerTokens', tokens.toString());
    // }, [tokens]);

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
            // Modo Sorpréndeme: Calidad con Factor Rareza (v0.3.5: Suelo de votos)
            url += '&vote_average.gte=7.0&popularity.lte=800&vote_count.gte=500&sort_by=vote_average.desc';
        } else {
            // Modo Leyenda: Foco en Clásicos y Culto (v0.3.5: Calidad Oro)
            url += '&vote_average.gte=8.0&vote_count.gte=1000&primary_release_date.lte=1995-01-01&sort_by=vote_average.desc';
        }

        // Sesgo positivo por perfil (Top 3 géneros ganadores)
        const topGenres = Object.entries(userStats.winningGenres)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(x => x[0]);

        if (topGenres.length > 0 && (!gameFilters.genres || gameFilters.genres.length === 0) && (!gameFilters.genresToFollow || gameFilters.genresToFollow.length === 0)) {
            // Solo sesgamos si el usuario no eligió filtros manuales ni hay preferencia de sesión
            url += `&with_genres=${topGenres.join('|')}`;
        }

        // v0.5.0: Géneros deseados (from kept cards) tienen prioridad
        if (gameFilters.genresToFollow && gameFilters.genresToFollow.length > 0) {
            url += `&with_genres=${gameFilters.genresToFollow.join('|')}`;
        } else if (gameFilters.genres && gameFilters.genres.length > 0) {
            // v0.4.0: Operador OR para géneros (Pipe |)
            url += `&with_genres=${gameFilters.genres.join('|')}`;
        }

        // v0.5.0: Géneros vetados (from discarded cards)
        if (gameFilters.genresToExclude && gameFilters.genresToExclude.length > 0) {
            url += `&without_genres=${gameFilters.genresToExclude.join(',')}`;
        }

        // 3. Rango Cronológico v0.4.0
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

        try {
            // v0.6.0: Fetch 10 pages in parallel for deep discovery (~200 movies instead of ~60)
            const randomStartPage = Math.floor(Math.random() * 5) + 1; // Start from page 1-5
            const numPages = 10; // Fetch 10 consecutive pages
            const pagePromises = Array.from({ length: numPages }, (_, i) =>
                fetch(`${url}&page=${randomStartPage + i}`)
            );

            console.log(`[Deep Discovery] Fetching ${numPages} pages starting from page ${randomStartPage}...`);
            const responses = await Promise.all(pagePromises);

            // Check if all responses are ok
            for (const response of responses) {
                if (!response.ok) throw new Error(`Error de API: ${response.status}`);
            }

            // Parse all responses
            const dataArrays = await Promise.all(responses.map(r => r.json()));

            // Combine all results into a single array
            let data = {
                results: dataArrays.flatMap(d => d.results || [])
            };

            console.log(`[Deep Discovery] ✅ Fetched ${data.results.length} movies from ${numPages} pages — Pool is ${Math.round(data.results.length / 20)}x larger!`);

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

                if (level >= 5) {
                    fallbackUrl += `&vote_count.gte=100`; // Prohibido bajar de 100 en Nivel 6
                    fallbackUrl += `&vote_average.gte=7.5`;
                } else {
                    fallbackUrl += `&vote_count.gte=50`;
                }

                // v0.5.1: Fallback también usa 2 páginas
                const fallbackPromises = [
                    fetch(`${fallbackUrl}&page=1`),
                    fetch(`${fallbackUrl}&page=2`)
                ];

                const fallbackResponses = await Promise.all(fallbackPromises);
                if (fallbackResponses.every(r => r.ok)) {
                    const fallbackDataArrays = await Promise.all(fallbackResponses.map(r => r.json()));
                    data = {
                        results: fallbackDataArrays.flatMap(d => d.results || [])
                    };
                    console.log(`[Fallback] Fetched ${data.results.length} movies from ${fallbackPromises.length} pages`);
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
        setGameState('revealing');
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

            if (initialPool.filter(m => !sessionSeen.has(m.id)).length < 6) {
                console.log("Pool aún pequeño: Relajando rating mínimo...");
                const lowRating = await fetchMoviesByDifficulty(difficulty, {
                    ...filters,
                    minRating: difficulty === 6 ? 7.5 : 5 // Nivel 6 no baja de 7.5
                }, '&page=3');
                initialPool = [...initialPool, ...lowRating];
            }

            // v0.3.5 Especial: Fallback Curado para Nivel 6
            if (difficulty === 6 && initialPool.filter(m => !sessionSeen.has(m.id)).length < 6) {
                console.log("Nivel 6 agotado: Inyectando Clásicos de Culto...");
                const classicIds = [680, 1398, 346, 238, 424, 15, 429, 103, 11]; // Pulp Fiction, Stalker, 7 Samurai, etc.
                const classicPromises = classicIds.map(async (id) => {
                    const res = await fetch(`${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&language=es-ES`);
                    if (res.ok) {
                        const m = await res.json();
                        return {
                            id: m.id,
                            title: m.title,
                            year: m.release_date?.split('-')[0] || 'N/A',
                            rating: m.vote_average,
                            poster: m.poster_path ? `${POSTER_BASE_URL}${m.poster_path}` : '',
                            overview: m.overview,
                            genre: m.genres?.map((g: any) => String(g.id)) || [],
                            isMystery: true, // Se inyecta como "Mystery Card de Clásico"
                            mysteryText: "TESORO DE LA CINETECA"
                        };
                    }
                    return null;
                });
                const classics = (await Promise.all(classicPromises)).filter(Boolean) as Movie[];
                initialPool = [...initialPool, ...classics];
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
                if (selectedHand.length < 6 && count < 2) {
                    selectedHand.push(movie);
                    genreCount[primaryGenre] = count + 1;
                    uniqueIds.add(movie.id);
                }
            }

            // Relleno final garantizando unicidad y sin repetir vistos
            while (selectedHand.length < 6 && shuffled.length > 0) {
                const movie = shuffled.pop()!;
                if (!uniqueIds.has(movie.id) && !sessionSeen.has(movie.id)) {
                    selectedHand.push(movie);
                    uniqueIds.add(movie.id);
                }
            }

            // Fallback Crítico: Mystery Cards (v0.4.0)
            if (selectedHand.length < 6) {
                console.warn("Algoritmo agotado: Insertando Mystery Cards para completar mano.");
                while (selectedHand.length < 6) {
                    selectedHand.push({
                        id: -100 - selectedHand.length,
                        title: "Mazo Agotado",
                        year: "????",
                        rating: 0,
                        poster: "",
                        genre: [],
                        overview: "El Dealer no encontró esa combinación, pero tiene estas joyas para vos. Intenta relajar los filtros para la próxima partida.",
                        isMystery: true,
                        mysteryText: "JOYA DEL DEALER"
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
            console.error(err);
            const message = err instanceof Error ? err.message : 'Error al repartir la mano.';
            setError(message);
            setGameState('idle');
        } finally {
            setLoading(false);
        }
    }, [difficulty, filters, fetchMoviesByDifficulty, saveSeenToStorage, seenMovieIds]);

    // 7. v0.5.0: Selection Protocol — Swapping receives keepIds (cards to CONSERVE)
    const swapCards = useCallback(async (keepIds: number[]) => {
        // Derive what to replace: everything NOT in keepIds
        const keptCards = hand.filter(m => keepIds.includes(m.id));
        const discardedCards = hand.filter(m => !keepIds.includes(m.id));
        const numToReplace = 6 - keptCards.length; // Always refill to 6

        if (tokens <= 0 || numToReplace === 0) return;

        setLoading(true);
        setLearningMessage('Aprendiendo tus gustos...');

        // --- SESSION LEARNING ENGINE ---
        setSessionPreferences(prev => {
            const newPrefs = { ...prev };

            // Lógica Positiva: sumar géneros conservados
            keptCards.forEach(m => {
                m.genre.forEach(g => {
                    newPrefs.desiredGenres[g] = (newPrefs.desiredGenres[g] || 0) + 1;
                });
            });

            // Lógica de Veto: sumar géneros descartados
            discardedCards.forEach(m => {
                m.genre.forEach(g => {
                    newPrefs.vetoedGenres[g] = (newPrefs.vetoedGenres[g] || 0) + 1;
                });
            });

            // Cruce de Datos: promedio de rating y año de las conservadas
            const allKeptRatings = [...(prev.totalKept > 0 ? [prev.avgRating * prev.totalKept] : []), ...keptCards.map(m => m.rating)];
            const allKeptYears = [...(prev.totalKept > 0 ? [prev.avgYear * prev.totalKept] : []), ...keptCards.filter(m => !isNaN(Number(m.year))).map(m => Number(m.year))];

            newPrefs.totalKept = prev.totalKept + keptCards.length;
            newPrefs.totalDiscarded = prev.totalDiscarded + discardedCards.length;
            newPrefs.avgRating = allKeptRatings.reduce((a, b) => a + b, 0) / Math.max(newPrefs.totalKept, 1);
            newPrefs.avgYear = allKeptYears.reduce((a, b) => a + b, 0) / Math.max(allKeptYears.length, 1);

            return newPrefs;
        });

        // Build adaptive filters from session preferences
        const currentPrefs = sessionPreferences;
        const desiredGenreIds = Object.entries(currentPrefs.desiredGenres)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([id]) => id);

        // Veto: genres discarded >= 3 times get excluded
        const vetoedGenreIds = Object.entries(currentPrefs.vetoedGenres)
            .filter(([, count]) => count >= 3)
            .map(([id]) => id)
            .filter(id => !desiredGenreIds.includes(id)); // Don't veto if also desired

        console.log('[v0.5.0 Learning]', {
            desired: desiredGenreIds,
            vetoed: vetoedGenreIds,
            avgRating: currentPrefs.avgRating.toFixed(1),
            avgYear: Math.round(currentPrefs.avgYear)
        });

        const handIds = new Set(keptCards.map(m => m.id));
        const sessionSeen = new Set(seenMovieIds);

        // Heurística de reemplazo: usar géneros deseados y vetar los rechazados
        const keptGenres = Array.from(new Set(keptCards.flatMap(m => m.genre)));
        const bestMovie = [...keptCards].sort((a, b) => b.rating - a.rating)[0];
        const targetDecade = bestMovie ? Math.floor(Number(bestMovie.year) / 10) * 10 : null;

        let replacements: Movie[] = [];
        const validFromPool = moviePool.current.filter(m => !handIds.has(m.id) && !sessionSeen.has(m.id));

        // Priority 1: Match kept genres + decade
        if (keptGenres.length > 0) {
            const intersected = validFromPool.filter(m => {
                const isDecade = targetDecade ? Math.floor(Number(m.year) / 10) * 10 === targetDecade : true;
                const hasGenre = m.genre.some(g => keptGenres.includes(g));
                const notVetoed = !m.genre.some(g => vetoedGenreIds.includes(g));
                return isDecade && hasGenre && notVetoed;
            });
            replacements = intersected.slice(0, numToReplace);
        }

        // Priority 2: From pool without decade restriction
        if (replacements.length < numToReplace) {
            const stillNeeded = numToReplace - replacements.length;
            const chosenIds = new Set(replacements.map(r => r.id));

            const fallback = validFromPool
                .filter(m => !chosenIds.has(m.id) && !handIds.has(m.id) && !m.genre.some(g => vetoedGenreIds.includes(g)))
                .slice(0, stillNeeded);

            replacements = [...replacements, ...fallback];
        }

        // Priority 3: Fetch new movies with adaptive filters from TMDB
        if (replacements.length < numToReplace) {
            try {
                const adaptiveFilters: FilterSettings = {
                    ...filters,
                    genresToFollow: desiredGenreIds.length > 0 ? desiredGenreIds : undefined,
                    genresToExclude: vetoedGenreIds.length > 0 ? vetoedGenreIds : undefined,
                };
                const freshMovies = await fetchMoviesByDifficulty(difficulty, adaptiveFilters, '&page=2');
                const validFresh = freshMovies.filter(m => !handIds.has(m.id) && !sessionSeen.has(m.id));
                const stillNeeded = numToReplace - replacements.length;
                replacements = [...replacements, ...validFresh.slice(0, stillNeeded)];
            } catch (e) {
                console.warn('Adaptive fetch failed, using fallback', e);
            }
        }

        // Priority 4: QA Fallback — relax date filter but keep genre veto
        if (replacements.length < numToReplace) {
            try {
                const relaxedFilters: FilterSettings = {
                    ...filters,
                    decades: [], // Relax date
                    genresToFollow: desiredGenreIds.length > 0 ? desiredGenreIds : undefined,
                    genresToExclude: vetoedGenreIds.length > 0 ? vetoedGenreIds : undefined,
                };
                const emergencyMovies = await fetchMoviesByDifficulty(difficulty, relaxedFilters, '&page=4');
                const validEmergency = emergencyMovies.filter(m => !handIds.has(m.id) && !sessionSeen.has(m.id) && !replacements.some(r => r.id === m.id));
                const stillNeeded = numToReplace - replacements.length;
                replacements = [...replacements, ...validEmergency.slice(0, stillNeeded)];
            } catch (e) {
                console.warn('Emergency fetch failed', e);
            }
        }

        // Priority 5: Mystery Cards as last resort
        while (replacements.length < numToReplace) {
            replacements.push({
                id: -500 - replacements.length,
                title: "Mazo Agotado",
                year: "???",
                rating: 0,
                poster: "",
                genre: [],
                overview: "El Dealer no encontró esa combinación, pero tiene estas joyas para vos.",
                isMystery: true,
                mysteryText: "JOYA DEL DEALER"
            });
        }

        let newHand = [...keptCards, ...replacements];
        saveSeenToStorage(replacements.filter(m => !m.isMystery).map(m => m.id));
        setDiscarded(prev => [...prev, ...discardedCards]);

        // Energía ilimitada: no se descuentan tokens
        // const tokensCost = discardedCards.length * 10;
        // setTokens(prev => Math.max(0, prev - tokensCost));
        const nextRound = round + 1;
        setRound(nextRound);

        // v0.6.1: Dealer Burn now REPLACES the card to maintain 6 cards
        if (nextRound === 2) {
            const sortedHand = [...newHand].sort((a, b) => a.rating - b.rating);
            const lowestRated = sortedHand[0];

            // Try to find one replacement for the burned card
            let burnReplacement: Movie[] = [];

            // Try pool first
            const replacementFromPool = moviePool.current.find(m =>
                !newHand.some(h => h.id === m.id) &&
                !sessionSeen.has(m.id) &&
                !discardedCards.some(d => d.id === m.id)
            );

            if (replacementFromPool) {
                burnReplacement = [replacementFromPool];
            } else {
                // Creating specialized mystery request or just Mystery Card
                burnReplacement = [{
                    id: -999,
                    title: "Comodín del Dealer",
                    year: "2026",
                    rating: 9.9,
                    poster: "",
                    genre: [],
                    overview: "El Dealer quemó una carta débil y sacó este comodín para mantener el juego vivo.",
                    isMystery: true,
                    mysteryText: "COMODÍN"
                }];
            }

            setBurnMessage(`Dealer's Choice: Cambié "${lowestRated.title}" por algo mejor.`);
            setDiscarded(prev => [...prev, lowestRated]);
            setTimeout(() => setBurnMessage(null), 5000);

            newHand = newHand.map(m => m.id === lowestRated.id ? burnReplacement[0] : m);
        }

        setHand(newHand);
        setLoading(false);
        setTimeout(() => setLearningMessage(null), 2000);
    }, [hand, round, tokens, seenMovieIds, sessionPreferences, difficulty, filters, executeDealerBurn, saveSeenToStorage, fetchMoviesByDifficulty]);

    const resetGame = () => {
        setGameState('idle');
        setHand([]);
        setWinner(null);
        setRound(1);
        setBurnMessage(null);
        setLearningMessage(null);
        setSessionPreferences({
            desiredGenres: {},
            vetoedGenres: {},
            avgRating: 0,
            avgYear: 0,
            totalKept: 0,
            totalDiscarded: 0
        });
        moviePool.current = [];
    };

    // v0.6.1: Siempre puede seleccionar para conservar (hasta 6). Con energía ilimitada siempre puede descartar.
    const maxKeep = 6;
    const maxDiscards = tokens > 0 ? 6 : 0;
    const tokensDisplay: string | number = tokens >= UNLIMITED_TOKENS ? '∞' : tokens;

    return {
        gameState,
        hand,
        winner,
        streak,
        tokens,
        tokensDisplay,
        round,
        loading,
        error,
        burnMessage,
        learningMessage,
        maxKeep,
        maxDiscards,
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

