import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import TokenInfoCard from "./components/TokenInfoCard";
import TweetScatterChart from "./components/TweetScatterChart";
import Leaderboard from "./components/LeaderBoard";
import Podium from "./components/Podium";
import RadarChart from "./components/RadarChart"
import PolarChart from "./components/PolarChart"
import { getTopTokensByTweetCount, getTopTokensByWomScore } from "./utils";

// Default WOM token data
const DEFAULT_WOM_TOKEN = {
  Token: "WOM",
  WomScore: 85,
  MarketCap: 380000000000, // Example 380B
  Volume: 12000000000, // Example 12B
  MakerCount: 450,
  Liquidity: 5000000000, // Example 5B
  Age: "24h",
  chainIcon: "/assets/solana-icon.png",
};

function App() {
  const [searchedToken, setSearchedToken] = useState(DEFAULT_WOM_TOKEN);
  const [tokens, setTokens] = useState([]); 
  const [displayedTokens, setDisplayedTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch Data from Backend
  const fetchTokenData = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/tokens");
      const data = await response.json();
      setTokens(data);
      setDisplayedTokens(data);

      // Set WOM token if it's in the fetched data
      const womToken = data.find((token) => token.Token === "WOM") || DEFAULT_WOM_TOKEN;
      setSearchedToken(womToken);

      setHasFetched(true);
      localStorage.setItem("tokens", JSON.stringify(data)); 
    } catch (error) {
      console.error("Error fetching token data:", error);
    }
    setLoading(false);
  };

  // Load Data from Local Storage
  useEffect(() => {
    const storedTokens = localStorage.getItem("tokens");
    if (storedTokens) {
      setTokens(JSON.parse(storedTokens));
      setDisplayedTokens(JSON.parse(storedTokens));
      setHasFetched(true);
    }
  }, []);

  // Handle Token Click
  const handleTokenClick = (token) => {
    setSearchedToken(token);
  };

  const topTokens = getTopTokensByTweetCount(displayedTokens, 3);
  const topTokensByWomScore = getTopTokensByWomScore(displayedTokens, 5);

  useEffect(() => {
    if (!searchQuery) {
      setDisplayedTokens(tokens);
    } else {
      setDisplayedTokens(tokens.filter(token => 
        token.Token.toLowerCase().includes(searchQuery.toLowerCase())
      ));
    }
  }, [searchQuery, tokens]);


  return (
    <div className="bg-[#010409] min-h-screen text-gray-300">
      <Header />

      {/* ✅ Podium Section with 2 Charts (Row Layout) */}
      <div className="max-w-7xl mx-auto px-6 mt-12 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Chart (Bubble Chart) */}
          {/* <div className="w-full">
            <RadarChart tokens={topTokens}/>
          </div> */}

          {/* Center (Podium) */}
          <div className="w-full">
            <Podium tokens={topTokens} />
          </div>

          {/* Right Chart (Polar Chart) */}
          <div className="w-full">
            <PolarChart tokens={topTokensByWomScore}/>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between my-6 px-6 gap-4">
        {/* Fetch Data Button */}
        <button
          onClick={fetchTokenData}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-green-600 shadow-lg text-white font-semibold hover:bg-green-700 transition-all duration-300 hover:scale-105 active:scale-95"
        >
          {loading ? "Fetching Data..." : "Fetch Data"}
        </button>

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search Tokens..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-1/3 px-4 py-3 rounded-lg bg-[#050A0A] border border-green-800/40 shadow-lg text-green-300 placeholder-green-500 outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Show Content Only After Data is Fetched */}
      {hasFetched && (
        <div className="max-w-7xl mx-auto p-6 space-y-12">
          {/* Top Section - Line Chart and Token Info */}
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
            {/* Line Chart */}
            <div className="lg:col-span-7">
              <TweetScatterChart searchedToken={searchedToken} />
            </div>
            
            {/* Token Info Card */}
            <div className="lg:col-span-3">
              <TokenInfoCard token={searchedToken} />
            </div>
          </div>

          {/* Leaderboard */}
          <div className="w-full">
            <Leaderboard 
              tokens={displayedTokens} 
              onTokenClick={handleTokenClick}
              loading={loading} 
              fetchTokenData={fetchTokenData}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
