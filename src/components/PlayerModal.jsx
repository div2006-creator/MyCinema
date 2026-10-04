import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Bookmark, 
  Check, 
  Star, 
  Share2, 
  Server, 
  Sparkles, 
  Film, 
  Zap, 
  Globe, 
  RefreshCw,
  ShieldCheck, 
  ShieldAlert, 
  Play, 
  Tv, 
  Layers, 
  AlertCircle,
  Lock,
  UserCheck,
  Languages,
  Volume2,
  VolumeX,
  Sliders,
  Headphones,
  ChevronDown,
  ChevronUp,
  Info,
  Maximize,
  Minimize,
  Command
} from 'lucide-react';
import { STREAM_SERVERS, getStreamUrl } from '../services/streamProviders';
import { idbSaveWatchHistory } from '../services/db';

export default function PlayerModal({ 
  movie, 
  onClose, 
  onToggleWatchlist, 
  isSaved = false,
  currentUser = null,
  onOpenAuth
}) {
  const isAnime = movie?.type === 'Anime' || movie?.isAnime || movie?.division === 'anime';
  const hasHindiDub = movie?.hasHindiDub || (Array.isArray(movie?.languages) && movie.languages.some(l => typeof l === 'string' && l.toLowerCase().includes('hindi')));
  
  // Audio Mode: 'hindi' (Hindi Dub / Dual Audio) | 'dub' (English Dubbed / Dual Audio) | 'sub' (Original Japanese with Subtitles) | 'multi' (Multi-Audio / Multi-Lang) | 'original'
  const [audioMode, setAudioMode] = useState(isAnime ? 'dub' : (hasHindiDub ? 'hindi' : 'multi'));

  // Modes: 'FULL_STREAM' (Primary: Full Movie / Episode stream via third-party nodes), 'TRAILER' (Official 4K trailer for this title), 'ARCHIVE' (Open archive MP4)
  const [playbackMode, setPlaybackMode] = useState('FULL_STREAM');
  // Default to Server 1 (VidLink Pro) which provides the 4K Ultra Multi-Audio and Hindi Dubbed audio tracks
  const [selectedServer, setSelectedServer] = useState(STREAM_SERVERS[0].id);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [copied, setCopied] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showAudioBooster, setShowAudioBooster] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [sandboxEnabled, setSandboxEnabled] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const playerContainerRef = useRef(null);

  // Standalone movies (including Anime films like Your Name, Spirited Away) must NEVER be treated as TV series
  const isTv = movie?.type === 'Movie'
    ? false
    : (movie?.type === 'Series' || 
       (movie?.type === 'Anime' && (movie?.episodes > 1 || !movie?.episodes)) || 
       (!movie?.type && ((movie?.episodes && movie.episodes > 1) || (movie?.seasons && movie.seasons > 1))));
  const totalEpisodes = movie?.episodes || (isTv ? 12 : 1);
  const totalSeasons = movie?.seasons || 1;

  // Save to Continue Watching history in IndexedDB & LocalStorage
  useEffect(() => {
    if (!movie) return;
    try {
      idbSaveWatchHistory({
        id: movie.id || movie.tmdbId || movie.imdbId || movie.title,
        title: movie.title,
        poster: movie.poster || movie.posterUrl,
        backdrop: movie.backdrop || movie.backdropUrl,
        year: movie.year,
        rating: movie.rating || movie.imdbRating,
        type: movie.type || (isTv ? 'Series' : 'Movie'),
        hasHindiDub: movie.hasHindiDub || hasHindiDub,
        tmdbId: movie.tmdbId,
        imdbId: movie.imdbId,
        malId: movie.malId,
        season: isTv ? selectedSeason : undefined,
        episode: isTv ? selectedEpisode : undefined,
        lastWatchedServer: selectedServer,
        progress: 35, // playback start marker
        timestamp: Date.now()
      }).catch(err => console.warn('[History] IDB save non-critical warning:', err));
    } catch (e) {
      console.warn('[History] Non-critical history error:', e);
    }
  }, [movie, selectedSeason, selectedEpisode, selectedServer, isTv]);

  // Fullscreen toggler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (playerContainerRef.current?.requestFullscreen) {
        playerContainerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Track fullscreen changes
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Keyboard Shortcuts: [1-4] Servers, [H] Hindi Dub, [R] Reload, [F] Fullscreen, [Esc] Close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === '1' && STREAM_SERVERS[0]) {
        setSelectedServer(STREAM_SERVERS[0].id);
      } else if (e.key === '2' && STREAM_SERVERS[1]) {
        setSelectedServer(STREAM_SERVERS[1].id);
      } else if (e.key === '3' && STREAM_SERVERS[2]) {
        setSelectedServer(STREAM_SERVERS[2].id);
      } else if (e.key === '4' && STREAM_SERVERS[3]) {
        setSelectedServer(STREAM_SERVERS[3].id);
      } else if (e.key === 'h' || e.key === 'H') {
        setAudioMode(prev => prev === 'hindi' ? 'multi' : 'hindi');
        const hindiServer = STREAM_SERVERS.find(s => s.id === 'vidsrc_pm') || STREAM_SERVERS[1];
        if (hindiServer) setSelectedServer(hindiServer.id);
      } else if (e.key === 'r' || e.key === 'R') {
        setIsLoaded(false);
        setReloadKey(k => k + 1);
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, toggleFullscreen]);

  // Exact movie identifier: prioritize TMDB ID for VidLink / VidSrc, fallback to IMDB
  const streamIdentifier = movie?.tmdbId || movie?.imdbId || '693134';

  // Individual trailer key specific to this movie. If missing, use YouTube search embed for that exact title!
  const movieTrailerUrl = movie?.trailerKey 
    ? `https://www.youtube-nocookie.com/embed/${movie.trailerKey}?autoplay=1&mute=0&controls=1&rel=0&modestbranding=1`
    : `https://www.youtube-nocookie.com/embed?listType=search&list=${encodeURIComponent((movie?.title || '') + ' official trailer')}&autoplay=1&mute=0`;

  // Third-party full movie stream resolver URL
  const fullStreamUrl = getStreamUrl(
    selectedServer, 
    streamIdentifier, 
    isTv, 
    selectedSeason, 
    selectedEpisode,
    {
      audioMode,
      malId: movie?.malId,
      isAnime,
      tmdbId: movie?.tmdbId,
      imdbId: movie?.imdbId
    }
  );

  const currentServerObj = STREAM_SERVERS.find(s => s.id === selectedServer) || STREAM_SERVERS[0];

  // Window navigation shield: traps any external attempt to redirect top window away from our website
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'Playback in progress on MyCinema';
      return 'Playback in progress on MyCinema';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Prevent external popup window.open triggers
    const originalOpen = window.open;
    window.open = function (...args) {
      console.warn('[Security Shield] Blocked external popup attempt:', args);
      return null;
    };

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.open = originalOpen;
    };
  }, []);


  useEffect(() => {
    setIsLoaded(false);
  }, [playbackMode, selectedServer, selectedSeason, selectedEpisode, sandboxEnabled, audioMode, reloadKey]);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/95 backdrop-blur-2xl overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-3xl cinema-panel border border-amber-500/30 overflow-hidden shadow-[0_25px_100px_rgba(0,0,0,0.98)] bg-[#070b14]/98 my-auto">
        
        {/* Top Control Bar - Sticky Header */}
        <div className="sticky top-0 z-40 p-3 sm:p-4 bg-[#0a0e1a]/95 backdrop-blur-md border-b border-amber-500/20 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold tracking-widest text-amber-400 uppercase flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Full Media Playback Engine:</span>
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950/70 text-amber-300 border border-amber-500/30 uppercase">
              {playbackMode === 'FULL_STREAM' ? currentServerObj.badge : playbackMode}
            </span>

            {/* Sandbox Toggle Pill */}
            {playbackMode === 'FULL_STREAM' && currentUser && (
              <button
                onClick={() => setSandboxEnabled(!sandboxEnabled)}
                title="Sandbox is disabled so streaming nodes can play without 'Disable sandbox' prompts. Click to toggle."
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider transition-all cursor-pointer flex items-center gap-1 border ${
                  sandboxEnabled
                    ? 'bg-amber-950/60 text-amber-300 border-amber-400/50'
                    : 'bg-emerald-950/60 text-emerald-300 border-emerald-400/40'
                }`}
              >
                {sandboxEnabled ? (
                  <>
                    <ShieldAlert className="w-3 h-3 text-amber-400" />
                    <span>Sandbox: Strict ON</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>Sandbox: Disabled (Native Stream)</span>
                  </>
                )}
              </button>
            )}

            {currentUser && (
              <span className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                <UserCheck className="w-3 h-3" />
                <span>@{currentUser.username} (Authorized)</span>
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Primary Mode: Full Movie / Episode Stream */}
            <button
              onClick={() => setPlaybackMode('FULL_STREAM')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                playbackMode === 'FULL_STREAM'
                  ? 'gold-gradient-btn text-black font-black shadow-[0_0_18px_rgba(245,158,11,0.5)] scale-105'
                  : 'cinema-panel text-amber-300 hover:border-amber-400/50'
              }`}
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>⚡ Full {isTv ? 'Episode' : 'Movie'} Stream</span>
            </button>

            {/* Mode 2: Official Trailer for THIS specific title */}
            <button
              onClick={() => setPlaybackMode('TRAILER')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                playbackMode === 'TRAILER'
                  ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold shadow-[0_0_15px_rgba(217,119,6,0.5)]'
                  : 'cinema-panel text-slate-300 hover:text-amber-300'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Official 4K Trailer</span>
            </button>

            {/* Mode 3: Open Archive MP4 */}
            <button
              onClick={() => setPlaybackMode('ARCHIVE')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                playbackMode === 'ARCHIVE'
                  ? 'bg-amber-400 text-black font-bold shadow-[0_0_15px_rgba(251,191,36,0.5)]'
                  : 'cinema-panel text-amber-300 hover:border-amber-400/40'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Archive MP4</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              aria-label="Close player"
              className="w-9 h-9 rounded-full cinema-panel flex items-center justify-center text-slate-300 hover:text-white hover:border-amber-400 transition-all cursor-pointer shadow-lg ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Server Switcher Bar - Instant 1-Click Server Switching (When authenticated) */}
        {playbackMode === 'FULL_STREAM' && currentUser && (
          <div className="px-3 sm:px-6 py-2.5 bg-[#080d19] border-b border-amber-500/20 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
              <Server className="w-4 h-4 text-amber-400 animate-pulse" />
              <span className="font-bold uppercase tracking-wider text-slate-200">
                Streaming Mirror Node:
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {STREAM_SERVERS.map((server) => {
                const isActive = selectedServer === server.id;
                return (
                  <button
                    key={server.id}
                    onClick={() => setSelectedServer(server.id)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-mono tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? 'gold-gradient-btn text-black font-bold shadow-[0_0_12px_rgba(245,158,11,0.5)] scale-105'
                        : 'cinema-panel text-slate-300 hover:text-amber-300 hover:border-amber-400/40'
                    }`}
                  >
                    <span>{server.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Audio Track & Multi-Language Selector Bar (When authenticated) */}
        {playbackMode === 'FULL_STREAM' && currentUser && (
          <div className="px-3 sm:px-6 py-2 bg-[#0a0f1e] border-b border-amber-500/20 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 text-xs font-mono">
              <Languages className="w-4 h-4 text-amber-400" />
              <span className="font-bold uppercase tracking-wider text-slate-200">
                Audio Track & Language:
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-950/80 border border-amber-500/40 text-amber-300 font-bold">
                {isAnime 
                  ? 'DUAL AUDIO (ENG DUB / JAP SUB)' 
                  : (hasHindiDub ? '🇮🇳 HINDI DUB & MULTI-AUDIO' : 'MULTI-AUDIO / DUAL AUDIO')}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {isAnime ? (
                <>
                  <button
                    onClick={() => setAudioMode('dub')}
                    className={`px-3 py-1 rounded-xl text-[11px] font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
                      audioMode === 'dub'
                        ? 'gold-gradient-btn text-black font-bold shadow-[0_0_12px_rgba(245,158,11,0.5)] scale-105'
                        : 'cinema-panel text-slate-300 hover:text-white hover:border-amber-400/40'
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>🎧 English Dubbed (Dual Audio)</span>
                  </button>
                  <button
                    onClick={() => setAudioMode('sub')}
                    className={`px-3 py-1 rounded-xl text-[11px] font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
                      audioMode === 'sub'
                        ? 'bg-gradient-to-r from-slate-200 to-white text-black font-bold shadow-[0_0_12px_rgba(255,255,255,0.4)] scale-105'
                        : 'cinema-panel text-slate-300 hover:text-white hover:border-slate-500'
                    }`}
                  >
                    <span>🇯🇵 Japanese (Original + Sub)</span>
                  </button>
                </>
              ) : (
                <>
                  {/* Dedicated Hindi Dub Button */}
                  <button
                    onClick={() => {
                      setAudioMode('hindi');
                      setSelectedServer('vidlink');
                    }}
                    className={`px-3.5 py-1 rounded-xl text-[11px] font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
                      audioMode === 'hindi'
                        ? 'gold-gradient-btn text-black font-black shadow-[0_0_16px_rgba(245,158,11,0.6)] scale-105'
                        : 'cinema-panel text-amber-300 hover:text-white hover:border-amber-400/50'
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>🇮🇳 Hindi Dub (Dual Audio)</span>
                  </button>

                  <button
                    onClick={() => {
                      setAudioMode('multi');
                      setSelectedServer('vidlink');
                    }}
                    className={`px-3 py-1 rounded-xl text-[11px] font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
                      audioMode === 'multi'
                        ? 'bg-amber-500 text-black font-bold shadow-[0_0_12px_rgba(245,158,11,0.5)] scale-105'
                        : 'cinema-panel text-slate-300 hover:text-white hover:border-amber-400/40'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>🌐 Multi-Audio & Dubs</span>
                  </button>

                  <button
                    onClick={() => setAudioMode('original')}
                    className={`px-3 py-1 rounded-xl text-[11px] font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
                      audioMode === 'original'
                        ? 'bg-gradient-to-r from-slate-200 to-white text-black font-bold shadow-[0_0_12px_rgba(255,255,255,0.4)] scale-105'
                        : 'cinema-panel text-slate-300 hover:text-white hover:border-slate-500'
                    }`}
                  >
                    <span>🎬 Original English</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Live Hindi Dub Audio Guide Banner */}
        {playbackMode === 'FULL_STREAM' && currentUser && (audioMode === 'hindi' || hasHindiDub) && (
          <div className="px-3 sm:px-6 py-2.5 bg-gradient-to-r from-amber-950/90 via-[#181308] to-amber-950/90 border-b border-amber-500/40 flex flex-wrap items-center justify-between gap-2.5 text-[11px] font-mono text-amber-200">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping shrink-0" />
              <span className="font-bold text-white text-xs">
                🇮🇳 HINDI DUB & MULTI-AUDIO ACTIVE (Server 1 - VidLink Pro)
              </span>
            </div>
            <div className="flex items-center gap-2 bg-black/60 px-3 py-1 rounded-lg border border-amber-500/30 text-amber-300">
              <span className="text-white font-bold">👉 TO PLAY IN HINDI:</span>
              <span>Inside video player at bottom-right, click 🎧 Audio / Subtitles (⚙️) ➔ select &quot;Hindi&quot; track!</span>
            </div>
          </div>
        )}

        {/* Video Player Display Container (16:9 ratio) */}
        <div ref={playerContainerRef} className="relative aspect-video w-full bg-black overflow-hidden group">
          
          {/* PRIMARY MODE: EXACT FULL MOVIE / EPISODE VIA ACTIVE SERVER */}
          {playbackMode === 'FULL_STREAM' && (
            currentUser ? (
              <div className="relative w-full h-full bg-black">
                <iframe
                  key={`${selectedServer}-${streamIdentifier}-${selectedSeason}-${selectedEpisode}-${audioMode}-${sandboxEnabled}-${reloadKey}`}
                  src={fullStreamUrl}
                  title={`${movie.title} Full Playback Stream`}
                  referrerPolicy="origin"
                  {...(sandboxEnabled ? { sandbox: "allow-forms allow-scripts allow-same-origin allow-presentation" } : {})}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                  allowFullScreen
                  className="w-full h-full border-0"
                  onLoad={() => setIsLoaded(true)}
                />

                {!isLoaded && (
                  <div className="absolute inset-0 bg-[#060912] flex flex-col items-center justify-center text-amber-400 font-mono text-xs z-10 pointer-events-none p-4 text-center">
                    <RefreshCw className="w-9 h-9 animate-spin mb-3 text-amber-400" />
                    <span className="tracking-widest uppercase text-white font-bold mb-1 text-sm sm:text-base">
                      INITIALIZING FULL STREAM FOR {movie.title}...
                    </span>
                    <span className="text-slate-400 text-xs">
                      Connecting to {currentServerObj.name} • Anti-Redirect Shield Active
                    </span>
                  </div>
                )}

                {/* Status & Unmuted Audio Overlay */}
                <div className="absolute top-3 left-3 z-30 pointer-events-none flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-300 bg-black/85 px-3 py-1.5 rounded-full border border-emerald-500/30 backdrop-blur-md">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-bold">EXACT FULL PLAYBACK // {currentServerObj.quality}</span>
                  </div>

                  <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-amber-300 bg-black/85 px-2.5 py-1.5 rounded-full border border-amber-500/30 backdrop-blur-md">
                    <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                    <span className="font-bold">SOUND: UNMUTED</span>
                  </div>

                  {hasHindiDub && (
                    <div className="hidden md:flex items-center gap-1.5 text-[10px] font-mono text-amber-200 bg-amber-950/90 px-3 py-1.5 rounded-full border border-amber-500/50 backdrop-blur-md shadow-lg">
                      <Languages className="w-3.5 h-3.5 text-amber-400" />
                      <span>Switch to Hindi: Click 🎧 Audio icon at bottom-right of player</span>
                    </div>
                  )}
                </div>

                <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setIsLoaded(false);
                      setReloadKey(k => k + 1);
                    }}
                    title="Reload stream video player (Hot key: R)"
                    className="px-2.5 py-1 rounded-full bg-black/85 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-white/20 hover:border-amber-400/50 backdrop-blur-md text-[10px] font-mono flex items-center gap-1 transition-all cursor-pointer shadow-md"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Reload (R)</span>
                  </button>

                  <button
                    onClick={toggleFullscreen}
                    title="Toggle Fullscreen (Hot key: F)"
                    className="px-2.5 py-1 rounded-full bg-black/85 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-white/20 hover:border-amber-400/50 backdrop-blur-md text-[10px] font-mono flex items-center gap-1 transition-all cursor-pointer shadow-md"
                  >
                    {isFullscreen ? <Minimize className="w-3 h-3" /> : <Maximize className="w-3 h-3" />}
                    <span>{isFullscreen ? 'Exit (F)' : 'Full (F)'}</span>
                  </button>
                </div>

                {/* Micro Hotkey Legend in Player Bar */}
                <div className="absolute bottom-2 left-3 z-30 hidden sm:flex items-center gap-2 text-[9px] font-mono text-slate-400 bg-black/70 px-2.5 py-1 rounded border border-white/10 backdrop-blur-sm pointer-events-none">
                  <span className="text-amber-400 font-bold">HOTKEYS:</span>
                  <span>[1-4] Servers</span>
                  <span>•</span>
                  <span>[H] Hindi Dub</span>
                  <span>•</span>
                  <span>[R] Reload</span>
                  <span>•</span>
                  <span>[F] Fullscreen</span>
                  <span>•</span>
                  <span>[Esc] Close</span>
                </div>
              </div>
            ) : (
              /* LUXURY AUTHENTICATION REQUIRED LOCK SCREEN */
              <div className="relative w-full h-full bg-[#060912] flex flex-col items-center justify-center p-6 text-center overflow-hidden">
                {movie.posterUrl && (
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-20 filter blur-lg pointer-events-none"
                  />
                )}
                <div className="absolute inset-0 bg-black/85 backdrop-blur-sm -z-0" />

                <div className="relative z-10 max-w-lg flex flex-col items-center">
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-400/20 to-amber-600/30 border border-amber-400/50 flex items-center justify-center shadow-[0_0_35px_rgba(245,158,11,0.45)] mb-4">
                    <Lock className="w-8 h-8 text-amber-300 animate-pulse" />
                  </div>

                  <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-widest mb-1.5">
                    // ACCESS PROTOCOL: AUTHENTICATION REQUIRED
                  </span>

                  <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wider mb-2">
                    Transmission Locked
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light mb-6 max-w-md">
                    To stream <strong className="text-white font-bold">{movie.title}</strong> in full high definition, you must be logged into your Aether Cinema account.
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      onClick={() => onOpenAuth && onOpenAuth(movie)}
                      className="px-7 py-3 rounded-full gold-gradient-btn text-black font-mono font-black text-xs uppercase tracking-widest shadow-[0_0_25px_rgba(245,158,11,0.6)] hover:scale-105 transition-all cursor-pointer flex items-center gap-2"
                    >
                      <Zap className="w-4 h-4 fill-current" />
                      <span>Sign In / Register To Play</span>
                    </button>

                    <button
                      onClick={() => setPlaybackMode('TRAILER')}
                      className="px-5 py-3 rounded-full cinema-panel text-slate-300 hover:text-white text-xs font-mono uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2"
                    >
                      <Film className="w-3.5 h-3.5" />
                      <span>Watch Trailer First</span>
                    </button>
                  </div>
                </div>
              </div>
            )
          )}

          {/* MODE 2: OFFICIAL 4K TRAILER FOR THIS SPECIFIC TITLE */}
          {playbackMode === 'TRAILER' && (
            <div className="relative w-full h-full bg-black">
              <iframe
                key={movieTrailerUrl}
                src={movieTrailerUrl}
                title={`${movie.title} Official Trailer`}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                allowFullScreen
                onLoad={() => setIsLoaded(true)}
              />

              {!isLoaded && (
                <div className="absolute inset-0 bg-[#05070e] flex flex-col items-center justify-center text-violet-400 font-mono text-xs z-10 pointer-events-none">
                  <RefreshCw className="w-8 h-8 animate-spin mb-3 text-violet-400" />
                  <span className="tracking-widest uppercase text-white font-bold">
                    LOADING OFFICIAL TRAILER FOR {movie.title}...
                  </span>
                </div>
              )}

              <div className="absolute top-3 left-3 z-30 pointer-events-none flex items-center gap-2 text-[10px] font-mono text-violet-300 bg-black/80 px-3 py-1 rounded-full border border-violet-400/30 backdrop-blur-md">
                <Film className="w-3.5 h-3.5 text-violet-400" />
                <span>OFFICIAL 4K TRAILER PREVIEW</span>
              </div>
            </div>
          )}

          {/* MODE 3: DIRECT OPEN ARCHIVE MP4 */}
          {playbackMode === 'ARCHIVE' && (
            <div className="relative w-full h-full bg-black flex items-center justify-center">
              <video
                src="https://archive.org/download/ElephantsDream/ed_1024_512kb.mp4"
                poster={movie.backdropUrl || movie.image || movie.posterUrl}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              />
            </div>
          )}
        </div>

        {/* VOLUME & DIALOGUE CLARITY BOOSTER TOOLKIT */}
        {playbackMode === 'FULL_STREAM' && currentUser && (
          <div className="bg-[#090d18] border-b border-amber-500/20">
            <div className="px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-amber-400 animate-pulse flex-shrink-0" />
                <span className="text-xs font-mono font-bold text-slate-200">
                  Movie Voice Too Low?
                </span>
                <span className="hidden sm:inline px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950/80 text-amber-300 border border-amber-500/30 font-bold">
                  AUDIO & DIALOGUE BOOSTER
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Instant 1-Click High-Gain Server Switches */}
                <button
                  onClick={() => setSelectedServer('vidlink')}
                  className={`px-3 py-1 rounded-xl text-[11px] font-mono transition-all cursor-pointer border flex items-center gap-1.5 ${
                    selectedServer === 'vidlink'
                      ? 'gold-gradient-btn text-black font-bold shadow-[0_0_12px_rgba(245,158,11,0.5)] scale-105'
                      : 'cinema-panel text-amber-300 hover:border-amber-400/50 hover:text-white'
                  }`}
                  title="VidLink Pro normalizes audio to 2.0 Stereo for the loudest and clearest dialogue"
                >
                  <span>🔊 Server 1 (Loudest Vocals)</span>
                </button>

                <button
                  onClick={() => setSelectedServer('anyembed')}
                  className={`px-3 py-1 rounded-xl text-[11px] font-mono transition-all cursor-pointer border flex items-center gap-1.5 ${
                    selectedServer === 'anyembed'
                      ? 'gold-gradient-btn text-black font-bold shadow-[0_0_12px_rgba(245,158,11,0.5)] scale-105'
                      : 'cinema-panel text-slate-300 hover:border-amber-400/50 hover:text-white'
                  }`}
                  title="AnyEmbed VIP has high-speed direct stream and balanced vocal gain"
                >
                  <span>🔊 Server 3 (High Gain)</span>
                </button>

                <button
                  onClick={() => setShowAudioBooster(!showAudioBooster)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                    showAudioBooster
                      ? 'bg-amber-400 text-black border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                      : 'cinema-panel text-amber-300 hover:border-amber-400/50 hover:text-white'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>{showAudioBooster ? 'Hide Audio Tips' : 'Fix Low Voice (3 Steps)'}</span>
                  {showAudioBooster ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* EXPANDABLE 3-STEP DIALOGUE CLARITY GUIDE */}
            {showAudioBooster && (
              <div className="px-4 sm:px-6 py-4 bg-[#060a14] border-t border-amber-500/20 grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs font-sans">
                
                {/* Step 1 */}
                <div className="p-3.5 rounded-2xl cinema-panel border border-amber-500/30 bg-[#090e1d]/80 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 text-amber-400 font-mono font-bold text-xs uppercase">
                      <span className="w-5 h-5 rounded-full bg-amber-400 text-black flex items-center justify-center text-[10px] font-black">1</span>
                      <span>Turn Player Slider to 100%</span>
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      Most third-party video players start with their internal volume bar set at <strong className="text-amber-300">50% by default</strong>. Hover over the speaker icon in the bottom-right corner of the video screen and drag the volume slider all the way up to <strong className="text-white">100%</strong> to immediately double the voice volume.
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-white/10 text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                    <span>⚡ Immediate 2x Volume Increase</span>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="p-3.5 rounded-2xl cinema-panel border border-amber-500/30 bg-[#090e1d]/80 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 text-amber-400 font-mono font-bold text-xs uppercase">
                      <span className="w-5 h-5 rounded-full bg-amber-400 text-black flex items-center justify-center text-[10px] font-black">2</span>
                      <span>Change 5.1 To Stereo 2.0</span>
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      Hollywood releases (Avengers, Marvel, Dune) use <strong className="text-amber-300">5.1 Surround Sound</strong> where actors' voices are isolated to a center channel. On laptop speakers or headphones, click the <strong className="text-white">⚙️ Settings icon</strong> inside the video player and choose <strong className="text-amber-300">Stereo 2.0</strong> to bring speech front and center.
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-white/10 text-[10px] font-mono text-amber-300 flex items-center gap-1">
                    <span>🎧 Crystal-Clear Center Vocals</span>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="p-3.5 rounded-2xl cinema-panel border border-amber-500/30 bg-[#090e1d]/80 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 text-amber-400 font-mono font-bold text-xs uppercase">
                      <span className="w-5 h-5 rounded-full bg-amber-400 text-black flex items-center justify-center text-[10px] font-black">3</span>
                      <span>Windows / Mac Loudness Boost</span>
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      On Windows: Right-click the speaker icon on your desktop taskbar → select <strong className="text-white">Sound settings</strong> → click your active speaker → scroll to Enhancements → enable <strong className="text-amber-300">"Loudness Equalization"</strong>. This boosts quiet whisper voices by up to +300% across your entire computer!
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-white/10 text-[10px] font-mono text-cyan-300 flex items-center gap-1">
                    <span>🚀 Up to +300% System Vocal Boost</span>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* TV / Anime Episode & Season Selector Matrix */}
        {isTv && currentUser && (
          <div className="px-4 sm:px-6 py-3 bg-[#080d19] border-b border-amber-500/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2.5">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-200">
                <Tv className="w-4 h-4 text-violet-400" />
                <span className="font-bold uppercase tracking-wider">
                  Select Anime / Series Episode:
                </span>
                <span className="text-amber-400 font-bold">
                  (Playing Season {selectedSeason} • Episode {selectedEpisode})
                </span>
              </div>

              {totalSeasons > 1 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-mono text-slate-400 uppercase">Season:</span>
                  {Array.from({ length: totalSeasons }, (_, i) => i + 1).map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setSelectedSeason(s);
                        setSelectedEpisode(1);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                        selectedSeason === s
                          ? 'gold-gradient-btn text-black font-bold shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                          : 'cinema-panel text-slate-300 hover:text-white'
                      }`}
                    >
                      S{s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Episode Grid Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-amber-500/30">
              {Array.from({ length: totalEpisodes }, (_, i) => i + 1).map((ep) => {
                const isActive = selectedEpisode === ep;
                return (
                  <button
                    key={ep}
                    onClick={() => {
                      setSelectedEpisode(ep);
                      if (playbackMode !== 'FULL_STREAM') setPlaybackMode('FULL_STREAM');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? 'gold-gradient-btn text-black font-bold shadow-[0_0_12px_rgba(245,158,11,0.5)] scale-105'
                        : 'cinema-panel text-slate-300 hover:text-amber-300 hover:border-amber-400/40'
                    }`}
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>EP {ep}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Media Details & Action Controls Section */}
        <div className="p-4 sm:p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-500/30 uppercase">
                  {movie.type || (isTv ? 'ANIME SERIES' : 'FULL MOVIE')}
                </span>
                <div className="flex items-center gap-1 text-xs text-amber-300 font-bold bg-black/40 px-2.5 py-0.5 rounded-md border border-amber-400/20">
                  <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                  <span>{movie.rating}</span>
                </div>

                {/* Age Rating Badge */}
                {movie.ageRating && (
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase border ${
                    movie.ageRating === '18+'
                      ? 'bg-rose-950/80 text-rose-300 border-rose-500/50 shadow-[0_0_8px_rgba(244,63,94,0.4)]'
                      : movie.ageRating === 'ALL AGES'
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-400/40'
                        : 'bg-cyan-950/80 text-cyan-300 border-cyan-400/40'
                  }`}>
                    {movie.ageRating === '18+' ? '🔞 18+' : movie.ageRating}
                  </span>
                )}

                <span className="text-xs text-slate-400 font-mono">
                  {movie.year}
                </span>
                {movie.duration && (
                  <span className="text-xs text-slate-400 font-mono">
                    • {movie.duration}
                  </span>
                )}
                {movie.source && (
                  <span className="text-[10px] text-violet-300 font-mono bg-violet-950/60 px-2 py-0.5 rounded border border-violet-500/30">
                    Source: {movie.source}
                  </span>
                )}
              </div>

              <h2 className="text-2xl sm:text-4xl font-black uppercase text-white tracking-wide">
                {movie.title}
              </h2>
              {movie.tagline && (
                <p className="text-xs sm:text-sm font-mono text-amber-400 mt-1 uppercase tracking-wider">
                  // {movie.tagline}
                </p>
              )}

              {/* Multi-Language Availability Chips */}
              <div className="flex flex-wrap items-center gap-1.5 mt-3">
                <span className="text-xs font-mono text-slate-400 flex items-center gap-1 mr-1">
                  <Globe className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-bold text-slate-300">Languages Available:</span>
                </span>
                {(movie.languages || ['Hindi Dub (Dual Audio)', 'English (Original)', 'Japanese', 'Spanish', 'French', 'German']).map((lang, idx) => {
                  const isHindi = typeof lang === 'string' && lang.toLowerCase().includes('hindi');
                  return (
                    <span 
                      key={idx}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium border ${
                        isHindi 
                          ? 'bg-amber-950/80 border-amber-500/50 text-amber-300 font-bold shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                          : 'bg-slate-900 border-slate-700 text-slate-300'
                      }`}
                    >
                      {lang}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => onToggleWatchlist(movie)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                  isSaved
                    ? 'bg-amber-400/20 text-amber-300 border border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                    : 'cinema-panel text-white hover:border-amber-400/50'
                }`}
              >
                {isSaved ? <Check className="w-4 h-4 text-amber-400" /> : <Bookmark className="w-4 h-4" />}
                <span>{isSaved ? 'In Vault' : 'Add To Vault'}</span>
              </button>

              <button
                onClick={handleShare}
                className="w-10 h-10 rounded-full cinema-panel flex items-center justify-center text-slate-300 hover:text-amber-300 hover:border-amber-400/40 transition-all cursor-pointer relative"
                title="Share link"
              >
                <Share2 className="w-4 h-4" />
                {copied && (
                  <span className="absolute -top-8 px-2 py-0.5 rounded bg-amber-400 text-black text-[10px] font-mono font-bold whitespace-nowrap">
                    COPIED
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Synopsis */}
          <div className="border-t border-slate-800/80 pt-4">
            <h3 className="text-xs font-mono tracking-widest text-slate-400 uppercase mb-2">
              // TRANSMISSION SUMMARY
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
              {movie.synopsis || `Live cinematic transmission for ${movie.title}. The exact full movie is resolved through decentralized stream nodes and played directly inside your browser with zero redirects.`}
            </p>
          </div>

          {/* Genres, Server Info & Playback Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6 pt-4 border-t border-slate-800/80">
            <div className="flex flex-wrap gap-2">
              {movie.genres && movie.genres.map((g, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full text-[11px] font-mono text-amber-300/80 bg-amber-950/30 border border-amber-500/20"
                >
                  #{g}
                </span>
              ))}
              {movie.mood && (
                <span className="px-3 py-1 rounded-full text-[11px] font-mono text-amber-300 bg-amber-950/40 border border-amber-400/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>{movie.mood}</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-400/30 px-3 py-1.5 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                {currentUser 
                  ? `STATUS: AUTHENTICATED USER STREAMING // ${currentServerObj.quality}`
                  : 'STATUS: AUTHENTICATION REQUIRED TO STREAM FULL TITLE'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
