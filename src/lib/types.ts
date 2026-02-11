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
}

export type GameState = 'idle' | 'configuring' | 'dealing' | 'playing' | 'revealing' | 'won';

export interface FilterSettings {
    genres: string[];
    decades: string[];
    person?: { id: number; name: string; type: 'actor' | 'director' };
    minRating?: number;
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
