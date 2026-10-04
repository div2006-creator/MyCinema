import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroCarousel from './components/HeroCarousel';
import Top10Leaderboard from './components/Top10Leaderboard';
import BentoShowcase from './components/BentoShowcase';
import ContentRow from './components/ContentRow';
import StudioStandards from './components/StudioStandards';
import ExploreSection from './components/ExploreSection';
import WatchlistSection from './components/WatchlistSection';
import SearchModal from './components/SearchModal';
import PlayerModal from './components/PlayerModal';
import AuthModal from './components/AuthModal';
import AgeVerificationModal from './components/AgeVerificationModal';
import LiveWebExtractorBar from './components/LiveWebExtractorBar';
import ContinueWatchingRow from './components/ContinueWatchingRow';
import FilterMatrix from './components/FilterMatrix';
import AccessibilityPanel from './components/AccessibilityPanel';
import Footer from './components/Footer';

import { HERO_TITLES, CATEGORIES } from './data/cinemaData';
import { extractMoviesFromWeb } from './services/liveWebExtractor';
import { 
  getCurrentUser, 
  logoutUser, 
  restoreSessionFromDatabase,
  getStoredAgeClearance,
  saveUserAgeClearance
} from './services/authService';
import { idbGetWatchHistory, idbRemoveWatchHistory } from './services/db';
import { Film, Flame, Tv, Layers, Sparkles, Trophy, SlidersHorizontal } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [divisionFilter, setDivisionFilter] = useState('ALL'); // 'ALL' | 'movies' | 'anime' | 'series'

  const [watchlist, setWatchlist] = useState(() => {
    try {
      const saved = localStorage.getItem('aether_cinema_watchlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Watch History (Continue Watching)
  const [watchHistory, setWatchHistory] = useState([]);
  const [isA11yOpen, setIsA11yOpen] = useState(false);

  // User Authentication & Age Verification State
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const [ageClearance, setAgeClearance] = useState(() => getStoredAgeClearance());

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingPlayMovie, setPendingPlayMovie] = useState(null);

  const [isAgeModalOpen, setIsAgeModalOpen] = useState(false);
  const [pendingAgeMovie, setPendingAgeMovie] = useState(null);

  // Load Watch History from IndexedDB & LocalStorage
  const refreshWatchHistory = async () => {
    try {
      const items = await idbGetWatchHistory();
      setWatchHistory(items || []);
    } catch (e) {
      console.warn('Could not load watch history:', e);
    }
  };

  useEffect(() => {
    refreshWatchHistory();
  }, []);

  const handleRemoveHistoryItem = async (movieId) => {
    await idbRemoveWatchHistory(movieId);
    setWatchHistory(prev => prev.filter(item => item.movieId !== movieId && item.id !== movieId));
  };

  // Global hotkeys: / or ⌘K (Search), Alt+A or ? (Accessibility), Esc (close modals)
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        setIsSearchOpen(true);
      } else if ((e.altKey && e.key.toLowerCase() === 'a') || (e.shiftKey && e.key === '?')) {
        e.preventDefault();
        setIsA11yOpen(prev => !prev);
      } else if (e.key === 'Escape') {
        if (isA11yOpen) setIsA11yOpen(false);
        else if (isSearchOpen) setIsSearchOpen(false);
        else if (isAuthModalOpen) setIsAuthModalOpen(false);
        else if (isAgeModalOpen) setIsAgeModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isA11yOpen, isSearchOpen, isAuthModalOpen, isAgeModalOpen]);

  // Restore permanent database session on mount (survives tab/browser closes & device restarts)
  useEffect(() => {
    async function initDatabaseSession() {
      const dbUser = await restoreSessionFromDatabase();
      if (dbUser) {
        setCurrentUser(dbUser);
        if (dbUser.ageClearance) {
          setAgeClearance(dbUser.ageClearance);
        }
      }
    }
    initDatabaseSession();
  }, []);

  const [selectedMovie, setSelectedMovie] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [extractedCategories, setExtractedCategories] = useState([]);

  // Auto-extract live real movies from online web on initial startup
  useEffect(() => {
    async function initLiveFeed() {
      try {
        const liveMovies = await extractMoviesFromWeb('avengers', 'movie');
        if (liveMovies.length > 0) {
          setExtractedCategories([
            {
              id: 'live-web-extracted-init',
              division: 'movies',
              divisionBadge: '🎬 LIVE WEB FEEDS',
              title: 'LIVE WEB STREAMS // RECENT EXTRACTS',
              subtitle: 'Real movie streams resolved live from verified third-party web indexers',
              items: liveMovies
            }
          ]);
        }
      } catch (e) {
        console.warn('Initial live extraction fallback:', e);
      }
    }
    initLiveFeed();
  }, []);

  // Sync watchlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('aether_cinema_watchlist', JSON.stringify(watchlist));
    } catch (e) {
      console.error("Could not sync watchlist to localStorage", e);
    }
  }, [watchlist]);

  const handleToggleWatchlist = (movie) => {
    setWatchlist((prev) => {
      const exists = prev.some((item) => item.id === movie.id);
      if (exists) {
        return prev.filter((item) => item.id !== movie.id);
      } else {
        return [...prev, movie];
      }
    });
  };

  const handleRemoveFromWatchlist = (movieId) => {
    setWatchlist((prev) => prev.filter((item) => item.id !== movieId));
  };

  // Helper: Check if user meets the age rating requirement of the title
  const checkAgeAllowed = (movie, clearance = ageClearance) => {
    if (!movie?.ageRating || movie.ageRating === 'ALL AGES') return true;
    if (movie.ageRating === '18+') {
      return clearance?.is18Plus === true;
    }
    if (movie.ageRating === '13+' || movie.ageRating === '16+') {
      return clearance?.is13Plus === true || clearance?.is18Plus === true;
    }
    return true;
  };

  // User must be logged in AND pass age verification (13+ or 18+) to play movies/animes!
  const handlePlayMovie = (movie) => {
    const formattedMovie = {
      ...movie,
      image: movie.image || movie.posterUrl,
      type: movie.type || (movie.isAnime ? 'Anime' : 'Movie')
    };

    // 1. Authentication Gate
    if (!currentUser) {
      setPendingPlayMovie(formattedMovie);
      setIsAuthModalOpen(true);
      return;
    }

    // 2. Age Rating Verification Gate (13+ / 18+)
    if (!checkAgeAllowed(formattedMovie)) {
      setPendingAgeMovie(formattedMovie);
      setIsAgeModalOpen(true);
      return;
    }

    // Authenticated & Age-Verified: Begin playback!
    setSelectedMovie(formattedMovie);
  };

  const handleConfirmAgeVerification = async (clearance) => {
    setAgeClearance(clearance);
    await saveUserAgeClearance(clearance);
    setIsAgeModalOpen(false);

    if (pendingAgeMovie) {
      setSelectedMovie(pendingAgeMovie);
      setPendingAgeMovie(null);
    }
  };

  const handleMoreInfoHero = (heroItem) => {
    setSelectedMovie({
      ...heroItem,
      image: heroItem.posterUrl || heroItem.image,
      type: heroItem.isAnime ? 'Anime' : 'Movie'
    });
  };

  const handleOpenAuth = (movieToPlay = null) => {
    setPendingPlayMovie(movieToPlay);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);
    const activeClearance = user.ageClearance || ageClearance;

    if (user.ageClearance) {
      setAgeClearance(user.ageClearance);
    }

    if (pendingPlayMovie) {
      const movieToPlay = pendingPlayMovie;
      setPendingPlayMovie(null);

      if (!checkAgeAllowed(movieToPlay, activeClearance)) {
        setPendingAgeMovie(movieToPlay);
        setIsAgeModalOpen(true);
      } else {
        setSelectedMovie(movieToPlay);
      }
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
  };

  const handleAddExtractedCategory = (newCat) => {
    setExtractedCategories((prev) => [newCat, ...prev.filter(c => c.id !== newCat.id)]);
  };

  // Combine live extracted categories with standard categories
  const allDisplayCategories = [...extractedCategories, ...CATEGORIES];

  // All catalog items for Top 10 Leaderboard & Bento
  const allCatalogItems = [
    ...HERO_TITLES,
    ...CATEGORIES.flatMap(c => c.items)
  ];
  const uniqueCatalogItems = Array.from(new Map(allCatalogItems.map(item => [item.title, item])).values());

  // Filter categories by active division tab or filter
  const getVisibleCategories = () => {
    const currentDivision = activeTab === 'movies' 
      ? 'movies' 
      : activeTab === 'anime' 
        ? 'anime' 
        : activeTab === 'series' 
          ? 'series' 
          : divisionFilter;

    if (currentDivision === 'movies') {
      return allDisplayCategories.filter(c => c.division === 'movies' || (!c.division && c.title.includes('MOVIE')));
    }
    if (currentDivision === 'anime') {
      return allDisplayCategories.filter(c => c.division === 'anime' || (!c.division && c.title.includes('ANIME')));
    }
    if (currentDivision === 'series') {
      return allDisplayCategories.filter(c => c.division === 'series' || (!c.division && c.title.includes('SERIES')));
    }

    return allDisplayCategories;
  };

  // Filter hero spotlight based on division
  const getVisibleHeroTitles = () => {
    if (activeTab === 'movies') return HERO_TITLES.filter(h => h.division === 'movies');
    if (activeTab === 'anime') return HERO_TITLES.filter(h => h.division === 'anime');
    if (activeTab === 'series') return HERO_TITLES.filter(h => h.division === 'series');
    if (divisionFilter === 'movies') return HERO_TITLES.filter(h => h.division === 'movies');
    if (divisionFilter === 'anime') return HERO_TITLES.filter(h => h.division === 'anime');
    if (divisionFilter === 'series') return HERO_TITLES.filter(h => h.division === 'series');
    return HERO_TITLES;
  };

  const isHomeOrDivisionTab = ['home', 'movies', 'anime', 'series'].includes(activeTab);

  // Bento Spotlight feature & side items
  const bentoFeature = uniqueCatalogItems.find(c => c.title === 'OPPENHEIMER') || uniqueCatalogItems[0];
  const bentoSides = uniqueCatalogItems.filter(c => c.title !== bentoFeature?.title).slice(0, 4);

  return (
    <div className="min-h-screen bg-[#06080d] text-slate-100 selection:bg-amber-400 selection:text-black font-sans relative">
      
      {/* Subtle warm amber theater atmospheric glow */}
      <div className="fixed top-0 left-1/3 w-[500px] h-[400px] bg-amber-500/[0.04] rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="fixed top-1/2 right-1/4 w-[450px] h-[400px] bg-amber-600/[0.03] rounded-full blur-[160px] pointer-events-none -z-10" />

      {/* Luxury Full-Width Sticky Cinema Command Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'home') setDivisionFilter('ALL');
          if (tab === 'movies') setDivisionFilter('movies');
          if (tab === 'anime') setDivisionFilter('anime');
          if (tab === 'series') setDivisionFilter('series');
        }}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenA11y={() => setIsA11yOpen(true)}
        watchlistCount={watchlist.length}
        currentUser={currentUser}
        onOpenAuth={() => handleOpenAuth()}
        onLogout={handleLogout}
        ageClearance={ageClearance}
      />

      {/* Main View Router */}
      <main className="w-full">
        {isHomeOrDivisionTab && (
          <>
            {/* Interactive Cinema Theater Stage & Spotlight Reel */}
            <HeroCarousel
              items={getVisibleHeroTitles()}
              onPlay={handlePlayMovie}
              onMoreInfo={handleMoreInfoHero}
              onToggleWatchlist={handleToggleWatchlist}
              watchlist={watchlist}
            />

            {/* Continue Watching / Playback Resume Bar (IndexedDB Synced) */}
            <ContinueWatchingRow
              items={watchHistory}
              onResumeMovie={handlePlayMovie}
              onRemoveItem={handleRemoveHistoryItem}
            />

            {/* Division Banner when viewing a dedicated channel */}
            {activeTab !== 'home' && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
                <div className="p-6 sm:p-8 rounded-3xl cinema-panel border border-amber-500/25 bg-[#090e1c]/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xl">
                  <div>
                    <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest flex items-center gap-1.5 mb-1.5 font-bold">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Dedicated Channel View:</span>
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight font-sans">
                      {activeTab === 'movies' && '🎬 English Movies Vault // 4K Hollywood Masterworks'}
                      {activeTab === 'anime' && '⛩️ Anime Sanctuary // Complete Universes & Sagas'}
                      {activeTab === 'series' && '📺 Prestige Web Series // Multi-Season Television'}
                    </h2>
                    <p className="text-xs text-slate-300 font-mono mt-1">
                      {activeTab === 'movies' && '// Uncompressed master releases streaming in 4K with multi-audio dubs & zero redirects.'}
                      {activeTab === 'anime' && '// Complete seasons with Dual Audio (English Dub + Japanese Sub) and episode matrices.'}
                      {activeTab === 'series' && '// Critically acclaimed full seasons with seamless episode progression.'}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setActiveTab('home');
                      setDivisionFilter('ALL');
                    }}
                    className="self-start sm:self-center px-5 py-2.5 rounded-full cinema-panel text-xs font-mono text-amber-300 hover:border-amber-400 transition-all cursor-pointer whitespace-nowrap"
                  >
                    View All Cinema ↗
                  </button>
                </div>
              </div>
            )}

            {/* Channel Division Filter Bar (Home View) */}
            {activeTab === 'home' && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl cinema-panel">
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                    <Layers className="w-4 h-4 text-amber-400" />
                    <span className="uppercase font-bold tracking-wider">
                      Explore Channels:
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {[
                      { id: 'ALL', label: '🌟 All Cinema' },
                      { id: 'movies', label: '🎬 English Movies' },
                      { id: 'anime', label: '⛩️ Anime Realm' },
                      { id: 'series', label: '📺 Web Series' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setDivisionFilter(tab.id)}
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 ${
                          divisionFilter === tab.id
                            ? 'gold-gradient-btn text-black'
                            : 'cinema-panel text-slate-300 hover:text-white hover:border-white/20'
                        }`}
                      >
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* FORMAT 1: Top 10 Global Leaderboard (Only on All or Home View) */}
            {(activeTab === 'home' && divisionFilter === 'ALL') && (
              <Top10Leaderboard
                items={uniqueCatalogItems}
                onSelectMovie={handlePlayMovie}
                onToggleWatchlist={handleToggleWatchlist}
                watchlist={watchlist}
              />
            )}

            {/* Live Web Stream Resolver Tool */}
            <LiveWebExtractorBar onExtractedData={handleAddExtractedCategory} />

            {/* FORMAT 2: Curated Studio Bento Spotlight Showcase */}
            {(activeTab === 'home' && divisionFilter === 'ALL') && (
              <BentoShowcase
                featuredItem={bentoFeature}
                sideItems={bentoSides}
                onSelectMovie={handlePlayMovie}
                onToggleWatchlist={handleToggleWatchlist}
                watchlist={watchlist}
              />
            )}

            {/* ADVANCED FILTER & DISCOVERY MATRIX */}
            <FilterMatrix
              mediaList={uniqueCatalogItems}
              onSelectMovie={handlePlayMovie}
              onToggleWatchlist={handleToggleWatchlist}
              watchlist={watchlist}
            />

            {/* FORMAT 3: Distinct Divided Content Rows with Reel / Grid View Mode */}
            <div className="space-y-2">
              {getVisibleCategories().map((category) => (
                <ContentRow
                  key={category.id}
                  category={category}
                  onSelectMovie={handlePlayMovie}
                  onToggleWatchlist={handleToggleWatchlist}
                  watchlist={watchlist}
                />
              ))}
            </div>

            {/* FORMAT 4: Studio Quality & Security Standards (Replaces Inochi Protocol) */}
            <StudioStandards />
          </>
        )}

        {/* TOP 10 DEDICATED CHANNEL TAB */}
        {activeTab === 'top10' && (
          <div className="pt-8">
            <Top10Leaderboard
              items={uniqueCatalogItems}
              onSelectMovie={handlePlayMovie}
              onToggleWatchlist={handleToggleWatchlist}
              watchlist={watchlist}
            />

            <div className="space-y-4">
              {CATEGORIES.map((category) => (
                <ContentRow
                  key={category.id}
                  category={category}
                  onSelectMovie={handlePlayMovie}
                  onToggleWatchlist={handleToggleWatchlist}
                  watchlist={watchlist}
                />
              ))}
            </div>
          </div>
        )}

        {/* VAULT / WATCHLIST TAB */}
        {activeTab === 'watchlist' && (
          <WatchlistSection
            watchlist={watchlist}
            onSelectMovie={handlePlayMovie}
            onRemoveFromWatchlist={handleRemoveFromWatchlist}
            onGoExplore={() => setActiveTab('home')}
          />
        )}
      </main>

      {/* Global Luxury Studio Footer */}
      <Footer onNavigate={(tab) => {
        setActiveTab(tab);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }} />

      {/* Modals & Dialogs */}
      {selectedMovie && (
        <PlayerModal
          movie={selectedMovie}
          onClose={() => {
            setSelectedMovie(null);
            refreshWatchHistory();
          }}
          onToggleWatchlist={handleToggleWatchlist}
          isSaved={watchlist.some((item) => item.id === selectedMovie.id)}
          currentUser={currentUser}
          onOpenAuth={handleOpenAuth}
        />
      )}

      {isSearchOpen && (
        <SearchModal
          onClose={() => setIsSearchOpen(false)}
          onSelectMovie={handlePlayMovie}
        />
      )}

      {isA11yOpen && (
        <AccessibilityPanel
          isOpen={isA11yOpen}
          onClose={() => setIsA11yOpen(false)}
        />
      )}

      {isAuthModalOpen && (
        <AuthModal
          onClose={() => {
            setIsAuthModalOpen(false);
            setPendingPlayMovie(null);
          }}
          onSuccess={handleAuthSuccess}
        />
      )}

      {isAgeModalOpen && pendingAgeMovie && (
        <AgeVerificationModal
          movie={pendingAgeMovie}
          currentClearance={ageClearance}
          onConfirm={handleConfirmAgeVerification}
          onClose={() => {
            setIsAgeModalOpen(false);
            setPendingAgeMovie(null);
          }}
        />
      )}
    </div>
  );
}
