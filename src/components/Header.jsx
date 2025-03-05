import { Bars3Icon, XMarkIcon, BoltIcon } from "@heroicons/react/24/solid";
import React, { useState } from "react";
import Logo from "../assets/logo.png";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="relative flex items-center justify-between px-6 py-4 text-green-300 shadow-lg backdrop-blur-xl bg-opacity-95 bg-black">
      
      {/* Left Side - Bigger Logo */}
      <div className="flex items-center">
        <img src={Logo} alt="Logo" className="w-30 h-30 object-contain" />
      </div>

      {/* Center - Live Indicator (Smaller, No Border) */}
      <div className="absolute left-1/2 transform -translate-x-1/2">
        <div className="flex items-center gap-2 px-5 py-1.5 rounded-lg bg-green-900/20 shadow-lg text-sm font-semibold text-green-300 uppercase tracking-wide 
          hover:scale-110 active:scale-95 transition duration-300 animate-pulse">
          <BoltIcon className="w-4 h-4 text-yellow-300 animate-spin-slow" />
          <span className="text-base font-bold text-yellow-300">LIVE</span>
          <span className="relative flex items-center">
            <span className="relative w-2.5 h-2.5 bg-green-500 rounded-full">
              <span className="absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75 animate-ping"></span>
            </span>
          </span>
        </div>
      </div>

      {/* Right Side - Navigation & Mobile Menu */}
      <div className="flex items-center gap-4">
        {/* Desktop Buttons */}
        <div className="hidden md:flex gap-4">
          <button className="px-6 py-2 rounded-lg bg-green-900/20 shadow-lg hover:bg-green-800/40 transition duration-300 flex items-center hover:scale-110 active:scale-95">
            <span className="text-sm text-green-300">Leaderboard</span>
          </button>

          <button className="px-6 py-2 rounded-lg bg-green-900/20 shadow-lg hover:bg-green-800/40 transition duration-300 flex items-center hover:scale-110 active:scale-95">
            <span className="text-sm text-green-300">Sentiment</span>
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="block md:hidden p-2 bg-green-900/20 rounded-lg hover:bg-green-800/40 transition duration-300"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? (
            <XMarkIcon className="w-6 h-6 text-green-300" />
          ) : (
            <Bars3Icon className="w-6 h-6 text-green-300" />
          )}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="absolute top-16 right-6 w-48 bg-black bg-opacity-95 shadow-lg rounded-lg md:hidden">
          <ul className="flex flex-col">
            <li>
              <button className="w-full text-left px-6 py-3 text-green-300 hover:bg-green-800/40 transition duration-300">
                Leaderboard
              </button>
            </li>
            <li>
              <button className="w-full text-left px-6 py-3 text-green-300 hover:bg-green-800/40 transition duration-300">
                Sentiment
              </button>
            </li>
          </ul>
        </div>
      )}
      
    </header>
  );
};

export default Header;
