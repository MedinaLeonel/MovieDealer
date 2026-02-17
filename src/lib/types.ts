export type DifficultyLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface Movie {
  id: number;
  title: string;
  poster: string;
  backdrop?: string;
  overview: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  genres: { id: number; name: string; type?: string }[];
  runtime?: number;
  media_type: 'movie' | 'tv';
  // Propiedades adicionales para compatibilidad - con valores por defecto
  year: string;
  rating: number;
  genre: string[];
  isMystery?: boolean;
  mysteryText?: string;
  popularity?: number;
}

export interface PoolSettings {
  genre?: string;
  decade?: string;
  minRating?: number;
  type?: 'movie' | 'tv' | 'both';
}

export interface PoolState {
  movies: Movie[];
  isBuilding: boolean;
  lastBuilt: number;
  seenIds: Set<number>;
}

export interface FilterSettings {
  genres: string[];
  decades: string[];
  person?: { id: number; name: string; type?: 'actor' | 'director' };
  minRating?: number;
  genresToFollow?: string[];
  genresToExclude?: string[];
}

export type GameState = 'idle' | 'configuring' | 'dealing' | 'playing' | 'revealing' | 'won';

export interface SessionPreferences {
  desiredGenres: Record<string, number>;   // genre_id -> times kept
  vetoedGenres: Record<string, number>;    // genre_id -> times discarded
  avgRating: number;
  avgYear: number;
  totalKept: number;
  totalDiscarded: number;
}

export interface WatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

export interface WinningStats {
  winningGenres: Record<string, number>;
}

export interface MovieDetails extends Movie {
  providers?: WatchProvider[];
  flatrate?: boolean; // Indica si se puede ver por suscripción
}
