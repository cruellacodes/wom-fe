import React, { useState } from "react";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/solid";
import solanaIcon from "../assets/solana.png";
import BubbleChart from "./BubbleChart";

const Leaderboard = ({ tokens, tweets, onTokenClick }) => {
  const [sortBy, setSortBy] = useState("WomScore");
  const [sortOrder, setSortOrder] = useState(-1); // -1: descending, 1: ascending

  // Format large numbers
  const formatNumber = (num) => {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";
    return num;
  };

  // Battery style for WOM Score
  const getBatteryColor = (score) => {
    if (score >= 49) return "bg-green-500";
    if (score >= 25) return "bg-yellow-400";
    return "bg-red-500";
  };

  // Handler for sorting columns
  const handleSort = (key) => {
    if (sortBy === key) {
      setSortOrder(sortOrder * -1);
    } else {
      setSortBy(key);
      setSortOrder(-1);
    }
  };

  // Render sorting arrow
  const renderSortArrow = (key) => {
    if (sortBy !== key) return <span className="text-gray-500 ml-1">↕</span>;
    return sortOrder === -1 ? (
      <ChevronDownIcon className="h-4 w-4 inline-block ml-1 text-green-400" />
    ) : (
      <ChevronUpIcon className="h-4 w-4 inline-block ml-1 text-green-400" />
    );
  };

  // Sort tokens
  const sortedTokens = [...tokens].sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];

    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortOrder * aVal.localeCompare(bVal);
    } else {
      return sortOrder * (aVal - bVal);
    }
  });

  return (
    <div className="p-6 rounded-xl text-green-300 shadow-lg bg-[#0A0F0A] border border-green-800/40 
      backdrop-blur-lg bg-opacity-90 hover:shadow-[0px_0px_60px_rgba(34,197,94,0.3)] transition-all duration-300">
      
      <h2 className="text-lg font-bold text-green-400 uppercase tracking-wide mb-6 text-center">
        Trending Tokens
      </h2>

      <div className="overflow-x-auto rounded-lg border border-green-800/40">
        <table className="w-full border-collapse text-left text-gray-300 text-sm">
          <thead>
            <tr className="bg-[#06100A] text-green-300 text-xs tracking-wide">
              <th className="p-3">CHAIN</th>
              {["Token", "WomScore", "MarketCap", "Age", "Volume", "MakerCount", "Liquidity"].map((key) => (
                <th
                  key={key}
                  className="p-3 cursor-pointer hover:text-green-400 transition duration-200"
                  onClick={() => handleSort(key)}
                >
                  {key.toUpperCase()} {renderSortArrow(key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedTokens.map((token) => (
              <tr
                key={token.Token}
                onClick={() => onTokenClick(token)}
                className="border-b border-green-900/40 hover:bg-green-900/30 transition-all duration-300 cursor-pointer"
              >
                <td className="p-3 flex items-center">
                  <img src={solanaIcon} alt="Solana" className="w-8 h-8" />
                </td>
                <td className="p-3 font-semibold text-white">
                  <a 
                    href={token.dex_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-green-400 hover:underline transition-all duration-200"
                  >
                    {token.Token.toUpperCase()}
                  </a>
                </td>
                <td className="p-3 flex items-center gap-2">
                  <div className="relative w-16 h-6 bg-gray-800 rounded-md flex items-center px-1 border border-gray-500">
                    <div
                      className={`h-4 rounded-md ${getBatteryColor(token.WomScore)}`}
                      style={{ width: `${token.WomScore}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-semibold text-white">
                    {token.WomScore}%
                  </span>
                </td>
                <td className="p-3">{formatNumber(token.MarketCap)}</td>
                <td className="p-3">{token.Age < 1 ? "<1" : token.Age}</td>
                <td className="p-3">{formatNumber(token.Volume)}</td>
                <td className="p-3">{formatNumber(token.MakerCount)}</td>
                <td className="p-3">{formatNumber(token.Liquidity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <BubbleChart tokens={tokens} tweets={tweets} />
    </div>
  );
};

export default Leaderboard;
