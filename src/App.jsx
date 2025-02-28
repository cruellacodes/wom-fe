import React, { useState, useEffect, useRef } from "react";
import Header from "./components/Header";
import TokenInfoCard from "./components/TokenInfoCard";
import TweetScatterChart from "./components/TweetScatterChart";
import Leaderboard from "./components/LeaderBoard";
import Podium from "./components/Podium";
import RadarChart from "./components/RadarChart";
import PolarChart from "./components/PolarChart";
import Footer from "./components/Footer";
import { getTopTokensByTweetCount, getTopTokensByWomScore } from "./utils";

const DEFAULT_WOM_TOKEN = {
  Token: "WOM",
  WomScore: 85,
  MarketCap: 380000000000,
  Volume: 12000000000,
  MakerCount: 450,
  Liquidity: 5000000000,
  Age: "24h",
  chainIcon: "/assets/solana-icon.png",
};

function App() {
  const [searchedToken, setSearchedToken] = useState(DEFAULT_WOM_TOKEN);
  const [tokens, setTokens] = useState([]);
  const [tweets, setTweets] = useState([]);
  const [displayedTokens, setDisplayedTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const tokenInfoRef = useRef(null);

  useEffect(() => {
    localStorage.removeItem("tokens");
  }, []);

  // Fetch Tokens from Backend
  const fetchTokenData = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/tokens");
      if (!response.ok) throw new Error("Failed to fetch tokens");

      const data = await response.json();
      console.log("Fetched Tokens:", data);

      if (Array.isArray(data) && data.length > 0) {
        setTokens(data);
        setDisplayedTokens(data);

        const womToken = data.find((token) => token.Token === "WOM") || DEFAULT_WOM_TOKEN;
        setSearchedToken(womToken);
        setHasFetched(true);
      } else {
        console.error("Invalid token data received:", data);
      }
    } catch (error) {
      console.error("Error fetching token data:", error);
    }
    setLoading(false);
  };

  // Fetch Tweets for Tokens (Runs only if tokens exist)
  useEffect(() => {
    if (tokens.length === 0) return;

    const fetchTweetsForTokens = async () => {
      setLoading(true);
      try {
        console.log("Fetching tweets for tokens...");
        const tweetPromises = tokens.map(async (token) => {
          if (!token.Token) return [];
          const response = await fetch(`http://127.0.0.1:8000/stored-tweets/?token=${token.Token}`);
          if (!response.ok) {
            console.error(`Failed to fetch tweets for ${token.Token}:`, response.statusText);
            return [];
          }
          const data = await response.json();
          return (data.tweets || []).map((tweet) => ({ ...tweet, token: token.Token }));
        });

        const allTweets = await Promise.all(tweetPromises);
        setTweets(allTweets.flat());
        console.log("Tweets fetched successfully.");
      } catch (error) {
        console.error("Error fetching tweets:", error);
      }
      setLoading(false);
    };

    fetchTweetsForTokens();
  }, [tokens]);

  // Auto-fetch tokens every 60 seconds
  useEffect(() => {
    fetchTokenData();
    const intervalId = setInterval(() => {
      fetchTokenData();
    }, 60000);
    return () => clearInterval(intervalId);
  }, []);

  // Handle Token Click & Scroll to Token Info
  const handleTokenClick = (token) => {
    setSearchedToken(token);
    
    window.location.hash = "#token-info";

    // Smoothly scroll to the TokenInfo section
    setTimeout(() => {
      tokenInfoRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  // Handle Search Filtering
  useEffect(() => {
    if (!searchQuery) {
      setDisplayedTokens(tokens);
    } else {
      setDisplayedTokens(
        tokens.filter((token) => token.Token && token.Token.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
  }, [searchQuery, tokens]);

  const topTokens = getTopTokensByTweetCount(displayedTokens, 3);
  const topTokensByWomScore = getTopTokensByWomScore(displayedTokens, 5);

  return (
    <div className="bg-[#010409] min-h-screen text-gray-300">
      <Header />

      {/* Podium & Polar Chart Section */}
      <div className="max-w-7xl mx-auto px-6 mt-12 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="w-full">
            <RadarChart tokens={topTokens} />
          </div>
          <div className="w-full">
            <Podium tokens={topTokens} />
          </div>
          <div className="w-full">
            <PolarChart tokens={topTokensByWomScore} />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto my-6 px-6 gap-4 flex flex-col" ref={tokenInfoRef}>
        <div className="mt-4 ">
          <input
            type="text"
            placeholder="Search Tokens..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-[#050A0A] border border-green-800/40 shadow-lg text-green-300 placeholder-green-500 outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Show Data Only After Tokens Are Fetched */}
      {hasFetched && (
        <div className="max-w-7xl mx-auto p-6 space-y-12">
          
          {/* Scatter Chart & Token Info Card Section */}
          <div id="token-info" className="grid grid-cols-1 lg:grid-cols-10 gap-6">
            <div className="lg:col-span-7">
              <TweetScatterChart 
                searchedToken={searchedToken} 
                tweets={tweets.filter((tweet) => tweet.token === searchedToken.Token)}
              />
            </div>
            <div className="lg:col-span-3">
              <TokenInfoCard token={searchedToken} />
            </div>
          </div>

          {/* Leaderboard */}
          <div className="w-full">
            <Leaderboard 
              tokens={displayedTokens} 
              tweets={tweets}
              onTokenClick={handleTokenClick}
              loading={loading} 
            />
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}

export default App;
