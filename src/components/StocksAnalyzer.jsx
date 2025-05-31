// StocksAnalyzer.jsx
// eslint-disable-next-line no-unused-vars
import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const StocksAnalyzer = () => {
  return (
    <div className="bg-[#0A0A0E] min-h-screen text-white font-mono tracking-widest">
      <Header />

      <div className="text-center pt-16 pb-6 px-4">
        <h1 className="text-2xl sm:text-3xl font-semibold text-[#FF4DFF]">
          StocksAnalyzer is on the way.
        </h1>
        <p className="text-sm text-[#AAA] mt-2 font-light max-w-xl mx-auto">
          Real-time word-of-mouth sentiment for every stock, ETF, and memecoin-turned-equity.
        </p>
      </div>

      <div className="flex items-center justify-center mt-20 mb-28 px-6">
        <div className="text-left max-w-2xl bg-[#13131A] border border-[#2A2A2A] p-6 rounded-2xl shadow-[0_0_20px_#FF4DFF20]">
          <p className="text-md text-[#DDD] mb-6 leading-relaxed">
            Our crypto engine is graduating to the broader market. In the next release you’ll be able to:
          </p>
          <ul className="list-disc pl-5 space-y-3 text-[#AAA] text-sm">
            <li>
              Track live tweet velocity and sentiment for NYSE & Nasdaq tickers
            </li>
            <li>
              Spot micro-account chatter on fresh IPOs and upcoming earnings plays
            </li>
            <li>
              Compare “WOM Scores” across stocks, sectors, and ETFs in one leaderboard
            </li>
            <li>
              Set instant alerts when small-cap whispers start to trend
            </li>
          </ul>
          <p className="text-sm text-[#777] mt-8 italic">
            Private beta is scheduled for Q3 2025. Spaces are limited while we stress-test the new data pipeline.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default StocksAnalyzer;
