import { useState } from 'react';
import './App.css';
import { useMovieDealer } from './hooks/useMovieDealer';
import { Hand } from './components/Hand';
import { Winner } from './components/Winner';
import { AdSlot } from './components/AdSlot';
import { ThemeSelector } from './components/ThemeSelector';
import { DifficultySelector } from './components/DifficultySelector';

function App() {
  const {
    gameState,
    hand,
    winner,
    streak,
    round,
    loading,
    error,
    maxDiscards,
    difficulty,
    setDifficulty,
    dealHand,
    swapCards,
    stand,
    resetGame
  } = useMovieDealer();

  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const handleToggle = (id: number) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id);
      } else {
        if (prev.length >= maxDiscards) return prev;
        return [...prev, id];
      }
    });
  };

  const handleSwap = () => {
    if (selectedIds.length === 0) return;
    swapCards(selectedIds);
    setSelectedIds([]);
  };

  if (gameState === 'won' && winner) {
    return <Winner movie={winner} onReset={resetGame} />;
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="brand">MovieDealer 🎴</div>
        <ThemeSelector />
        <div className="streak">🔥 {streak}</div>
      </header>

      <main className="game-board">
        {gameState === 'idle' ? (
          <div className="hero-section">
            <h1 className="hero-title">
              No pienses.<br />Solo elige.
            </h1>
            <p className="hero-subtitle">Tu próxima película favorita en 60 segundos.</p>

            <DifficultySelector level={difficulty} onChange={setDifficulty} />

            <button
              className="btn-primary hero-cta"
              onClick={dealHand}
              disabled={loading}
            >
              {loading ? 'Repartiendo...' : 'Deal me a hand'}
            </button>

            {error && <div className="error-message">{error}</div>}
          </div>
        ) : (
          <div className="play-area">
            <div className="status-bar">
              <span>Lvl {difficulty} • Round {round}</span>
              <span className="separator">|</span>
              <span>Max Discards: {maxDiscards}</span>
            </div>

            <Hand
              cards={hand}
              selectedIds={selectedIds}
              onToggle={handleToggle}
            />

            <div className="controls">
              {maxDiscards > 0 && (
                <button
                  className="btn-danger"
                  onClick={handleSwap}
                  disabled={selectedIds.length === 0}
                >
                  Discard Selected ({selectedIds.length})
                </button>
              )}

              <button className="btn-primary" onClick={stand}>
                {maxDiscards === 0 ? "Final Choice (Plantarse)" : "Plantarse (Stand)"}
              </button>
            </div>

            <div className="instructions">
              {maxDiscards > 0 ?
                `Selecciona hasta ${maxDiscards} para descartar.` :
                "Ronda final. Elige jugar esta mano."
              }
            </div>

            <AdSlot active={false} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
