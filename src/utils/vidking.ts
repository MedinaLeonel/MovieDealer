const BASE_URL = "https://www.vidking.net";

export interface VidkingConfig {
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  season?: number;
  episode?: number;
  autoPlay?: boolean;
  nextEpisode?: boolean;
  episodeSelector?: boolean;
  color?: string;
  progress?: number;
}

export function buildVidkingUrl(config: VidkingConfig): string {
  const {
    tmdbId,
    mediaType,
    season = 1,
    episode = 1,
    autoPlay = false,
    nextEpisode = false,
    episodeSelector = false,
    color,
    progress
  } = config;

  // Build base URL
  let baseUrl: string;
  if (mediaType === 'movie') {
    baseUrl = `${BASE_URL}/embed/movie/${tmdbId}`;
  } else if (mediaType === 'tv') {
    baseUrl = `${BASE_URL}/embed/tv/${tmdbId}/${season}/${episode}`;
  } else {
    throw new Error(`Invalid mediaType: ${mediaType}. Must be 'movie' or 'tv'`);
  }

  // Build query parameters
  const params = new URLSearchParams();
  
  if (autoPlay) params.append('autoPlay', 'true');
  if (nextEpisode && mediaType === 'tv') params.append('nextEpisode', 'true');
  if (episodeSelector && mediaType === 'tv') params.append('episodeSelector', 'true');
  if (color) params.append('color', color);
  if (progress !== undefined) params.append('progress', progress.toString());

  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

export function buildStreamUrl(options: {
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  season?: number;
  episode?: number;
  autoPlay?: boolean;
  nextEpisode?: boolean;
  episodeSelector?: boolean;
  color?: string;
  progress?: number;
}): string {
  return buildVidkingUrl(options);
}

// Dealer Cinema Mode configuration
export function getDealerCinemaConfig(tmdbId: number, mediaType: 'movie' | 'tv', season = 1, episode = 1): VidkingConfig {
  return {
    tmdbId,
    mediaType,
    season,
    episode,
    autoPlay: true,
    nextEpisode: mediaType === 'tv',
    episodeSelector: mediaType === 'tv',
    color: 'e50914' // Netflix red style
  };
}
