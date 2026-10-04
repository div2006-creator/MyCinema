import React, { useState } from 'react';
import { 
  Film, 
  Flame, 
  Tv, 
  Bookmark, 
  Search, 
  User, 
  LogIn, 
  LogOut, 
  ShieldCheck, 
  ChevronDown, 
  Trophy, 
  Sparkles,
  Layers,
  Menu,
  X,
  SlidersHorizontal
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  onOpenSearch, 
  onOpenA11y,
  watchlistCount = 0,
  currentUser = null,
  onOpenAuth,
  onLogout,
  ageClearance = null
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'All Cinema', icon: Layers },
    { id: 'movies', label: 'English Movies', icon: Film },
    { id: 'anime', label: 'Anime Realm', icon: Flame },
    { id: 'series', label: 'Web Series', icon: Tv },
    { id: 'top10', label: 'Top 10 Ranked', icon: Trophy },
    { id: 'watchlist', label: 'My Vault', icon: Bookmark, badge: watchlistCount },
  ];

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-2xl bg-[#06080d]/92 border-b border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.8)] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Left: Studio Brand & Identity */}
        <div 
          onClick={() => {
            setActiveTab('home');
            setMobileMenuOpen(false);
          }}
          className="flex items-center gap-3.5 cursor-pointer group select-none flex-shrink-0"
        >
          {/* Cinema Gold Studio Monogram */}
          <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 p-0.5 shadow-[0_0_20px_rgba(245,158,11,0.3)] group-hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] transition-all">
            <div className="w-full h-full bg-[#090d16] rounded-[10px] flex items-center justify-center">
              <Film className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform duration-300" />
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-black text-xl tracking-tight text-white group-hover:text-amber-300 transition-colors uppercase font-sans">
                AETHER
              </span>
              <span className="text-[10px] font-mono font-bold tracking-widest text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/30">
                4K HDR
              </span>
            </div>
            <span className="text-[9px] tracking-[0.3em] text-slate-400 font-mono uppercase -mt-0.5">
              PREMIER CINEMA THEATER
            </span>
          </div>
        </div>

        {/* Center: Cinema Navigation Channels (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative px-3.5 xl:px-4 py-2 rounded-xl text-xs font-bold tracking-wide uppercase transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'text-amber-300 bg-amber-500/10 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-full bg-amber-400 text-black">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Quick Tools, Clearance Badge, Search & Account */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          
          {/* Accessibility Suite Button */}
          <button
            onClick={onOpenA11y}
            aria-label="Accessibility & Display Suite (Alt+A)"
            title="Accessibility Suite & Hotkeys (Alt+A or ?)"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl cinema-panel hover:border-amber-400/40 text-slate-300 hover:text-white transition-all cursor-pointer group"
          >
            <SlidersHorizontal className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform" />
            <span className="hidden xl:inline text-xs font-mono font-medium text-slate-300">
              A11y
            </span>
          </button>

          {/* Quick Search Button with ⌘K Badge */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2.5 px-3 sm:px-4 py-2 rounded-xl cinema-panel hover:border-amber-400/40 text-slate-300 hover:text-white transition-all cursor-pointer group"
          >
            <Search className="w-4 h-4 text-slate-400 group-hover:text-amber-400 transition-colors" />
            <span className="hidden sm:inline text-xs font-mono font-medium text-slate-300">
              Quick Search...
            </span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-black/50 border border-slate-700/60 rounded">
              /
            </kbd>
          </button>

          {/* Age Clearance Tag */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl cinema-panel text-[11px] font-mono font-bold border border-white/10">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span className="text-slate-300">
              {ageClearance?.is18Plus ? '🔞 18+ UNLOCKED' : ageClearance?.is13Plus ? '13+ VERIFIED' : 'AGE GATE READY'}
            </span>
          </div>

          {/* User Account Capsule / Authentication */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl cinema-panel-gold cursor-pointer group"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-black font-black text-xs">
                  {currentUser.username ? currentUser.username[0].toUpperCase() : 'U'}
                </div>
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-bold text-white leading-none">
                    {currentUser.username}
                  </span>
                  <span className="text-[9px] font-mono text-amber-400 leading-tight">
                    AUTHENTICATED
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400 transition-colors" />
              </button>

              {/* User Dropdown */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl cinema-panel-gold border border-amber-500/30 p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="p-3 border-b border-white/10 mb-2">
                    <p className="text-xs font-bold text-white uppercase">{currentUser.username}</p>
                    <p className="text-[10px] font-mono text-slate-400 truncate">Device Session Active</p>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-bold">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>Saved in IndexedDB</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      setActiveTab('watchlist');
                    }}
                    className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 flex items-center gap-2 text-left cursor-pointer"
                  >
                    <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                    <span>My Saved Vault ({watchlistCount})</span>
                  </button>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 flex items-center gap-2 text-left mt-1 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out of Device</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => onOpenAuth()}
              className="gold-gradient-btn px-4 py-2 rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl cinema-panel text-slate-300 hover:text-white cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-[#07090e]/98 backdrop-blur-2xl px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wide flex items-center justify-between ${
                  isActive 
                    ? 'text-amber-300 bg-amber-500/10 border border-amber-500/30' 
                    : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-amber-400 text-black">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
          
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenA11y();
            }}
            className="w-full px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wide flex items-center justify-between text-amber-400 bg-white/5 hover:bg-white/10 mt-2"
          >
            <div className="flex items-center gap-3">
              <SlidersHorizontal className="w-4 h-4 text-amber-400" />
              <span>Accessibility & Display</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">HOTKEYS & A11Y</span>
          </button>
        </div>
      )}
    </header>
  );
}
