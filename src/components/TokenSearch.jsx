/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Search } from "lucide-react";
import debounce from "lodash.debounce";

const TokenSearch = ({ tokens = [], tweets = [], setSearchedToken, setFilteredTweets }) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const lowerQuery = query.toLowerCase();

  const matchedSuggestions = useMemo(() => {
    if (!lowerQuery) return [];
    return tokens
      .filter(({ token_symbol = "", token_name = "", address = "" }) =>
        token_symbol.toLowerCase().includes(lowerQuery) ||
        token_name.toLowerCase().includes(lowerQuery) ||
        address.toLowerCase() === lowerQuery
      )
      .slice(0, 5);
  }, [tokens, lowerQuery]);

  useEffect(() => {
    setSuggestions(matchedSuggestions);
    setSelectedIndex(0);
  }, [matchedSuggestions]);

  const fetchTokenFromBackend = async (input) => {
    const chainId = "solana";
    const tokenRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/search-token/${chainId}/${input}`);
    if (!tokenRes.ok) throw new Error("Token not found");
    const tokenData = await tokenRes.json();

    const tweetRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/tweets/${tokenData.symbol}`);
    const tweetData = await tweetRes.json();

    return {
      match: {
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
        wom_score: tweetData.wom_score || "Calculating...",
      },
      enrichedTweets: (tweetData.tweets || []).map((t) => ({ ...t, token_symbol: tokenData.symbol.toLowerCase() })),
    };
  };

  const handleSearch = useCallback(
    async (input = query) => {
      if (!input) return;
      setLoading(true);

      let match = tokens.find(
        (t) => t.token_symbol?.toLowerCase() === lowerQuery ||
               t.token_name?.toLowerCase() === lowerQuery ||
               t.address?.toLowerCase() === lowerQuery
      );

      if (match) {
        setFilteredTweets(tweets.filter((t) => t.token_symbol === match.token_symbol?.toLowerCase()));
      } else {
        try {
          const { match: fetchedToken, enrichedTweets } = await fetchTokenFromBackend(input);
          match = fetchedToken;
          setFilteredTweets(enrichedTweets);
        } catch (err) {
          console.error("Search API error:", err);
          alert("Token not found.");
          setLoading(false);
          return;
        }
      }

      setSearchedToken(match);
      setQuery("");
      setSuggestions([]);
      setLoading(false);
    },
    [query, tokens, tweets, lowerQuery, setSearchedToken, setFilteredTweets]
  );

  const debouncedInput = useCallback(debounce((val) => setQuery(val), 150), []);

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      handleSearch(suggestions[selectedIndex]?.token_symbol || query);
    }
  };

  const handleClear = () => {
    setQuery("");
    const fallback = tokens[0];
    setSearchedToken(fallback);
    setFilteredTweets(tweets.filter((t) => t.token_symbol === fallback.token_symbol?.toLowerCase()));
  };

  return (
    <div className="relative w-full z-50 font-mono group">
      <div className="relative">
        <input
          type="text"
          placeholder="> search $token or address"
          defaultValue={query}
          onChange={(e) => debouncedInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="terminal-placeholder w-full pl-12 pr-10 py-3 rounded-xl bg-black/30 border border-[#14f195]/30 focus:ring-2 focus:ring-[#14f195] backdrop-blur-md text-[#14f195] placeholder-[#14f195]/70 outline-none font-mono text-sm transition-all duration-200"
        />
        <Search size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#14f195] group-hover:animate-pulse" />
        {query && (
          <button onClick={handleClear} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#9945FF] hover:text-red-500 transition text-lg font-bold">
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
                selectedIndex === idx ? "bg-[#14f195]/20" : ""
              }`}
            >
              {token.token_symbol} <span className="text-xs text-[#9945FF]">({token.token_name})</span>
            </li>
          ))}
        </ul>
      )}

      {loading && <p className="text-xs text-[#14f195] mt-2 animate-pulse font-mono">fetching tweets...</p>}
    </div>
  );
};

export default TokenSearch;