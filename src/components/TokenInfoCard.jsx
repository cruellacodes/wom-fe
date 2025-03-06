import React from "react";
import solanaIcon from "../assets/solana.png";
import { AiOutlineLineChart } from "react-icons/ai";

// Utility function for setting score color with glow effect
const getScoreColor = (score) => {
  if (score >= 49) return "bg-green-500 shadow-green-500/40";
  if (score >= 25) return "bg-yellow-400 shadow-yellow-400/40";
  return "bg-red-500 shadow-red-500/40";
};

const TokenInfoCard = ({ token }) => {
  return (
    <div
      className="p-4 rounded-lg bg-[#0A0F0A] border border-green-900/50 
      backdrop-blur-lg bg-opacity-90 shadow-md transition-all duration-300
      hover:border-green-400/60 hover:shadow-[0_0_15px_rgba(34,197,94,0.6)]"
    >
      {/* Dex Screener Chart Icon (Top-Right) */}
      <div className="absolute top-3 right-3">
        <a
          href={token.dex_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-green-400 hover:text-green-300 transition"
        >
          <AiOutlineLineChart size={20} />
        </a>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <img
          src={solanaIcon || "/assets/solana-icon.png"}
          alt={token.Token}
          className="w-10 h-10 rounded-md shadow-md"
        />
        <div>
          <h2 className="text-lg font-semibold text-green-300">{token.Token}</h2>
          <p className="text-xs text-green-500/80">{token.Age}h old | {token.MakerCount} Makers</p>
        </div>
      </div>

      {/* WOM Score */}
      <div className="mb-4">
        <p className="text-xs text-green-400">WOM Score</p>
        <div className="relative w-full h-2 rounded-full bg-green-900/20 overflow-hidden mt-1">
          <div
            className={`absolute top-0 left-0 h-full ${getScoreColor(token.WomScore)}`}
            style={{ width: `${token.WomScore}%` }}
          ></div>
        </div>
        <p className="text-xs text-green-400 mt-1">{token.WomScore}/100</p>
      </div>

      {/* Market Data */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        {[
          { label: "Market Cap", value: `$${token.MarketCap.toLocaleString()}` },
          { label: "24h Volume", value: `$${token.Volume.toLocaleString()}` },
          { label: "Liquidity", value: `$${token.Liquidity.toLocaleString()}` },
          {
            label: "1h Change",
            value: `${(token.priceChange1h ?? 0).toFixed(2)}%`,      
            className: token.priceChange1h >= 0 ? "text-green-300" : "text-red-400",
          },
        ].map((item, index) => (
          <div key={index} className="p-2 rounded-md bg-green-900/10">
            <p className="text-green-500/70 text-[10px]">{item.label}</p>
            <p className={`text-sm font-medium ${item.className || "text-green-300"}`}>{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TokenInfoCard;
