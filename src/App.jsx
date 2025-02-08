import React, { useState } from "react";
import Header from "./components/Header";
import TokenInfoCard from "./components/TokenInfoCard";
import LineChart from "./components/LineChart";
import Leaderboard from "./components/LeaderBoard";

function App() {
  const [searchedToken, setSearchedToken] = useState("");

  return (
    <div className="bg-[#010409] min-h-screen text-gray-300">
      {/* Full-width Header (Includes Search Bar) */}
      <Header />
      <div className="flex justify-center mt-4">
        <input
          type="text"
          placeholder="Search tokens..."
          value={searchedToken}
          onChange={(e) => setSearchedToken(e.target.value)}
          className="w-full max-w-md px-4 py-2 rounded-lg bg-transparent border border-green-600/30 text-green-300 outline-none focus:ring-2 focus:ring-green-400/50 placeholder-green-500/50 transition-all duration-300 hover:border-green-600/50 focus:border-green-600/50"
        />
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Top Section - Line Chart and Token Info Card */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          {/* Line Chart (70%) */}
          <div className="lg:col-span-7">
            <LineChart searchedToken={searchedToken} />
          </div>
          
          {/* Token Info Card (30%) */}
          <div className="lg:col-span-3">
            <TokenInfoCard token={{ name: searchedToken || "Select a token", price: "--", change: "--" }} />
          </div>
        </div>
        
        {/* Leaderboard (Full Width) */}
        <div className="w-full">
          <Leaderboard searchedToken={searchedToken} />
        </div>
      </div>
    </div>
  );
}

export default App;
