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
import { CinematicIntro } from './components/CinematicIntro';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [introDone, setIntroDone] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem('movieDealerHasSeenOnboarding');
  });

  const {
    gameState,
    hand,
    winner,
    streak,
    tokens,
    tokensDisplay,
    round,
    loading,
    error,
    burnMessage,
    learningMessage,
    maxKeep,
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

  // v0.5.0: selectedIds now represents cards to KEEP
  const handleToggle = (id: number) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id);
      } else {
        if (prev.length >= maxKeep) return prev;
        return [...prev, id];
      }
    });
  };

  // v0.5.0: Send keepIds (selectedIds) to swapCards
  // QA: Las cartas conservadas siguen seleccionadas para la próxima ronda (no desmarcar).
  const handleSwap = () => {
    if (selectedIds.length === 0) return;
    const keepIds = [...selectedIds];
    swapCards(keepIds);
    setSelectedIds(keepIds); // Mantener selección para la siguiente ronda
  };

  const handleDeal = () => {
    setSelectedIds([]);
    dealHand();
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

            <DifficultySelector
              level={difficulty}
              onChange={setDifficulty}
              onShowInfo={() => setShowOnboarding(true)}
            />

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
                onClick={handleDeal}
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
            onConfirm={handleDeal}
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
                {[1, 2, 3, 4, 5, 6].map((r) => (
                  <div key={r} className={`round-step ${round >= r ? 'active' : ''} ${round === r ? 'current' : ''}`}>
                    <span className="step-num">{r}</span>
                    <span className="step-label">R{r}</span>
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
              {learningMessage && (
                <div className="learning-notice">
                  <span className="learning-dot"></span>
                  {learningMessage}
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
                    Selecciona hasta <strong>{maxKeep}</strong> películas para <strong>conservar</strong>
                  </span>
                  <span className="instruction-subtext">Armá tu noche perfecta. Las no seleccionadas se queman.</span>
                </>
              ) : (
                <>
                  <span className="instruction-text highlight">¡RONDA FINAL!</span>
                  <span className="instruction-subtext">{tokens <= 0 ? 'Sin fichas: All-in forzado.' : 'Es hora de decidir. ¿Te quedás con esta mano?'}</span>
                </>
              )}
            </div>

            <Hand
              cards={hand}
              selectedIds={selectedIds}
              onToggle={handleToggle}
              isRevealing={gameState === 'revealing'}
            />

            <div className="controls-wrapper">
              {maxDiscards > 0 && gameState !== 'revealing' && (
                <Tooltip text={`Quemás ${hand.length - selectedIds.length} cartas • Cuesta ${(hand.length - selectedIds.length) * 10} tokens`}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-primary action-btn"
                    onClick={handleSwap}
                    disabled={selectedIds.length === 0 || loading}
                  >
                    <span className="btn-icon">✨</span>
                    {loading ? 'Aprendiendo...' : `Conservar Selección (${selectedIds.length})`}
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
      {!introDone && (
        <CinematicIntro onComplete={() => setIntroDone(true)} />
      )}

      <motion.div
        className="app-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: introDone ? 1 : 0 }}
        transition={{
          duration: 0.8,
          ease: [0.22, 1, 0.36, 1],
          delay: introDone ? 0 : 0,
        }}
        style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, pointerEvents: introDone ? 'auto' : 'none' }}
      >
        <Header
          tokensDisplay={tokensDisplay}
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
      </motion.div>

      <Onboarding
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />
      <ToastFeed />
    </div>
  );
}

export default App;
