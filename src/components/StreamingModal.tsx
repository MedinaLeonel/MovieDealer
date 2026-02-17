import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStreaming } from '../context/StreamingContext';
import { buildVidkingUrl, getDealerCinemaConfig } from '../utils/vidking';
import './StreamingModal.css';

export function StreamingModal() {
  const { state, closeStream, setSeason, setEpisode, toggleCinemaMode, setLoading } = useStreaming();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasNoSources, setHasNoSources] = useState(false);
  const [hasMetadata, setHasMetadata] = useState(false);
  const [hasDuration, setHasDuration] = useState(false);
  const [fallbackTimeout, setFallbackTimeout] = useState<number | null>(null);

  // Control body scroll based on streaming modal state
  useEffect(() => {
    document.body.style.overflow = state.isOpen ? 'hidden' : 'auto';
  }, [state.isOpen]);

  // Safety timeout to hide loader after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // 15-second timeout ONLY if no metadata AND no duration
  useEffect(() => {
    if (state.isOpen && !hasNoSources && !hasMetadata && !hasDuration) {
      const timer = setTimeout(() => {
        console.log("15-second timeout: No metadata or duration detected");
        setHasNoSources(true);
      }, 15000);

      setFallbackTimeout(timer);
      return () => {
        if (timer) clearTimeout(timer);
      };
    }
  }, [state.isOpen, hasNoSources, hasMetadata, hasDuration]);

  // Reset no sources state when modal closes or media changes
  useEffect(() => {
    if (!state.isOpen) {
      setHasNoSources(false);
      setHasMetadata(false);
      setHasDuration(false);
      if (fallbackTimeout) {
        clearTimeout(fallbackTimeout);
        setFallbackTimeout(null);
      }
    }
  }, [state.isOpen]);

  // Add window message listener for player events
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log('[StreamingModal] Received message:', event.data, typeof event.data);
      
      // Handle both string and object data
      let data;
      if (typeof event.data === "string") {
        try {
          data = JSON.parse(event.data);
        } catch (error) {
          console.error("Error parsing player event:", error);
          return;
        }
      } else if (typeof event.data === "object") {
        data = event.data;
      } else {
        return;
      }
      
      if (data.type === "PLAYER_EVENT") {
        console.log("Player event:", data.data);
        
        // Detect metadata and duration
        if (data.data) {
          if (data.data.duration && data.data.duration > 0) {
            console.log("Duration detected:", data.data.duration);
            setHasDuration(true);
          }
          if (data.data.metadata || data.data.title || data.data.poster) {
            console.log("Metadata detected");
            setHasMetadata(true);
          }
        }
        
        // Detect when no qualities are available (explicit message)
        if (data.data && data.data.qualities && data.data.qualities.count === 0) {
          console.log("Explicit no sources message received");
          setHasNoSources(true);
          if (fallbackTimeout) {
            clearTimeout(fallbackTimeout);
            setFallbackTimeout(null);
          }
        }
        
        // Clear timeout if playback starts successfully OR qualities > 0
        if (data.data && (
          data.data.playing || 
          data.data.loaded || 
          (data.data.qualities && data.data.qualities.count > 0)
        )) {
          console.log("Playback or qualities detected, clearing fallback timeout");
          if (fallbackTimeout) {
            clearTimeout(fallbackTimeout);
            setFallbackTimeout(null);
          }
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [fallbackTimeout]);

  // Handle ESC key for cinema mode exit
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && (state.cinemaMode || state.dealerCinemaMode)) {
        toggleCinemaMode();
      }
    };

    if (state.cinemaMode || state.dealerCinemaMode) {
      document.addEventListener('keydown', handleEsc);
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [state.cinemaMode, state.dealerCinemaMode, toggleCinemaMode]);

  const handleIframeLoad = () => {
    setIsLoaded(true);
    setLoading(false);
  };

  const handleRetry = () => {
    // Reset states and reload iframe
    setHasNoSources(false);
    setIsLoaded(false);
    setHasMetadata(false);
    setHasDuration(false);
    
    // Clear any existing timeouts
    if (fallbackTimeout) {
      clearTimeout(fallbackTimeout);
      setFallbackTimeout(null);
    }
    
    // Reset loading state
    setLoading(true);
    
    // Force iframe reload
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  const getIframeSrc = () => {
    if (!state.tmdbId || !state.mediaType) {
      console.error('[StreamingModal] Missing required data:', { tmdbId: state.tmdbId, mediaType: state.mediaType });
      return '';
    }
    
    let config;
    if (state.dealerCinemaMode) {
      // Use Dealer Cinema Mode configuration
      config = getDealerCinemaConfig(state.tmdbId, state.mediaType, state.season, state.episode);
    } else {
      // Standard configuration
      config = {
        tmdbId: state.tmdbId,
        mediaType: state.mediaType,
        season: state.season,
        episode: state.episode,
        autoPlay: false,
        nextEpisode: false,
        episodeSelector: false,
        color: undefined,
        progress: undefined
      };
    }
    
    const src = buildVidkingUrl(config);
    console.log('[StreamingModal] Streaming URL:', src);
    console.log('[StreamingModal] URL generated once, stable:', { tmdbId: state.tmdbId, mediaType: state.mediaType, season: state.season, episode: state.episode });
    return src;
  };

  const openInNewTab = () => {
    const src = getIframeSrc();
    if (src) {
      window.open(src, '_blank');
    }
  };

  const handleSeasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSeason = parseInt(e.target.value);
    setSeason(newSeason);
  };

  const handleEpisodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newEpisode = parseInt(e.target.value);
    setEpisode(newEpisode);
  };

  const renderSeasonEpisodeSelectors = () => {
    if (state.mediaType !== 'tv' || state.cinemaMode) return null;

    return (
      <div className="streaming-controls">
        <div className="season-episode-selector">
          <div className="selector-group">
            <label htmlFor="season-select">Temporada:</label>
            <select 
              id="season-select"
              value={state.season} 
              onChange={handleSeasonChange}
              className="selector-dropdown"
            >
              {Array.from({ length: 20 }, (_, i) => i + 1).map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>
          
          <div className="selector-group">
            <label htmlFor="episode-select">Episodio:</label>
            <select 
              id="episode-select"
              value={state.episode} 
              onChange={handleEpisodeChange}
              className="selector-dropdown"
            >
              {Array.from({ length: 30 }, (_, i) => i + 1).map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    );
  };

  const renderFallback = () => {
    // Show no sources message when detected
    if (hasNoSources) {
      return (
        <div className="streaming-fallback">
          <div className="fallback-content">
            <h3>No streaming sources available for this title.</h3>
            <div className="fallback-buttons">
              <button 
                onClick={handleRetry}
                className="fallback-button retry-button"
              >
                Retry loading stream
              </button>
              <button 
                onClick={openInNewTab}
                className="fallback-button"
              >
                Open in new tab
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Only show fallback if URL is null or tmdbId is missing
    const src = getIframeSrc();
    if (src) return null;

    return (
      <div className="streaming-fallback">
        <div className="fallback-content">
          <h3>Streaming provider unavailable</h3>
          <button 
            onClick={openInNewTab}
            className="fallback-button"
          >
            Open in new tab
          </button>
        </div>
      </div>
    );
  };

  const renderLoadingSkeleton = () => {
    // Hide skeleton if loaded or no sources detected
    // BUT keep skeleton if metadata/duration detected but still loading
    if (isLoaded || hasNoSources) return null;

    return (
      <div className="streaming-skeleton">
        <div className="skeleton-shimmer"></div>
        <div className="skeleton-text">Cargando stream...</div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {state.isOpen && (
        <motion.div
          className="streaming-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className={`streaming-modal ${(state.cinemaMode || state.dealerCinemaMode) ? 'cinema-mode' : ''}`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Close Button - Hidden in Cinema Mode */}
            {!state.cinemaMode && !state.dealerCinemaMode && (
              <button
                className="streaming-close-btn"
                onClick={closeStream}
                aria-label="Cerrar stream"
              >
                ✕
              </button>
            )}

            {/* Cinema Mode Toggle - Hidden in Dealer Cinema Mode */}
            {!state.dealerCinemaMode && (
              <button
                className="cinema-mode-btn"
                onClick={toggleCinemaMode}
                aria-label="Modo cine"
              >
                🎬
              </button>
            )}

            {/* Season/Episode Selectors - Hidden in Cinema Mode */}
            {state.mediaType === 'tv' && !state.cinemaMode && !state.dealerCinemaMode && renderSeasonEpisodeSelectors()}

            {/* Main Content */}
            <div className="streaming-content">
              {/* Always render iframe immediately */}
              {state.mediaType && (
                <iframe
                  ref={iframeRef}
                  src={getIframeSrc()}
                  width="100%"
                  height="100%"
                  allow="autoplay; fullscreen; encrypted-media"
                  allowFullScreen
                  referrerPolicy="no-referrer"
                  frameBorder="0"
                  key={`stream-${state.tmdbId}-${state.mediaType}-${state.season}-${state.episode}`}
                  onLoad={handleIframeLoad}
                  title="Video stream"
                />
              )}

              {/* Loading skeleton as overlay */}
              {renderLoadingSkeleton()}

              {/* Fallback Message */}
              {renderFallback()}
            </div>

            {/* Cinema Mode Hint */}
            {state.cinemaMode && (
              <div className="cinema-mode-hint">
                Presiona ESC para salir del modo cine
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
