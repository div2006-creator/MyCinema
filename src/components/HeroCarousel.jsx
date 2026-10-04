import React, { useState, useEffect } from 'react';
import { Play, Film, Star, Clock, Globe, Plus, Check, ChevronRight } from 'lucide-react';

export default function HeroCarousel({ items, onPlay, onMoreInfo, onToggleWatchlist, watchlist = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [items.length, isPaused]);

  if (!items || items.length === 0) return null;
  const current = items[currentIndex];
  const isSaved = watchlist.some((w) => w.id === current.id);

  return (
    <section 
      className="relative w-full pt-6 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Ambient Cinema Warm Ember Glow */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 w-96 h-80 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Main Two-Column Cinema Spotlight Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left: Main Cinema Showcase Stage (8 cols) */}
        <div className="lg:col-span-8 relative h-[480px] sm:h-[540px] md:h-[580px] rounded-3xl overflow-hidden cinema-card group shadow-[0_20px_60px_rgba(0,0,0,0.9)]">
          
          {/* Panoramic Backdrop */}
          <div className="absolute inset-0 bg-black">
            <img
              key={current.id}
              src={current.backdropUrl || current.image}
              alt={current.title}
              className="w-full h-full object-cover object-center transform scale-100 group-hover:scale-105 transition-all duration-1000 ease-out brightness-[0.78]"
            />
          </div>

          {/* Luxury Charcoal & Gold Vignette Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#06080d] via-[#06080d]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#06080d] via-[#06080d]/85 to-transparent w-full md:w-3/4" />
          <div className="absolute inset-0 border border-white/10 rounded-3xl pointer-events-none" />

          {/* Top Status Strip */}
          <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 backdrop-blur-md shadow-[0_0_15px_rgba(245,158,11,0.3)] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span>{current.badge || 'SPOTLIGHT MASTERPIECE'}</span>
              </span>
              <span className="hidden sm:inline-block px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-black/60 text-slate-300 border border-white/10 backdrop-blur-md">
                4K ULTRA HD • DOLBY VISION
              </span>
            </div>

            {/* Division Tag */}
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-black uppercase bg-black/70 text-slate-300 border border-white/15 backdrop-blur-md">
              {current.division === 'anime' ? '⛩️ ANIME REALM' : current.division === 'series' ? '📺 WEB SERIES' : '🎬 ENGLISH MOVIE'}
            </span>
          </div>

          {/* Content Overlay at Bottom */}
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 md:p-12 z-10 flex flex-col justify-end max-w-2xl">
            
            {/* Meta Attributes Row */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 mb-3">
              <div className="flex items-center gap-1 text-xs text-amber-300 font-bold bg-black/60 px-2.5 py-0.5 rounded-md backdrop-blur-sm border border-amber-500/30">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{current.rating}</span>
              </div>

              {current.duration && (
                <div className="flex items-center gap-1 text-xs text-slate-300 font-mono bg-black/60 px-2.5 py-0.5 rounded-md backdrop-blur-sm border border-white/10">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{current.duration}</span>
                </div>
              )}

              {current.ageRating && (
                <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-mono font-black uppercase backdrop-blur-sm border ${
                  current.ageRating === '18+'
                    ? 'bg-rose-950/90 text-rose-300 border-rose-500/60 shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                    : current.ageRating === 'ALL AGES'
                      ? 'bg-emerald-950/90 text-emerald-300 border-emerald-400/50'
                      : 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                }`}>
                  {current.ageRating === '18+' ? '🔞 18+' : current.ageRating}
                </span>
              )}

              {/* Multi-Audio / Dual Audio Tag */}
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-violet-950/80 text-violet-300 border border-violet-500/40 backdrop-blur-sm">
                <Globe className="w-3 h-3 text-violet-400" />
                <span>{current.isAnime ? 'DUAL AUDIO (ENG DUB / JAP SUB)' : 'MULTI-AUDIO (DUAL / DUB)'}</span>
              </div>
            </div>

            {/* Film Title */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white uppercase drop-shadow-2xl mb-2 font-sans leading-none">
              {current.title}
            </h1>

            {/* Tagline */}
            {current.tagline && (
              <p className="text-xs sm:text-sm font-mono tracking-widest text-amber-400 mb-3 uppercase">
                {current.tagline}
              </p>
            )}

            {/* Synopsis */}
            <p className="text-slate-300 text-xs sm:text-sm line-clamp-2 sm:line-clamp-3 mb-6 max-w-xl font-normal leading-relaxed drop-shadow">
              {current.synopsis}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <button
                onClick={() => onPlay(current)}
                className="gold-gradient-btn px-6 sm:px-8 py-3.5 rounded-full text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2.5 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-black text-black ml-0.5" />
                <span>Stream Master 4K</span>
              </button>

              <button
                onClick={() => onMoreInfo(current)}
                className="px-5 sm:px-6 py-3.5 rounded-full font-semibold text-xs sm:text-sm tracking-wider uppercase flex items-center gap-2 cinema-panel text-white hover:border-amber-400/50 backdrop-blur-md transition-all cursor-pointer"
              >
                <Film className="w-4 h-4 text-amber-400" />
                <span>Watch Trailer</span>
              </button>

              {onToggleWatchlist && (
                <button
                  onClick={() => onToggleWatchlist(current)}
                  className={`p-3.5 rounded-full cinema-panel flex items-center justify-center transition-all cursor-pointer ${
                    isSaved ? 'text-amber-400 border-amber-400/60' : 'text-slate-300 hover:text-white'
                  }`}
                  aria-label="Add to Vault"
                >
                  {isSaved ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Now Screening Spotlight Reel Deck (4 cols) */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-3 cinema-panel p-4 rounded-3xl border border-white/10">
          
          <div className="flex items-center justify-between px-2 pt-1 pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <h3 className="text-xs font-mono font-bold tracking-widest text-slate-200 uppercase">
                Spotlight Reel (6 Titles)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              0{currentIndex + 1} / 0{items.length}
            </span>
          </div>

          {/* Interactive Thumbnails Deck */}
          <div className="space-y-2.5 overflow-y-auto max-h-[490px] pr-1">
            {items.map((item, idx) => {
              const isActive = idx === currentIndex;

              return (
                <div
                  key={item.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`relative p-2.5 rounded-2xl transition-all duration-300 cursor-pointer flex items-center gap-3.5 group ${
                    isActive
                      ? 'bg-amber-500/15 border border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                      : 'hover:bg-white/[0.05] border border-transparent'
                  }`}
                >
                  {/* Thumbnail Poster */}
                  <div className="relative w-14 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-white/10">
                    <img 
                      src={item.image || item.posterUrl} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute top-1 left-1 px-1 py-0.2 rounded bg-black/80 text-[9px] font-bold text-amber-300">
                      ★ {item.rating}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[9px] font-mono font-black uppercase text-amber-400 bg-amber-950/70 px-1.5 py-0.5 rounded border border-amber-500/30">
                        {item.division === 'anime' ? 'ANIME' : item.division === 'series' ? 'SERIES' : 'MOVIE'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {item.year}
                      </span>
                    </div>

                    <h4 className={`text-xs font-bold uppercase truncate transition-colors ${
                      isActive ? 'text-amber-300' : 'text-white group-hover:text-amber-200'
                    }`}>
                      {item.title}
                    </h4>

                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
                      {item.genres ? item.genres.join(', ') : item.type}
                    </p>

                    {/* Progress indicator when active */}
                    {isActive && (
                      <div className="w-full h-1 bg-amber-950 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full animate-pulse w-3/4" />
                      </div>
                    )}
                  </div>

                  <ChevronRight className={`w-4 h-4 transition-transform flex-shrink-0 ${
                    isActive ? 'text-amber-400 translate-x-1' : 'text-slate-600 group-hover:text-slate-400'
                  }`} />
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
