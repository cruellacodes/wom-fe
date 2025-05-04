/* eslint-disable react/prop-types */
// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";

const TokenSearch = ({
  tokens = [],
  tweets = [],
  setSearchedToken,
  setFilteredTweets,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingTweets, setLoadingTweets] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered =
      query.length > 0
        ? tokens.filter((t) =>
            [t.token_symbol, t.token_name, t.address]
              .filter(Boolean)
              .some((v) => v.toLowerCase().includes(query))
          )
        : [];
    setSuggestions(filtered.slice(0, 5));
    setSelectedIndex(0);
  }, [searchQuery, tokens]);

  const handleSearch = async (input = searchQuery) => {
    if (!input) return;

    const query = input.toLowerCase();
    setLoadingTweets(true);

    let match = tokens.find(
      (token) =>
        token.token_symbol?.toLowerCase() === query ||
        token.token_name?.toLowerCase() === query ||
        token.address?.toLowerCase() === query
    );

    if (!match) {
      try {
        const chainId = "solana";
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/search-token/${chainId}/${input}`
        );
        if (!res.ok) throw new Error("Token not found");

        const tokenData = await res.json();

        match = {
          token_symbol: tokenData.symbol,
          token_name: tokenData.name,
          address: tokenData.address,
          age_hours: tokenData.ageHours || "N/A",
          market_cap_usd: tokenData.marketCap || 0,
          volume_usd: tokenData.volume24h || 0,
          liquidity_usd: tokenData.liquidity || 0,
          priceUsd: tokenData.priceUsd || "N/A",
          dex_url: tokenData.dexUrl || "#",
          pricechange1h: tokenData.priceChange1h || 0,
          wom_score: "Calculating...",
        };

        const tweetRes = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/tweets/${tokenData.symbol}`
        );
        const tweetData = await tweetRes.json();

        match.wom_score = tweetData.wom_score || "N/A";

        const enrichedTweets =
          tweetData.tweets?.map((tweet) => ({
            ...tweet,
            token_symbol: tokenData.symbol.toLowerCase(),
          })) || [];

        setFilteredTweets(enrichedTweets);
      } catch (err) {
        console.error("API fallback failed:", err);
        alert("Token not found.");
        setLoadingTweets(false);
        return;
      }
    } else {
      const relevantTweets = tweets.filter(
        (tweet) => tweet.token_symbol === match.token_symbol?.toLowerCase()
      );
      setFilteredTweets(relevantTweets);
    }

    setSearchedToken(match);
    setSearchQuery("");
    setSuggestions([]);
    setLoadingTweets(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter") {
      if (suggestions.length > 0) {
        handleSearch(suggestions[selectedIndex].token_symbol);
      } else {
        handleSearch();
      }
    }
  };

  const handleClear = () => {
    setSearchQuery("");
    setSuggestions([]);
    const fallback = tokens[0];
    setSearchedToken(fallback);
    const relevantTweets = tweets.filter(
      (tweet) => tweet.token_symbol === fallback.token_symbol?.toLowerCase()
    );
    setFilteredTweets(relevantTweets);
  };

  return (
    <div className="relative w-full group font-mono z-50">
      <style>
        {`
        .terminal-placeholder::placeholder {
          font-family: monospace;
          color: #14f195b0;
        }

        .terminal-placeholder::after {
          content: '|';
          animation: blink 1s infinite;
          color: #14f195;
          margin-left: 2px;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}
      </style>

      <div className="relative">
        <input
          type="text"
          placeholder="> search $token or address"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="terminal-placeholder w-full pl-12 pr-10 py-3 rounded-xl bg-black/30 border border-[#14f195]/30 focus:ring-2 focus:ring-[#14f195] backdrop-blur-md text-[#14f195] placeholder-[#14f195]/70 outline-none font-mono text-sm transition-all duration-200 hover:shadow-[0_0_12px_rgba(20,241,149,0.3)] focus:shadow-[0_0_20px_rgba(20,241,149,0.6)]"
        />
        <Search
          size={18}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#14f195] group-hover:animate-pulse"
        />
        {searchQuery && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#9945FF] hover:text-red-500 transition-all duration-150 text-lg font-bold"
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>

      {suggestions.length > 0 && (
        <ul className="absolute w-full bg-black/80 border border-[#14f195]/20 rounded-xl mt-2 max-h-60 overflow-y-auto backdrop-blur-md text-[#14f195] z-50 shadow-lg">
          {suggestions.map((token, idx) => (
            <li
              key={token.address}
              onClick={() => handleSearch(token.token_symbol)}
              className={`cursor-pointer px-4 py-2 text-sm transition hover:bg-[#14f195]/10 ${
                selectedIndex === idx
                  ? "bg-[#14f195]/20 text-[#14f195]"
                  : "bg-transparent"
              }`}
            >
              {token.token_symbol}{" "}
              <span className="text-xs text-[#9945FF]">
                ({token.token_name})
              </span>
            </li>
          ))}
        </ul>
      )}

      {loadingTweets && (
        <p className="text-xs text-[#14f195] mt-2 animate-pulse font-mono">
          fetching tweets...
        </p>
      )}
    </div>
  );
};

export default TokenSearch;
