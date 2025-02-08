import React, { useState } from "react";

const mockTokens = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  chain: ["Ethereum", "Bitcoin", "Solana", "BSC", "Polygon", "Avalanche"][
    Math.floor(Math.random() * 6)
  ],
  symbol: `TOKEN${i + 1}`,
  womScore: Math.floor(Math.random() * 100), // Sentiment Score (0-100)
  mc: `$${(Math.random() * 100 + 1).toFixed(2)}B`, // Market Cap in Billions
  liquidity: `$${(Math.random() * 10 + 0.5).toFixed(2)}M`, // Liquidity in Millions
  volume: `$${(Math.random() * 5 + 0.5).toFixed(2)}M`, // 24h Volume in Millions
  makers: Math.floor(Math.random() * 1000 + 100), // Market Makers Count
  age: Math.floor(Math.random() * 72) + "h", // Age in hours
}));

const getScoreColor = (score) => {
  if (score >= 75) return "bg-green-500";
  if (score >= 50) return "bg-yellow-400";
  return "bg-red-500";
};

const Leaderboard = ({ searchedToken }) => {
  return (
    <div className="p-6 rounded-xl text-green-300 shadow-[0px_0px_40px_rgba(34,197,94,0.15)] backdrop-blur-md bg-opacity-90 bg-[#050A0A] border border-green-800/40">
      <h2 className="text-lg font-semibold text-green-300 mb-4 text-center uppercase tracking-wide">Trending Tokens</h2>
      <div className="overflow-x-auto rounded-lg border border-green-800/40">
        <table className="w-full border-collapse text-left text-gray-300 text-sm">
          <thead>
            <tr className="bg-green-900/40 text-green-300 uppercase text-xs tracking-wide">
              <th className="p-3">Chain</th>
              <th className="p-3">Token</th>
              <th className="p-3">Sentiment</th>
              <th className="p-3">Market Cap</th>
              <th className="p-3">Age</th>
              <th className="p-3">Volume</th>
              <th className="p-3">Makers</th>
              <th className="p-3">Liquidity</th>
            </tr>
          </thead>
          <tbody>
            {mockTokens.map((token) => (
              <tr
                key={token.id}
                className={`border-b border-green-900/40 hover:bg-green-900/30 transition-all duration-300 ${searchedToken === token.symbol ? "bg-green-800/50 border border-green-400" : ""}`}
              >
                <td className="p-3 font-medium text-green-300">{token.chain}</td>
                <td className="p-3 font-semibold text-green-400">{token.symbol}</td>
                <td className="p-3 w-1/3 flex flex-col items-center">
              <div className="relative w-20 h-1 rounded-full bg-green-900/20 overflow-hidden mx-auto">
                <div
                  className={`absolute top-0 left-0 h-full ${getScoreColor(token.womScore)} transition-all duration-500 rounded-full`}
                  style={{ width: `${token.womScore}%` }}
                ></div>
              </div>
              <span className="text-green-400 text-[10px] block mt-0.5">{token.womScore}/100</span>
            </td>


                <td className="p-3 font-medium text-gray-300">{token.mc}</td>
                <td className="p-3 font-medium text-gray-300">{token.age}</td>
                <td className="p-3 font-medium text-gray-300">{token.volume}</td>
                <td className="p-3 font-medium text-gray-300">{token.makers}</td>
                <td className="p-3 font-medium text-gray-300">{token.liquidity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
