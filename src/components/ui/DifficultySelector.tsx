import { motion } from 'framer-motion';
import './DifficultySelector.css';
import { Tooltip } from './Tooltip';
import type { DifficultyLevel } from '../../lib/types';

interface Props {
    level: DifficultyLevel;
    onChange: (level: DifficultyLevel) => void;
    onShowInfo: () => void;
}

const LEVELS: { id: DifficultyLevel; label: string; sub: string; desc: string }[] = [
    { id: 1, label: "Taquilla Mundial", sub: "Brillante y Dorado", desc: "Hits masivos y Blockbusters" },
    { id: 2, label: "¿Qué ver?", sub: "Popular", desc: "Populares pero con calidad" },
    { id: 3, label: "Sorpréndeme", sub: "Gemas Ocultas", desc: "Joyas escondidas y buen rating" },
    { id: 4, label: "Adicto", sub: "Cinefilia Diaria", desc: "Filtro equilibrado para cinefilia diaria" },
    { id: 5, label: "Extremo", sub: "Autor", desc: "Cine de autor y alta exigencia" },
    { id: 6, label: "Cineteca", sub: "Archivo Prohibido", desc: "Clásicos y obras maestras del culto" },
];

export function DifficultySelector({ level, onChange, onShowInfo }: Props) {
    return (
        <div className="difficulty-container">
            <h3 className="diff-title">NIVEL DE CINEFILIA</h3>
            <button className="info-trigger-inline" onClick={onShowInfo}>
                ¿Cómo funciona? ℹ️
            </button>
            <p className="diff-choose-deck">Elige tu <span className="diff-choose-deck--accent">mazo</span></p>
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
