import React, { useState } from "react";
import { Search } from "lucide-react";

const TokenSearch = ({ tokens, setSearchedToken, storedTweets, setFreshTweets }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingTweets, setLoadingTweets] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery) return;
    setLoadingTweets(true);
    try {
      const chainId = "solana";
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/search-token/${chainId}/${searchQuery}`);
      if (!res.ok) throw new Error("Token not found or API error");

      const tokenData = await res.json();

      const baseToken = {
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
      };

      setSearchedToken(baseToken);

      const tweetRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/tweets/${tokenData.symbol}`);
      const tweetData = await tweetRes.json();

      setSearchedToken((prev) => ({
        ...prev,
        WomScore: tweetData.wom_score || "N/A",
      }));

      const enriched = tweetData.tweets?.map((tweet) => ({
        ...tweet,
        token: tweetData.token,
        token_symbol: tweetData.token?.toLowerCase(),
      })) || [];

      setFreshTweets(enriched);
    } catch (err) {
      console.error("Search error:", err);
      alert("Token not found");
    }
    setLoadingTweets(false);
  };

  const handleClear = () => {
    setSearchQuery("");
    const defaultToken = tokens[0];
    setSearchedToken(defaultToken);
    const fallback = storedTweets.filter(
      (tweet) => tweet.token_symbol === defaultToken?.token_symbol?.toLowerCase()
    );
    setFreshTweets([]);
  };

  return (
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
          onClick={handleClear}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 text-sm hover:text-green-300 transition"
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
      {loadingTweets && (
        <p className="text-sm text-green-400 mt-2 animate-pulse">Analyzing tweets...</p>
      )}
    </div>
  );
};

export default TokenSearch;
