import { useState } from 'react';
import { useMovieDealer } from './hooks/useMovieDealer';
import { Hand } from './components/Hand';
import { Winner } from './components/Winner';
import { AdSlot } from './components/ui/AdSlot';
import { DifficultySelector } from './components/ui/DifficultySelector';
import { Header } from './components/Header';
import { Tooltip } from './components/ui/Tooltip';

import { FilterMenu } from './components/FilterMenu';

import { Onboarding } from './components/Onboarding';
import { ToastFeed } from './components/ToastFeed';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const {
    gameState,
    hand,
    winner,
    streak,
    tokens,
    round,
    loading,
    error,
    burnMessage,
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

  // No longer returning Winner early, it will be handled in renderContent within the container scope

  const renderContent = () => {
    switch (gameState) {
      case 'won':
        return winner ? <Winner movie={winner} hand={hand} onReset={resetGame} /> : null;
      case 'idle':
        return (
          <div className="hero-section">
            <h1 className="hero-title">
              No pienses.<br />Solo elige.
            </h1>
            <p className="hero-subtitle">Tu próxima película favorita en 60 segundos.</p>

            <DifficultySelector level={difficulty} onChange={setDifficulty} />

            <motion.div
              className="setup-choice-group"
              variants={{
                show: {
                  transition: {
                    staggerChildren: 0.1,
                    delayChildren: 0.5
                  }
                }
              }}
              initial="hidden"
              animate="show"
            >
              <motion.button
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0 }
                }}
                whileHover={{ scale: 1.05, boxShadow: 'var(--glow-accent)' }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary hero-cta pulse-btn"
                onClick={dealHand}
                disabled={loading}
              >
                {loading ? 'Preparando...' : 'Comenzar Juego'}
              </motion.button>

              <motion.button
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0 }
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-secondary hero-cta"
                onClick={goToConfig}
                disabled={loading}
              >
                Personalizar Mano
              </motion.button>
            </motion.div>

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
      case 'revealing':
        return (
          <div className="play-area">
            <div className={`game-status-panel ${gameState === 'revealing' ? 'blur-out' : ''}`}>
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
              {burnMessage && (
                <div className="dealer-burn-notice">
                  {burnMessage}
                </div>
              )}
              {gameState === 'revealing' ? (
                <div className="reveal-notice revealing-pulse">
                  <span className="instruction-text highlight">EL DEALER REVELA EL DESTINO...</span>
                  <span className="instruction-subtext">Aguarda un instante...</span>
                </div>
              ) : maxDiscards > 0 ? (
                <>
                  <span className="instruction-text">
                    Selecciona hasta <strong>{maxDiscards}</strong> películas para descartar
                  </span>
                  <span className="instruction-subtext">Optimiza tu mano antes de la ronda final</span>
                </>
              ) : (
                <>
                  <span className="instruction-text highlight">¡RONDA FINAL!</span>
                  <span className="instruction-subtext">{tokens <= 0 ? 'Sin fichas: All-in forzado.' : 'Es hora de decidir. ¿Te quedas con esta mano?'}</span>
                </>
              )}
            </div>

            <Hand
              cards={hand}
              selectedIds={selectedIds}
              onToggle={handleToggle}
              isFinalRound={maxDiscards === 0 || gameState === 'revealing'}
              isRevealing={gameState === 'revealing'}
            />

            <div className="controls-wrapper">
              {maxDiscards > 0 && gameState !== 'revealing' && (
                <Tooltip text={`Cuesta ${selectedIds.length * 10} tokens de energía`}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-danger action-btn"
                    onClick={handleSwap}
                    disabled={selectedIds.length === 0 || loading}
                  >
                    <span className="btn-icon">♻️</span>
                    {loading ? 'Cargando...' : `Descartar Seleccionadas (${selectedIds.length})`}
                  </motion.button>
                </Tooltip>
              )}

              {gameState !== 'revealing' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-danger action-btn"
                  onClick={stand}
                  disabled={loading}
                >
                  <span className="btn-icon">🃏</span>
                  {maxDiscards === 0 ? "Revelar Ganadora" : "Plantarse (Stand)"}
                </motion.button>
              )}
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
      <Header
        tokens={tokens}
        streak={streak}
        onReset={resetGame}
      />

      <main className="game-board">
        <AnimatePresence mode="wait">
          <motion.div
            key={gameState}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            style={{ width: '100%', minHeight: '100%', display: 'flex', flexDirection: 'column' }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      <Onboarding />
      <ToastFeed />
    </div>
  );
}

export default App;
