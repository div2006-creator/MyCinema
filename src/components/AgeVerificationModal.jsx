import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Calendar, 
  Lock, 
  Check, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

export default function AgeVerificationModal({ 
  isOpen = true, 
  movie, 
  onClose, 
  onConfirm,
  onConfirmVerification 
}) {
  const currentYear = new Date().getFullYear();
  const requiredAge = movie?.ageRating === '18+' ? 18 : 13;
  const maxValidYear = currentYear - requiredAge;

  const [selectedYear, setSelectedYear] = useState(maxValidYear - 2); // Default to an adult year (e.g. 2004/2000)
  const [certifiedCheckbox, setCertifiedCheckbox] = useState(true);
  const [rememberOnDevice, setRememberOnDevice] = useState(true);
  const [errorNotice, setErrorNotice] = useState('');

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

  useEffect(() => {
    if (isOpen && movie) {
      setErrorNotice('');
      setCertifiedCheckbox(true);
      setSelectedYear(maxValidYear - 2);
    }
  }, [isOpen, movie, maxValidYear]);

  if (!isOpen || !movie) return null;

  const calculatedAge = currentYear - selectedYear;
  const isAgeValid = calculatedAge >= requiredAge;

  const handleYearChange = (year) => {
    setSelectedYear(year);
    if (currentYear - year < requiredAge) {
      setErrorNotice(`Under Age: You must be at least ${requiredAge} years old to access this title.`);
    } else {
      setErrorNotice('');
    }
  };

  const handleConfirm = (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!isAgeValid) {
      setErrorNotice(`Access Denied: You must be at least ${requiredAge} years old to stream this transmission.`);
      return;
    }

    // Auto-check certification if clicked verify
    if (!certifiedCheckbox) {
      setCertifiedCheckbox(true);
    }

    const clearanceData = {
      verifiedAge: calculatedAge,
      birthYear: selectedYear,
      is18Plus: calculatedAge >= 18,
      is13Plus: calculatedAge >= 13,
      rememberOnDevice
    };

    if (typeof onConfirm === 'function') {
      onConfirm(clearanceData);
    } else if (typeof onConfirmVerification === 'function') {
      onConfirmVerification(clearanceData);
    }
  };

  // Generate birth years from current year down to currentYear - 85
  const yearOptions = Array.from({ length: 85 }, (_, i) => currentYear - i);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-fade-in">
      <div 
        className="relative w-full max-w-lg rounded-3xl glass-capsule border border-rose-500/40 p-6 sm:p-8 bg-[#090b14]/98 shadow-[0_25px_100px_rgba(244,63,94,0.3)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Glow */}
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 blur-3xl pointer-events-none ${
          movie.ageRating === '18+' ? 'bg-rose-600/30' : 'bg-amber-500/30'
        }`} />

        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-5 right-5 w-9 h-9 rounded-full glass-panel flex items-center justify-center text-slate-400 hover:text-white hover:border-rose-400 transition-all cursor-pointer shadow-md"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon & Advisory Notice */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-xl mb-3 ${
            movie.ageRating === '18+'
              ? 'bg-rose-950/70 border-rose-500/50 text-rose-400 shadow-[0_0_25px_rgba(244,63,94,0.4)]'
              : 'bg-amber-950/70 border-amber-500/50 text-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.4)]'
          }`}>
            <ShieldAlert className="w-7 h-7 animate-pulse" />
          </div>

          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-black uppercase tracking-widest border ${
              movie.ageRating === '18+'
                ? 'bg-rose-950/80 text-rose-300 border-rose-500/50'
                : 'bg-amber-950/80 text-amber-300 border-amber-500/50'
            }`}>
              🔞 {movie.ageRating} RATING ADVISORY
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black uppercase text-white tracking-wide mt-1">
            Age Verification Required
          </h2>

          <p className="text-xs text-slate-300 font-mono mt-1">
            // TRANSMISSION CONTENT RESTRICTION PROTOCOL
          </p>
        </div>

        {/* Movie Info Card Preview */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#0e1322] border border-slate-800 mb-5">
          {movie.image && (
            <img
              src={movie.image}
              alt={movie.title}
              className="w-12 h-16 object-cover rounded-xl shadow-md border border-slate-700 shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-black uppercase text-white truncate">
              {movie.title}
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              {movie.year} • {movie.genres?.join(', ')}
            </div>
            <div className="text-[11px] text-rose-300 font-light mt-0.5 line-clamp-1">
              ⚠️ {movie.advisoryReason || `Contains mature themes appropriate for viewers ${movie.ageRating}.`}
            </div>
          </div>
        </div>

        {/* Age Selector & Verification Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span>Select Your Birth Year:</span>
              </span>
              <span className="text-cyan-400 font-bold">
                Age: {calculatedAge} years
              </span>
            </label>

            <select
              value={selectedYear}
              onChange={(e) => handleYearChange(parseInt(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0a1122] border border-cyan-500/30 text-white text-sm focus:outline-none focus:border-cyan-400 font-mono cursor-pointer"
            >
              {yearOptions.map((yr) => (
                <option key={yr} value={yr} className="bg-[#090e1c] text-white">
                  {yr} (Age: {currentYear - yr})
                </option>
              ))}
            </select>
          </div>

          {/* Error Notice if Underage */}
          {errorNotice && (
            <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500/50 text-rose-200 text-xs font-mono flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorNotice}</span>
            </div>
          )}

          {/* Legal Certification Checkbox */}
          <label className="flex items-start gap-3 p-3 rounded-xl glass-panel border border-slate-800 cursor-pointer select-none hover:border-cyan-400/30 transition-all">
            <input
              type="checkbox"
              checked={certifiedCheckbox}
              onChange={(e) => {
                setCertifiedCheckbox(e.target.checked);
                if (e.target.checked && errorNotice.includes('check')) {
                  setErrorNotice('');
                }
              }}
              className="mt-0.5 w-4 h-4 rounded text-cyan-400 accent-cyan-400 bg-slate-900 border-slate-700 cursor-pointer"
            />
            <span className="text-xs text-slate-300 font-light leading-relaxed">
              I certify under Aether Cinema policy that I am <strong className="text-white font-bold">{requiredAge} years of age or older</strong> and agree to stream mature restricted material.
            </span>
          </label>

          {/* Remember on this device checkbox */}
          <label className="flex items-center gap-2.5 px-1 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberOnDevice}
              onChange={(e) => setRememberOnDevice(e.target.checked)}
              className="w-3.5 h-3.5 rounded text-cyan-400 accent-cyan-400 bg-slate-900 border-slate-700 cursor-pointer"
            />
            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
              <span>Remember age clearance on this device (Save to Database)</span>
            </span>
          </label>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!isAgeValid}
              className={`w-full py-3 rounded-xl font-mono font-bold text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 ${
                isAgeValid
                  ? 'bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 text-black shadow-[0_0_20px_rgba(52,211,153,0.5)] hover:scale-[1.02] active:scale-[0.99]'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Verify & Unlock Movie</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-3 rounded-xl glass-panel text-slate-400 hover:text-white text-xs font-mono uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
