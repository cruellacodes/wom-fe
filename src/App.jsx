import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import TokenInfoCard from "./components/TokenInfoCard";
import TweetScatterChart from "./components/TweetScatterChart";
import Leaderboard from "./components/LeaderBoard";
import Podium from "./components/Podium";
import RadarChart from "./components/RadarChart";
import PolarChart from "./components/PolarChart";
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
  const [tweets, setTweets] = useState([]); //Store all tweets globally
  const [displayedTokens, setDisplayedTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  //Fetch Tokens from the Backend
  const fetchTokenData = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/tokens");
      const data = await response.json();
      setTokens(data);
      setDisplayedTokens(data);

      const womToken = data.find((token) => token.Token === "WOM") || DEFAULT_WOM_TOKEN;
      setSearchedToken(womToken);

      setHasFetched(true);
      localStorage.setItem("tokens", JSON.stringify(data));
      console.log("Tokens fetched successfully.");
    } catch (error) {
      console.error("Error fetching token data:", error);
    }
    setLoading(false);
  };

  //Fetch Tweets for All Tokens
  const fetchTweetsForTokens = async () => {
    setLoading(true);
    try {
      console.log("Fetching tweets for tokens...");
      const tweetPromises = tokens.map(async (token) => {
        const response = await fetch(`http://127.0.0.1:8000/stored-tweets/?token=${token.Token}`);

        if (!response.ok) {
          console.error(`Failed to fetch tweets for ${token.Token}:`, response.statusText);
          return [];
        }

        const data = await response.json();
        return (data.tweets || []).map(tweet => ({
          ...tweet,
          token: token.Token, 
        }));
      });

      const allTweets = await Promise.all(tweetPromises);
      setTweets(allTweets.flat()); 
      console.log("Tweets fetched successfully.");
    } catch (error) {
      console.error("Error fetching tweets:", error);
    }
    setLoading(false);
  };

  //Load Tokens from Local Storage on First Render
  useEffect(() => {
    const storedTokens = localStorage.getItem("tokens");
    if (storedTokens) {
      setTokens(JSON.parse(storedTokens));
      setDisplayedTokens(JSON.parse(storedTokens));
      setHasFetched(true);
    }
  }, []);

  //Handle Token Selection
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

      {/*Podium & Polar Chart Section */}
      <div className="max-w-7xl mx-auto px-6 mt-12 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="w-full">
            <Podium tokens={topTokens} />
          </div>
          <div className="w-full">
            <PolarChart tokens={topTokensByWomScore}/>
          </div>
        </div>
      </div>

      {/*Search Bar & Fetch Buttons */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between my-6 px-6 gap-4">
        <button
          onClick={fetchTokenData}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-green-600 shadow-lg text-white font-semibold hover:bg-green-700 transition-all duration-300 hover:scale-105 active:scale-95"
        >
          {loading ? "Fetching Tokens..." : "Fetch Tokens"}
        </button>

        <button
          onClick={fetchTweetsForTokens}
          disabled={loading || !hasFetched}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-600 shadow-lg text-white font-semibold hover:bg-blue-700 transition-all duration-300 hover:scale-105 active:scale-95"
        >
          {loading ? "Fetching Tweets..." : "Fetch Tweets"}
        </button>

        <input
          type="text"
          placeholder="Search Tokens..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-1/3 px-4 py-3 rounded-lg bg-[#050A0A] border border-green-800/40 shadow-lg text-green-300 placeholder-green-500 outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/*Show Data Only After Tokens Are Fetched */}
      {hasFetched && (
        <div className="max-w-7xl mx-auto p-6 space-y-12">
          {/*Scatter Chart & Token Info Card */}
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
            <div className="lg:col-span-7">
              <TweetScatterChart 
                  searchedToken={searchedToken} 
                  tweets={tweets.filter(tweet => tweet.token === searchedToken.Token)}
                />
            </div>
            <div className="lg:col-span-3">
              <TokenInfoCard token={searchedToken} />
            </div>
          </div>

          {/*Leaderboard */}
          <div className="w-full">
            <Leaderboard 
              tokens={displayedTokens} 
              tweets={tweets}
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
