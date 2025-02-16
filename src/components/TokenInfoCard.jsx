import React from "react";
import { motion } from "framer-motion";
import solanaIcon from "../assets/solana.png"

// Utility function for setting score color
const getScoreColor = (score) => {
  if (score >= 75) return "bg-green-500";
  if (score >= 50) return "bg-yellow-400";
  return "bg-red-500";
};

const TokenInfoCard = ({ token }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="p-6 rounded-xl bg-[#0A0F0A] border border-green-900/40 
      backdrop-blur-lg bg-opacity-90 shadow-[0px_0px_40px_rgba(34,197,94,0.15)]
      hover:shadow-[0px_0px_60px_rgba(34,197,94,0.3)] transition-all duration-300"
    >
      {/* Header Section */}
      <div className="flex items-center gap-4 mb-6">
        <img
          src={solanaIcon || "/assets/solana-icon.png"}
          alt={token.Token}
          className="w-12 h-12 rounded-full shadow-md border border-green-500/50 p-1"
        />
        <div>
          <h2 className="text-2xl font-extrabold text-green-300 tracking-wide">
            {token.Token}
          </h2>
          <p className="text-sm text-green-500/80 uppercase tracking-wide">
            {token.Age} old | {token.MakerCount} Makers
          </p>
        </div>
      </div>

      {/* WOM Score Section */}
      <div className="mb-6">
        <p className="text-lg font-semibold text-green-300">WOM Score</p>
        <div className="relative w-full h-3 rounded-full bg-green-900/20 overflow-hidden mt-2">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: `${token.WomScore}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`absolute top-0 left-0 h-full ${getScoreColor(token.WomScore)} transition-all duration-500`}
          ></motion.div>
        </div>
        <p className="text-sm text-green-400 mt-1">{token.WomScore}/100</p>
      </div>

      {/* Market Data Section */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="p-3 rounded-lg bg-green-900/10 border border-green-800/30 shadow-sm">
          <p className="text-green-500/80 text-xs">Market Cap</p>
          <p className="text-lg font-semibold text-green-300">${token.MarketCap.toLocaleString()}</p>
        </div>
        <div className="p-3 rounded-lg bg-green-900/10 border border-green-800/30 shadow-sm">
          <p className="text-green-500/80 text-xs">24h Volume</p>
          <p className="text-lg font-semibold text-green-300">${token.Volume.toLocaleString()}</p>
        </div>
        <div className="p-3 rounded-lg bg-green-900/10 border border-green-800/30 shadow-sm">
          <p className="text-green-500/80 text-xs">Liquidity</p>
          <p className="text-lg font-semibold text-green-300">${token.Liquidity.toLocaleString()}</p>
        </div>
        <div className="p-3 rounded-lg bg-green-900/10 border border-green-800/30 shadow-sm">
          <p className="text-green-500/80 text-xs">1h Volume</p>
          {/** to add 1h volume */}
          <p className="text-lg font-semibold text-green-300">{token.MakerCount.toLocaleString()}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default TokenInfoCard;
