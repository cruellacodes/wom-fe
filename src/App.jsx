import React, { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import Header from "./components/Header";
import TokenInfoCard from "./components/TokenInfoCard";
import TweetScatterChart from "./components/TweetScatterChart";
import Leaderboard from "./components/LeaderBoard";
import Podium from "./components/Podium";
import RadarChart from "./components/RadarChart";
import PolarChart from "./components/PolarChart";
import Footer from "./components/Footer";
import { getTopTokensByTweetCount, getTopTokensByWomScore, sortTokens } from "./utils";
import { Routes, Route, useLocation } from "react-router-dom";
import About from "./components/About";
import TwitterScan from "./components/TwitterScan";

function App() {
  const [initialLoading, setInitialLoading] = useState(true); 
  const [searchedToken, setSearchedToken] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [tweets, setTweets] = useState([]);
  const [displayedTokens, setDisplayedTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingTweets, setLoadingTweets] = useState(false);
  const [storedTweets, setStoredTweets] = useState([]);
  const [freshTweets, setFreshTweets] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const tokenInfoRef = useRef(null);
  const leaderboardRef = useRef(null);
  const tweetSentimentRef = useRef(null);

  const scrollToLeaderboard = () => {
    setTimeout(() => {
      leaderboardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const [, setScrollToTweetSentimentAreaChart] = useState(() => () => {});
  const location = useLocation();

  useEffect(() => {
    localStorage.removeItem("tokens");
  }, []);

  useEffect(() => {
    if (location.pathname === "/" && location.state?.scrollTo) {
      const target = location.state.scrollTo;
      setTimeout(() => {
        if (target === "leaderboard") {
          leaderboardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        } else if (target === "sentiment") {
          tweetSentimentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  }, [location]);

  const fetchAllTokensData = async (page = 1) => {
    setLoading(true);
    try {
      const limit = 20;
      const onlyActive = true;
      const query = `page=${page}&limit=${limit}&only_active=${onlyActive}`;
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/tokens?${query}`);
      if (!response.ok) throw new Error("Failed to fetch tokens");

      const data = await response.json();
      if (Array.isArray(data.tokens) && data.tokens.length > 0) {
        setTokens(data.tokens);
        setDisplayedTokens(data.tokens);
        setHasFetched(true);
      
        const sorted = sortTokens(data.tokens, "wom_score", -1); 
        handleTokenClick(sorted[0]); 
      }
    } catch (error) {
      console.error("Error fetching token data:", error);
    }
    setLoading(false);
  };

  const fetchTweetsForTokens = async () => {
    if (tokens.length === 0) return;
    setLoading(true);
    try {
      const tweetPromises = tokens.map(async (token) => {
        const symbol = encodeURIComponent((token.token_symbol || token.Token)?.toLowerCase());
        if (!symbol) return [];

        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/stored-tweets/?token_symbol=${symbol}`
        );
        const data = await response.json();

        return Array.isArray(data.tweets)
          ? data.tweets.map((tweet) => ({
              ...tweet,
              token_symbol: decodeURIComponent(symbol).toLowerCase(),
            }))
          : [];
      });

      const allTweets = await Promise.all(tweetPromises);
      setStoredTweets(allTweets.flat());
    } catch (error) {
      console.error("Error fetching tweets:", error);
      setStoredTweets([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchAllTokensData(currentPage);
      setInitialLoading(false); 
    };
    loadData();
  }, [currentPage]);

  useEffect(() => {
    fetchTweetsForTokens();
  }, [tokens]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleTokenClick = (token) => {
    setSearchQuery("");
    setSearchedToken(token);
    setHasFetched(true);

    const tokenSymbol = token.token_symbol || token.Token;
    const tokenLower = tokenSymbol?.toLowerCase();

    const relevantStoredTweets = storedTweets.filter(
      (tweet) => tweet.token_symbol === tokenLower
    );

    setTweets(relevantStoredTweets);

    setTimeout(() => {
      tokenInfoRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleSearch = async () => {
    if (!searchQuery) return;
    setLoading(true);
    try {
      const chainId = "solana";
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/search-token/${chainId}/${searchQuery}`);
      if (!response.ok) throw new Error("Token not found or API error");

      const tokenData = await response.json();
      setSearchedToken({
        Token: tokenData.symbol,
        Age: tokenData.ageHours || "N/A",
        MarketCap: tokenData.marketCap || 0,
        Volume: tokenData.volume24h || 0,
        Liquidity: tokenData.liquidity || 0,
        priceUsd: tokenData.priceUsd || "N/A",
        dex_url: tokenData.dexUrl || "#",
        chainIcon: "/assets/solana-icon.png",
        priceChange1h: tokenData.priceChange1h || 0,
        WomScore: "Calculating...",
      });
      setHasFetched(true);
      setLoadingTweets(true);

      const tweetsResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/tweets/${tokenData.symbol}`);
      const freshTweetsData = await tweetsResponse.json();

      setSearchedToken((prev) => ({
        ...prev,
        WomScore: freshTweetsData.wom_score || "N/A",
      }));

      if (freshTweetsData && freshTweetsData.tweets) {
        const enrichedTweets = freshTweetsData.tweets.map((tweet) => ({
          ...tweet,
          token: freshTweetsData.token,
        }));
        setFreshTweets(enrichedTweets);
      } else {
        setTweets([]);
      }
      setLoadingTweets(false);
    } catch (error) {
      console.error("Error fetching token:", error);
      alert("Token not found");
      setLoading(false);
      setLoadingTweets(false);
    }
    setLoading(false);
  };

  const topTokens = getTopTokensByTweetCount(displayedTokens, 3);
  const topTokensByWomScore = getTopTokensByWomScore(displayedTokens, 5);

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#010409] text-green-300">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-green-400 border-dashed rounded-full animate-spin"></div>
          <p className="mt-3 text-sm animate-pulse">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="bg-[#010409] min-h-screen text-gray-300 transition-opacity duration-700 ease-in opacity-100">
            <Header onScrollToLeaderboard={scrollToLeaderboard} scrollToTweetSentimentAreaChart={setScrollToTweetSentimentAreaChart} />
            
            {/* Token Leaderboard Charts */}
            <div className="max-w-7xl mx-auto px-6 mt-8 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="col-span-1">
                  <RadarChart tokens={topTokens} />
                </div>
                <div className="col-span-1">
                  <Podium tokens={topTokens} />
                </div>
                <div className="col-span-1">
                  <PolarChart tokens={topTokensByWomScore} />
                </div>
              </div>
            </div>

            <div ref={tokenInfoRef} className="w-full max-w-3xl mx-auto mb-4 px-4">
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Enter token address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-gradient-to-br from-green-800/20 to-green-900/10 border border-green-700/30 shadow-md backdrop-blur-sm text-green-300 placeholder-green-500 outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500"
                />
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500 pointer-events-none" />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      const firstToken = tokens[0] || null;
                      setSearchedToken(firstToken);
                      setHasFetched(true);
                      const defaultTweets = storedTweets.filter(
                        (tweet) => tweet.token_symbol === firstToken?.token_symbol?.toLowerCase()
                      );                      
                      setTweets(defaultTweets);
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 text-sm hover:text-green-300 transition"
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
            {hasFetched && searchedToken && (
              <div className="max-w-7xl mx-auto p-6 space-y-12">
                <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
                  <div className="lg:col-span-7 relative">
                    {loadingTweets && (
                      <div className="absolute inset-0 z-10 bg-[#0A0F0A]/90 flex items-center justify-center rounded-lg">
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 border-4 border-green-400 border-dashed rounded-full animate-spin"></div>
                          <p className="text-green-300 text-sm mt-2 animate-pulse">Analyzing tweets...</p>
                        </div>
                      </div>
                    )}
                    <TweetScatterChart
                      searchedToken={searchedToken}
                      tweets={[
                        ...storedTweets.filter(
                          (tweet) =>
                            tweet.token_symbol === (searchedToken.token_symbol || searchedToken.Token)?.toLowerCase()
                        ),
                        ...freshTweets.filter(
                          (tweet) =>
                            tweet.token_symbol === (searchedToken.token_symbol || searchedToken.Token)?.toLowerCase()
                        ),
                      ]}
                    />
                  </div>
                  <div className="lg:col-span-3">
                    <TokenInfoCard token={searchedToken} />
                  </div>
                </div>
                <div ref={leaderboardRef} className="w-full">
                  <Leaderboard
                    tokens={displayedTokens}
                    tweets={storedTweets}
                    onTokenClick={handleTokenClick}
                    loading={loading}
                    setScrollToTweetSentimentAreaChart={tweetSentimentRef}
                    page={currentPage}
                    onPageChange={handlePageChange}
                  />
                </div>
              </div>
            )}
            <Footer />
          </div>
        }
      />
      <Route path="/about" element={<About />} />
      <Route path="/twitterscan" element={<TwitterScan />} />
    </Routes>
  );
}

export default App;
