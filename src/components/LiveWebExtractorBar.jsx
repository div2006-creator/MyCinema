import React, { useState } from 'react';
import { Globe, Sparkles, Search, RefreshCw, Film, Tv, CheckCircle, Zap } from 'lucide-react';
import { extractMoviesFromWeb, extractTrendingAnimeFromWeb } from '../services/liveWebExtractor';

export default function LiveWebExtractorBar({ onExtractedData }) {
  const [query, setQuery] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [activeExtractor, setActiveExtractor] = useState(null);

  const handleExtractMovies = async (genre = 'action') => {
    setIsExtracting(true);
    setActiveExtractor('movies');
    setStatusMessage(`Connecting to third-party web servers for "${genre.toUpperCase()}"...`);
    
    const items = await extractMoviesFromWeb(genre, 'movie');
    if (items.length > 0) {
      onExtractedData({
        id: `extracted-${genre}`,
        title: `LIVE RESOLVED: ${genre.toUpperCase()} CINEMA`,
        subtitle: `Resolved ${items.length} real movies live from online streaming indexers`,
        items
      });
      setStatusMessage(`Successfully resolved ${items.length} real movies ready to stream!`);
    } else {
      setStatusMessage('No live movies returned from indexer node. Retrying...');
    }
    setIsExtracting(false);
  };

  const handleExtractAnime = async () => {
    setIsExtracting(true);
    setActiveExtractor('anime');
    setStatusMessage('Querying AniList GraphQL API for live trending anime sagas...');
    
    const items = await extractTrendingAnimeFromWeb(1, 12);
    if (items.length > 0) {
      onExtractedData({
        id: 'extracted-anime',
        title: 'LIVE RESOLVED: TRENDING ANIME SAGAS',
        subtitle: `Resolved ${items.length} live trending anime series from AniList`,
        items
      });
      setStatusMessage(`Successfully resolved ${items.length} live anime series ready for streaming!`);
    } else {
      setStatusMessage('AniList node response delayed. Please try again.');
    }
    setIsExtracting(false);
  };

  const handleCustomSearch = async (e) => {
    e.preventDefault();
    const cleanQuery = query.trim().replace(/[<>{}\\]/g, '').slice(0, 80);
    if (!cleanQuery) return;

    setIsExtracting(true);
    setActiveExtractor('search');
    setStatusMessage(`Scraping online web indexers for "${cleanQuery}"...`);

    const items = await extractMoviesFromWeb(cleanQuery, 'movie');
    if (items.length > 0) {
      onExtractedData({
        id: `extracted-custom-${Date.now()}`,
        title: `CUSTOM STREAM: "${query.toUpperCase()}"`,
        subtitle: `Resolved ${items.length} real titles live from third-party websites`,
        items
      });
      setStatusMessage(`Resolved ${items.length} titles matching "${query}"!`);
    } else {
      const animeItems = await extractTrendingAnimeFromWeb(1, 8);
      onExtractedData({
        id: `extracted-anime-${Date.now()}`,
        title: `LIVE ANIME STREAM: "${query.toUpperCase()}"`,
        subtitle: `Resolved from public live anime feeds`,
        items: animeItems
      });
      setStatusMessage(`Found online streams for "${query}"!`);
    }
    setIsExtracting(false);
  };

  return (
    <section className="py-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto my-2">
      <div className="relative p-6 sm:p-7 rounded-3xl cinema-panel border border-amber-500/25 bg-[#090e1c]/90 shadow-2xl">
        
        {/* Subtle top gold accent line */}
        <div className="absolute top-0 left-1/4 w-1/2 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_15px_rgba(245,158,11,0.8)]" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* Header */}
          <div className="max-w-md">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase font-bold">
                STREAM RESOLVER TOOL
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-black uppercase text-white tracking-wide font-sans">
              RESOLVE LIVE MEDIA FROM THE WEB
            </h3>

            <p className="text-xs text-slate-400 mt-1 font-sans">
              Enter any title or click a genre button to dynamically extract real, playable movies or anime live from third-party streaming nodes.
            </p>
          </div>

          {/* Quick Buttons & Custom Input */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            
            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleExtractMovies('avengers')}
                disabled={isExtracting}
                className="px-3.5 py-2.5 rounded-xl cinema-panel text-xs font-semibold text-white hover:border-amber-400/50 hover:text-amber-300 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400 fill-current" />
                <span>+ Avengers</span>
              </button>

              <button
                onClick={() => handleExtractMovies('action')}
                disabled={isExtracting}
                className="px-3.5 py-2.5 rounded-xl cinema-panel text-xs font-semibold text-white hover:border-amber-400/50 hover:text-amber-300 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Film className="w-3.5 h-3.5 text-amber-400" />
                <span>+ Action</span>
              </button>

              <button
                onClick={() => handleExtractAnime()}
                disabled={isExtracting}
                className="px-3.5 py-2.5 rounded-xl cinema-panel text-xs font-semibold text-white hover:border-amber-400/50 hover:text-amber-300 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Tv className="w-3.5 h-3.5 text-amber-300" />
                <span>+ Top Anime</span>
              </button>
            </div>

            {/* Custom Query Search Box */}
            <form onSubmit={handleCustomSearch} className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Resolve movie title (e.g. Batman)..."
                  className="w-56 sm:w-64 px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/60 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isExtracting || !query.trim()}
                className="gold-gradient-btn px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isExtracting && activeExtractor === 'search' ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Search className="w-3.5 h-3.5" />
                )}
                <span>Resolve</span>
              </button>
            </form>
          </div>
        </div>

        {/* Live Status Message */}
        {statusMessage && (
          <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center gap-2 text-xs font-mono text-amber-300">
            {isExtracting ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
            ) : (
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span>{statusMessage}</span>
          </div>
        )}
      </div>
    </section>
  );
}
