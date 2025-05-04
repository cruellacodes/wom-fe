import { Bars3Icon, XMarkIcon, BoltIcon } from "@heroicons/react/24/solid";
// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";
import Logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";

// eslint-disable-next-line no-empty-pattern
const Header = ({  }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleScrollRedirect = (target) => {
    setMenuOpen(false);
    setTimeout(() => {
      navigate("/", { state: { scrollTo: target } });
    }, 100);
  };

  const mobileNavItems = [
    {
      label: "Leaderboard",
      action: () => handleScrollRedirect("leaderboard"),
    },
    {
      label: "Sentiment",
      action: () => handleScrollRedirect("sentiment"),
    },
    {
      label: "How it works",
      action: () => {
        setMenuOpen(false);
        navigate("/about");
      },
    },
    {
      label: "TwitterScan",
      action: () => {
        setMenuOpen(false);
        navigate("/twitterscan");
      },
    },
  ];

  return (
    <header className="relative flex items-center justify-between px-6 py-4 text-green-300 shadow-xl backdrop-blur-xl bg-black/80 border-b border-green-800/20 z-50">
      
      {/* Left Side - Clickable Logo */}
      <div
        className="flex items-center cursor-pointer transition hover:opacity-90"
        onClick={() => navigate("/")}
      >
        <img src={Logo} alt="Logo" className="w-28 h-28 object-contain" />
      </div>

      {/* Center - Live Indicator */}
      <div className="absolute left-1/2 transform -translate-x-1/2">
        <div className="flex items-center gap-2 px-5 py-1.5 rounded-lg bg-gradient-to-br from-green-800/30 to-green-900/10 border border-green-500/10 shadow-xl text-sm font-semibold text-green-300 uppercase tracking-wide 
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

      {/* Right Side - Desktop & Mobile Nav */}
      <div className="flex items-center gap-4">

        {/* Desktop Buttons */}
        <div className="hidden md:flex gap-4">
          <button
            className="px-6 py-2 rounded-lg bg-gradient-to-br from-green-800/30 to-green-900/10 backdrop-blur-md border border-green-700/20 shadow-lg hover:shadow-green-500/30 transition-all duration-300 ease-in-out flex items-center hover:scale-105 active:scale-95"
            onClick={() => navigate("/twitterscan")}
          >
            <span className="text-sm text-green-300">TwitterScan</span>
          </button>

          <button
            className="px-6 py-2 rounded-lg bg-gradient-to-br from-green-800/30 to-green-900/10 backdrop-blur-md border border-green-700/20 shadow-lg hover:shadow-green-500/30 transition-all duration-300 ease-in-out flex items-center hover:scale-105 active:scale-95"
            onClick={() => navigate("/about")}
          >
            <span className="text-sm text-green-300">How it works</span>
          </button>

          <button
            className="px-6 py-2 rounded-lg bg-gradient-to-br from-green-800/30 to-green-900/10 backdrop-blur-md border border-green-700/20 shadow-lg hover:shadow-green-500/30 transition-all duration-300 ease-in-out flex items-center hover:scale-105 active:scale-95"
            onClick={() => handleScrollRedirect("leaderboard")}
          >
            <span className="text-sm text-green-300">Leaderboard</span>
          </button>

          <button
            className="px-6 py-2 rounded-lg bg-gradient-to-br from-green-800/30 to-green-900/10 backdrop-blur-md border border-green-700/20 shadow-lg hover:shadow-green-500/30 transition-all duration-300 ease-in-out flex items-center hover:scale-105 active:scale-95"
            onClick={() => handleScrollRedirect("sentiment")}
          >
            <span className="text-sm text-green-300">Sentiment</span>
          </button>
        </div>

        {/* Mobile Menu Toggle */}
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
        <div className="absolute top-16 right-6 w-52 z-50 bg-gradient-to-br from-black/90 to-green-900/20 backdrop-blur-lg border border-green-700/20 shadow-2xl rounded-lg md:hidden transition-all duration-300 ease-in-out">
          <ul className="flex flex-col">
            {mobileNavItems.map((item) => (
              <li key={item.label}>
                <button
                  className="w-full text-left px-6 py-3 text-green-300 hover:bg-green-800/40 transition duration-300"
                  onClick={item.action}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
};

export default Header;
