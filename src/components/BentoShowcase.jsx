import React from 'react';
import { Play, Star, Plus, Check, Globe, Sparkles, Film } from 'lucide-react';

export default function BentoShowcase({ 
  featuredItem, 
  sideItems = [], 
  onSelectMovie, 
  onToggleWatchlist, 
  watchlist = [] 
}) {
  if (!featuredItem) return null;
  const isFeaturedSaved = watchlist.some((w) => w.id === featuredItem.id);

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Section Title */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-4 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
            <span className="text-xs font-mono font-bold tracking-widest text-amber-400 uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>CURATED STUDIO SELECTION</span>
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight font-sans">
            CINEMATIC IMMERSION SPOTLIGHT
          </h2>
        </div>
      </div>

      {/* Bento Grid: 1 Large Panoramic Card + 4 Vertical Cards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
        
        {/* Large Featured Tile (7 cols) */}
        <div 
          onClick={() => onSelectMovie(featuredItem)}
          className="md:col-span-7 relative min-h-[380px] sm:min-h-[440px] rounded-3xl overflow-hidden cinema-card group cursor-pointer shadow-2xl flex flex-col justify-end p-6 sm:p-8"
        >
          {/* Backdrop Image */}
          <div className="absolute inset-0 bg-black">
            <img
              src={featuredItem.backdropUrl || featuredItem.image}
              alt={featuredItem.title}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out brightness-[0.7]"
            />
          </div>

          {/* Vignette Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#06080d] via-[#06080d]/65 to-transparent" />
          <div className="absolute inset-0 border border-white/10 rounded-3xl pointer-events-none" />

          {/* Top Badges */}
          <div className="absolute top-5 left-5 right-5 flex items-center justify-between z-10">
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 backdrop-blur-md">
              FEATURED MASTERWORK
            </span>

            {featuredItem.ageRating && (
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-black border backdrop-blur-md ${
                featuredItem.ageRating === '18+'
                  ? 'bg-rose-950/90 text-rose-300 border-rose-500/60'
                  : 'bg-black/70 text-slate-200 border-white/20'
              }`}>
                {featuredItem.ageRating === '18+' ? '🔞 18+' : featuredItem.ageRating}
              </span>
            )}
          </div>

          {/* Bottom Content */}
          <div className="relative z-10 max-w-xl">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1 text-xs text-amber-300 font-bold bg-black/60 px-2 py-0.5 rounded border border-amber-500/30">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{featuredItem.rating}</span>
              </div>
              <span className="text-xs font-mono text-slate-300">{featuredItem.year}</span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-mono text-amber-400 uppercase">
                {featuredItem.division === 'anime' ? '⛩️ Anime' : featuredItem.division === 'series' ? '📺 Series' : '🎬 Movie'}
              </span>
            </div>

            <h3 className="text-2xl sm:text-4xl font-black uppercase text-white group-hover:text-amber-300 transition-colors drop-shadow-md mb-2">
              {featuredItem.title}
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 mb-5 font-normal leading-relaxed drop-shadow">
              {featuredItem.synopsis}
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectMovie(featuredItem);
                }}
                className="gold-gradient-btn px-6 py-2.5 rounded-full text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-black text-black ml-0.5" />
                <span>Play Master</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleWatchlist(featuredItem);
                }}
                className={`p-2.5 rounded-full cinema-panel flex items-center justify-center transition-all cursor-pointer ${
                  isFeaturedSaved ? 'text-amber-400 border-amber-400' : 'text-slate-300 hover:text-white'
                }`}
              >
                {isFeaturedSaved ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* 4 Complementary Cards (5 cols - 2x2 grid) */}
        <div className="md:col-span-5 grid grid-cols-2 gap-4">
          {sideItems.slice(0, 4).map((item) => {
            const isSaved = watchlist.some((w) => w.id === item.id);

            return (
              <div
                key={item.id}
                onClick={() => onSelectMovie(item)}
                className="relative rounded-2xl overflow-hidden cinema-card group cursor-pointer shadow-lg flex flex-col justify-between"
              >
                {/* Poster */}
                <div className="relative aspect-[3/4] w-full overflow-hidden">
                  <img
                    src={item.image || item.posterUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />

                  {/* Rating Tag */}
                  <div className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-md border border-amber-500/30 text-[10px] font-bold text-amber-300">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{item.rating}</span>
                  </div>

                  {/* Multi-Audio Pill */}
                  <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-violet-950/90 text-violet-300 border border-violet-500/40">
                    🌐 {item.isAnime ? 'DUAL' : 'MULTI'}
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectMovie(item);
                      }}
                      className="w-9 h-9 rounded-full gold-gradient-btn flex items-center justify-center text-black shadow-lg"
                    >
                      <Play className="w-4 h-4 fill-black text-black ml-0.5" />
                    </button>
                  </div>
                </div>

                {/* Footer Info */}
                <div className="p-2.5 bg-[#0a0f1d]">
                  <h4 className="font-bold text-xs text-white group-hover:text-amber-300 truncate uppercase transition-colors">
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-1 mt-0.5 text-[10px] text-slate-400 font-mono">
                    <span>{item.year}</span>
                    <span>•</span>
                    <span className="truncate text-slate-300">{item.type}</span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
