import React from "react";

const getScoreColor = (score) => {
  if (score >= 75) return "bg-green-500";
  if (score >= 50) return "bg-yellow-400";
  return "bg-red-500";
};

const TokenInfoCard = ({ token = {
  name: "WOM Coin",
  symbol: "WOM",
  womScore: 85,
  mc: "$380B",
  volume: "$12B",
  makers: "450",
  liquidity: "$5B",
  age: "24h",
  chainIcon: "/assets/solana-icon.png",
} }) => {
  return (
    <div className="p-6 rounded-xl bg-[#0A0F0A] border border-green-900/30 backdrop-blur-lg bg-opacity-95 shadow-[0px_0px_40px_rgba(34,197,94,0.15)]">
      {/* Header with Chain Icon and Token Symbol */}
      <div className="flex items-center gap-4 mb-4">
        <img src={token.chainIcon} alt="Solana" className="w-10 h-10 rounded-full shadow-md" />
        <div>
          <h2 className="text-xl font-bold text-green-300">{token.symbol}</h2>
        </div>
      </div>

      {/* WOM Score with Progress Bar */}
      <div className="mb-4">
        <p className="text-lg font-semibold text-green-300">WOM Score</p>
        <div className="relative w-full h-2 rounded-full bg-green-900/20 overflow-hidden mt-1">
          <div
            className={`absolute top-0 left-0 h-full ${getScoreColor(token.womScore)} transition-all duration-500`}
            style={{ width: `${token.womScore}%` }}
          ></div>
        </div>
        <p className="text-sm text-green-400 mt-1">{token.womScore}/100</p>
      </div>

      {/* Market Data */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-green-500/80">Market Cap</p>
          <p className="text-lg font-semibold text-green-300">{token.mc}</p>
        </div>
        <div>
          <p className="text-green-500/80">24h Volume</p>
          <p className="text-lg font-semibold text-green-300">{token.volume}</p>
        </div>
        <div>
          <p className="text-green-500/80">Liquidity</p>
          <p className="text-lg font-semibold text-green-300">{token.liquidity}</p>
        </div>
        <div>
          <p className="text-green-500/80">Makers</p>
          <p className="text-lg font-semibold text-green-300">{token.makers}</p>
        </div>
        <div className="col-span-2">
          <p className="text-green-500/80">Age</p>
          <p className="text-lg font-semibold text-green-300">{token.age}</p>
        </div>
      </div>
    </div>
  );
};

export default TokenInfoCard;
