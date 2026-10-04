import React, { useState, useMemo } from 'react';
import { Filter, Star, Sparkles, Film, Tv, Globe, SlidersHorizontal, RotateCcw, Search } from 'lucide-react';

export const GENRE_LIST = [
  'All Genres',
  'Action',
  'Sci-Fi',
  'Animation',
  'Adventure',
  'Drama',
  'Crime',
  'Fantasy',
  'Thriller'
];

export default function FilterMatrix({ 
  items = [], 
  onSelectMovie, 
  onToggleWatchlist, 
  watchlist = [] 
}) {
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'HINDI' | 'MOVIES' | 'SERIES' | 'ANIME' | 'TOP_RATED'
  const [selectedGenre, setSelectedGenre] = useState('All Genres');
  const [sortBy, setSortBy] = useState('RATING_DESC'); // 'RATING_DESC' | 'YEAR_DESC' | 'TITLE_ASC'
  const [searchTerm, setSearchTerm] = useState('');

  // Filter and sort computation
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Tab filter
      if (activeTab === 'HINDI') {
        const hasHindi = item.hasHindiDub || (Array.isArray(item.languages) && item.languages.some(l => typeof l === 'string' && l.toLowerCase().includes('hindi')));
        if (!hasHindi) return false;
      }
      if (activeTab === 'MOVIES' && item.type !== 'Movie') return false;
      if (activeTab === 'SERIES' && item.type !== 'Series') return false;
      if (activeTab === 'ANIME' && !item.isAnime && item.type !== 'Anime') return false;
      if (activeTab === 'TOP_RATED' && parseFloat(item.rating || 0) < 8.5) return false;

      // Genre filter
      if (selectedGenre !== 'All Genres') {
        const matchGenre = Array.isArray(item.genres) && item.genres.some(g => g.toLowerCase() === selectedGenre.toLowerCase());
        if (!matchGenre) return false;
      }

      // Search term filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchTitle = item.title?.toLowerCase().includes(q);
        const matchGenre = Array.isArray(item.genres) && item.genres.some(g => g.toLowerCase().includes(q));
        if (!matchTitle && !matchGenre) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'RATING_DESC') return parseFloat(b.rating || 0) - parseFloat(a.rating || 0);
      if (sortBy === 'YEAR_DESC') return parseInt(b.year || 0) - parseInt(a.year || 0);
      if (sortBy === 'TITLE_ASC') return (a.title || '').localeCompare(b.title || '');
      return 0;
    });
  }, [items, activeTab, selectedGenre, sortBy, searchTerm]);

  const hasActiveFilters = activeTab !== 'ALL' || selectedGenre !== 'All Genres' || sortBy !== 'RATING_DESC' || searchTerm.trim() !== '';

  const handleReset = () => {
    setActiveTab('ALL');
    setSelectedGenre('All Genres');
    setSortBy('RATING_DESC');
    setSearchTerm('');
  };

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto my-4" id="cinema-filter-matrix">
      
      {/* Control Dashboard Panel */}
      <div className="p-5 sm:p-7 rounded-3xl cinema-panel border border-amber-500/30 bg-[#080c18] shadow-2xl">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold tracking-widest text-amber-400 uppercase">
                  EXPLORATION MATRIX
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950/80 text-amber-300 border border-amber-500/30 font-bold">
                  {filteredItems.length} MATCHES
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight font-sans">
                ADVANCED FILTER & DISCOVERY ENGINE
              </h2>
            </div>
          </div>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="self-start md:self-auto px-4 py-2 rounded-xl cinema-panel text-amber-300 hover:text-white hover:border-amber-400/50 text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Primary Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          {[
            { id: 'ALL', label: 'All Catalog' },
            { id: 'HINDI', label: '🇮🇳 Hindi Dub (Dual Audio)' },
            { id: 'MOVIES', label: '🎬 Feature Movies' },
            { id: 'SERIES', label: '📺 TV Series' },
            { id: 'ANIME', label: '⛩️ Anime Sagas' },
            { id: 'TOP_RATED', label: '⭐ Top Rated (8.5+)' }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-mono font-bold tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'gold-gradient-btn text-black font-bold shadow-[0_0_15px_rgba(245,158,11,0.5)] scale-105'
                    : 'cinema-panel text-slate-300 hover:text-amber-300 hover:border-amber-400/40'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Secondary Bar: Genre Dropdown, Search Input, and Sort Control */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
          
          {/* Quick Search inside Filters */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search in filtered results..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs font-mono placeholder:text-slate-500 focus:outline-none focus:border-amber-400/60"
            />
          </div>

          {/* Genre Dropdown */}
          <div className="relative">
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-slate-200 text-xs font-mono focus:outline-none focus:border-amber-400/60 cursor-pointer appearance-none"
            >
              {GENRE_LIST.map((g) => (
                <option key={g} value={g} className="bg-[#0b1020] text-slate-200">
                  Genre: {g}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-slate-200 text-xs font-mono focus:outline-none focus:border-amber-400/60 cursor-pointer appearance-none"
            >
              <option value="RATING_DESC" className="bg-[#0b1020] text-slate-200">Sort: Highest IMDb Rating</option>
              <option value="YEAR_DESC" className="bg-[#0b1020] text-slate-200">Sort: Newest Release Year</option>
              <option value="TITLE_ASC" className="bg-[#0b1020] text-slate-200">Sort: Title (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filtered Grid Display */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mt-6">
          {filteredItems.map((item) => {
            const isSaved = watchlist.some((w) => w.id === item.id);
            return (
              <div
                key={item.id}
                className="rounded-2xl overflow-hidden cinema-card group flex flex-col justify-between"
              >
                {/* Poster */}
                <div 
                  onClick={() => onSelectMovie(item)}
                  className="relative aspect-[2/3] w-full overflow-hidden cursor-pointer"
                >
                  <img
                    src={item.image || item.posterUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />

                  {/* Rating */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md border border-amber-500/30 text-[11px] font-bold text-amber-300">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{item.rating}</span>
                  </div>

                  {/* Type */}
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md border border-white/10 text-[10px] font-mono font-bold text-slate-300 uppercase">
                    {item.type}
                  </div>

                  {/* Hindi Dub Badge */}
                  {item.hasHindiDub && (
                    <div className="absolute bottom-2.5 right-2.5 px-1.5 py-0.5 rounded-md backdrop-blur-md text-[9px] font-mono font-bold bg-amber-950/90 text-amber-300 border border-amber-500/40 z-10 flex items-center gap-1">
                      <span>🇮🇳 HINDI DUB</span>
                    </div>
                  )}
                </div>

                {/* Meta */}
                <div className="p-3 bg-[#0a0f1d] flex flex-col justify-between flex-grow">
                  <div>
                    <h3 
                      onClick={() => onSelectMovie(item)}
                      className="font-bold text-sm text-white group-hover:text-amber-300 transition-colors truncate cursor-pointer uppercase font-sans"
                    >
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 font-mono">
                      <span>{item.year}</span>
                      <span>•</span>
                      <span className="truncate">{Array.isArray(item.genres) ? item.genres.slice(0, 2).join(', ') : item.type}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl cinema-panel border border-white/10 mt-6 bg-[#080d1a]">
          <Film className="w-12 h-12 text-amber-400/50 mx-auto mb-3 animate-pulse" />
          <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-1">
            No Titles Found Matching Filters
          </h3>
          <p className="text-xs text-slate-400 font-mono mb-4">
            Try adjusting your genre or search term to discover more titles.
          </p>
          <button
            onClick={handleReset}
            className="px-5 py-2 rounded-full gold-gradient-btn text-black font-mono font-bold text-xs uppercase cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      )}
    </section>
  );
}
