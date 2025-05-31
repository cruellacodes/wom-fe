// StocksAnalyzer.jsx
// eslint-disable-next-line no-unused-vars
import React from "react";
import Header from "./Header";
import Footer from "./Footer";

const StocksAnalyzer = () => {
  return (
    <div className="bg-[#0A0A0E] min-h-screen text-white font-mono tracking-widest">
      <Header />

      <div className="text-center pt-16 pb-6 px-4">
        <h1 className="text-2xl sm:text-3xl font-semibold">StocksAnalyzer</h1>
        <p className="text-sm text-[#AAA] mt-2 font-light">
          Realtime analysis of trending stocks, meme tickers & social mentions.
        </p>
      </div>

      <div className="flex items-center justify-center mt-20 mb-28 px-6">
        <div className="text-center max-w-xl">
          <h2 className="text-xl sm:text-2xl font-semibold text-[#FF4DFF] mb-4">
            Coming soon 👀
          </h2>
          <p className="text-md text-[#AAA] font-light">
            We&apos;re cooking up a new way to track stocks, memes, and social hype.
            Stay tuned for StocksAnalyzer – it&apos;s gonna slap.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default StocksAnalyzer;
