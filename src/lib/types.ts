export type DifficultyLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface Movie {
    id: number;
    title: string;
    year: string | number;
    rating: number; // 1-10 (vote_average)
    poster: string;
    genre: string[];
    director?: string;
    overview: string;
    difficulty?: DifficultyLevel;
    popularity?: number;
    vote_count?: number;
    imdb_id?: string;
    isMystery?: boolean;
    mysteryText?: string;
    media_type: 'movie' | 'tv'; // Required for streaming
}

export type GameState = 'idle' | 'configuring' | 'dealing' | 'playing' | 'revealing' | 'won';

export interface FilterSettings {
    genres: string[];
    decades: string[];
    person?: { id: number; name: string; type: 'actor' | 'director' };
    minRating?: number;
    genresToFollow?: string[];   // v0.5.0: Géneros deseados (from kept cards)
    genresToExclude?: string[];  // v0.5.0: Géneros vetados (from discarded cards)
}

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
