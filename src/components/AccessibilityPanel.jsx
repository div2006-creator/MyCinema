import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  Type, 
  Zap, 
  HelpCircle, 
  X, 
  Check, 
  Sliders, 
  SunMedium, 
  Keyboard, 
  ShieldCheck, 
  RotateCcw 
} from 'lucide-react';

const A11Y_SETTINGS_KEY = 'mycinema_a11y_preferences';

export default function AccessibilityPanel({ 
  isOpen = false, 
  onClose 
}) {
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState('normal'); // 'normal' | 'large' | 'xlarge'
  const [reducedMotion, setReducedMotion] = useState(false);
  const [activeTab, setActiveTab] = useState('CONTROLS'); // 'CONTROLS' | 'HOTKEYS'

  // Load saved preferences
  useEffect(() => {
    try {
      const raw = localStorage.getItem(A11Y_SETTINGS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setHighContrast(Boolean(parsed.highContrast));
        setFontSize(parsed.fontSize || 'normal');
        setReducedMotion(Boolean(parsed.reducedMotion));
      }
    } catch {}
  }, []);

  // Apply settings to document root
  useEffect(() => {
    const root = document.documentElement;

    // High-Contrast Mode
    if (highContrast) {
      root.classList.add('high-contrast-mode');
    } else {
      root.classList.remove('high-contrast-mode');
    }

    // Font size scaling
    root.setAttribute('data-font-scale', fontSize);
    if (fontSize === 'large') {
      root.style.fontSize = '17px';
    } else if (fontSize === 'xlarge') {
      root.style.fontSize = '18.5px';
    } else {
      root.style.fontSize = '';
    }

    // Reduced motion
    if (reducedMotion) {
      root.setAttribute('data-reduced-motion', 'true');
    } else {
      root.removeAttribute('data-reduced-motion');
    }

    // Save to localStorage
    try {
      localStorage.setItem(A11Y_SETTINGS_KEY, JSON.stringify({
        highContrast,
        fontSize,
        reducedMotion
      }));
    } catch {}
  }, [highContrast, fontSize, reducedMotion]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleReset = () => {
    setHighContrast(false);
    setFontSize('normal');
    setReducedMotion(false);
  };

  const KEYBOARD_SHORTCUTS = [
    { key: '/', desc: 'Open Instant Search & Voice Command' },
    { key: 'Esc', desc: 'Close any open Player, Search, or Modal' },
    { key: 'Alt + A', desc: 'Open Accessibility & Display Suite' },
    { key: '?', desc: 'View Keyboard Shortcuts Cheat Sheet' },
    { key: '1 - 4', desc: 'Switch Streaming Server 1, 2, 3, or 4 inside Player' },
    { key: 'H', desc: 'Quick-Switch to Hindi Dub / Dual Audio track' },
    { key: 'R', desc: 'Reload Video Stream Handshake' },
    { key: 'F', desc: 'Toggle Fullscreen Mode' }
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-xl animate-fade-in"
      role="dialog"
      aria-label="Accessibility & Display Suite"
      aria-modal="true"
    >
      <div className="relative w-full max-w-xl rounded-3xl cinema-panel border border-amber-500/40 p-5 sm:p-7 shadow-[0_20px_80px_rgba(0,0,0,0.95)] bg-[#070b16]/98">
        
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-5 pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold tracking-widest text-amber-400 uppercase">
                  INCLUSIVE CINEMA
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 font-bold">
                  WCAG COMPLIANT
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight font-sans">
                ACCESSIBILITY & HOTKEYS
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close accessibility modal"
            className="w-9 h-9 rounded-full cinema-panel flex items-center justify-center text-slate-300 hover:text-white hover:border-amber-400 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle: Settings vs Hotkeys */}
        <div className="flex items-center gap-2 mb-6 p-1 rounded-2xl bg-black/60 border border-white/10">
          <button
            onClick={() => setActiveTab('CONTROLS')}
            className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'CONTROLS'
                ? 'gold-gradient-btn text-black font-bold shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Display Controls</span>
          </button>

          <button
            onClick={() => setActiveTab('HOTKEYS')}
            className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'HOTKEYS'
                ? 'gold-gradient-btn text-black font-bold shadow-md'
                : 'text-slate-400 hover:text-amber-300'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>Keyboard Shortcuts</span>
          </button>
        </div>

        {/* TAB 1: DISPLAY & ACCESSIBILITY CONTROLS */}
        {activeTab === 'CONTROLS' && (
          <div className="space-y-4">
            
            {/* Feature 1: High Contrast Mode */}
            <div className="p-4 rounded-2xl cinema-panel border border-white/10 bg-[#090e1c] flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <SunMedium className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-sm text-white font-sans uppercase">High-Contrast Mode</span>
                </div>
                <p className="text-xs text-slate-400">
                  Enhances text legibility with maximum contrast yellow & white lettering on pure black backings.
                </p>
              </div>

              <button
                onClick={() => setHighContrast(!highContrast)}
                role="switch"
                aria-checked={highContrast}
                className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer flex-shrink-0 ${
                  highContrast ? 'bg-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.7)]' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-black transition-transform ${
                    highContrast ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Feature 2: Text Size Scaling */}
            <div className="p-4 rounded-2xl cinema-panel border border-white/10 bg-[#090e1c]">
              <div className="flex items-center gap-2 mb-1">
                <Type className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-sm text-white font-sans uppercase">Text & UI Scale</span>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Scale interface font size for effortless readability across desktop and mobile screens.
              </p>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'normal', label: 'Default (100%)' },
                  { id: 'large', label: 'Large (115%)' },
                  { id: 'xlarge', label: 'Extra Large (130%)' }
                ].map((size) => (
                  <button
                    key={size.id}
                    onClick={() => setFontSize(size.id)}
                    className={`py-2 px-3 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer border ${
                      fontSize === size.id
                        ? 'gold-gradient-btn text-black border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                        : 'cinema-panel text-slate-300 hover:border-amber-400/50'
                    }`}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Feature 3: Reduced Motion */}
            <div className="p-4 rounded-2xl cinema-panel border border-white/10 bg-[#090e1c] flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-violet-400" />
                  <span className="font-bold text-sm text-white font-sans uppercase">Reduced Motion</span>
                </div>
                <p className="text-xs text-slate-400">
                  Disables auto-scrolling carousels, pulsing glows, and decorative micro-animations.
                </p>
              </div>

              <button
                onClick={() => setReducedMotion(!reducedMotion)}
                role="switch"
                aria-checked={reducedMotion}
                className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer flex-shrink-0 ${
                  reducedMotion ? 'bg-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.7)]' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-black transition-transform ${
                    reducedMotion ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Reset Settings */}
            <div className="pt-2 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500">Preferences save automatically to your device</span>
              <button
                onClick={handleReset}
                className="text-amber-400 hover:text-white flex items-center gap-1 underline cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Display Settings</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: KEYBOARD SHORTCUTS CHEAT SHEET */}
        {activeTab === 'HOTKEYS' && (
          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            <p className="text-xs text-slate-400 mb-3 font-mono">
              Control playback, navigation, and search seamlessly using your keyboard:
            </p>

            {KEYBOARD_SHORTCUTS.map((item, idx) => (
              <div 
                key={idx}
                className="p-3 rounded-xl cinema-panel border border-white/10 bg-[#090e1c] flex items-center justify-between gap-3 text-xs"
              >
                <span className="text-slate-200 font-sans">{item.desc}</span>
                <kbd className="px-2.5 py-1 rounded-lg bg-black/80 border border-amber-500/40 text-amber-300 font-mono font-bold text-xs shadow-inner">
                  {item.key}
                </kbd>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
