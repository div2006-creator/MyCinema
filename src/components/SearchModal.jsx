import React, { useState, useEffect } from 'react';
import { Search, X, Star, Play, Sparkles, Globe, Tv, RefreshCw, Film } from 'lucide-react';
import { CATEGORIES, HERO_TITLES } from '../data/cinemaData';
import { searchLiveAnime } from '../services/aniListApi';

export default function SearchModal({ isOpen = true, onClose, onSelectMovie }) {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState('LOCAL'); // 'LOCAL' or 'LIVE_WEB'
  const [liveResults, setLiveResults] = useState([]);
  const [isSearchingLive, setIsSearchingLive] = useState(false);
  const [customTmdbInput, setCustomTmdbInput] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Handle live search debouncing for Live Web mode
  useEffect(() => {
    if (mode !== 'LIVE_WEB' || !query.trim()) {
      setLiveResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingLive(true);
      const results = await searchLiveAnime(query);
      setLiveResults(results);
      setIsSearchingLive(false);
    }, 450);

    return () => clearTimeout(timer);
  }, [query, mode]);

  if (!isOpen) return null;

  // Local media pool
  const allMedia = [
    ...HERO_TITLES.map((h) => ({
      ...h,
      image: h.posterUrl || h.image,
      type: h.type || (h.isAnime ? 'Anime' : 'Movie')
    })),
    ...CATEGORIES.flatMap((c) => c.items)
  ];

  const uniqueMedia = Array.from(new Map(allMedia.map((item) => [item.id || item.title, item])).values());

  const localResults = query.trim()
    ? uniqueMedia.filter((item) => {
        const q = query.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.genres?.some((g) => g.toLowerCase().includes(q)) ||
          item.type?.toLowerCase().includes(q) ||
          item.mood?.toLowerCase().includes(q) ||
          (item.languages && item.languages.some(l => l.toLowerCase().includes(q)))
        );
      })
    : uniqueMedia.slice(0, 8);

  const handleLaunchCustomTmdb = (e) => {
    e.preventDefault();
    const raw = customTmdbInput.trim();
    if (!raw) return;

    // Security Validation: Only accept clean numeric TMDB IDs or alphanumeric IMDb IDs
    const sanitizedId = raw.replace(/[^a-zA-Z0-9]/g, '');
    if (!sanitizedId || (!/^\d+$/.test(sanitizedId) && !/^tt\d+$/i.test(sanitizedId))) {
      alert('Security Validation: Please enter a valid numeric TMDB ID (e.g. 299534) or IMDb ID (e.g. tt4154796).');
      return;
    }

    const customMovie = {
      id: `custom-${sanitizedId}`,
      tmdbId: sanitizedId,
      imdbId: sanitizedId.startsWith('tt') ? sanitizedId : undefined,
      title: `CUSTOM STREAM #${sanitizedId}`,
      rating: "9.0",
      year: "2025",
      type: "Movie",
      genres: ["Custom Stream", "Verified Node"],
      image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80",
      synopsis: `Custom media transmission resolved directly from verified streaming nodes using identifier #${sanitizedId}.`,
      episodes: 1
    };

    onSelectMovie(customMovie);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 px-3 sm:px-4 bg-black/85 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl cinema-panel border border-amber-500/30 p-5 sm:p-6 shadow-[0_20px_70px_rgba(0,0,0,0.95)] bg-[#070b14]/98">
        
        {/* Header Tabs: Local vs Live Third-Party Web */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 p-1 rounded-full bg-black/60 border border-white/10">
            <button
              onClick={() => setMode('LOCAL')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold tracking-wider transition-all cursor-pointer ${
                mode === 'LOCAL'
                  ? 'gold-gradient-btn text-black font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Cinema Catalog
            </button>
            <button
              onClick={() => setMode('LIVE_WEB')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                mode === 'LIVE_WEB'
                  ? 'gold-gradient-btn text-black font-bold shadow-md'
                  : 'text-slate-400 hover:text-amber-300'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Live Web Extractor</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="relative flex items-center mb-4">
          <Search className="absolute left-4 w-5 h-5 text-amber-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              mode === 'LIVE_WEB'
                ? "Search any anime on the live web (e.g. Demon Slayer, Naruto, Bleach)..."
                : "Search Iron Man, Avengers, Thor, Hindi Dub, Hollywood..."
            }
            autoFocus
            className="w-full pl-12 pr-12 py-3.5 rounded-2xl bg-black/60 border border-slate-700/80 focus:border-amber-400 focus:outline-none text-white placeholder-slate-500 font-mono text-sm transition-all focus:shadow-[0_0_20px_rgba(245,158,11,0.25)]"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 text-xs font-mono text-slate-500 hover:text-slate-300 cursor-pointer"
            >
              CLEAR
            </button>
          )}
        </div>

        {/* Custom TMDB ID Quick Extractor */}
        <div className="mb-4 p-3 rounded-2xl bg-amber-950/20 border border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
            <Film className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>Instant TMDB ID Stream:</span>
          </div>

          <form onSubmit={handleLaunchCustomTmdb} className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="e.g. 299534 or 1726"
              value={customTmdbInput}
              onChange={(e) => setCustomTmdbInput(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-black/60 border border-slate-700 text-xs font-mono text-amber-300 w-full sm:w-36 focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              className="gold-gradient-btn px-3 py-1.5 rounded-xl text-black font-mono text-xs font-bold whitespace-nowrap cursor-pointer transition-colors"
            >
              Extract & Play
            </button>
          </form>
        </div>

        {/* Section Indicator */}
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-3 px-1">
          <span>
            {mode === 'LIVE_WEB'
              ? isSearchingLive
                ? 'EXTRACTING LIVE ANIME STREAMS...'
                : `LIVE WEB RESULTS (${liveResults.length})`
              : query.trim()
                ? `QUERY RESULTS (${localResults.length})`
                : 'TOP TRANSMISSIONS'}
          </span>
          <span className="text-amber-400/80">ESC TO CLOSE</span>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto pr-1 space-y-2">
          {mode === 'LIVE_WEB' ? (
            isSearchingLive ? (
              <div className="text-center py-12 text-cyan-400 font-mono text-xs flex flex-col items-center gap-2">
                <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
                <span>CONNECTING TO LIVE WEB SERVERS...</span>
              </div>
            ) : liveResults.length === 0 ? (
              <div className="text-center py-12 text-slate-500 font-mono text-xs">
                {query.trim()
                  ? `NO LIVE STREAMS FOUND FOR "${query.toUpperCase()}"`
                  : 'TYPE ANY ANIME OR SERIES TO EXTRACT LIVE STREAMS DIRECT FROM THE WEB'}
              </div>
            ) : (
              liveResults.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectMovie(item);
                    onClose();
                  }}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-cyan-500/10 border border-transparent hover:border-cyan-400/30 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-12 h-16 rounded-xl object-cover border border-slate-700 group-hover:border-cyan-400/50"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-violet-950 text-violet-300 border border-violet-500/30">
                          LIVE WEB
                        </span>
                        <h4 className="font-bold text-sm text-white group-hover:text-cyan-300 transition-colors uppercase">
                          {item.title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
                        <span>{item.year}</span>
                        <span>•</span>
                        <span className="text-cyan-400">{item.duration}</span>
                        {item.genres && (
                          <>
                            <span>•</span>
                            <span className="text-slate-400 hidden sm:inline">
                              {item.genres.slice(0, 2).join(', ')}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-xs text-amber-300 font-mono">
                      <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                      <span>{item.rating}</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-cyan-400/20 group-hover:bg-cyan-400 flex items-center justify-center text-cyan-300 group-hover:text-black transition-all">
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>
              ))
            )
          ) : (
            localResults.length === 0 ? (
              <div className="text-center py-12 text-slate-500 font-mono text-xs">
                NO TRANSMISSIONS DETECTED MATCHING "{query.toUpperCase()}"
              </div>
            ) : (
              localResults.map((item) => {
                const isHindiDub = item.hasHindiDub || item.languages?.some(l => typeof l === 'string' && l.toLowerCase().includes('hindi'));
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      onSelectMovie(item);
                      onClose();
                    }}
                    className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-amber-500/10 border border-transparent hover:border-amber-400/30 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3.5">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-12 h-16 rounded-xl object-cover border border-slate-700 group-hover:border-amber-400/50"
                      />
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-bold text-sm text-white group-hover:text-amber-300 transition-colors uppercase font-sans">
                            {item.title}
                          </h4>
                          {isHindiDub && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-500/40">
                              🇮🇳 HINDI DUB
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
                          <span>{item.year}</span>
                          <span>•</span>
                          <span className="text-amber-400">{item.type}</span>
                          {item.genres && (
                            <>
                              <span>•</span>
                              <span className="text-slate-400 hidden sm:inline">
                                {item.genres.slice(0, 2).join(', ')}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-xs text-amber-300 font-mono">
                        <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                        <span>{item.rating}</span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-amber-400/20 group-hover:bg-amber-400 flex items-center justify-center text-amber-300 group-hover:text-black transition-all">
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>
                );
              })
            )
          )}
        </div>
      </div>
    </div>
  );
}
