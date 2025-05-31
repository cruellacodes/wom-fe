/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, useMemo, useRef } from "react";
import { Search } from "lucide-react";
import solanaIcon from "../assets/solana.png";

const TokenSearch = ({
  tokens = [],
  tweets = [],
  setSearchedToken,
  setFilteredTweets,
  setIsFetchingTweets,
  setIsAnalyzingSentiment,
  fetchIdRef,
  setIsTokenInfoLoading
}) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [waitingForAddress, setWaitingForAddress] = useState(false);
  const [lastSymbolAttempt, setLastSymbolAttempt] = useState("");

  const suggestionRefs = useRef([]);
  const lowerQuery = query.toLowerCase();

  const isProbablyAddress = (input) => input.length >= 30;

  const resetUI = () => {
    setQuery("");
    setSuggestions([]);
    setWaitingForAddress(false);
    setLastSymbolAttempt("");
  };

  const matchedSuggestions = useMemo(() => {
    if (!lowerQuery) return [];
    return tokens
      .filter(({ token_symbol = "", token_name = "", address = "" }) =>
        token_symbol.toLowerCase().includes(lowerQuery) ||
        token_name.toLowerCase().includes(lowerQuery) ||
        address.toLowerCase() === lowerQuery
      )
      .slice(0, 20);
  }, [tokens, lowerQuery]);

  useEffect(() => {
    setSuggestions(matchedSuggestions);
    setSelectedIndex(0);
  }, [matchedSuggestions]);

  useEffect(() => {
    if (query.trim() === "") {
      setWaitingForAddress(false);
      setLastSymbolAttempt("");
    }
  }, [query]);

  useEffect(() => {
    const el = suggestionRefs.current[selectedIndex];
    if (el) {
      el.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [selectedIndex]);

  const fetchTokenInfo = async (input) => {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/search-token/${input}`);
    if (!res.ok) throw new Error("Token not found");
    return await res.json();
  };

  const fetchTweetsForToken = async (symbol) => {
    const token_symbol = symbol.replace(/^\$/, "").toLowerCase();
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/tweets/${token_symbol}`);
    if (!res.ok) throw new Error("Tweet fetch failed");

    const tweetData = await res.json();

    return {
      tweets: (tweetData.tweets || []).map((t) => ({
        ...t,
        token_symbol: `$${token_symbol}`, // Force $ prefix
      })),
      wom_score: tweetData.wom_score ?? 1.0,
    };
  };

  const handleSearch = async (input = query) => {
    if (!input) return;

    const lowerInput = input.toLowerCase();

    const match = tokens.find(
      (t) =>
        t.token_symbol?.toLowerCase() === lowerInput ||
        t.token_name?.toLowerCase() === lowerInput ||
        t.address?.toLowerCase() === lowerInput
    );

    if (match) {
      setSearchedToken(match);
      setFilteredTweets([]);
      setFilteredTweets(
        tweets.filter(
          (t) => t.token_symbol?.toLowerCase() === match.token_symbol?.toLowerCase()
        )
      );
      resetUI();
      return;
    }

    if (isProbablyAddress(lowerInput)) {
      const currentId = ++fetchIdRef.current;
    
      try {
        setIsFetchingTweets(true);
        setIsAnalyzingSentiment(true);
    
        setIsTokenInfoLoading(true);
        const tokenData = await fetchTokenInfo(lowerInput);
    
        if (fetchIdRef.current !== currentId) return;
    
        const tokenSymbolWithDollar = `$${tokenData.symbol.toLowerCase()}`;
    
        const fetchedToken = {
          token_symbol: tokenSymbolWithDollar,
          token_name: tokenData.token_name,
          address: tokenData.address,
          age: tokenData.age || "N/A",
          market_cap_usd: tokenData.marketCap || 0,
          volume_usd: tokenData.volume24h || 0,
          liquidity_usd: tokenData.liquidity || 0,
          priceUsd: tokenData.priceUsd || "N/A",
          dex_url: tokenData.dexUrl || "#",
          pricechange1h: tokenData.priceChange1h || 0,
          image_url: tokenData.imageUrl || solanaIcon,
          wom_score: "Calculating...",
        };
    
        if (fetchIdRef.current !== currentId) return;
        setSearchedToken(fetchedToken);
        setIsTokenInfoLoading(false);
    
        const tweetData = await fetchTweetsForToken(tokenData.symbol);
    
        if (fetchIdRef.current !== currentId) return;
    
        const enrichedTweets = tweetData.tweets.map((t) => ({
          ...t,
          token_symbol: tokenSymbolWithDollar,
        }));
    
        setFilteredTweets([]);
        setFilteredTweets(enrichedTweets);
    
        if (fetchIdRef.current !== currentId) return;
        setSearchedToken((prev) => ({
          ...prev,
          wom_score: tweetData.wom_score ?? "N/A",
        }));
      } catch (err) {
        if (fetchIdRef.current === currentId) {
          console.error("Backend fetch failed:", err);
          setSuggestions([]);
          setWaitingForAddress(false);
          setLastSymbolAttempt("");
        }
      } finally {
        if (fetchIdRef.current === currentId) {
          setIsFetchingTweets(false);
          setIsAnalyzingSentiment(false);
          setQuery("");
          setSuggestions([]);
        }
      }
      return
    }
    

    setLastSymbolAttempt(input);
    setWaitingForAddress(true);
    setSuggestions([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (suggestions.length > 0) {
        handleSearch(suggestions[selectedIndex].token_symbol);
      } else {
        handleSearch(query.trim());
      }
    }
  };

  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    setWaitingForAddress(false);
    setLastSymbolAttempt("");
  
    fetchIdRef.current++; 
    setIsFetchingTweets(false);       
    setIsAnalyzingSentiment(false);
  
    const fallback = tokens[0];
    setSearchedToken(fallback);
    setFilteredTweets(
      tweets.filter(
        (t) => t.token_symbol?.toLowerCase() === fallback.token_symbol?.toLowerCase()
      )
    );
  };
  

  return (
    <div className="relative w-full z-50 font-mono group">
      {/* Input Wrapper */}
      <div className="relative shadow-md">
        <input
          type="text"
          placeholder="> search $token or address"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full pl-12 pr-12 py-3 rounded-full bg-[#0A0F0A]/80 border border-[#14f195]/20 text-sm text-[#14f195] placeholder-[#14f195]/50 focus:outline-none focus:ring-2 focus:ring-[#14f195] backdrop-blur-md transition-all duration-200"
        />
  
        {/* Search Icon */}
        <Search
          size={18}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#14f195]/80 group-hover:animate-pulse"
        />
  
        {/* Clear (X) */}
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#14f195]/70 hover:text-red-400 transition text-lg font-bold"
          >
            ×
          </button>
        )}
      </div>
  
      {/* Suggestions Dropdown */}
      {suggestions.length > 0 && (
        <ul className="absolute w-full mt-2 max-h-64 overflow-y-auto bg-[#0A0F0A]/90 border border-[#14f195]/10 rounded-2xl shadow-lg backdrop-blur-md text-[#14f195] z-50">
          {suggestions.map((token, idx) => (
            <li
              key={token.address}
              ref={(el) => (suggestionRefs.current[idx] = el)}
              onClick={() => handleSearch(token.token_symbol)}
              className={`cursor-pointer px-4 py-2 text-sm transition-all duration-150 flex items-center gap-3 hover:bg-[#14f195]/10 ${
                selectedIndex === idx ? "bg-[#14f195]/20" : ""
              }`}
            >
              <img
                src={token.image_url || solanaIcon}
                alt={token.token_symbol}
                className="w-5 h-5 rounded-full object-cover border border-green-800"
              />
              <span className="truncate">
                {token.token_symbol}
                <span className="text-xs text-[#9945FF] ml-2">({token.token_name})</span>
              </span>
            </li>
          ))}
        </ul>
      )}
  
      {/* Fallback Prompt */}
      {waitingForAddress && (
        <p className="text-xs text-yellow-400 mt-2 font-mono">
          Couldn&apos;t find <span className="font-bold">${lastSymbolAttempt}</span>. Try pasting its token address.
        </p>
      )}
    </div>
  );
  
};

export default TokenSearch;
