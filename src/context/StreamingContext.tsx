import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface StreamingState {
  isOpen: boolean;
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  season: number;
  episode: number;
  cinemaMode: boolean;
  dealerCinemaMode: boolean;
  isLoading: boolean;
  hasError: boolean;
}

interface StreamingContextType {
  state: StreamingState;
  openStream: (tmdbId: number, mediaType: 'movie' | 'tv', season?: number, episode?: number) => void;
  openDealerCinemaMode: (tmdbId: number, mediaType: 'movie' | 'tv', season?: number, episode?: number) => void;
  closeStream: () => void;
  setSeason: (season: number) => void;
  setEpisode: (episode: number) => void;
  toggleCinemaMode: () => void;
  toggleDealerCinemaMode: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: boolean) => void;
}

const StreamingContext = createContext<StreamingContextType | undefined>(undefined);

interface StreamingProviderProps {
  children: ReactNode;
}

export function StreamingProvider({ children }: StreamingProviderProps) {
  const [state, setState] = useState<StreamingState>({
    isOpen: false,
    tmdbId: 0,
    mediaType: 'movie',
    season: 1,
    episode: 1,
    cinemaMode: false,
    dealerCinemaMode: false,
    isLoading: false,
    hasError: false,
  });

  const openStream = useCallback((tmdbId: number, mediaType: 'movie' | 'tv', season = 1, episode = 1) => {
    setState(prev => ({
      ...prev,
      isOpen: true,
      tmdbId,
      mediaType,
      season,
      episode,
      cinemaMode: false,
      dealerCinemaMode: false,
      isLoading: true,
      hasError: false,
    }));
  }, []);

  const openDealerCinemaMode = useCallback((tmdbId: number, mediaType: 'movie' | 'tv', season = 1, episode = 1) => {
    setState(prev => ({
      ...prev,
      isOpen: true,
      tmdbId,
      mediaType,
      season,
      episode,
      cinemaMode: true,
      dealerCinemaMode: true,
      isLoading: true,
      hasError: false,
    }));
  }, []);

  const closeStream = useCallback(() => {
    setState(prev => ({
      ...prev,
      isOpen: false,
      tmdbId: 0,
      mediaType: 'movie',
      season: 1,
      episode: 1,
      cinemaMode: false,
      dealerCinemaMode: false,
      isLoading: false,
      hasError: false,
    }));
  }, []);

  const setSeason = useCallback((season: number) => {
    setState(prev => ({
      ...prev,
      season,
      episode: 1, // Reset episode when season changes
      isLoading: true,
      hasError: false,
    }));
  }, []);

  const setEpisode = useCallback((episode: number) => {
    setState(prev => ({
      ...prev,
      episode,
      isLoading: true,
      hasError: false,
    }));
  }, []);

  const toggleCinemaMode = useCallback(() => {
    setState(prev => ({
      ...prev,
      cinemaMode: !prev.cinemaMode,
    }));
  }, []);

  const toggleDealerCinemaMode = useCallback(() => {
    setState(prev => ({
      ...prev,
      dealerCinemaMode: !prev.dealerCinemaMode,
      cinemaMode: !prev.dealerCinemaMode,
    }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({
      ...prev,
      isLoading: loading,
    }));
  }, []);

  const setError = useCallback((error: boolean) => {
    setState(prev => ({
      ...prev,
      hasError: error,
      isLoading: false,
    }));
  }, []);

  const value: StreamingContextType = {
    state,
    openStream,
    openDealerCinemaMode,
    closeStream,
    setSeason,
    setEpisode,
    toggleCinemaMode,
    toggleDealerCinemaMode,
    setLoading,
    setError,
  };

  return (
    <StreamingContext.Provider value={value}>
      {children}
    </StreamingContext.Provider>
  );
}

export function useStreaming(): StreamingContextType {
  const context = useContext(StreamingContext);
  if (context === undefined) {
    throw new Error('useStreaming must be used within a StreamingProvider');
  }
  return context;
}
