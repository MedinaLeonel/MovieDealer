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

export type GameState = 'idle' | 'dealing' | 'playing' | 'won';
