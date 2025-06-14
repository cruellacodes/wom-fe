/* eslint-disable react/prop-types */
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Routes, Route } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import React from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster } from "react-hot-toast";
import { useLocation } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react"

import Header from "./components/Header";
import Footer from "./components/Footer";
import Leaderboard from "./components/LeaderBoard";
import TokenSearch from "./components/TokenSearch";
import TokenInfoCard from "./components/TokenInfoCard";
import TweetScatterChart from "./components/TweetScatterChart";
import RadarChart from "./components/RadarChart";
import Podium from "./components/Podium";
import PolarChart from "./components/PolarChart";
import About from "./components/About";
import TwitterScan from "./components/TwitterScan";
import AppLoader from "./components/Loader";
import ShillerScan from "./components/ShillerScan"
import StocksAnalyzer from "./components/StocksAnalyzer.jsx"
import GlobalFeaturedModal from "./components/GlobalFeaturedModal";

import { useActiveTokens } from "./hooks/useActiveTokens";
import { useTokenTweets } from "./hooks/useTokenTweets";
import { supabase } from "./lib/supabaseClient";

import { getTopTokensByTweetCount, getTopTokensByWomScore } from "./utils";

dayjs.extend(utc);

import { ChevronDownIcon } from "@heroicons/react/24/solid";

