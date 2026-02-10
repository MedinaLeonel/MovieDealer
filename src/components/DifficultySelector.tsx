/* src/components/DifficultySelector.tsx */
import './DifficultySelector.css';
import type { DifficultyLevel } from '../lib/types';

interface Props {
    level: DifficultyLevel;
    onChange: (level: DifficultyLevel) => void;
}

const LEVELS: { id: DifficultyLevel; label: string; sub: string }[] = [
    { id: 1, label: "Chill", sub: "Gente normal" },
    { id: 2, label: "¿Qué ver?", sub: "3-4 pelis/mes" },
    { id: 3, label: "Sorpréndeme", sub: "10+ pelis/mes" },
    { id: 4, label: "Adicto", sub: "30 pelis/mes" },
    { id: 5, label: "Extremo", sub: "Cinefilia pura" },
    { id: 6, label: "Leyenda", sub: "Historia del Cine" },
];

export function DifficultySelector({ level, onChange }: Props) {
    return (
        <div className="difficulty-container">
            <h3 className="diff-title">NIVEL DE CINEFILIA</h3>
            <div className="diff-grid">
                {LEVELS.map((L) => (
                    <button
                        key={L.id}
                        className={`diff-btn ${level === L.id ? 'active' : ''}`}
                        onClick={() => onChange(L.id)}
                    >
                        <div className="diff-num">{L.id}</div>
                        <div className="diff-text">
                            <strong>{L.label}</strong>
                            <span>{L.sub}</span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
