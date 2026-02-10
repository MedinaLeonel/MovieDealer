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
}

export type GameState = 'idle' | 'configuring' | 'dealing' | 'playing' | 'won';

export interface FilterSettings {
    genres: string[];
    decades: string[];
    person?: { id: number; name: string; type: 'actor' | 'director' };
    minRating?: number;
}
