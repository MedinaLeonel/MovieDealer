import { motion } from 'framer-motion';
import './DifficultySelector.css';
import { Tooltip } from './Tooltip';
import type { DifficultyLevel } from '../../lib/types';

interface Props {
    level: DifficultyLevel;
    onChange: (level: DifficultyLevel) => void;
}

const LEVELS: { id: DifficultyLevel; label: string; sub: string; desc: string }[] = [
    { id: 1, label: "Chill", sub: "Gente normal", desc: "Hits masivos y Blockbusters" },
    { id: 2, label: "¿Qué ver?", sub: "3-4 pelis/mes", desc: "Populares pero con calidad" },
    { id: 3, label: "Sorpréndeme", sub: "10+ pelis/mes", desc: "Joyas escondidas y buen rating" },
    { id: 4, label: "Adicto", sub: "30 pelis/mes", desc: "Filtro equilibrado para cinefilia diaria" },
    { id: 5, label: "Extremo", sub: "Cinefilia pura", desc: "Cine de autor y alta exigencia" },
    { id: 6, label: "Leyenda", sub: "Historia del Cine", desc: "Clásicos y obras maestras del culto" },
];

export function DifficultySelector({ level, onChange }: Props) {
    return (
        <div className="difficulty-container">
            <h3 className="diff-title">NIVEL DE CINEFILIA</h3>
            <div className="diff-grid">
                {LEVELS.map((L) => (
                    <Tooltip key={L.id} text={L.desc}>
                        <motion.button
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            className={`diff-btn ${level === L.id ? 'active' : ''}`}
                            onClick={() => onChange(L.id)}
                        >
                            <div className="diff-num">{L.id}</div>
                            <div className="diff-text">
                                <strong>{L.label}</strong>
                                <span>{L.sub}</span>
                            </div>
                        </motion.button>
                    </Tooltip>
                ))}
            </div>
        </div>
    );
}
