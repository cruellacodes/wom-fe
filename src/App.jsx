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
import SimpleFeaturedPayment from "./components/FeaturedPayment";

import { useActiveTokens } from "./hooks/useActiveTokens";
import { useTokenTweets } from "./hooks/useTokenTweets";

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

const GlobalFeaturedModal = ({ 
  isOpen, 
  onClose, 
  tokens, 
  featuredTokens, 
  onSelectToken,
  selectedToken,
  onPaymentSuccess 
}) => {
  const [showPayment, setShowPayment] = useState(false);

  // Get tokens that aren't already featured
  const availableTokens = tokens.filter(token => 
    !featuredTokens.some(ft => 
      ft.token_symbol === token.token_symbol &&
      ft.featured_until &&
      new Date(ft.featured_until) > new Date()
    )
  ).slice(0, 20); // Show top 20 for selection

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setShowPayment(false);
      onSelectToken(null);
    }
  }, [isOpen, onSelectToken]);

  if (!isOpen) return null;

  // Show payment modal if token is selected
  if (showPayment && selectedToken) {
    return (
      <SimpleFeaturedPayment
        isOpen={true}
        onClose={() => {
          setShowPayment(false);
          onSelectToken(null);
          onClose();
        }}
        userToken={selectedToken}
        onPaymentSuccess={onPaymentSuccess}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0A0F0A] border border-[#1b1b1b] rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-hidden relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-6">
          <div className="text-3xl mb-3">⭐</div>
          <h3 className="text-2xl font-bold text-green-300 mb-2">
            Get Featured
          </h3>
          <p className="text-gray-400">
            Select a token to feature in the top 3 spots
          </p>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {availableTokens.length > 0 ? (
            <div className="space-y-2">
              {availableTokens.map((token) => (
                <div
                  key={token.token_symbol}
                  onClick={() => {
                    onSelectToken(token);
                    setShowPayment(true);
                  }}
                  className="flex items-center justify-between p-3 border border-[#2a2a2a] rounded-lg hover:border-green-400/50 hover:bg-green-400/5 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-3">
                    {token.image_url && (
                      <img
                        src={token.image_url}
                        alt={token.token_symbol}
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <div>
                      <div className="text-white font-medium">
                        {token.token_symbol?.toUpperCase()}
                      </div>
                      <div className="text-gray-400 text-sm">
                        WOM Score: {token.wom_score}%
                      </div>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white rounded-lg font-medium transition-all transform hover:scale-105">
                    Select
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p>No tokens available for featuring.</p>
              <p className="text-sm mt-2">All tokens may already be featured or none loaded yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function App() {
  // Your existing states
  const [searchedToken, setSearchedToken] = useState(null);
  const [filteredTweets, setFilteredTweets] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showCharts, setShowCharts] = useState(true);

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

  // Load featured tokens from localStorage on startup
  useEffect(() => {
    const savedFeatured = localStorage.getItem('featuredTokens');
    if (savedFeatured) {
      try {
        const parsed = JSON.parse(savedFeatured);
        // Filter out expired ones
        const validFeatured = parsed.filter(ft => 
          ft.featured_until && new Date(ft.featured_until) > new Date()
        );
        setFeaturedTokens(validFeatured);
        
        // Save back the cleaned list if any were expired
        if (validFeatured.length !== parsed.length) {
          localStorage.setItem('featuredTokens', JSON.stringify(validFeatured));
        }
      } catch (error) {
        console.error('Error loading featured tokens:', error);
      }
    }
  }, []);

  // Save featured tokens to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('featuredTokens', JSON.stringify(featuredTokens));
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

  // andle the "Get Featured" button from header bar
  const handleGlobalFeaturedClick = () => {
    if (tokens.length > 0) {
      setShowGlobalFeaturedModal(true);
    } else {
      alert('No tokens available. Please wait for tokens to load.');
    }
  };

  // Handle adding a new featured token
  const handleAddFeaturedToken = (featuredToken) => {
    setFeaturedTokens(prev => {
      // Remove any existing featured entry for this token
      const filtered = prev.filter(ft => ft.token_symbol !== featuredToken.token_symbol);
      // Add the new one
      return [...filtered, featuredToken];
    });
  };

  // Handle successful payment from global modal
  const handleGlobalPaymentSuccess = (paymentData) => {
    handleAddFeaturedToken(paymentData.token);
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
      }, 100); // small delay to ensure DOM is rendered
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