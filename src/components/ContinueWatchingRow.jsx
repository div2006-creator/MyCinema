import React from 'react';
import { Play, X, Clock, Tv, Film, Sparkles } from 'lucide-react';

export default function ContinueWatchingRow({ 
  items = [], 
  onResumeMovie, 
  onRemoveItem 
}) {
  if (!items || items.length === 0) return null;

  return (
    <section className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between gap-3 mb-4 pb-2 border-b border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-5 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 shadow-[0_0_12px_rgba(245,158,11,0.6)]" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold tracking-widest text-amber-400 uppercase">
                RESUME TRANSMISSION
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950/80 text-amber-300 border border-amber-500/30">
                {items.length} {items.length === 1 ? 'TITLE' : 'TITLES'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight font-sans">
              CONTINUE WATCHING
            </h2>
          </div>
        </div>
      </div>

      {/* Horizontal Scroll Deck */}
      <div className="flex items-stretch gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-3">
        {items.map((item, index) => {
          const isTv = item.type === 'Series' || (item.type === 'Anime' && item.episodes > 1) || item.season > 1 || item.episode > 1;
          const itemId = item.movieId || item.id || item.title || index;
          const displayImage = item.poster || item.posterUrl || item.backdrop || item.image || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80';
          const progressVal = item.progress || item.progressPercent || 35;

          return (
            <div
              key={itemId}
              className="relative flex-shrink-0 w-64 sm:w-72 rounded-2xl overflow-hidden cinema-panel cinema-card border border-amber-500/25 bg-[#090d18] group flex flex-col justify-between"
            >
              {/* Card Image with Progress Bar */}
              <div 
                onClick={() => onResumeMovie(item)}
                className="relative aspect-video w-full overflow-hidden cursor-pointer bg-black"
              >
                <img
                  src={displayImage}
                  alt={item.title || 'Movie Thumbnail'}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80';
                  }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                {/* Dismiss Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveItem(itemId);
                  }}
                  title="Remove from Continue Watching"
                  aria-label={`Remove ${item.title} from history`}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/80 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-white/10 hover:border-rose-500/50 flex items-center justify-center transition-all cursor-pointer z-20"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                {/* Type & Audio Badge */}
                <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-black/85 text-amber-300 border border-amber-500/30">
                    {item.type}
                  </span>
                  {item.hasHindiDub && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-950/90 text-amber-300 border border-amber-500/40">
                      🇮🇳 HINDI
                    </span>
                  )}
                </div>

                {/* Center Resume Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full gold-gradient-btn flex items-center justify-center text-black shadow-[0_0_20px_rgba(245,158,11,0.6)] transform scale-90 group-hover:scale-105 transition-all">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </div>

                {/* Glowing Progress Bar at Bottom of Thumbnail */}
                <div className="absolute bottom-0 inset-x-0 h-1.5 bg-white/15 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.9)]"
                    style={{ width: `${progressVal}%` }}
                  />
                </div>
              </div>

              {/* Meta Footer */}
              <div className="p-3.5 flex flex-col justify-between flex-grow">
                <div>
                  <h3 
                    onClick={() => onResumeMovie(item)}
                    className="font-bold text-sm text-white group-hover:text-amber-300 transition-colors truncate cursor-pointer uppercase font-sans"
                  >
                    {item.title}
                  </h3>

                  <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-slate-400">
                    {isTv ? (
                      <span className="text-amber-300 flex items-center gap-1 font-bold">
                        <Tv className="w-3 h-3 text-violet-400" />
                        <span>S{item.season || 1} : E{item.episode || 1}</span>
                      </span>
                    ) : (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <Film className="w-3 h-3 text-emerald-400" />
                        <span>Feature Movie</span>
                      </span>
                    )}
                    <span>•</span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>{progressVal}% watched</span>
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onResumeMovie(item)}
                  className="mt-3 w-full py-1.5 rounded-xl cinema-panel text-amber-300 hover:text-white hover:border-amber-400/50 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Resume Playback</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
