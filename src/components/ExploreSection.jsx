import React, { useState, useEffect } from 'react';
import { Filter, Star, Play, Bookmark, Check, Globe, RefreshCw } from 'lucide-react';
import { CATEGORIES, HERO_TITLES } from '../data/cinemaData';
import { fetchLiveTrendingAnime } from '../services/aniListApi';

export default function ExploreSection({ 
  onSelectMovie, 
  onToggleWatchlist, 
  watchlist = [] 
}) {
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [liveAnimeItems, setLiveAnimeItems] = useState([]);
  const [isLoadingLive, setIsLoadingLive] = useState(false);

  // Aggregate local items
  const localMedia = [
    ...HERO_TITLES.map((h) => ({
      id: h.id,
      tmdbId: h.tmdbId,
      title: h.title,
      rating: h.rating,
      ageRating: h.ageRating,
      year: h.year,
      type: h.isAnime ? 'Anime' : 'Movie',
      isAnime: h.isAnime,
      genres: h.genres,
      image: h.posterUrl,
      mood: h.moodTags[0],
      synopsis: h.synopsis,
      episodes: h.episodes,
      languages: h.languages,
      audioMode: h.audioMode,
      malId: h.malId
    })),
    ...CATEGORIES.flatMap((c) => c.items)
  ];

  // Fetch live trending anime on mount
  useEffect(() => {
    async function loadLive() {
      setIsLoadingLive(true);
      const items = await fetchLiveTrendingAnime(1, 10);
      setLiveAnimeItems(items);
      setIsLoadingLive(false);
    }
    loadLive();
  }, []);

  const allMedia = [...localMedia, ...liveAnimeItems];
  const uniqueMedia = Array.from(new Map(allMedia.map((item) => [item.id, item])).values());

  // Filter
  const filtered = uniqueMedia.filter((item) => {
    if (selectedFilter === 'ALL') return true;
    if (selectedFilter === 'DUAL_AUDIO') return item.languages && item.languages.length > 1;
    if (selectedFilter === 'LIVE_WEB') return item.id.startsWith('anilist-') || item.id.startsWith('omdb-');
    if (selectedFilter === 'ANIME') return item.type === 'Anime' || item.isAnime || item.genres?.includes('Anime');
    if (selectedFilter === 'MOVIES') return item.type === 'Movie';
    if (selectedFilter === 'SERIES') return item.type === 'Series';
    if (selectedFilter === 'SCIFI') return item.genres?.some((g) => g.toLowerCase().includes('sci-fi') || g.toLowerCase().includes('cyber'));
    return true;
  });

  // Sort by rating
  const sorted = [...filtered].sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));

  const filterTabs = [
    { id: 'ALL', label: '🌟 All Transmissions' },
    { id: 'DUAL_AUDIO', label: '🌐 Multi-Audio & Dubs' },
    { id: 'MOVIES', label: '🎬 English Movies' },
    { id: 'ANIME', label: '⛩️ Anime Universes' },
    { id: 'SERIES', label: '📺 Web Series' },
    { id: 'SCIFI', label: '⚡ Cyberpunk & Sci-Fi' },
    { id: 'LIVE_WEB', label: '📡 Live Web Feed' },
  ];

  return (
    <div className="pt-28 pb-20 px-4 md:px-8 max-w-7xl mx-auto min-h-screen">
      {/* Title & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono tracking-widest text-cyan-400 uppercase">
              // DECENTRALIZED STREAM DIRECTORY
            </span>
            {isLoadingLive && (
              <span className="flex items-center gap-1 text-[10px] font-mono text-violet-400 bg-violet-950/60 px-2 py-0.5 rounded-full border border-violet-500/30">
                <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                <span>SYNCING LIVE WEB</span>
              </span>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight mt-1">
            Global Index <span className="text-gradient-cyan-violet">Database</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Live extracted streams resolved from third-party nodes and decentralized indexers.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id)}
              className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedFilter === tab.id
                  ? 'bg-gradient-to-r from-cyan-400 to-violet-600 text-black font-bold shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                  : 'glass-panel text-slate-300 hover:text-cyan-300 hover:border-cyan-400/30'
              }`}
            >
              {tab.id === 'LIVE_WEB' && <Globe className="w-3.5 h-3.5" />}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Results */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
        {sorted.map((item) => {
          const isSaved = watchlist.some((w) => w.id === item.id);
          const isLiveWeb = item.id.startsWith('anilist-');

          return (
            <div
              key={item.id}
              className="group relative rounded-2xl overflow-hidden bg-[#0c1322] border border-slate-800 hover:border-cyan-400/50 transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,240,255,0.25)] flex flex-col justify-between"
            >
              <div 
                onClick={() => onSelectMovie(item)}
                className="relative aspect-[2/3] w-full overflow-hidden cursor-pointer"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                />

                <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-cyan-400/20 text-[10px] font-bold text-amber-300">
                  <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                  <span>{item.rating}</span>
                </div>

                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-cyan-950/80 backdrop-blur-md border border-cyan-400/30 text-[9px] font-mono font-semibold text-cyan-300 uppercase flex items-center gap-1">
                  {isLiveWeb && <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />}
                  <span>{isLiveWeb ? 'LIVE WEB' : item.type}</span>
                </div>

                {/* Multi-Language / Dual Audio Badge */}
                <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md backdrop-blur-md text-[8px] font-mono font-bold bg-violet-950/90 text-violet-300 border border-violet-500/50 z-10 flex items-center gap-1 shadow-sm">
                  <span>🌐</span>
                  <span>{item.isAnime ? 'DUAL AUDIO' : 'MULTI-AUDIO'}</span>
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectMovie(item);
                    }}
                    className="w-10 h-10 rounded-full bg-cyan-400 flex items-center justify-center text-black shadow-lg cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-black text-black ml-0.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleWatchlist(item);
                    }}
                    className={`w-10 h-10 rounded-full glass-panel flex items-center justify-center cursor-pointer ${
                      isSaved ? 'text-cyan-400 border-cyan-400' : 'text-white'
                    }`}
                  >
                    {isSaved ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-3.5">
                <h3 
                  onClick={() => onSelectMovie(item)}
                  className="font-bold text-xs sm:text-sm text-white group-hover:text-cyan-300 truncate cursor-pointer uppercase tracking-wide"
                >
                  {item.title}
                </h3>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 font-mono">
                  <span>{item.year}</span>
                  <span>•</span>
                  <span className="text-violet-300 truncate">
                    {item.genres ? item.genres.slice(0, 2).join(', ') : item.type}
                  </span>
                </div>

                {item.languages && (
                  <div className="flex items-center gap-1 mt-1.5 overflow-hidden text-[10px] text-slate-400 font-mono">
                    <Globe className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                    <span className="truncate text-cyan-200/90 font-medium">
                      {item.languages.slice(0, 2).join(', ')}
                      {item.languages.length > 2 ? ` +${item.languages.length - 2}` : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
