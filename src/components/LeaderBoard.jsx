/* eslint-disable react/prop-types */
// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, useRef } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/solid";
import solanaIcon from "../assets/solana.png";
import TweetSentimentAreaChart from "./TweetSentimentAreaChart";
import { AiOutlineLineChart } from "react-icons/ai";

const PAGE_SIZE = 20;

const Leaderboard = ({
  tokens = [],
  tweets = [],
  onTokenClick,
  setScrollTweetSentimentAreaChart,
  page,
  onPageChange,
}) => {
  const [sortBy, setSortBy] = useState("wom_score");
  const [sortOrder, setSortOrder] = useState(-1);
  const [searchQuery, setSearchQuery] = useState("");
  const [ageFilter, setAgeFilter] = useState("5d");
  const TweetSentimentAreaChartRef = useRef(null);

  useEffect(() => {
    if (setScrollTweetSentimentAreaChart) {
      setScrollTweetSentimentAreaChart(() => () => {
        TweetSentimentAreaChartRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    }
  }, [setScrollTweetSentimentAreaChart]);

  const sortedTokens = [...tokens].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    return sortOrder * ((aVal ?? 0) - (bVal ?? 0));
  });

  const ageFilteredTokens = sortedTokens.filter((token) => {
    const age = token.age_hours ?? Infinity;
    switch (ageFilter) {
      case "6h":
        return age <= 6;
      case "24h":
        return age < 24;
      case "5d":
        return age <= 120;
      default:
        return true;
    }
  });

  const filteredTokens = ageFilteredTokens.filter((token) =>
    token.token_symbol?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredTokens.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedTokens = filteredTokens.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  useEffect(() => {
    if (page > totalPages) {
      onPageChange(totalPages);
    }
  }, [filteredTokens.length, totalPages, page, onPageChange]);

  const safeFormatNumber = (num) => {
    if (typeof num !== "number" || isNaN(num)) return "—";
    if (num >= 1e9) return (num / 1e9).toFixed(1) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";
    return num.toLocaleString();
  };

  const getBatteryColor = (score) => {
    if (score >= 49) return "bg-green-500";
    if (score >= 25) return "bg-yellow-400";
    return "bg-red-500";
  };

  const handleSort = (key) => {
    if (sortBy === key) {
      setSortOrder(sortOrder * -1);
    } else {
      setSortBy(key);
      setSortOrder(-1);
    }
  };

  const renderSortArrow = (key) => {
    const baseStyle = "ml-1 inline-block";
    if (sortBy !== key) {
      return <span className={`${baseStyle} text-gray-500`}>⇅</span>;
    }
  
    return sortOrder === -1 ? (
      <span className={`${baseStyle} text-green-400`}>↓</span>
    ) : (
      <span className={`${baseStyle} text-green-400`}>↑</span>
    );
  };  
  
  return (
    <div className="p-6 rounded-xl text-green-300 bg-[#0A0F0A] border border-green-800/40 backdrop-blur-lg bg-opacity-90 transition-all duration-300">
      <div className="flex justify-center mb-6">
        <h2 className="text-xl md:text-2xl font-semibold tracking-wide text-green-300 text-center">
          Leaderboard
        </h2>

      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            onPageChange(1);
          }}
          placeholder="Search token..."
          className="px-3 py-2 bg-[#111] border border-gray-700 rounded-md text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-600 w-full md:w-64 text-sm"
        />

        <div className="flex gap-2">
          {["6h", "24h", "5d"].map((val) => (
            <button
              key={val}
              onClick={() => {
                setAgeFilter(val);
                onPageChange(1);
              }}
              className={`px-3 py-1 border rounded-md text-sm transition-all
                ${
                  ageFilter === val
                    ? "border-gray-500 text-white bg-[#1b1b1b]"
                    : "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white"
                }`}
            >
              {val}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-green-800/40">
        <table className="w-full border-collapse text-left text-gray-300 text-sm">
          <thead>
            <tr className="bg-[#06100A] text-green-300 text-xs tracking-wide uppercase">
              <th className="p-3">Chain</th>
              {[
                "token_symbol",
                "wom_score",
                "market_cap_usd",
                "age_hours",
                "volume_usd",
                "maker_count",
                "liquidity_usd",
              ].map((key) => (
                <th
                  key={key}
                  className="p-3 cursor-pointer hover:text-green-400 transition duration-200"
                  onClick={() => handleSort(key)}
                >
                  {key.replace("_", " ").toUpperCase()} {renderSortArrow(key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pagedTokens.length > 0 ? (
              pagedTokens.map((token) => (
                <tr
                  key={token.token_symbol}
                  onClick={() => token && onTokenClick(token)}
                  className="border-b border-green-900/40 hover:bg-green-900/20 transition-all duration-200 cursor-pointer"
                >
                  <td className="p-3 flex items-center">
                    <img src={solanaIcon} alt="Solana" className="w-7 h-7" />
                  </td>
                  <td className="p-3 font-medium text-white">
                    <span className="inline-flex items-center gap-1">
                      {(token.token_symbol ?? "—").toUpperCase()}
                      {token.dex_url && (
                        <a
                          href={token.dex_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-green-400"
                        >
                          <AiOutlineLineChart className="w-4 h-4 text-gray-400" />
                        </a>
                      )}
                    </span>
                  </td>
                  <td className="p-3 flex items-center gap-2">
                    <div className="relative w-16 h-4 bg-gray-800 rounded-full border border-gray-500">
                      <div
                        className={`h-full rounded-full ${getBatteryColor(
                          token.wom_score ?? 0
                        )}`}
                        style={{ width: `${token.wom_score ?? 0}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-white">
                      {token.wom_score != null ? `${token.wom_score}%` : "—"}
                    </span>
                  </td>
                  <td className="p-3">{safeFormatNumber(token.market_cap_usd)}</td>
                  <td className="p-3">
                    {token.age_hours != null
                      ? token.age_hours < 1
                        ? "<1"
                        : token.age_hours
                      : "—"}
                  </td>
                  <td className="p-3">{safeFormatNumber(token.volume_usd)}</td>
                  <td className="p-3">{safeFormatNumber(token.maker_count)}</td>
                  <td className="p-3">{safeFormatNumber(token.liquidity_usd)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="text-center py-8 text-green-400">
                  No tokens match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center items-center gap-4 mt-6">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="px-3 py-1 border border-green-700 rounded-md text-green-400 hover:text-green-200 hover:border-green-400 transition disabled:opacity-30"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>
        <span className="text-green-300 font-mono text-sm">
          Page {currentPage} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-3 py-1 border border-green-700 rounded-md text-green-400 hover:text-green-200 hover:border-green-400 transition disabled:opacity-30"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>

      <div ref={TweetSentimentAreaChartRef} className="mt-10">
        <TweetSentimentAreaChart tokens={tokens} tweets={tweets} />
      </div>
    </div>
  );
};

export default Leaderboard;