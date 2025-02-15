import React, { useState } from "react";
import { ChevronDownIcon, ArrowPathIcon } from "@heroicons/react/24/solid";
import solanaIcon from "../assets/solana.png";
import BubbleChart from "./BubbleChart";

const Leaderboard = ({ tokens, onTokenClick, loading, fetchTokenData }) => {
  const [sortBy, setSortBy] = useState("WomScore");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Format Large Numbers
  const formatNumber = (num) => {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";
    return num;
  };

  // Battery Style for WOM Score
  const getBatteryColor = (score) => {
    if (score >= 65) return "bg-green-500";
    if (score >= 40) return "bg-yellow-400";
    return "bg-red-500";
  };

  // Sorting Options (Hide WomScore When Selected)
  const sortingOptions = ["MarketCap", "Volume", "Age"];
  if (sortBy !== "WomScore") sortingOptions.unshift("WomScore");

  // Sort Tokens Based on Selected Option
  const sortedTokens = [...tokens].sort((a, b) => b[sortBy] - a[sortBy]);

  return (
    <div className="p-6 rounded-xl text-green-300 shadow-lg bg-gradient-to-br from-[#050A0A] via-[#092523] to-[#031715] border border-green-800/40">
      
      {/* Title & Controls */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-green-300 uppercase tracking-wide">
          Trending Tokens
        </h2>

        {/* Sorting & Refresh Controls */}
        <div className="flex items-center gap-4">
          {/* Sorting Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="relative flex items-center gap-2 px-6 py-2 rounded-lg bg-green-900/20 shadow-lg hover:bg-green-800/40 transition duration-300 hover:scale-105 active:scale-95"
            >
              <span className="text-sm font-medium text-green-300">Filtered by:</span>
              <span className="text-sm font-semibold text-green-300">{sortBy}</span>
              <ChevronDownIcon className="h-5 w-5 text-green-300" />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-lg bg-[#050A0A] border border-green-800/30 shadow-lg z-50">
                {sortingOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setSortBy(option);
                      setIsDropdownOpen(false);
                    }}
                    className="block w-full px-6 py-2 text-left text-green-300 text-sm font-medium hover:bg-green-800/40 hover:scale-105 transition duration-300"
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchTokenData}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 rounded-lg bg-green-900/20 shadow-lg hover:bg-green-800/40 transition duration-300 hover:scale-105 active:scale-95"
          >
            <ArrowPathIcon className={`h-5 w-5 ${loading ? "animate-spin" : ""} text-green-300`} />
            <span className="text-sm font-semibold text-green-300">{loading ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto rounded-lg border border-green-800/40">
        <table className="w-full border-collapse text-left text-gray-300 text-sm">
          <thead>
            <tr className="bg-green-900/40 text-green-300 text-xs tracking-wide">
              <th className="p-3">CHAIN</th>
              <th className="p-3">TOKEN</th>
              <th className="p-3">WOM SCORE</th>
              <th className="p-3">MARKET CAP</th>
              <th className="p-3">AGE (h)</th>
              <th className="p-3">VOLUME</th>
              <th className="p-3">MAKERS</th>
              <th className="p-3">LIQUIDITY</th>
            </tr>
          </thead>
          <tbody>
            {sortedTokens.map((token) => (
              <tr 
                key={token.Token} 
                onClick={() => onTokenClick(token)} // ✅ Handle Token Click
                className="border-b border-green-900/40 hover:bg-green-900/30 transition-all duration-300 cursor-pointer"
              >
                {/* Chain (Solana Icon) */}
                <td className="p-3 flex items-center">
                  <img src={solanaIcon} alt="Solana" className="w-8 h-8" />
                </td>

                {/* Token Name */}
                <td className="p-3 font-semibold text-white">{token.Token.toUpperCase()}</td>

                {/* WOM Score (Battery UI) */}
                <td className="p-3 flex items-center gap-2">
                  <div className="relative w-16 h-6 bg-gray-800 rounded-md flex items-center px-1 border border-gray-500">
                    <div
                      className={`h-4 rounded-md ${getBatteryColor(token.WomScore)}`}
                      style={{ width: `${token.WomScore}%` }}
                    ></div>
                  </div>
                  <span className="text-green-400 text-xs font-semibold">{token.WomScore.toFixed(2)}%</span>
                </td>

                {/* Market Cap */}
                <td className="p-3">{formatNumber(token.MarketCap)}</td>

                {/* Age */}
                <td className="p-3">{token.Age < 1 ? "<1" : token.Age}</td>

                {/* Volume */}
                <td className="p-3">{formatNumber(token.Volume)}</td>

                {/* Maker Count */}
                <td className="p-3">{formatNumber(token.MakerCount)}</td>

                {/* Liquidity */}
                <td className="p-3">{formatNumber(token.Liquidity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <BubbleChart/>
    </div>
  );
};
export default Leaderboard;
