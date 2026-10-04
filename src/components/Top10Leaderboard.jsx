import React, { useRef } from 'react';
import { Trophy, Star, Play, Plus, Check, Globe, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Top10Leaderboard({ items, onSelectMovie, onToggleWatchlist, watchlist = [] }) {
  const rowRef = useRef(null);

  // Take top 10 sorted by rating
  const top10Items = [...items]
    .sort((a, b) => parseFloat(b.rating || 0) - parseFloat(a.rating || 0))
    .slice(0, 10);

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

  return (
    <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Header with Title and Scroll Controls */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-4 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
            <span className="text-xs font-mono font-bold tracking-widest text-amber-400 uppercase flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>GLOBAL AUDIENCE LEADERBOARD</span>
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase font-sans">
            TOP 10 MOST STREAMED WORLDWIDE
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            // Real-time ranked cinematic masterworks streaming in uncompressed 4K master quality
          </p>
        </div>

        {/* Scroll Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            aria-label="Scroll left"
            className="w-9 h-9 rounded-full cinema-panel flex items-center justify-center text-slate-300 hover:text-amber-400 hover:border-amber-500/40 transition-all cursor-pointer shadow-md"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            aria-label="Scroll right"
            className="w-9 h-9 rounded-full cinema-panel flex items-center justify-center text-slate-300 hover:text-amber-400 hover:border-amber-500/40 transition-all cursor-pointer shadow-md"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Ranked Leaderboard Cards */}
      <div 
        ref={rowRef}
        className="flex items-center gap-6 overflow-x-auto no-scrollbar scroll-smooth pb-4 pt-2"
      >
        {top10Items.map((item, index) => {
          const rank = index + 1;
          const isSaved = watchlist.some((w) => w.id === item.id);
          const isGoldRank = rank <= 3;

          return (
            <div
              key={item.id}
              className="flex-shrink-0 flex items-end group cursor-pointer"
              onClick={() => onSelectMovie(item)}
            >
              {/* Giant Stylized Ranking Number */}
              <div className="select-none pointer-events-none -mr-4 sm:-mr-6 z-10 transition-transform group-hover:-translate-x-1 duration-300">
                <span className={isGoldRank ? 'ranking-number-gold' : 'ranking-number'}>
                  {rank}
                </span>
              </div>

              {/* Card Container */}
              <div className="relative w-44 sm:w-48 rounded-2xl overflow-hidden cinema-card group-hover:border-amber-500/60 shadow-xl flex-shrink-0">
                
                {/* Poster */}
                <div className="relative aspect-[2/3] w-full overflow-hidden">
                  <img
                    src={item.image || item.posterUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />

                  {/* Rating Tag */}
                  <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md border border-amber-500/30 text-[10px] font-bold text-amber-300">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{item.rating}</span>
                  </div>

                  {/* Type Badge */}
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md border border-white/10 text-[9px] font-mono font-bold text-slate-300 uppercase">
                    {item.type}
                  </div>

                  {/* Age Rating Badge */}
                  {item.ageRating && (
                    <div className={`absolute bottom-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-mono font-black border z-10 ${
                      item.ageRating === '18+'
                        ? 'bg-rose-950/90 text-rose-300 border-rose-500/60'
                        : 'bg-black/80 text-slate-200 border-white/20'
                    }`}>
                      {item.ageRating === '18+' ? '🔞 18+' : item.ageRating}
                    </div>
                  )}

                  {/* Multi-Audio Pill */}
                  <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-violet-950/90 text-violet-300 border border-violet-500/40 z-10 flex items-center gap-1">
                    <span>🌐</span>
                    <span>{item.isAnime ? 'DUAL' : 'MULTI'}</span>
                  </div>

                  {/* Hover Overlay with Play Button */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectMovie(item);
                      }}
                      className="w-11 h-11 rounded-full gold-gradient-btn flex items-center justify-center text-black shadow-lg transform scale-90 hover:scale-105 transition-transform"
                    >
                      <Play className="w-5 h-5 fill-black text-black ml-0.5" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleWatchlist(item);
                      }}
                      className={`w-11 h-11 rounded-full cinema-panel flex items-center justify-center transition-all ${
                        isSaved ? 'text-amber-400 border-amber-400' : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      {isSaved ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Footer Info */}
                <div className="p-3 bg-[#0a0f1d]">
                  <h3 className="font-bold text-xs text-white group-hover:text-amber-300 truncate uppercase transition-colors">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400 font-mono">
                    <span>{item.year}</span>
                    <span>•</span>
                    <span className="truncate text-slate-300">
                      {item.genres ? item.genres[0] : item.type}
                    </span>
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
