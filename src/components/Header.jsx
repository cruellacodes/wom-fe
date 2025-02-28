import { Cog6ToothIcon, Squares2X2Icon } from "@heroicons/react/24/solid";
import React, { useState } from "react";

const Header = () => {
  const [search, setSearch] = useState("");

  return (
    <header className="relative flex items-center justify-between px-8 py-5 rounded-xl text-green-300 shadow-[0px_0px_60px_rgba(34,197,94,0.2)] backdrop-blur-xl bg-opacity-95 bg-[#050A0A] border border-green-800/30">
      {/* Background Glow for Depth */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-700/10 via-green-600/10 to-green-500/5 opacity-50 blur-3xl pointer-events-none"></div>

      {/* Left Side - Selection Controls */}
      <div className="flex items-center gap-4">
        <button className="px-6 py-2 rounded-lg bg-green-900/20 shadow-lg hover:bg-green-800/40 transition duration-300 flex items-center hover:scale-105 active:scale-95">
          <span className="text-sm text-green-300">USD</span>
        </button>

        <button className="px-6 py-2 rounded-lg bg-green-900/20 shadow-lg hover:bg-green-800/40 transition duration-300 flex items-center hover:scale-105 active:scale-95">
          <span className="text-sm text-green-300">Global</span>
        </button>
      </div>

      {/* Center - Live Indicator */}
      <div className="relative flex items-center gap-6 w-[40%] justify-center">
        {/* Live Button with Heartbeat */}
        <div className="relative flex items-center gap-2 px-6 py-2 rounded-lg bg-green-900/20 shadow-lg text-sm font-semibold text-green-300 uppercase tracking-wide hover:scale-105 active:scale-95 transition duration-300">
          <span className="relative z-10">Live</span>
          <span className="relative flex items-center">
          <span className="relative w-2 h-2 bg-green-500 rounded-full">
            <span className="absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75 animate-ping"></span>
          </span>
          </span>
        </div>

        
      </div>

      {/* Right Side - Control Buttons */}
      <div className="flex items-center gap-5">
        <button className="p-3 rounded-lg bg-transparent shadow-lg hover:shadow-green-500/30 transition duration-300 hover:scale-110 active:scale-95">
          <Squares2X2Icon className="h-7 w-7 text-green-300 group-hover:text-green-400 transition duration-300" />
        </button>
        <button className="p-3 rounded-lg bg-transparent shadow-lg hover:shadow-green-500/30 transition duration-300 hover:scale-110 active:scale-95">
          <Cog6ToothIcon className="h-7 w-7 text-green-300 group-hover:text-green-400 transition duration-300" />
        </button>
      </div>
    </header>
  );
};

export default Header;
