import React from 'react';
import { ShieldCheck, Film, Globe, HardDrive, Sparkles, Award } from 'lucide-react';

export default function StudioStandards() {
  const standards = [
    {
      icon: Film,
      title: "Master 4K UHD Bitrate",
      subtitle: "UNCOMPRESSED QUALITY",
      description: "Direct streams delivered in up to 4K Ultra HD resolution with full dynamic range and spatial surround audio."
    },
    {
      icon: ShieldCheck,
      title: "Zero Redirect Guarantee",
      subtitle: "100% ON-SITE STREAMING",
      description: "Integrated top-level navigation shields and popup blockers keep playback strictly on this site without ad redirects."
    },
    {
      icon: Globe,
      title: "Global Multi-Audio & Dubs",
      subtitle: "MULTI-LANGUAGE TRACKS",
      description: "Switch seamlessly between English Dubbed, Japanese original, Hindi Dub, and international audio tracks with subtitles."
    },
    {
      icon: HardDrive,
      title: "Permanent Device Vault",
      subtitle: "INDEXEDDB ENCRYPTED",
      description: "Your login credentials, age clearance, and watchlists persist securely across device restarts without surveillance."
    }
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto my-6">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[11px] font-mono font-bold tracking-widest uppercase bg-amber-500/10 text-amber-300 border border-amber-500/30 mb-4 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span>PREMIER CINEMA STANDARDS</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white mb-3 font-sans">
          ENGINEERED FOR THE <span className="text-gold-gradient">ULTIMATE VIEWING EXPERIENCE</span>
        </h2>

        <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
          A modern private cinema platform designed with state-of-the-art streaming technology,
          instant multi-language audio switching, and zero compromise on picture quality.
        </p>
      </div>

      {/* 4 Feature Pillars Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {standards.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={index}
              className="p-6 rounded-3xl cinema-panel cinema-card flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-5 group-hover:scale-110 group-hover:bg-amber-500/20 transition-all shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                  <Icon className="w-6 h-6" />
                </div>

                <span className="text-[10px] font-mono tracking-widest text-amber-400 font-bold block mb-1 uppercase">
                  {item.subtitle}
                </span>

                <h3 className="text-lg font-bold text-white uppercase tracking-wide mb-2.5 group-hover:text-amber-300 transition-colors font-sans">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-400 leading-relaxed font-normal">
                  {item.description}
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-white/[0.08] flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>VERIFIED STANDARD</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
