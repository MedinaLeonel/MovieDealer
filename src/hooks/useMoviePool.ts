import { useState, useCallback } from 'react';
import type { PoolSettings, PoolState } from '../lib/types';
import { TMDB_API_KEY, TMDB_BASE_URL } from '../lib/constants';

export function useMoviePool() {
  const [poolState, setPoolState] = useState<PoolState>({
    movies: [],
    isBuilding: false,
    lastBuilt: 0,
    seenIds: new Set()
  });

  const [poolSettings, setPoolSettings] = useState<PoolSettings>({
    type: 'both',
    minRating: 6.5
  });

  const buildPool = useCallback(async (settings: PoolSettings) => {
    setPoolState(prev => ({ ...prev, isBuilding: true }));
    
    try {
      let url = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=es-ES&include_adult=false`;
      
      // Apply filters
      if (settings.minRating) {
        url += `&vote_average.gte=${settings.minRating}`;
      }
      
      if (settings.genre) {
        url += `&with_genres=${settings.genre}`;
      }
      
      if (settings.decade) {
        const [startYear, endYear] = settings.decade.split('-').map(Number);
        url += `&primary_release_date.gte=${startYear}-01-01&primary_release_date.lte=${endYear}-12-31`;
      }
      
      if (settings.type !== 'both') {
        url += settings.type === 'movie' ? '&with_original_language=en' : '&first_air_date.lte=2024-01-01';
      }
      
      // Fetch 5 pages = ~100 movies
      const pagePromises = [];
      for (let page = 1; page <= 5; page++) {
        pagePromises.push(fetch(`${url}&page=${page}`));
      }
      
      const responses = await Promise.all(pagePromises);
      const moviePromises = responses.map(async response => {
        if (!response.ok) {
          console.error(`API Error: ${response.status}`);
          return [];
        }
        const data = await response.json();
        const movies = data.results || [];
        
        // Add media_type to all movies
        return movies.map((movie: any) => ({
          ...movie,
          media_type: 'movie' as const,
          year: movie.release_date ? movie.release_date.split('-')[0] : 'Unknown',
          rating: movie.vote_average || 0,
          genre: movie.genres?.map((g: any) => g.name) || [],
          isMystery: false,
          mysteryText: undefined,
          popularity: movie.popularity || 0
        }));
      });
      
      const movieArrays = await Promise.all(moviePromises);
      const allMoviesFlat = movieArrays.flat();
      
      // Shuffle and limit to 200 max
      const shuffledMovies = allMoviesFlat
        .sort(() => Math.random() - 0.5)
        .slice(0, 200);
      
      const newSeenIds = new Set([
        ...poolState.seenIds,
        ...shuffledMovies.map((m: any) => m.id)
      ]);
      
      setPoolState({
        movies: shuffledMovies,
        isBuilding: false,
        lastBuilt: Date.now(),
        seenIds: newSeenIds
      });
      
      console.log(`✅ Pool built: ${shuffledMovies.length} movies, ${newSeenIds.size} total seen`);
      
    } catch (error) {
      console.error('Error building pool:', error);
      setPoolState(prev => ({ ...prev, isBuilding: false }));
    }
  }, [poolState.seenIds]);

  const getFromPool = useCallback((count: number = 5) => {
    if (poolState.movies.length === 0) {
      console.warn('Pool is empty, rebuilding...');
      buildPool(poolSettings);
      return [];
    }
    
    const available = poolState.movies.filter(movie => 
      !poolState.seenIds.has(movie.id)
    );
    
    const selected = available
      .sort(() => Math.random() - 0.5)
      .slice(0, count);
    
    // Mark as seen
    const newSeenIds = new Set([
      ...poolState.seenIds,
      ...selected.map(m => m.id)
    ]);
    
    setPoolState(prev => ({
      ...prev,
      seenIds: newSeenIds
    }));
    
    return selected;
  }, [poolState.movies, poolState.seenIds, poolSettings]);

  const rebuildPool = useCallback(() => {
    setPoolState(prev => ({ ...prev, seenIds: new Set() }));
    setTimeout(() => buildPool(poolSettings), 100);
  }, [buildPool, poolSettings]);

  return {
    poolState,
    poolSettings,
    setPoolSettings,
    buildPool,
    getFromPool,
    rebuildPool
  };
}
