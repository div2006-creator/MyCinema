import React from 'react';
import { Bookmark, Play, Trash2, ArrowRight, Film, Star, Globe } from 'lucide-react';

export default function WatchlistSection({ 
  watchlist = [], 
  onSelectMovie, 
  onRemoveFromWatchlist, 
  onGoExplore 
}) {
  return (
    <div className="pt-8 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-6 border-b border-white/[0.08]">
        <div>
          <span className="text-xs font-mono tracking-widest text-amber-400 uppercase">
            // PERSONAL CINEMA ARCHIVE
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight mt-1 font-sans">
            MY CINEMA <span className="text-gold-gradient">VAULT</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Saved securely in your browser's encrypted database.
          </p>
        </div>

        <div className="text-xs font-mono text-amber-300 bg-amber-950/60 border border-amber-500/30 px-3.5 py-1.5 rounded-full w-fit">
          {watchlist.length} {watchlist.length === 1 ? 'TITLE IN VAULT' : 'TITLES IN VAULT'}
        </div>
      </div>

      {watchlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20 px-4 cinema-panel rounded-3xl max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-6 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            <Bookmark className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-2 font-sans">
            Your Cinema Vault is Empty
          </h2>

          <p className="text-xs sm:text-sm text-slate-400 mb-8 max-w-md">
            Save any English movie, anime saga, or web series while browsing to quickly launch it anytime.
          </p>

          <button
            onClick={onGoExplore}
            className="gold-gradient-btn px-6 py-3 rounded-full text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer"
          >
            <span>Explore Cinema Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {watchlist.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl overflow-hidden cinema-card group flex flex-col justify-between"
            >
              <div 
                onClick={() => onSelectMovie(item)}
                className="relative aspect-[2/3] w-full overflow-hidden cursor-pointer"
              >
                <img
                  src={item.image || item.posterUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md border border-amber-500/30 text-[10px] font-bold text-amber-300">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{item.rating}</span>
                </div>

                {item.ageRating && (
                  <div className={`absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded text-[10px] font-mono font-black border z-10 ${
                    item.ageRating === '18+'
                      ? 'bg-rose-950/90 text-rose-300 border-rose-500/60'
                      : 'bg-black/80 text-slate-200 border-white/20'
                  }`}>
                    {item.ageRating === '18+' ? '🔞 18+' : item.ageRating}
                  </div>
                )}

                {/* Multi-Audio Badge */}
                <div className="absolute bottom-2.5 right-2.5 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-violet-950/90 text-violet-300 border border-violet-500/40 z-10">
                  🌐 {item.isAnime ? 'DUAL' : 'MULTI'}
                </div>

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectMovie(item);
                    }}
                    className="w-10 h-10 rounded-full gold-gradient-btn flex items-center justify-center text-black shadow-lg"
                  >
                    <Play className="w-4 h-4 fill-black text-black ml-0.5" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFromWatchlist(item.id);
                    }}
                    className="w-10 h-10 rounded-full cinema-panel flex items-center justify-center text-rose-400 hover:text-rose-300 hover:border-rose-400/60 transition-all cursor-pointer"
                    title="Remove from Vault"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-3.5 bg-[#0a0f1d]">
                <h3 
                  onClick={() => onSelectMovie(item)}
                  className="font-bold text-xs sm:text-sm text-white group-hover:text-amber-300 truncate cursor-pointer uppercase transition-colors"
                >
                  {item.title}
                </h3>
                <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400 font-mono">
                  <span>{item.year}</span>
                  <span>•</span>
                  <span className="truncate text-slate-300">{item.type}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
