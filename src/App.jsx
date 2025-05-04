import { useState, useRef, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import React from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

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

import { useSupabaseSubscriptions } from "./hooks/useSupabaseSubscriptions";
import { getTopTokensByTweetCount, getTopTokensByWomScore } from "./utils";
import { Toaster } from "react-hot-toast";

function App() {
  const [searchedToken, setSearchedToken] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredTweets, setFilteredTweets] = useState([]);

  const tokenInfoRef = useRef(null);
  const leaderboardRef = useRef(null);
  const tweetSentimentRef = useRef(null);

  const { tokens, tweets, loading } = useSupabaseSubscriptions();

  const nowUtc = dayjs.utc();
  const tweetsLast24h = tweets.filter((t) =>
    dayjs.utc(t.created_at).isAfter(nowUtc.subtract(24, "hour"))
  );

  const topTweetTokens = getTopTokensByTweetCount(tokens, 3, tweets, 24); //last 24h
  const topWomTokens = getTopTokensByWomScore(tokens, 5);

  useEffect(() => {
    if (!searchedToken && tokens.length > 0 && tweets.length > 0) {
      const tokenWithTweets = tokens.find((token) =>
        tweets.some(
          (t) => t.token_symbol?.toLowerCase() === token.token_symbol?.toLowerCase()
        )
      );
      if (tokenWithTweets) {
        const tokenSymbol = tokenWithTweets.token_symbol.toLowerCase();
        const relevant = tweets.filter(
          (t) => t.token_symbol?.toLowerCase() === tokenSymbol
        );
        setSearchedToken(tokenWithTweets);
        setFilteredTweets(relevant);
      }
    }
  }, [searchedToken, tokens, tweets]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(tokens.length / 20));
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [tokens.length, currentPage]);

  const handleTokenClick = (token) => {
    const clickedSymbol = token.token_symbol?.trim().toLowerCase();
    const relevantTweets = tweets.filter(
      (t) => t.token_symbol?.trim().toLowerCase() === clickedSymbol
    );
    setSearchedToken(token);
    setFilteredTweets(relevantTweets);
  };

  const handlePageChange = (page) => setCurrentPage(page);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#010409] flex items-center justify-center text-green-400 text-lg">
        Loading dashboard...
      </div>
    );
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

            <div className="max-w-7xl mx-auto px-6 mt-8 mb-8 grid md:grid-cols-3 gap-4">
              <RadarChart
                tokens={topTweetTokens}
                tweets={tweetsLast24h.filter((t) =>
                  topTweetTokens.some(
                    (token) => token.token_symbol?.toLowerCase() === t.token_symbol?.toLowerCase()
                  )
                )}
              />
              <Podium tokens={topTweetTokens} />
              <PolarChart tokens={topWomTokens} />
            </div>

            <div ref={tokenInfoRef} className="max-w-3xl mx-auto px-4 mb-4">
              <TokenSearch
                tokens={tokens}
                setSearchedToken={handleTokenClick}
                storedTweets={tweets}
              />
            </div>

            {searchedToken && (
              <div className="max-w-7xl mx-auto p-6 space-y-12">
                <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
                  <div className="lg:col-span-7 relative">
                    <TweetScatterChart
                      searchedToken={searchedToken}
                      tweets={filteredTweets}
                    />
                  </div>
                  <div className="lg:col-span-3">
                    <TokenInfoCard token={searchedToken} />
                  </div>
                </div>
              </div>
            )}

            <div ref={leaderboardRef} className="max-w-7xl mx-auto px-6 mt-8 mb-8">
              <Leaderboard
                tokens={tokens}
                tweets={tweets}
                onTokenClick={handleTokenClick}
                loading={loading}
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
    </Routes>
  );
}

export default App;