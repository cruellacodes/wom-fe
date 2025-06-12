/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/solid";
import solanaIcon from "../assets/solana.png";
import TokenSentimentChart from "./TokenSentimentChart";
import { AiOutlineLineChart } from "react-icons/ai";
import { FaCopy } from "react-icons/fa";

const PAGE_SIZE = 20;

const Leaderboard = React.memo(
  ({
    tokens = [],
    tweets = [],
    onTokenClick,
    setScrollTokenSentimentChart,
    page,
    onPageChange,
  }) => {
    const [sortBy, setSortBy] = useState("wom_score");
    const [sortOrder, setSortOrder] = useState(-1);
    const [searchQuery, setSearchQuery] = useState("");
    const [ageFilter, setAgeFilter] = useState("All");
    const [categoryFilter, setCategoryFilter] = useState("Trending");
    const [showCopyNotification, setShowCopyNotification] = useState(false);
    const TokenSentimentChartRef = useRef(null);

    const formatLaunchpadLabel = (value) => {
      const map = {
        pumpfun: "pump.fun",
        bonk: "bonk",
        boop: "boop",
        believe: "believe",
      };
      return map[value.toLowerCase()] || value;
    };

    // Function to extract token address from dex_url
    const extractTokenAddress = (dexUrl) => {
      if (!dexUrl) return null;
      // Extract address from URL like https://axiom.trade/t/4zDvBs8TYrp1Srdh7zWAj6BTUqiHPArEDbrPCK39vBLV/@wom
      const match = dexUrl.match(/\/t\/([A-Za-z0-9]+)/);
      return match ? match[1] : null;
    };

    // Function to copy token address to clipboard
    const copyTokenAddress = async (token, e) => {
      e.stopPropagation();
      const tokenAddress = extractTokenAddress(token.dex_url);
      
      if (!tokenAddress) {
        console.error('No token address found');
        return;
      }

      try {
        await navigator.clipboard.writeText(tokenAddress);
        setShowCopyNotification(true);
        
        // Hide notification after 3 seconds
        setTimeout(() => {
          setShowCopyNotification(false);
        }, 3000);
      } catch (err) {
        console.error('Failed to copy token address:', err);
      }
    };
    
    useEffect(() => {
      if (setScrollTokenSentimentChart) {
        setScrollTokenSentimentChart(() =>
          TokenSentimentChartRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
        );
      }
    }, [setScrollTokenSentimentChart]);

    const handleSort = useCallback((key) => {
      setSortBy((prev) => (prev === key ? prev : key));
      setSortOrder((prev) => (sortBy === key ? prev * -1 : -1));
    }, [sortBy]);

    const getBatteryColor = (score) => {
      if (score >= 49) return "bg-green-500 shadow-green-500/40";
      if (score >= 25) return "bg-yellow-400 shadow-yellow-400/40";
      return "bg-red-500 shadow-red-500/40";
    };    

    const safeFormatNumber = (num) => {
      if (typeof num !== "number" || isNaN(num)) return "—";
      if (num >= 1e9) return (num / 1e9).toFixed(1) + "B";
      if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
      if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";
      return num.toLocaleString();
    };

     // Parses "2d", "3h", "<1h", etc. into numeric hours
    const parseAgeToHours = (ageStr) => {
      if (!ageStr) return Infinity;
      if (ageStr === "<1h") return 0.5;
      if (ageStr.endsWith("h")) return parseFloat(ageStr.replace("h", ""));
      if (ageStr.endsWith("d")) return parseFloat(ageStr.replace("d", "")) * 24;
      return Infinity;
    };

    const filteredTokens = useMemo(() => {
      let sorted = [...tokens].sort((a, b) => {
        let aVal = a[sortBy] ?? 0;
        let bVal = b[sortBy] ?? 0;
    
        if (sortBy === "age") {
          aVal = parseAgeToHours(a.age);
          bVal = parseAgeToHours(b.age);
        }
    
        return sortOrder * (aVal - bVal);
      });

      sorted = sorted.filter((token) => {
        const age = parseAgeToHours(token.age);
        switch (ageFilter) {
          case "6h": return age <= 6;
          case "24h": return age <= 24;
          case "1w": return age <= 168; // 7 days * 24
          case "All": return true;
          default: return true;
        }        
      });
      
      // Category filter
      if (categoryFilter !== "Trending") {
        sorted = sorted.filter((t) => t.launchpad?.toLowerCase() === categoryFilter.toLowerCase());
      }  

      // Search
      return sorted.filter((token) =>
        token.token_symbol?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }, [tokens, sortBy, sortOrder, searchQuery, ageFilter, categoryFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredTokens.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const pagedTokens = useMemo(
      () => filteredTokens.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
      [filteredTokens, currentPage]
    );

    useEffect(() => {
      if (page > totalPages) onPageChange(totalPages);
    }, [page, totalPages, onPageChange]);

    const renderSortArrow = (key) => {
      const base = "ml-1 inline-block";
      if (sortBy !== key) return <span className={`${base} text-gray-500`}>⇅</span>;
      return sortOrder === -1
        ? <span className={`${base} text-green-400`}>↓</span>
        : <span className={`${base} text-green-400`}>↑</span>;
    };

    return (
      <div className="p-6 rounded-2xl bg-[#0A0F0A]/80 border border-[#1b1b1b] shadow-2xl backdrop-blur-md">
        {/* Copy Notification */}
        {showCopyNotification && (
          <div className="fixed top-6 right-6 z-50 bg-gradient-to-r from-green-900/95 to-emerald-900/95 backdrop-blur-lg border border-green-400/30 text-white px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-in min-w-[280px]">
            <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
              <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm text-green-50">Success!</p>
              <p className="text-xs text-green-100/80">Address copied to clipboard</p>
            </div>
            <div className="w-1 h-8 bg-gradient-to-b from-green-400 to-emerald-400 rounded-full"></div>
          </div>
        )}

        {/* Title */}
        <h2 className="text-center text-3xl font-semibold text-green-300 mb-8">
          Leaderboard
        </h2>
    
        {/* Search + Filters */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          {/* Search */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              onPageChange(1);
            }}
            placeholder="Search token..."
            className="w-full md:w-64 text-sm px-4 py-2 rounded-full bg-[#111]/80 text-white border border-[#2a2a2a] focus:ring-2 focus:ring-green-400 focus:outline-none placeholder-gray-500 transition"
          />
    
          {/* Launchpad Filter */}
          <div className="flex flex-wrap gap-2">
            {["Trending", "Pumpfun", "Bonk", "Boop", "Believe"].map((val) => {
              const isActive = categoryFilter === val;

              const baseStyles = "px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-150";

              const categoryStyles = {
                Trending: isActive
                  ? "bg-[#181818] border-green-400 text-green-300"
                  : "border-[#2a2a2a] text-gray-400 hover:border-green-300 hover:text-green-200",
                Pumpfun: isActive
                  ? "bg-[#90fcb3] text-[#0f1f17] border-none"
                  : "border-[#2a2a2a] text-gray-400 hover:border-green-300 hover:text-green-200",
                Bonk: isActive
                  ? "bg-[#f7f700] text-black border-none"
                  : "border-[#2a2a2a] text-gray-400 hover:border-yellow-300 hover:text-yellow-100",
                Boop: isActive
                  ? "bg-[#90caff] text-[#0a0f1a] border-none"
                  : "border-[#2a2a2a] text-gray-400 hover:border-blue-300 hover:text-blue-100",
                Believe: isActive
                  ? "bg-[#00FF00] text-black border-none"
                  : "border-[#2a2a2a] text-gray-400 hover:border-green-300 hover:text-green-200",                
              };

              return (
                <button
                  key={val}
                  onClick={() => {
                    setCategoryFilter(val);
                    onPageChange(1);
                  }}
                  className={`${baseStyles} ${categoryStyles[val]}`}
                >
                  {val}
                </button>
              );
            })}

          </div>
    
          {/* Age Filter */}
          <div className="flex flex-wrap gap-2">
            {["6h", "24h", "1w", "All"].map((val) => (
              <button
                key={val}
                onClick={() => {
                  setAgeFilter(val);
                  onPageChange(1);
                }}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 ${
                  ageFilter === val
                    ? "bg-[#181818] border-gray-400 text-white"
                    : "border-[#2a2a2a] text-gray-400 hover:border-gray-500 hover:text-white"
                }`}
              >
                {val}
              </button>
            ))}
          </div>
        </div>
    
        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-[#1f1f1f]">
          <table className="w-full text-sm text-gray-200">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#0f1b15]/80 text-green-300 uppercase text-xs tracking-widest border-b border-green-800/40">
                <th className="px-4 py-3 text-left">Chain</th>
                <th className="px-1 py-3 w-8"></th> {/* Empty header for lightning column */}
                {[
                  { key: "token_symbol", label: "Token" },
                  { key: "wom_score", label: "WOM Score" },
                  {
                    key: "avg_followers_count",
                    label: (
                      <div className="inline-flex items-center gap-1 text-xs whitespace-nowrap uppercase">
                        <span>Whispers</span>
                        <div className="relative group flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-[13px] h-[13px] text-gray-400 hover:text-green-300 transition"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z"
                            />
                          </svg>
                          <div className="absolute left-full top-full mt-2 ml-2 z-50 w-[220px] px-3 py-2 text-[12px] text-gray-200 bg-[#0a0a0a] border border-gray-700 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none leading-snug text-left normal-case whitespace-normal">
                            <p className="text-gray-100 font-medium mb-1">Whispers score</p>
                            <p>Measures how small the average tweeting account is.</p>
                            <p className="text-gray-400">Lower = earlier whispers.</p>
                          </div>
                        </div>
                      </div>
                    )
                  },    
                  { key: "market_cap_usd", label: "Market Cap" },
                  { key: "age", label: "Age" },
                  { key: "volume_usd", label: "Volume" },
                  { key: "liquidity_usd", label: "Liquidity" },
                ].map(({ key, label }) => (
                  <th
                    key={key}
                    className="px-4 py-3 text-left cursor-pointer hover:text-green-400 transition"
                    onClick={() => handleSort(key)}
                  >
                    {label} {renderSortArrow(key)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pagedTokens.length > 0 ? (
                pagedTokens.map((token) => (
                  <tr
                    key={token.token_symbol}
                    onClick={() => onTokenClick(token)}
                    className="border-b border-[#1f1f1f] hover:bg-green-900/10 transition cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <img src={solanaIcon} alt="Solana" className="w-5 h-5" />
                    </td>

                    {/* Lightning column - separate from Token column */}
                    <td className="px-1 py-3 w-8">
                      {token.first_spotted_by && (
                        <div className="relative group flex justify-center">
                          <span 
                            className="animate-pulse bg-yellow-400/10 text-yellow-300 text-[8px] font-bold px-1 py-0.5 rounded-sm uppercase cursor-pointer hover:bg-yellow-400/20 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`https://x.com/${token.first_spotted_by}`, '_blank');
                            }}
                          >
                            ⚡
                          </span>
                          <div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-1 w-max min-w-[180px] max-w-[220px] px-3 py-2 text-xs text-white bg-black border border-gray-700 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 pointer-events-none text-center">
                            <div className="whitespace-nowrap">First spotted by @{token.first_spotted_by}</div>
                            <div className="text-gray-400 whitespace-nowrap">Click to view profile</div>
                          </div>
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap font-medium text-white">
                      <div className="flex items-center gap-2">
                        {/* Token image */}
                        {token.image_url && (
                          <img
                            src={token.image_url}
                            alt={token.token_symbol}
                            className="w-5 h-5 rounded-full border border-green-800"
                          />
                        )}

                        {/* Token symbol and other elements */}
                        <span className="flex items-center gap-1">
                          {token.token_symbol?.toUpperCase()}
                          {token.dex_url && (
                            <>
                              <a
                                href={token.dex_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-green-300"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <AiOutlineLineChart className="w-4 h-4" />
                              </a>
                              <button
                                onClick={(e) => copyTokenAddress(token, e)}
                                className="group relative hover:text-green-300 transition-all duration-200 p-1.5 rounded-md hover:bg-green-900/20 cursor-pointer"
                                title="Copy token address"
                              >
                                <FaCopy className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                          {token.launchpad && token.launchpad !== "unknown" && (
                            <span
                              className={`ml-2 text-xs px-2 py-0.5 rounded-full font-medium ${
                                token.launchpad.toLowerCase() === "pumpfun"
                                  ? "bg-[#90fcb3] text-[#0f1f17]"
                                  : token.launchpad.toLowerCase() === "bonk"
                                  ? "bg-[#f7f700] text-black"
                                  : token.launchpad.toLowerCase() === "boop"
                                  ? "bg-[#90caff] text-[#0a0f1a]"
                                  : token.launchpad.toLowerCase() === "believe"
                                  ? "bg-[#00FF00] text-black"
                                  : "bg-purple-900 text-purple-300"
                              }`}
                            >
                              {formatLaunchpadLabel(token.launchpad)}
                            </span>
                          )}
                        </span>
                      </div>
                    </td>
    
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="relative w-16 h-2 rounded-full bg-gray-800 overflow-hidden border border-gray-700">
                          <div
                            className={`h-full ${getBatteryColor(token.wom_score ?? 0)}`}
                            style={{ width: `${token.wom_score ?? 0}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-white whitespace-nowrap">
                          {token.wom_score != null ? `${token.wom_score}%` : "—"}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-white text-sm">
                      {typeof token.avg_followers_count === "number"
                        ? safeFormatNumber(token.avg_followers_count)
                        : "—"}
                    </td>
    
                    <td className="px-4 py-3 whitespace-nowrap">
                      {safeFormatNumber(token.market_cap_usd)}
                    </td>
    
                    <td className="px-4 py-3 whitespace-nowrap">
                      {token.age ?? "—"}
                    </td>
    
                    <td className="px-4 py-3 whitespace-nowrap">
                      {safeFormatNumber(token.volume_usd)}
                    </td>
    
                    <td className="px-4 py-3 whitespace-nowrap">
                      {safeFormatNumber(token.liquidity_usd)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-green-400">
                    No tokens match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
    
        {/* Pagination */}
        <div className="flex justify-center items-center gap-6 mt-10">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="p-2 rounded-full border border-green-600 text-green-300 hover:text-green-100 hover:border-green-400 disabled:opacity-30 transition"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <span className="text-green-300 font-mono text-sm">
            Page {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="p-2 rounded-full border border-green-600 text-green-300 hover:text-green-100 hover:border-green-400 disabled:opacity-30 transition"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
    
        {/* Token Sentiment Chart */}
        <div ref={TokenSentimentChartRef} className="mt-12">
          <TokenSentimentChart tokens={tokens} tweets={tweets} />
        </div>
      </div>
    );    
    
  }
);

/* Add animation styles */
const styles = `
  @keyframes slide-in {
    from {
      transform: translateX(100%) scale(0.9);
      opacity: 0;
    }
    to {
      transform: translateX(0) scale(1);
      opacity: 1;
    }
  }
  
  .animate-slide-in {
    animation: slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

export default Leaderboard;