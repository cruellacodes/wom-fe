/* eslint-disable react/prop-types */
import { useState, useRef, useEffect, useMemo, useCallback, lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import React from "react";
import { Toaster } from "react-hot-toast";
import { useLocation } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";

// Custom lightweight debounce function - replaces lodash.debounce
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

// Date utility functions to replace dayjs
const getCurrentUTC = () => new Date();
const subtractHours = (date, hours) => new Date(date.getTime() - hours * 60 * 60 * 1000);
const isAfter = (date1, date2) => date1.getTime() > date2.getTime();

// Lazy load heavy components
const TweetScatterChart = lazy(() => import("./components/TweetScatterChart"));
const RadarChart = lazy(() => import("./components/RadarChart"));
const PolarChart = lazy(() => import("./components/PolarChart"));
const Podium = lazy(() => import("./components/Podium"));
const About = lazy(() => import("./components/About"));
const TwitterScan = lazy(() => import("./components/TwitterScan"));
const ShillerScan = lazy(() => import("./components/ShillerScan"));
const StocksAnalyzer = lazy(() => import("./components/StocksAnalyzer"));

// Regular imports for critical components
import Header from "./components/Header";
import Footer from "./components/Footer";
import Leaderboard from "./components/LeaderBoard";
import TokenSearch from "./components/TokenSearch";
import TokenInfoCard from "./components/TokenInfoCard";
import AppLoader from "./components/Loader";
import GlobalFeaturedModal from "./components/GlobalFeaturedModal";

import { useActiveTokens } from "./hooks/useActiveTokens";
import { useTokenTweets } from "./hooks/useTokenTweets";
import { supabase } from "./lib/supabaseClient";

import { getTopTokensByTweetCount, getTopTokensByWomScore } from "./utils";

import { ChevronDownIcon } from "@heroicons/react/24/solid";

// Loading component for lazy loaded components
const LazyLoadingSpinner = () => (
  <div className="flex justify-center items-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
  </div>
);

function ChartToggle({ show, onToggle }) {
  return (
    <div className="max-w-7xl mx-auto px-6 mt-4 mb-2 flex justify-start">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-br from-[#0A0F0A] via-[#0D1117] to-[#111827] 
          border border-[#14F195]/20 backdrop-blur-xl shadow-xl
          hover:border-[#14F195]/40 hover:shadow-[0_4px_20px_rgba(20,241,149,0.1)]
          transition-all duration-300 ease-out"
      >
        <span className="text-sm font-medium bg-gradient-to-r from-[#14F195] to-[#00D4AA] bg-clip-text text-transparent">
          {show ? "HIDE CHARTS" : "SHOW CHARTS"}
        </span>
        <ChevronDownIcon
          className={`w-4 h-4 text-[#14F195] transform transition-transform duration-300 ${
            show ? "rotate-180" : ""
          }`}
        />
      </button>
    </div>
  );
}

// Custom AnimatePresence replacement with CSS
function CustomAnimatePresence({ children, show }) {
  const [shouldRender, setShouldRender] = useState(show);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (show) {
      setShouldRender(true);
      setIsAnimating(true);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setShouldRender(false), 400); // Match animation duration
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!shouldRender) return null;

  return (
    <div 
      className={`overflow-hidden transition-all duration-400 ease-out ${
        isAnimating && show ? 'animate-expand' : 'animate-collapse'
      }`}
    >
      {children}
    </div>
  );
}

function App() {
  // Core states
  const [searchedToken, setSearchedToken] = useState(null);
  const [filteredTweets, setFilteredTweets] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showCharts, setShowCharts] = useState(false);

  // Featured system states
  const [featuredTokens, setFeaturedTokens] = useState([]);
  const [showGlobalFeaturedModal, setShowGlobalFeaturedModal] = useState(false);
  const [selectedTokenForGlobalFeatured, setSelectedTokenForGlobalFeatured] = useState(null);

  // Loading states
  const [isFetchingTweets, setIsFetchingTweets] = useState(false);
  const [isAnalyzingSentiment, setIsAnalyzingSentiment] = useState(false);
  const [isTokenInfoLoading, setIsTokenInfoLoading] = useState(false);

  // Refs
  const tokenInfoRef = useRef(null);
  const leaderboardRef = useRef(null);
  const tweetSentimentRef = useRef(null);
  const fetchIdRef = useRef(0);

  // Hooks
  const { tokens, loading: loadingTokens } = useActiveTokens();
  const { tweets, loading: loadingTweets } = useTokenTweets();
  const location = useLocation();

  // Featured tokens management
  const loadFeaturedTokens = useCallback(async () => {
    try {
      const now = new Date().toISOString();
      
      const { data: featuredSpots } = await supabase
        .from('featured_spots')
        .select('*')
        .eq('is_active', true)
        .gt('featured_until', now)
        .not('spot_position', 'is', null)
        .order('spot_position', { ascending: true });

      const formattedFeatured = featuredSpots?.map(spot => ({
        ...spot.token_data,
        is_featured: true,
        featured_until: spot.featured_until,
        featured_duration_hours: spot.duration_hours,
        featured_price: spot.price_sol,
        featured_at: spot.featured_at,
        spot_position: spot.spot_position
      })) || [];

      setFeaturedTokens(formattedFeatured);
    } catch (error) {
      console.error('Error loading featured tokens:', error);
      const savedFeatured = localStorage.getItem('featuredTokens');
      if (savedFeatured) {
        try {
          const parsed = JSON.parse(savedFeatured);
          const validFeatured = parsed.filter(ft => 
            ft.featured_until && new Date(ft.featured_until) > new Date()
          );
          setFeaturedTokens(validFeatured);
        } catch (localError) {
          console.error('Error loading featured tokens from localStorage:', localError);
        }
      }
    }
  }, []);

  const loadFeaturedTokensDebounced = useMemo(
    () => debounce(loadFeaturedTokens, 1000),
    [loadFeaturedTokens]
  );

  const promoteWaitingTokens = useCallback(async () => {
    try {
      const now = new Date().toISOString();

      await supabase
        .from('featured_spots')
        .update({ is_active: false })
        .eq('is_active', true)
        .lt('featured_until', now);

      const { data: activeSpots } = await supabase
        .from('featured_spots')
        .select('spot_position')
        .eq('is_active', true)
        .gt('featured_until', now)
        .not('spot_position', 'is', null);

      const occupiedPositions = new Set(activeSpots?.map(spot => spot.spot_position) || []);
      const availablePositions = [];

      for (let i = 1; i <= 3; i++) {
        if (!occupiedPositions.has(i)) {
          availablePositions.push(i);
        }
      }

      if (availablePositions.length > 0) {
        const { data: waitingTokens } = await supabase
          .from('featured_spots')
          .select('*')
          .eq('is_active', true)
          .is('spot_position', null)
          .order('created_at', { ascending: true });

        if (waitingTokens?.length > 0) {
          for (let i = 0; i < Math.min(availablePositions.length, waitingTokens.length); i++) {
            const token = waitingTokens[i];
            const position = availablePositions[i];

            await supabase
              .from('featured_spots')
              .update({ 
                spot_position: position,
                featured_at: new Date().toISOString()
              })
              .eq('id', token.id);

            console.log(`Auto-promoted ${token.token_symbol} to position ${position}`);
          }

          loadFeaturedTokens();
        }
      }
    } catch (error) {
      console.error('Error in auto-promotion system:', error);
    }
  }, [loadFeaturedTokens]);

  // Memoized calculations using native Date instead of dayjs
  const nowUtc = useMemo(() => getCurrentUTC(), []);
  
  const tweetsLast24h = useMemo(() => {
    if (!tweets.length) return [];
    const cutoff = subtractHours(nowUtc, 24);
    return tweets.filter((t) => isAfter(new Date(t.created_at), cutoff));
  }, [tweets, nowUtc]);

  const topTweetTokens = useMemo(() => {
    if (!tokens.length || !tweets.length) return [];
    return getTopTokensByTweetCount(tokens, 3, tweets, 24);
  }, [tokens, tweets]);

  const topWomTokens = useMemo(() => {
    if (!tokens.length) return [];
    return getTopTokensByWomScore(tokens, 5);
  }, [tokens]);

  // Event handlers
  const handleTokenClick = useCallback(
    (token) => {
      fetchIdRef.current++;
      setIsFetchingTweets(false);
      setIsAnalyzingSentiment(false);
      const clickedSymbol = token.token_symbol?.trim().toLowerCase();
      const relevantTweets = tweets.filter(
        (t) => t.token_symbol?.trim().toLowerCase() === clickedSymbol
      );
      setSearchedToken(token);
      setFilteredTweets(relevantTweets);

      tokenInfoRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [tweets]
  );

  const handlePageChange = useCallback((page) => setCurrentPage(page), []);

  const handleGlobalFeaturedClick = useCallback(() => {
    if (tokens.length > 0) {
      setShowGlobalFeaturedModal(true);
    } else {
      alert('No tokens available. Please wait for tokens to load.');
    }
  }, [tokens.length]);

  const handleGlobalPaymentSuccess = useCallback(() => {
    loadFeaturedTokensDebounced();
    setShowGlobalFeaturedModal(false);
    setSelectedTokenForGlobalFeatured(null);
  }, [loadFeaturedTokensDebounced]);

  // Effects
  useEffect(() => {
    const promotionInterval = setInterval(promoteWaitingTokens, 60000);
    promoteWaitingTokens();
    loadFeaturedTokens();
    const refreshInterval = setInterval(loadFeaturedTokens, 30000);

    return () => {
      clearInterval(promotionInterval);
      clearInterval(refreshInterval);
    };
  }, [promoteWaitingTokens, loadFeaturedTokens]);

  useEffect(() => {
    if (featuredTokens.length > 0) {
      localStorage.setItem('featuredTokens', JSON.stringify(featuredTokens));
    }
  }, [featuredTokens]);

  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      setFeaturedTokens(prev => {
        const filtered = prev.filter(ft => 
          ft.featured_until && new Date(ft.featured_until) > new Date()
        );
        return filtered.length !== prev.length ? filtered : prev;
      });
    }, 60000);

    return () => clearInterval(cleanupInterval);
  }, []);

  useEffect(() => {
    if (!searchedToken && tokens.length > 0 && tweets.length > 0) {
      const topWomSorted = getTopTokensByWomScore(tokens, 5); 
      const topTokenWithTweets = topWomSorted.find((token) =>
        tweets.some(
          (t) =>
            t.token_symbol?.toLowerCase() === token.token_symbol?.toLowerCase()
        )
      );

      if (topTokenWithTweets) {
        const tokenSymbol = topTokenWithTweets.token_symbol.toLowerCase();
        const relevantTweets = tweets.filter(
          (t) => t.token_symbol?.toLowerCase() === tokenSymbol
        );
        setSearchedToken(topTokenWithTweets);
        setFilteredTweets(relevantTweets);
      }
    }
  }, [searchedToken, tokens, tweets]);

  useEffect(() => {
    if (location?.state?.scrollTo === "leaderboard") {
      setTimeout(() => {
        leaderboardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  
    if (location?.state?.scrollTo === "sentiment") {
      setTimeout(() => {
        tweetSentimentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [location]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(tokens.length / 20));
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [tokens.length, currentPage]);

  if (loadingTokens || loadingTweets) {
    return <AppLoader />;
  }

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <div className="bg-[#010409] min-h-screen text-gray-300">
              <Header
                onScrollToLeaderboard={() =>
                  leaderboardRef.current?.scrollIntoView({ behavior: "smooth" })
                }
                onFeaturedClick={handleGlobalFeaturedClick}
              />

              <ChartToggle
                show={showCharts}
                onToggle={() => setShowCharts((prev) => !prev)}
              />

              <Analytics />

              <CustomAnimatePresence show={showCharts}>
                <div className="max-w-7xl mx-auto px-6 mt-4 mb-8 grid md:grid-cols-3 gap-4">
                  <Suspense fallback={<LazyLoadingSpinner />}>
                    <RadarChart
                      tokens={topTweetTokens}
                      tweets={tweetsLast24h.filter((t) =>
                        topTweetTokens.some(
                          (token) =>
                            token.token_symbol?.toLowerCase() ===
                            t.token_symbol?.toLowerCase()
                        )
                      )}
                    />
                    <Podium tokens={topTweetTokens} />
                    <PolarChart tokens={topWomTokens} />
                  </Suspense>
                </div>
              </CustomAnimatePresence>

              <div ref={tokenInfoRef} className="max-w-3xl mx-auto px-4 mb-4">
                <TokenSearch
                  fetchIdRef={fetchIdRef}
                  tokens={tokens}
                  tweets={tweets}
                  setSearchedToken={setSearchedToken}
                  setFilteredTweets={setFilteredTweets}
                  setIsFetchingTweets={setIsFetchingTweets}
                  setIsAnalyzingSentiment={setIsAnalyzingSentiment}
                  setIsTokenInfoLoading={setIsTokenInfoLoading}
                />
              </div>

              {searchedToken && (
                <div className="max-w-7xl mx-auto p-6 space-y-12">
                  <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
                    <div className="lg:col-span-7 relative">
                      <Suspense fallback={<LazyLoadingSpinner />}>
                        <TweetScatterChart
                          key={`${searchedToken?.token_symbol}-${filteredTweets.length}`}
                          searchedToken={searchedToken}
                          tweets={filteredTweets}
                          isFetchingTweets={isFetchingTweets}
                          isAnalyzingSentiment={isAnalyzingSentiment}
                          tokenSymbol={searchedToken?.token_symbol}
                        />
                      </Suspense>
                    </div>
                    <div className="lg:col-span-3">
                      <TokenInfoCard token={searchedToken} isLoading={isTokenInfoLoading} />
                    </div>
                  </div>
                </div>
              )}

              <div
                ref={leaderboardRef}
                className="max-w-7xl mx-auto px-6 mt-8 mb-8"
              >
                <Leaderboard
                  tokens={tokens}
                  tweets={tweets}
                  onTokenClick={handleTokenClick}
                  loading={loadingTokens || loadingTweets}
                  page={currentPage}
                  onPageChange={handlePageChange}
                  setScrollToTweetSentimentAreaChart={tweetSentimentRef}
                  featuredTokens={featuredTokens}
                  onAddFeatured={loadFeaturedTokensDebounced}
                />
              </div>

              <Footer />

              <GlobalFeaturedModal
                isOpen={showGlobalFeaturedModal}
                onClose={() => {
                  setShowGlobalFeaturedModal(false);
                  setSelectedTokenForGlobalFeatured(null);
                }}
                tokens={tokens}
                featuredTokens={featuredTokens}
                onSelectToken={setSelectedTokenForGlobalFeatured}
                selectedToken={selectedTokenForGlobalFeatured}
                onPaymentSuccess={handleGlobalPaymentSuccess}
              />

              <Toaster
                position="bottom-right"
                toastOptions={{
                  style: {
                    background: "#0A0F0A",
                    color: "#00FFB2",
                    border: "1px solid #00FFB2",
                  },
                }}
              />
            </div>
          }
        />
        <Route 
          path="/about" 
          element={
            <Suspense fallback={<AppLoader />}>
              <About />
            </Suspense>
          } 
        />
        <Route 
          path="/twitterscan" 
          element={
            <Suspense fallback={<AppLoader />}>
              <TwitterScan />
            </Suspense>
          } 
        />
        <Route 
          path="/shillerscan" 
          element={
            <Suspense fallback={<AppLoader />}>
              <ShillerScan />
            </Suspense>
          } 
        />
        <Route 
          path="/stocksanalyzer" 
          element={
            <Suspense fallback={<AppLoader />}>
              <StocksAnalyzer />
            </Suspense>
          } 
        />
      </Routes>

      <style>{`
        .animate-expand {
          animation: expandHeight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        
        .animate-collapse {
          animation: collapseHeight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        @keyframes expandHeight {
          from {
            opacity: 0;
            max-height: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            max-height: 500px;
            transform: translateY(0);
          }
        }
        
        @keyframes collapseHeight {
          from {
            opacity: 1;
            max-height: 500px;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            max-height: 0;
            transform: translateY(-10px);
          }
        }
      `}</style>
    </>
  );
}

export default App;