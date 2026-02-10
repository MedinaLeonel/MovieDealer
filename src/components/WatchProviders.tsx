import React, { useEffect, useState } from 'react';
import { ExternalLink, Clock } from 'lucide-react';
import type { WatchProvider } from '../lib/types';
import './WatchProviders.css';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

interface Props {
    movieId: number;
    onRuntimeFetch?: (runtime: number) => void;
}

export const WatchProviders: React.FC<Props> = ({ movieId, onRuntimeFetch }) => {
    const [providers, setProviders] = useState<WatchProvider[]>([]);
    const [imdbId, setImdbId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [runtime, setRuntime] = useState<number | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Parallel fetching
                const [providersRes, externalRes, detailsRes] = await Promise.all([
                    fetch(`${TMDB_BASE_URL}/movie/${movieId}/watch/providers?api_key=${TMDB_API_KEY}`),
                    fetch(`${TMDB_BASE_URL}/movie/${movieId}/external_ids?api_key=${TMDB_API_KEY}`),
                    fetch(`${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=es-ES`)
                ]);

                const providersData = await providersRes.json();
                const externalData = await externalRes.json();
                const detailsData = await detailsRes.json();

                // Filter for Argentina (AR)
                const arProviders = providersData.results?.AR?.flatrate || [];
                setProviders(arProviders);
                setImdbId(externalData.imdb_id);
                setRuntime(detailsData.runtime);
                if (onRuntimeFetch && detailsData.runtime) {
                    onRuntimeFetch(detailsData.runtime);
                }
            } catch (err) {
                console.error('Error fetching movie data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [movieId, onRuntimeFetch]);

    const handleStremio = () => {
        if (imdbId) {
            window.location.href = `stremio://detail/movie/${imdbId}`;
        }
    };

    if (loading) return <div className="providers-loading">Buscando señales...</div>;

    return (
        <div className="watch-providers-container">
            <div className="providers-header-row">
                <h3 className="section-title">¿Dónde verla?</h3>
                {runtime && (
                    <div className="runtime-info">
                        <Clock size={14} />
                        <span>{runtime} min</span>
                    </div>
                )}
            </div>

            <div className="providers-list">
                {providers.length > 0 ? (
                    providers.map(p => (
                        <div key={p.provider_id} className="provider-pill">
                            <img
                                src={`https://image.tmdb.org/t/p/original${p.logo_path}`}
                                alt={p.provider_name}
                                title={p.provider_name}
                                className="provider-logo"
                            />
                            <span>{p.provider_name}</span>
                        </div>
                    ))
                ) : (
                    <p className="no-providers">No disponible en plataformas locales. Prueba el Botón Mágico.</p>
                )}
            </div>

            <div className="streaming-actions">
                <button
                    className="stremio-btn"
                    onClick={handleStremio}
                    disabled={!imdbId}
                >
                    <svg width="20" height="20" viewBox="0 0 100 100" fill="white" xmlns="http://www.w3.org/2000/svg" className="stremio-logo-svg">
                        <path d="M50 0C22.4 0 0 22.4 0 50C0 77.6 22.4 100 50 100C77.6 100 100 77.6 100 50C100 22.4 77.6 0 50 0ZM35 30L75 50L35 70V30Z" />
                    </svg>
                    <span>VER EN STREMIO</span>
                </button>

                {imdbId && (
                    <a
                        href={`https://www.imdb.com/title/${imdbId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="imdb-link"
                    >
                        <ExternalLink size={18} />
                        IMDb
                    </a>
                )}
            </div>
        </div>
    );
};
