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

function App() {
  const [searchedToken, setSearchedToken] = useState(null);
  const [filteredTweets, setFilteredTweets] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showCharts, setShowCharts] = useState(true);

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
            <Header
              onScrollToLeaderboard={() =>
                leaderboardRef.current?.scrollIntoView({ behavior: "smooth" })
              }
            />

            <ChartToggle
              show={showCharts}
              onToggle={() => setShowCharts((prev) => !prev)}
            />

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
              <Leaderboard
                tokens={tokens}
                tweets={tweets}
                onTokenClick={handleTokenClick}
                loading={loadingTokens || loadingTweets}
                page={currentPage}
                onPageChange={handlePageChange}
                setScrollToTweetSentimentAreaChart={tweetSentimentRef}
              />
            </div>

            <Footer />

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
