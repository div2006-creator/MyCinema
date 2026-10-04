import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Zap, 
  Moon, 
  CloudRain, 
  Sun, 
  RotateCcw, 
  Play, 
  Star, 
  Bookmark 
} from 'lucide-react';
import { MOOD_FREQUENCIES, CATEGORIES, HERO_TITLES } from '../data/cinemaData';

const MOOD_ICONS = {
  Zap: Zap,
  Moon: Moon,
  Sparkles: Sparkles,
  CloudRain: CloudRain,
  Sun: Sun
};

export default function MoodMatrix({ onSelectMovie, onToggleWatchlist, watchlist = [] }) {
  const [journeyStarted, setJourneyStarted] = useState(false);
  const [selectedMood, setSelectedMood] = useState(null);

  // Combine all items to query by mood
  const allMedia = [
    ...HERO_TITLES.map((h) => ({
      id: h.id,
      title: h.title,
      rating: h.rating,
      year: h.year,
      type: h.isAnime ? 'Anime' : 'Movie',
      genres: h.genres,
      image: h.posterUrl,
      mood: h.moodTags[0],
      synopsis: h.synopsis
    })),
    ...CATEGORIES.flatMap((c) => c.items)
  ];

  // Remove duplicates by ID
  const uniqueMedia = Array.from(new Map(allMedia.map((item) => [item.id, item])).values());

  const filteredItems = selectedMood
    ? uniqueMedia.filter((item) => {
        const matchesDirect = item.mood?.toLowerCase().includes(selectedMood.name.toLowerCase());
        const matchesSuggested = selectedMood.suggestedIds?.includes(item.id);
        return matchesDirect || matchesSuggested;
      })
    : [];

  return (
    <div className="pt-28 pb-20 px-4 md:px-8 max-w-7xl mx-auto min-h-screen">
      {!journeyStarted ? (
        /* Step 1: Mood Intro Screen (Matching Inochi's layout with Cyberpunk styling) */
        <div className="flex flex-col items-center justify-center text-center py-16 sm:py-24 max-w-3xl mx-auto">
          {/* Centered Glowing Emblem */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-cyan-500/20 via-violet-600/30 to-fuchsia-500/20 border border-cyan-400/50 flex items-center justify-center shadow-[0_0_50px_rgba(0,240,255,0.35)] mb-10 animate-bounce duration-1000">
            <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-cyan-300" />
            <div className="absolute -inset-1 rounded-3xl bg-cyan-400/20 blur-md -z-10" />
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white mb-6">
            Calibrate Your <span className="text-gradient-cyan-violet">Consciousness</span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base md:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl mb-10">
            Bypass generic catalog algorithms. Transmit your current psychological vibe, 
            and let our neural resonance engine synthesize the exact cinema masterpiece you crave.
          </p>

          {/* CTA Button */}
          <button
            onClick={() => setJourneyStarted(true)}
            className="group relative px-8 sm:px-10 py-4 rounded-full font-bold text-sm tracking-wider uppercase flex items-center gap-3 bg-gradient-to-r from-cyan-400 via-cyan-300 to-violet-500 text-black shadow-[0_0_30px_rgba(0,240,255,0.5)] hover:shadow-[0_0_40px_rgba(0,240,255,0.8)] transition-all transform hover:scale-105 cursor-pointer"
          >
            <span>Initiate Frequency Scan</span>
            <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      ) : (
        /* Step 2 & 3: Mood Selector Nodes & Results */
        <div className="py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800">
            <div>
              <span className="text-xs font-mono tracking-widest text-cyan-400 uppercase">
                // NEURAL FREQUENCY MATRIX
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase mt-1">
                Select Your Resonance Frequency
              </h2>
            </div>

            <button
              onClick={() => {
                setJourneyStarted(false);
                setSelectedMood(null);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel text-xs text-slate-300 hover:text-cyan-300 hover:border-cyan-400/40 transition-all cursor-pointer w-fit"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Scan</span>
            </button>
          </div>

          {/* Mood Selector Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
            {MOOD_FREQUENCIES.map((mood) => {
              const Icon = MOOD_ICONS[mood.icon] || Sparkles;
              const isSelected = selectedMood?.id === mood.id;

              return (
                <div
                  key={mood.id}
                  onClick={() => setSelectedMood(mood)}
                  className={`cursor-pointer relative p-5 rounded-2xl transition-all duration-300 flex flex-col justify-between ${
                    isSelected
                      ? 'glass-panel border-cyan-400 shadow-[0_0_30px_rgba(0,240,255,0.3)] bg-gradient-to-b from-cyan-950/40 to-violet-950/40 -translate-y-1'
                      : 'glass-panel border-slate-800 hover:border-cyan-400/40 hover:bg-[#0d162b]'
                  }`}
                >
                  <div>
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${mood.color} flex items-center justify-center text-black mb-4 shadow-md`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
                      {mood.name}
                    </h3>

                    <p className="text-[11px] text-slate-400 line-clamp-3 leading-relaxed">
                      {mood.tagline}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                    <span className={isSelected ? 'text-cyan-300 font-bold' : 'text-slate-500'}>
                      {isSelected ? 'ACTIVE FREQUENCY' : 'TUNE IN'}
                    </span>
                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-cyan-400 shadow-[0_0_8px_rgba(0,240,255,1)]' : 'bg-slate-700'}`} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recommended Transmissions Feed */}
          {selectedMood ? (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="w-2 h-6 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.8)]" />
                <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wide">
                  Frequency Output: <span className="text-cyan-300">{selectedMood.name}</span>
                </h3>
                <span className="text-xs font-mono text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-full">
                  {filteredItems.length} Matched Signals
                </span>
              </div>

              {filteredItems.length === 0 ? (
                <div className="p-12 text-center glass-panel rounded-2xl text-slate-400 font-mono text-sm">
                  No transmissions found for this exact harmonic. Please recalibrate your sensor.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {filteredItems.map((item) => {
                    const isSaved = watchlist.some((w) => w.id === item.id);

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
                              <Bookmark className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="p-3">
                          <h4 
                            onClick={() => onSelectMovie(item)}
                            className="font-bold text-xs sm:text-sm text-white group-hover:text-cyan-300 truncate cursor-pointer uppercase"
                          >
                            {item.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {item.year} • {item.type}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500 font-mono text-xs">
              // SELECT AN EMOTIONAL NODE ABOVE TO SYNTHESIZE TRANSMISSIONS
            </div>
          )}
        </div>
      )}
    </div>
  );
}
