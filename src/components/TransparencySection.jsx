import React from 'react';
import { Search, HardDrive, ShieldCheck, Sparkles } from 'lucide-react';
import { TRANSPARENCY_PROTOCOLS } from '../data/cinemaData';

const ICONS = {
  Search: Search,
  HardDrive: HardDrive,
  ShieldCheck: ShieldCheck
};

export default function TransparencySection() {
  return (
    <section className="relative py-16 px-4 md:px-8 max-w-7xl mx-auto my-8">
      {/* Background Subtle Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-950/10 to-transparent pointer-events-none -z-10" />

      {/* Header Badge & Title */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[11px] font-mono font-bold tracking-widest uppercase bg-cyan-950/60 text-cyan-300 border border-cyan-400/30 mb-4 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
          <span>Platform Protocol</span>
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
        </div>

        <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white mb-4">
          Transmission <span className="text-gradient-cyan-violet">Architecture</span>
        </h2>

        <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
          Discover how AETHER orchestrates decentralized media streams across global nodes 
          while maintaining absolute user confidentiality and zero server footprint.
        </p>
      </div>

      {/* 3 Grid Feature Protocol Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TRANSPARENCY_PROTOCOLS.map((protocol, index) => {
          const Icon = ICONS[protocol.iconName] || ShieldCheck;

          return (
            <div
              key={index}
              className="relative p-6 sm:p-8 rounded-3xl glass-panel glass-panel-hover flex flex-col justify-between transition-all duration-300 group"
            >
              {/* Card Ambient Glow on Hover */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/15 transition-all -z-10" />

              <div>
                {/* Protocol Icon & Tag */}
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.2)] group-hover:scale-110 group-hover:border-cyan-300 transition-all">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-mono tracking-widest text-violet-400 bg-violet-950/60 px-2.5 py-1 rounded-full border border-violet-500/30 uppercase">
                    {protocol.tag}
                  </span>
                </div>

                {/* Card Title */}
                <h3 className="text-lg sm:text-xl font-black uppercase tracking-wide text-white mb-3 group-hover:text-cyan-200 transition-colors">
                  {protocol.title}
                </h3>

                {/* Card Description */}
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-light">
                  {protocol.description}
                </p>
              </div>

              {/* Status Indicator */}
              <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>STATUS: OPERATIONAL</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
