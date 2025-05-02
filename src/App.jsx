import React, { useState, useRef } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
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
import { getTopTokensByTweetCount, getTopTokensByWomScore } from "./utils";
import { useTokens } from "./hooks/useTokens";
import { useStoredTweets } from "./hooks/useTweets";
import { Toaster } from "react-hot-toast";
import { useMemo, useEffect } from "react";

function App() {
  const [searchedToken, setSearchedToken] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [freshTweets, setFreshTweets] = useState([]);
  const tokenInfoRef = useRef(null);
  const leaderboardRef = useRef(null);
  const tweetSentimentRef = useRef(null);

  const { tokens, loading, hasFetched } = useTokens(currentPage, setSearchedToken);
  const storedTweets = useStoredTweets(tokens);
  const [tweets, setTweets] = useState([]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(tokens.length / 20));
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [tokens.length, currentPage]);



  const handlePageChange = (page) => setCurrentPage(page);

  const handleTokenClick = (token) => {
    const tokenSymbol = (token.token_symbol || token.Token)?.toLowerCase();
    setSearchedToken(token);
    const relevantTweets = storedTweets.filter(t => t.token_symbol === tokenSymbol);
    setTweets(relevantTweets);
  };
  

  const topTweetTokens = getTopTokensByTweetCount(tokens, 3);
  const topWomTokens = getTopTokensByWomScore(tokens, 5);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="bg-[#010409] min-h-screen text-gray-300">
            <Header onScrollToLeaderboard={() => leaderboardRef.current?.scrollIntoView({ behavior: "smooth" })} />
            <div className="max-w-7xl mx-auto px-6 mt-8 mb-8 grid md:grid-cols-3 gap-4">
              <RadarChart tokens={topTweetTokens} />
              <Podium tokens={topTweetTokens} />
              <PolarChart tokens={topWomTokens} />
            </div>

            <div ref={tokenInfoRef} className="max-w-3xl mx-auto px-4 mb-4">
              <TokenSearch
                tokens={tokens}
                setSearchedToken={setSearchedToken}
                storedTweets={storedTweets}
                setFreshTweets={setFreshTweets}
              />
            </div>

            {searchedToken && (
              <div className="max-w-7xl mx-auto p-6 space-y-12">
                <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
                  <div className="lg:col-span-7 relative">
                  <TweetScatterChart
                    searchedToken={searchedToken}
                    tweets={tweets}
                  />

                  </div>
                  <div className="lg:col-span-3">
                    <TokenInfoCard token={searchedToken} />
                  </div>
                </div>

                <div ref={leaderboardRef}>
                  <Leaderboard
                    tokens={tokens}
                    tweets={storedTweets}
                    onTokenClick={handleTokenClick}
                    loading={loading}
                    page={currentPage}
                    onPageChange={handlePageChange}
                    setScrollToTweetSentimentAreaChart={tweetSentimentRef}
                  />
                </div>
              </div>
            )}
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
