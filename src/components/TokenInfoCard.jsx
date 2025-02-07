import React from "react";

const TokenInfoCard = () => {
  return (
    <div className="relative p-6 rounded-xl bg-[#0A0F0A] border border-green-900/20 backdrop-blur-lg bg-opacity-90 shadow-[0px_0px_50px_rgba(34,197,94,0.1)]">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-700/10 via-green-600/10 to-green-500/5 opacity-40 blur-2xl pointer-events-none"></div>

      {/* Token Name and Logo */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
          <span className="text-2xl">🪙</span> {/* Replace with actual logo */}
        </div>
        <div>
          <h2 className="text-xl font-semibold text-green-300">Ethereum (ETH)</h2>
          <p className="text-sm text-green-500/80">ERC-20</p>
        </div>
      </div>

      {/* Token Price and Change */}
      <div className="mb-6">
        <p className="text-3xl font-bold text-green-300">$3,200.45</p>
        <p className="text-sm text-green-500 flex items-center gap-1">
          <span className="text-green-400">↑ 2.34%</span>
          <span className="text-green-500/50">(24h)</span>
        </p>
      </div>

      {/* Market Cap and Volume */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-green-500/80">Market Cap</p>
          <p className="text-lg font-semibold text-green-300">$380B</p>
        </div>
        <div>
          <p className="text-sm text-green-500/80">24h Volume</p>
          <p className="text-lg font-semibold text-green-300">$12B</p>
        </div>
      </div>

      {/* Progress Bar for Supply */}
      <div className="mt-6">
        <p className="text-sm text-green-500/80 mb-2">Circulating Supply</p>
        <div className="w-full h-2 rounded-full bg-green-900/20">
          <div
            className="h-2 rounded-full bg-green-500"
            style={{ width: "75%" }} // Adjust width dynamically
          ></div>
        </div>
        <p className="text-sm text-green-500/80 mt-1">120M / 160M</p>
      </div>
    </div>
  );
};

export default TokenInfoCard;