import { useState } from 'react';
import './App.css';
import { useMovieDealer } from './hooks/useMovieDealer';
import { Hand } from './components/Hand';
import { Winner } from './components/Winner';
import { AdSlot } from './components/AdSlot';
import { ThemeSelector } from './components/ThemeSelector';
import { DifficultySelector } from './components/DifficultySelector';

import { FilterMenu } from './components/FilterMenu';

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
    filters,
    setFilters,
    goToConfig,
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

  const renderContent = () => {
    switch (gameState) {
      case 'idle':
        return (
          <div className="hero-section">
            <h1 className="hero-title">
              No pienses.<br />Solo elige.
            </h1>
            <p className="hero-subtitle">Tu próxima película favorita en 60 segundos.</p>

            <DifficultySelector level={difficulty} onChange={setDifficulty} />

            <button
              className="btn-primary hero-cta"
              onClick={goToConfig}
              disabled={loading}
            >
              Continuar
            </button>

            {error && <div className="error-message">{error}</div>}
          </div>
        );

      case 'configuring':
        return (
          <FilterMenu
            filters={filters}
            onFiltersChange={setFilters}
            onConfirm={dealHand}
            onBack={resetGame}
          />
        );

      case 'dealing':
        return (
          <div className="loading-state">
            <div className="dealer-spinner">🃏</div>
            <p>El Dealer está barajando...</p>
            {error && <div className="error-message">{error}</div>}
          </div>
        );

      case 'playing':
        return (
          <div className="play-area">
            <div className="game-status-panel">
              <div className="level-badge">LEVEL {difficulty}</div>
              <div className="round-indicator">
                {[1, 2, 3].map((r) => (
                  <div key={r} className={`round-step ${round >= r ? 'active' : ''} ${round === r ? 'current' : ''}`}>
                    <span className="step-num">{r}</span>
                    <span className="step-label">Ronda {r}</span>
                  </div>
                ))}
                <div className="round-step">
                  <span className="step-icon">🎯</span>
                  <span className="step-label">Final</span>
                </div>
              </div>
            </div>

            <div className="action-instruction">
              {maxDiscards > 0 ? (
                <>
                  <span className="instruction-text">
                    Selecciona hasta <strong>{maxDiscards}</strong> películas para descartar
                  </span>
                  <span className="instruction-subtext">Optimiza tu mano antes de la ronda final</span>
                </>
              ) : (
                <>
                  <span className="instruction-text highlight">¡RONDA FINAL!</span>
                  <span className="instruction-subtext">Es hora de decidir. ¿Te quedas con esta mano?</span>
                </>
              )}
            </div>

            <Hand
              cards={hand}
              selectedIds={selectedIds}
              onToggle={handleToggle}
            />

            <div className="controls-wrapper">
              {maxDiscards > 0 && (
                <button
                  className="btn-danger action-btn"
                  onClick={handleSwap}
                  disabled={selectedIds.length === 0}
                >
                  <span className="btn-icon">♻️</span>
                  Descartar Seleccionadas ({selectedIds.length})
                </button>
              )}

              <button className="btn-primary action-btn" onClick={stand}>
                <span className="btn-icon">🃏</span>
                {maxDiscards === 0 ? "Revelar Ganadora" : "Plantarse (Stand)"}
              </button>
            </div>

            <AdSlot active={false} />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="brand">MovieDealer 🎴</div>
        <ThemeSelector />
        <div className="streak">🔥 {streak}</div>
      </header>

      <main className="game-board">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
