import { Cog6ToothIcon, Squares2X2Icon } from "@heroicons/react/24/solid";
import React, { useState } from "react";

const Header = () => {
  const [search, setSearch] = useState("");

  return (
    <header className="relative flex items-center justify-between px-6 py-4 rounded-xl text-green-300 shadow-[0px_0px_50px_rgba(34,197,94,0.1)] backdrop-blur-lg bg-opacity-90 bg-[#0A0F0A] border border-green-900/20">
      {/* Background Glow for Depth */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-700/10 via-green-600/10 to-green-500/5 opacity-40 blur-2xl pointer-events-none"></div>

      {/* Left Side - Selection Controls */}
      <div className="flex items-center gap-3">
        <button className="relative group px-5 py-2 rounded-lg bg-opacity-10 bg-green-700 shadow-lg hover:bg-opacity-20 transition duration-300 flex items-center hover:scale-105 active:scale-95">
          <span className="text-sm text-green-300">USD</span>
          <span className="ml-2 w-2 h-2 border-t border-r border-green-300 rotate-45"></span>
        </button>

        <button className="relative group px-5 py-2 rounded-lg bg-opacity-10 bg-green-700 shadow-lg hover:bg-opacity-20 transition duration-300 flex items-center hover:scale-105 active:scale-95">
          <span className="text-sm text-green-300">Global</span>
          <span className="ml-2 w-2 h-2 border-t border-r border-green-300 rotate-45"></span>
        </button>
      </div>

      {/* Center - Search Bar (Hacker Style) */}
      <div className="relative flex items-center w-[30%]">
        <input
          type="text"
          className="w-full px-4 py-2 rounded-lg bg-transparent border border-green-600/30 text-green-300 outline-none focus:ring-2 focus:ring-green-400/50 placeholder-green-500/50 transition-all duration-300 hover:border-green-600/50 focus:border-green-600/50"
          placeholder="Search tokens..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="absolute right-2 px-3 py-1 bg-green-500/90 text-black font-semibold rounded-lg hover:bg-green-400 transition duration-300 hover:scale-105 active:scale-95">
          Search
        </button>
      </div>

      {/* Right Side - Control Buttons & Live Indicator */}
      <div className="flex items-center gap-4">
        <button className="relative group p-3 rounded-lg bg-transparent shadow-lg hover:shadow-green-500/20 transition duration-300 hover:scale-105 active:scale-95">
          <Squares2X2Icon className="h-6 w-6 text-green-300 group-hover:text-green-400 transition duration-300" />
        </button>
        <button className="relative group p-3 rounded-lg bg-transparent shadow-lg hover:shadow-green-500/20 transition duration-300 hover:scale-105 active:scale-95">
          <Cog6ToothIcon className="h-6 w-6 text-green-300 group-hover:text-green-400 transition duration-300" />
        </button>

        {/* Live Indicator - Terminal Green Heartbeat */}
        <div className="relative flex items-center gap-3 px-5 py-2 rounded-lg bg-opacity-10 bg-[#0D1A0D] shadow-lg text-sm font-semibold text-green-300 uppercase tracking-wide hover:scale-105 active:scale-95 transition duration-300">
          <span className="relative z-10">Live</span>
          <span className="relative flex items-center">
            <span className="relative w-3 h-3 bg-green-500 rounded-full shadow-lg animate-heartbeat"></span>
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;