import React, { useState, useEffect } from 'react';
import { 
  X, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  AlertCircle, 
  CheckCircle,
  Film
} from 'lucide-react';
import { loginUser, registerUser } from '../services/authService';

export default function AuthModal({ 
  isOpen = true, 
  onClose, 
  onAuthSuccess, 
  onSuccess,
  pendingMovie = null 
}) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setError('');
      setSuccess('');
      setUsername('');
      setPassword('');
      setConfirmPassword('');
    }
  }, [isOpen, isRegisterMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      if (isRegisterMode) {
        if (password !== confirmPassword) {
          setError('Passwords do not match. Please re-enter.');
          setIsLoading(false);
          return;
        }
        const res = await registerUser(username, password);
        if (!res.success) {
          setError(res.error);
          setIsLoading(false);
          return;
        }
        const callback = onSuccess || onAuthSuccess;
        setSuccess(`Welcome to Aether Cinema, @${res.user.username}! Identity saved to database.`);
        setTimeout(() => {
          if (callback) callback(res.user);
        }, 600);
      } else {
        const res = await loginUser(username, password);
        if (!res.success) {
          setError(res.error);
          setIsLoading(false);
          return;
        }
        const callback = onSuccess || onAuthSuccess;
        setSuccess(`Welcome back, @${res.user.username}! Permanent device session verified.`);
        setTimeout(() => {
          if (callback) callback(res.user);
        }, 600);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = () => {
    setUsername('aether_pilot');
    setPassword('password123');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in">
      <div 
        className="relative w-full max-w-md rounded-3xl glass-capsule border border-cyan-400/40 p-6 sm:p-8 bg-[#070b16]/98 shadow-[0_20px_80px_rgba(0,0,0,0.95)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-gradient-to-b from-cyan-500/20 to-transparent blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-5 right-5 w-9 h-9 rounded-full glass-panel flex items-center justify-center text-slate-400 hover:text-white hover:border-cyan-400 transition-all cursor-pointer shadow-md"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Badge & Title */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-violet-600/30 border border-cyan-400/40 flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.3)] mb-3">
            <Lock className="w-5 h-5 text-cyan-300" />
          </div>

          <h2 className="text-2xl font-black uppercase text-white tracking-wide">
            {isRegisterMode ? 'Create Identity' : 'Authorize Access'}
          </h2>

          <p className="text-xs text-slate-400 font-mono mt-1">
            {isRegisterMode 
              ? '// REGISTER A NEW STREAMING CIPHER KEY' 
              : '// ENTER CREDENTIALS TO UNLOCK STREAMING'}
          </p>

          {/* Pending Movie Notice */}
          {pendingMovie && (
            <div className="mt-3 px-3 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-400/30 text-cyan-300 text-xs font-mono flex items-center gap-2 max-w-full truncate">
              <Film className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
              <span className="truncate">
                Required to play: <strong className="text-white uppercase">{pendingMovie.title}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Mode Toggle Switch */}
        <div className="flex rounded-xl glass-panel p-1 mb-6 border border-slate-800">
          <button
            type="button"
            onClick={() => setIsRegisterMode(false)}
            className={`flex-1 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
              !isRegisterMode
                ? 'bg-gradient-to-r from-cyan-400 to-violet-600 text-black shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setIsRegisterMode(true)}
            className={`flex-1 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
              isRegisterMode
                ? 'bg-gradient-to-r from-cyan-400 to-violet-600 text-black shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-400/40 text-emerald-300 text-xs font-mono flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-[11px] font-mono text-slate-300 uppercase tracking-wider mb-1.5">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. neo_runner"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#090f20]/90 border border-cyan-500/30 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all font-mono"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[11px] font-mono text-slate-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#090f20]/90 border border-cyan-500/30 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-cyan-300 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password (Register mode only) */}
          {isRegisterMode && (
            <div>
              <label className="block text-[11px] font-mono text-slate-300 uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#090f20]/90 border border-cyan-500/30 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all font-mono"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-600 text-black font-mono font-bold text-xs uppercase tracking-widest hover:shadow-[0_0_20px_rgba(0,240,255,0.6)] hover:scale-[1.02] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="animate-spin text-sm">↻</span>
            ) : (
              <Zap className="w-4 h-4 fill-current" />
            )}
            <span>
              {isRegisterMode ? 'Initialize Account' : 'Authenticate & Stream'}
            </span>
          </button>
        </form>

        {/* Demo Fast-Fill Helper */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col items-center">
          <button
            type="button"
            onClick={handleQuickDemoLogin}
            className="text-[11px] font-mono text-slate-400 hover:text-cyan-300 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Use Demo Account (aether_pilot)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