function ChartToggle({ show, onToggle }) {
  return (
    <div className="flex justify-center mt-4 mb-2">
      <button
        onClick={onToggle}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-green-500 text-xs font-mono tracking-wide text-green-300 bg-[#001d10]/40 hover:bg-[#003322]/60 backdrop-blur-md transition-all"
      >
        {show ? "HIDE CHARTS" : "SHOW CHARTS"}
        <ChevronDownIcon
          className={`w-3.5 h-3.5 transform transition-transform duration-300 ${
            show ? "rotate-180" : ""
          }`}
        />
      </button>
    </div>
  );
}

function App() {
  // Your existing states
  const [searchedToken, setSearchedToken] = useState(null);
  const [filteredTweets, setFilteredTweets] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showCharts, setShowCharts] = useState(true);

  // NEW: Featured system states
  const [featuredTokens, setFeaturedTokens] = useState([]);
  const [showGlobalFeaturedModal, setShowGlobalFeaturedModal] = useState(false);
  const [selectedTokenForGlobalFeatured, setSelectedTokenForGlobalFeatured] = useState(null);

  const tokenInfoRef = useRef(null);
  const leaderboardRef = useRef(null);
  const tweetSentimentRef = useRef(null);

  const { tokens, loading: loadingTokens } = useActiveTokens();
  const { tweets, loading: loadingTweets } = useTokenTweets();
  const location = useLocation();
  const [isFetchingTweets, setIsFetchingTweets] = useState(false);
  const [isAnalyzingSentiment, setIsAnalyzingSentiment] = useState(false);
  const fetchIdRef = useRef(0); 
  const [isTokenInfoLoading, setIsTokenInfoLoading] = useState(false);

  // NEW: Auto-promotion system
  useEffect(() => {
    // Start monitoring for auto-promotions
    startAutoPromotionSystem();
    
    // Load initial featured tokens
    loadFeaturedTokens();

    // Refresh featured tokens every 30 seconds
    const refreshInterval = setInterval(loadFeaturedTokens, 30000);

    return () => {
      clearInterval(refreshInterval);
    };
  }, []);

  const startAutoPromotionSystem = () => {
    // Check for promotions every minute
    const promotionInterval = setInterval(promoteWaitingTokens, 60000);
    
    // Also check immediately
    promoteWaitingTokens();

    return () => clearInterval(promotionInterval);
  };

  const promoteWaitingTokens = async () => {
    try {
      const now = new Date().toISOString();

      // 1. Mark expired spots as inactive
      await supabase
        .from('featured_spots')
        .update({ is_active: false })
        .eq('is_active', true)
        .lt('featured_until', now);

      // 2. Get available spot positions (1-3)
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

      // 3. Promote waiting tokens to fill available spots
      if (availablePositions.length > 0) {
        const { data: waitingTokens } = await supabase
          .from('featured_spots')
          .select('*')
          .eq('is_active', true)
          .is('spot_position', null)
          .order('created_at', { ascending: true }); // First paid, first promoted

        if (waitingTokens?.length > 0) {
          // Promote tokens to available spots
          for (let i = 0; i < Math.min(availablePositions.length, waitingTokens.length); i++) {
            const token = waitingTokens[i];
            const position = availablePositions[i];

            await supabase
              .from('featured_spots')
              .update({ 
                spot_position: position,
                featured_at: new Date().toISOString() // Update when actually featured
              })
              .eq('id', token.id);

            console.log(`Auto-promoted ${token.token_symbol} to position ${position}`);
          }

          // Refresh featured tokens after promotions
          loadFeaturedTokens();
        }
      }

    } catch (error) {
      console.error('Error in auto-promotion system:', error);
    }
  };

  const loadFeaturedTokens = async () => {
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
      // Fallback to localStorage if database fails
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
  };

  // Save featured tokens to localStorage as backup
  useEffect(() => {
    if (featuredTokens.length > 0) {
      localStorage.setItem('featuredTokens', JSON.stringify(featuredTokens));
    }
  }, [featuredTokens]);

  // Clean up expired featured tokens every minute
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      setFeaturedTokens(prev => {
        const filtered = prev.filter(ft => 
          ft.featured_until && new Date(ft.featured_until) > new Date()
        );
        return filtered.length !== prev.length ? filtered : prev;
      });
    }, 60000); // Check every minute

    return () => clearInterval(cleanupInterval);
  }, []);

  // Handle the "Get Featured" button from header bar
  const handleGlobalFeaturedClick = () => {
    if (tokens.length > 0) {
      setShowGlobalFeaturedModal(true);
    } else {
      alert('No tokens available. Please wait for tokens to load.');
    }
  };

  // Handle adding a new featured token (refresh from database)
  const handleAddFeaturedToken = async (paymentData) => {
    // Refresh the featured tokens list after a successful payment
    await loadFeaturedTokens();
    
    console.log('Token featured successfully:', paymentData);
  };

  // Handle successful payment from global modal
  const handleGlobalPaymentSuccess = (paymentData) => {
    handleAddFeaturedToken(paymentData);
    setShowGlobalFeaturedModal(false);
    setSelectedTokenForGlobalFeatured(null);
  };

  const nowUtc = useMemo(() => dayjs.utc(), []);
  const tweetsLast24h = useMemo(() => {
    return tweets.filter((t) =>
      dayjs.utc(t.created_at).isAfter(nowUtc.subtract(24, "hour"))
    );
  }, [tweets, nowUtc]);

  const topTweetTokens = useMemo(() => {
    return getTopTokensByTweetCount(tokens, 3, tweets, 24);
  }, [tokens, tweets]);

  const topWomTokens = useMemo(() => {
    return getTopTokensByWomScore(tokens, 5);
  }, [tokens]);

  // Set default token based on best WOM score with available tweets
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
  }, [searchedToken, tokens, tweets, topWomTokens]);

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

  const handlePageChange = (page) => setCurrentPage(page);

  if (loadingTokens || loadingTweets) {
    return <AppLoader />;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="bg-[#010409] min-h-screen text-gray-300">
            {/* UPDATED: Pass featured handler to Header */}
            <Header
              onScrollToLeaderboard={() =>
                leaderboardRef.current?.scrollIntoView({ behavior: "smooth" })
              }
              onFeaturedClick={handleGlobalFeaturedClick}
            />
            <Analytics />
            <ChartToggle
              show={showCharts}
              onToggle={() => setShowCharts((prev) => !prev)}
            />

            <Analytics />

            <AnimatePresence>
              {showCharts && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4 }}
                  className="overflow-hidden"
                >
                  <div className="max-w-7xl mx-auto px-6 mt-4 mb-8 grid md:grid-cols-3 gap-4">
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
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

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
                    <TweetScatterChart
                      key={`${searchedToken?.token_symbol}-${filteredTweets.length}`}
                      searchedToken={searchedToken}
                      tweets={filteredTweets}
                      isFetchingTweets={isFetchingTweets}
                      isAnalyzingSentiment={isAnalyzingSentiment}
                      tokenSymbol={searchedToken?.token_symbol}
                    />
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
              {/* UPDATED: Pass featured system props to Leaderboard */}
              <Leaderboard
                tokens={tokens}
                tweets={tweets}
                onTokenClick={handleTokenClick}
                loading={loadingTokens || loadingTweets}
                page={currentPage}
                onPageChange={handlePageChange}
                setScrollToTweetSentimentAreaChart={tweetSentimentRef}
                // NEW: Featured system props
                featuredTokens={featuredTokens}
                onAddFeatured={handleAddFeaturedToken}
              />
            </div>

            <Footer />

            {/* NEW: Global Featured Token Selection Modal */}
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
      <Route path="/about" element={<About />} />
      <Route path="/twitterscan" element={<TwitterScan />} />
      <Route path="/shillerscan" element={<ShillerScan />} />
      <Route path="/stocksanalyzer" element={<StocksAnalyzer />} />
    </Routes>
  );
}

export default App;