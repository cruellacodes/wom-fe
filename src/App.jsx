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
  const [loadingTweets, setLoadingTweets] = useState(false);
  const [storedTweets, setStoredTweets] = useState([]);
  const [freshTweets, setFreshTweets] = useState([]);


  const tokenInfoRef = useRef(null);
  const leaderboardRef = useRef(null);

  const scrollToLeaderboard = () => {
    setTimeout(() => {
      leaderboardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };
  
  const [scrollToBubbleChart, setScrollToBubbleChart] = useState(() => () => {}); 

  useEffect(() => {
    localStorage.removeItem("tokens");
  }, []);


  // Function to fetch all tokens data (runs every 60s)
  const fetchAllTokensData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.BACKEND_URL}/tokens`);
      if (!response.ok) throw new Error("Failed to fetch tokens");

      const data = await response.json();
      console.log("Fetched Tokens:", data);

      if (Array.isArray(data) && data.length > 0) {
        setTokens(data);
        setDisplayedTokens(data);
        setHasFetched(true);
      } else {
        console.error("Invalid token data received:", data);
      }
    } catch (error) {
      console.error("Error fetching token data:", error);
    }
    setLoading(false);
  };

  // Fetch tokens every 60s except searched token
  useEffect(() => {
    fetchAllTokensData();
    const intervalId = setInterval(() => {
      fetchAllTokensData();
    }, 60000);
    return () => clearInterval(intervalId);
  }, []);


  useEffect(() => {
    if (tokens.length === 0) return;
  
    const fetchTweetsForTokens = async () => {
      setLoading(true);
      try {
        const tweetPromises = tokens.map(async (token) => {
          if (!token.Token) return [];
  
          const response = await fetch(`${process.env.BACKEND_URL}/stored-tweets/?token=${token.Token}`);
          const data = await response.json();
  
          return data.tweets?.map((tweet) => ({
            ...tweet,
            token: token.Token,
          })) || [];
        });
  
        const allTweets = await Promise.all(tweetPromises);
        setStoredTweets(allTweets.flat());
      } catch (error) {
        console.error("Error fetching tweets:", error);
        setStoredTweets([]);
      }
      setLoading(false);
    };
  
    fetchTweetsForTokens();
  }, [tokens]);    

  // Handle Token Click & Scroll to Token Info
  const handleTokenClick = (token) => {
    setLoadingTweets(false);
    setSearchQuery("");
    setSearchedToken(token);
    setTimeout(() => {
      tokenInfoRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };
  

  const handleSearch = async () => {
    if (!searchQuery) return;
  
    setLoading(true);
    try {
      const chainId = "solana";
      const response = await fetch(`${process.env.BACKEND_URL}/search-token/${chainId}/${searchQuery}`);
      if (!response.ok) throw new Error("Token not found or API error");
  
      const tokenData = await response.json();
      console.log("Fetched Token Data:", tokenData);
  
      // Show token info immediately with placeholder WOM score
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

      const tweetsResponse = await fetch(`${process.env.BACKEND_URL}/tweets/${tokenData.symbol}`);
      const freshTweetsData = await tweetsResponse.json();
      console.log("Fetched Fresh Tweets:", freshTweetsData);

      setSearchedToken(prev => ({
        ...prev,
        WomScore: freshTweetsData.wom_score || "N/A"
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

  return (
    <div className="bg-[#010409] min-h-screen text-gray-300">
      <Header 
        onScrollToLeaderboard={scrollToLeaderboard} 
        scrollToBubbleChart={scrollToBubbleChart} 
      />

      {/* Podium & Polar Chart Section */}
      <div className="max-w-7xl mx-auto px-6 mt-8 mb-8">
        <div className="flex flex-col md:flex-row gap-4"> 
          <div className="flex-1">
            <RadarChart tokens={topTokens} />
          </div>
          <div className="flex-1">
            <Podium tokens={topTokens} />
          </div>
          <div className="flex-1">
            <PolarChart tokens={topTokensByWomScore} />
          </div>
        </div>
      </div>


      {/* Search Bar */}
      <div ref={tokenInfoRef} id="token-info" className="w-full max-w-3xl mx-auto mb-4 px-4">
        <div className="relative">
        <input
          type="text"
          placeholder="Enter token address..."
          value={searchQuery}
          
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (e.target.value.trim() === "") {
              // Reset state if search is cleared
              setSearchedToken(DEFAULT_WOM_TOKEN);
              setHasFetched(true);
              const womTweets = tweets.filter(tweet => tweet.token === "WOM");
              setTweets(womTweets);
            }
          }}
          
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
          className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#0A0F0A] border border-green-800/30 
          shadow-sm text-green-300 placeholder-green-500 outline-none transition-all 
          focus:border-green-400 focus:ring-0"
        />

          {/* Search Icon */}
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500" />

          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSearchedToken(DEFAULT_WOM_TOKEN);
                setHasFetched(true);
                const womTweets = tweets.filter(tweet => tweet.token === "WOM");
                setTweets(womTweets);
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 text-sm hover:text-green-300"
            >
              ✕
            </button>
          )}
        </div>
      </div>


      {/* Show Data Only After Tokens Are Fetched */}
      {hasFetched && (
        <div className="max-w-7xl mx-auto p-6 space-y-12">
          
          {/* Scatter Chart & Token Info Card Section */}
          <div id="token-info" className="grid grid-cols-1 lg:grid-cols-10 gap-6">
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
                  ...storedTweets.filter(tweet => tweet.token === searchedToken.Token),
                  ...freshTweets.filter(tweet => tweet.token === searchedToken.Token)
                ]}
              />
            </div>

            <div className="lg:col-span-3">
              <TokenInfoCard token={searchedToken} />
            </div>
          </div>

          {/* Leaderboard */}
          <div ref={leaderboardRef} className="w-full">
            <Leaderboard 
              tokens={displayedTokens} 
              tweets={tweets}
              onTokenClick={handleTokenClick}
              loading={loading} 
              setScrollToBubbleChart={setScrollToBubbleChart}
            />
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}

export default App;
