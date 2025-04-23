import React, { useState, useEffect, useRef } from "react";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/solid";
import solanaIcon from "../assets/solana.png";
import TweetSentimentAreaChart from "./TweetSentimentAreaChart";
import { AiOutlineLineChart } from "react-icons/ai";

const Leaderboard = ({ tokens, tweets, onTokenClick, setScrollTweetSentimentAreaChart, page, onPageChange }) => {
  const [sortBy, setSortBy] = useState("wom_score");
  const [sortOrder, setSortOrder] = useState(-1);
  const TweetSentimentAreaChartRef = useRef(null);

  useEffect(() => {
    if (setScrollTweetSentimentAreaChart) {
      setScrollTweetSentimentAreaChart(() => () => {
        if (TweetSentimentAreaChartRef.current) {
          TweetSentimentAreaChartRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    }
  }, [setScrollTweetSentimentAreaChart]);

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
    if (sortBy !== key) return <span className="text-gray-500 ml-1">↕</span>;
    return sortOrder === -1 ? (
      <ChevronDownIcon className="h-4 w-4 inline-block ml-1 text-green-400" />
    ) : (
      <ChevronUpIcon className="h-4 w-4 inline-block ml-1 text-green-400" />
    );
  };

  const sortedTokens = [...tokens].sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];

    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortOrder * aVal.localeCompare(bVal);
    } else {
      return sortOrder * ((aVal ?? 0) - (bVal ?? 0));
    }
  });

  return (
    <div className="p-6 rounded-xl text-green-300 shadow-lg bg-[#0A0F0A] border border-green-800/40 backdrop-blur-lg bg-opacity-90 hover:shadow-[0px_0px_60px_rgba(34,197,94,0.3)] transition-all duration-300">
      <h2 className="text-lg font-bold text-green-400 uppercase tracking-wide mb-6 text-center">
        Trending Tokens
      </h2>

      <div className="overflow-x-auto rounded-lg border border-green-800/40">
        <table className="w-full border-collapse text-left text-gray-300 text-sm">
          <thead>
            <tr className="bg-[#06100A] text-green-300 text-xs tracking-wide">
              <th className="p-3">CHAIN</th>
              {[
                { label: "Token", key: "token_symbol" },
                { label: "WomScore", key: "wom_score" },
                { label: "MarketCap", key: "market_cap_usd" },
                { label: "Age(h)", key: "age_hours" },
                { label: "Volume", key: "volume_usd" },
                { label: "MakerCount", key: "maker_count" },
                { label: "Liquidity", key: "liquidity_usd" },
              ].map(({ label, key }) => (
                <th
                  key={key}
                  className="p-3 cursor-pointer hover:text-green-400 transition duration-200"
                  onClick={() => handleSort(key)}
                >
                  {label.toUpperCase()} {renderSortArrow(key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedTokens.map((token) => (
              <tr
                key={token.address}
                onClick={() => token && onTokenClick(token)}
                className="border-b border-green-900/40 hover:bg-green-900/30 transition-all duration-300 cursor-pointer"
              >
                <td className="p-3 flex items-center">
                  <img src={solanaIcon} alt="Solana" className="w-8 h-8" />
                </td>
                <td className="p-3 font-semibold text-white">
                  <span className="inline-flex items-center gap-1">
                    {(token.token_symbol ?? "—").toUpperCase?.() ?? "—"}
                    {token.dex_url && (
                      <a
                        href={token.dex_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-green-400 transition-all duration-200"
                      >
                        <AiOutlineLineChart className="w-4 h-4 text-gray-400 hover:text-green-400 transition-all duration-200" />
                      </a>
                    )}
                  </span>
                </td>
                <td className="p-3 flex items-center gap-2">
                  <div className="relative w-16 h-6 bg-gray-800 rounded-md flex items-center px-1 border border-gray-500">
                    <div
                      className={`h-4 rounded-md ${getBatteryColor(token.wom_score ?? 0)}`}
                      style={{ width: `${token.wom_score ?? 0}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-semibold text-white">
                    {token.wom_score != null ? `${token.wom_score}%` : "—"}
                  </span>
                </td>
                <td className="p-3">{safeFormatNumber(token.market_cap_usd)}</td>
                <td className="p-3">{token.age_hours != null ? (token.age_hours < 1 ? "<1" : token.age_hours) : "—"}</td>
                <td className="p-3">{safeFormatNumber(token.volume_usd)}</td>
                <td className="p-3">{safeFormatNumber(token.maker_count)}</td>
                <td className="p-3">{safeFormatNumber(token.liquidity_usd)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div ref={TweetSentimentAreaChartRef}>
        <TweetSentimentAreaChart tokens={tokens} tweets={tweets} />
      </div>
    </div>
  );
};

export default Leaderboard;
