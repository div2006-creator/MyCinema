import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Star, Play, Plus, Check, Globe, Grid, Film, Sparkles } from 'lucide-react';

export default function ContentRow({ 
  category, 
  onSelectMovie, 
  onToggleWatchlist, 
  watchlist = [] 
}) {
  const rowRef = useRef(null);
  const [viewMode, setViewMode] = useState('scroll'); // 'scroll' | 'grid'

  const scroll = (direction) => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.75;
      rowRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const isAnime = category.division === 'anime' || category.title.includes('ANIME');

  return (
    <section className="py-7 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Category Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5 pb-3 border-b border-white/[0.06]">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="w-2 h-4 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
            <span className="text-[11px] font-mono font-bold tracking-widest text-amber-400 uppercase">
              {category.divisionBadge || 'CINEMA ARCHIVE'}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight font-sans">
            {category.title}
          </h2>

          {category.subtitle && (
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              // {category.subtitle}
            </p>
          )}
        </div>

        {/* Action Controls: Grid toggle & Scroll Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => setViewMode(viewMode === 'scroll' ? 'grid' : 'scroll')}
            className={`px-3 py-1.5 rounded-xl cinema-panel text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'grid' ? 'text-amber-400 border-amber-500/40 bg-amber-500/10' : 'text-slate-400 hover:text-white'
            }`}
            title="Toggle Grid / Scroll View"
          >
            <Grid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{viewMode === 'grid' ? 'Reel View' : 'Grid View'}</span>
          </button>

          {viewMode === 'scroll' && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => scroll('left')}
                aria-label="Scroll left"
                className="w-8 h-8 rounded-full cinema-panel flex items-center justify-center text-slate-300 hover:text-amber-400 hover:border-amber-500/40 transition-all cursor-pointer shadow-md"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scroll('right')}
                aria-label="Scroll right"
                className="w-8 h-8 rounded-full cinema-panel flex items-center justify-center text-slate-300 hover:text-amber-400 hover:border-amber-500/40 transition-all cursor-pointer shadow-md"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Render Items either in Horizontal Scroll Reel or Multi-Row Grid */}
      <div 
        ref={rowRef}
        className={viewMode === 'scroll' 
          ? "flex items-stretch gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-3" 
          : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
        }
      >
        {category.items.map((item) => {
          const isSaved = watchlist.some((w) => w.id === item.id);

          return (
            <div
              key={item.id}
              className={`rounded-2xl overflow-hidden cinema-card group flex flex-col justify-between ${
                viewMode === 'scroll' ? 'flex-shrink-0 w-44 sm:w-52' : 'w-full'
              }`}
            >
              {/* Card Poster Image Container */}
              <div 
                onClick={() => onSelectMovie(item)}
                className="relative aspect-[2/3] w-full overflow-hidden cursor-pointer"
              >
                <img
                  src={item.image || item.posterUrl}
                  alt={item.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                />

                {/* Rating Badge */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md border border-amber-500/30 text-[11px] font-bold text-amber-300">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{item.rating}</span>
                </div>

                {/* Type Badge */}
                <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md border border-white/10 text-[10px] font-mono font-bold text-slate-300 uppercase">
                  {item.type}
                </div>

                {/* Age Rating Badge */}
                {item.ageRating && (
                  <div className={`absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md backdrop-blur-md text-[10px] font-mono font-black border z-10 ${
                    item.ageRating === '18+'
                      ? 'bg-rose-950/90 text-rose-300 border-rose-500/60 shadow-[0_0_10px_rgba(244,63,94,0.4)]'
                      : item.ageRating === 'ALL AGES'
                        ? 'bg-emerald-950/90 text-emerald-300 border-emerald-400/50'
                        : 'bg-black/85 text-slate-200 border-white/20'
                  }`}>
                    {item.ageRating === '18+' ? '🔞 18+' : item.ageRating}
                  </div>
                )}

                {/* Multi-Language / Dual Audio Badge */}
                <div className="absolute bottom-2.5 right-2.5 px-1.5 py-0.5 rounded-md backdrop-blur-md text-[9px] font-mono font-bold bg-violet-950/90 text-violet-300 border border-violet-500/50 z-10 flex items-center gap-1 shadow-sm">
                  <span>🌐</span>
                  <span>{item.isAnime ? 'DUAL AUDIO' : 'MULTI-AUDIO'}</span>
                </div>

                {/* Hover Quick Action Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectMovie(item);
                    }}
                    className="w-11 h-11 rounded-full gold-gradient-btn flex items-center justify-center text-black shadow-lg transform scale-90 hover:scale-105 transition-transform cursor-pointer"
                  >
                    <Play className="w-5 h-5 fill-black text-black ml-0.5" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleWatchlist(item);
                    }}
                    className={`w-11 h-11 rounded-full cinema-panel flex items-center justify-center transition-all cursor-pointer ${
                      isSaved ? 'text-amber-400 border-amber-400' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {isSaved ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Card Meta Footer */}
              <div className="p-3.5 bg-[#0a0f1d] flex flex-col justify-between flex-grow">
                <div>
                  <h3 
                    onClick={() => onSelectMovie(item)}
                    className="font-bold text-sm text-white group-hover:text-amber-300 transition-colors truncate cursor-pointer uppercase tracking-wide font-sans"
                  >
                    {item.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 font-mono">
                    <span>{item.year}</span>
                    <span>•</span>
                    <span className="text-slate-300 truncate">
                      {item.genres ? item.genres.slice(0, 2).join(', ') : item.type}
                    </span>
                  </div>

                  {item.languages && (
                    <div className="flex items-center gap-1 mt-1.5 overflow-hidden text-[10px] text-slate-400 font-mono">
                      <Globe className="w-3 h-3 text-amber-400 flex-shrink-0" />
                      <span className="truncate text-amber-200/90 font-medium">
                        {item.languages.slice(0, 2).join(', ')}
                        {item.languages.length > 2 ? ` +${item.languages.length - 2}` : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
