import React, { useState, useEffect } from 'react';
import { ArrowUp, Film, Shield, Globe, Award, Sparkles } from 'lucide-react';

export default function Footer({ onNavigate }) {
  const [showTopBtn, setShowTopBtn] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowTopBtn(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative mt-20 border-t border-white/[0.08] bg-[#05070c] text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          {/* Brand Column */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-black text-sm shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                <Film className="w-5 h-5 text-black" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-white text-base tracking-widest uppercase font-sans">
                  AETHER CINEMA
                </span>
                <span className="text-[9px] font-mono text-amber-400 tracking-widest -mt-0.5 uppercase">
                  PREMIER 4K STREAMING THEATER
                </span>
              </div>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed max-w-md font-sans">
              A private cinema web theater delivering master uncompressed 4K releases, complete anime sagas, 
              and prestige television with multi-language dubbing and zero external redirects.
            </p>

            <div className="flex flex-wrap items-center gap-2.5 mt-6 text-[11px] font-mono">
              <span className="flex items-center gap-1.5 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30 text-amber-300">
                <Film className="w-3 h-3 text-amber-400" />
                <span>4K ULTRA HD • 1080P MASTER</span>
              </span>
              <span className="flex items-center gap-1.5 bg-white/[0.05] px-3 py-1 rounded-full border border-white/10 text-slate-300">
                <Globe className="w-3 h-3 text-violet-400" />
                <span>DUAL AUDIO & MULTI-DUB</span>
              </span>
            </div>
          </div>

          {/* Cinema Channels */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4 font-mono">
              // CINEMA CHANNELS
            </h4>
            <ul className="space-y-2.5 font-sans">
              <li>
                <button 
                  onClick={() => onNavigate('home')} 
                  className="hover:text-amber-300 transition-colors cursor-pointer"
                >
                  All Cinema
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('movies')} 
                  className="hover:text-amber-300 transition-colors cursor-pointer"
                >
                  English Movies Vault
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('anime')} 
                  className="hover:text-amber-300 transition-colors cursor-pointer"
                >
                  Anime Sanctuary
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('series')} 
                  className="hover:text-amber-300 transition-colors cursor-pointer"
                >
                  Prestige Web Series
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('top10')} 
                  className="hover:text-amber-300 transition-colors cursor-pointer"
                >
                  Top 10 Global Ranked
                </button>
              </li>
            </ul>
          </div>

          {/* Standards & Security */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4 font-mono">
              // STREAMING INTEGRITY
            </h4>
            <ul className="space-y-2.5 text-slate-400 text-xs font-sans">
              <li className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero Redirect Navigation Shield</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>6 High-Speed Stream Mirror Nodes</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>Multi-Audio (English / Hindi / Jap)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-violet-400" />
                <span>IndexedDB Encrypted Device Session</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits Strip */}
        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-slate-500">
          <div>
            <span>© {new Date().getFullYear()} AETHER CINEMA. All streams resolved on-the-fly.</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-slate-400">All 6 Streaming Nodes Operational</span>
          </div>
        </div>
      </div>

      {/* Floating Scroll to Top Button */}
      {showTopBtn && (
        <button
          onClick={scrollToTop}
          aria-label="Scroll to top"
          className="fixed bottom-6 right-6 w-11 h-11 rounded-full cinema-panel-gold text-amber-400 flex items-center justify-center shadow-2xl hover:scale-110 transition-all z-40 cursor-pointer"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </footer>
  );
}
