// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bars3Icon,
  XMarkIcon,
  ChartBarIcon,
  BookOpenIcon,
  StarIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import Logo from "../assets/logo.png";

// eslint-disable-next-line react/prop-types
const Header = ({ onFeaturedClick }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
  }, [menuOpen]);

  const navItems = [
    {
      icon: <ChartBarIcon className="w-5 h-5" />,
      label: "Leaderboard",
      action: () => navigate("/", { state: { scrollTo: "leaderboard" } }),
    },
    {
      icon: <BookOpenIcon className="w-5 h-5" />,
      label: "How it works",
      action: () => navigate("/about"),
    },
  ];

  return (
    <>
      {/* Main Header */}
      <header className="w-full px-6 md:px-10 py-4 bg-black text-white z-50 relative">
        <div className="flex items-center justify-between w-full">
          {/* Left - Logo + Nav + LIVE */}
          <div className="flex items-center gap-6 flex-shrink-0">
            <div
              onClick={() => navigate("/")}
              className="flex items-center cursor-pointer hover:opacity-90 transition"
            >
              <img
                src={Logo}
                alt="Logo"
                className="w-20 md:w-24 h-20 md:h-24 object-contain"
              />
            </div>
            <div className="hidden md:flex items-center gap-4">
              {navItems.map(({ icon, label, action }) => (
                <button
                  key={label}
                  onClick={action}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition rounded-md"
                >
                  {icon}
                  {label}
                </button>
              ))}
              {/* LIVE - Mini inline status */}
              <div className="flex items-center gap-1 text-[10px] font-mono text-[#00FF00] pl-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FF00] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00FF00]"></span>
                </span>
                <span>LIVE</span>
              </div>
            </div>
          </div>

          {/* Right - EXEC Buttons */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => navigate("/twitterscan")}
              className="px-2.5 py-1.5 font-mono tracking-widest text-xs text-[#00FF00] bg-[#002b00] hover:bg-[#004400] rounded-md transition"
            >
              &gt;_ EXEC TWITTERSCAN
            </button>
            <div className="relative">
              <button
                onClick={() => navigate("/shillerscan")}
                className="px-2.5 py-1.5 font-mono tracking-widest text-xs text-cyan-400 bg-[#001f2e] hover:bg-[#003f5c] rounded-md transition"
              >
                &gt;_ EXEC SHILLERSCAN
              </button>
              <span className="absolute -top-2 -right-2 text-[10px] font-bold bg-purple-600 text-white px-1.5 py-0.5 rounded shadow-md uppercase tracking-wide">
                BETA
              </span>
            </div>
            <div className="relative">
              <button
                onClick={() => navigate("/stocksanalyzer")}
                className="px-2.5 py-1.5 font-mono tracking-widest text-xs text-pink-400 bg-[#2a003f] hover:bg-[#440066] rounded-md transition"
              >
                &gt;_ EXEC STOCKSANALYZER
              </button>
              <span className="absolute -top-2 -right-2 text-[10px] font-bold bg-yellow-600 text-white px-1.5 py-0.5 rounded shadow-md uppercase tracking-wide">
                SOON
              </span>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 hover:bg-zinc-800 rounded z-50"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <XMarkIcon className="w-6 h-6 text-white" />
            ) : (
              <Bars3Icon className="w-6 h-6 text-white" />
            )}
          </button>
        </div>

        {/* Mobile Dropdown */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
            menuOpen ? "max-h-96 mt-4" : "max-h-0"
          }`}
        >
          <div className="flex flex-col gap-3 text-sm text-zinc-300">
            {navItems.map(({ icon, label, action }) => (
              <button
                key={label}
                onClick={() => {
                  setMenuOpen(false);
                  action();
                }}
                className="flex items-center gap-2 px-3 py-2 rounded hover:text-white hover:bg-white/10 transition"
              >
                {icon}
                {label}
              </button>
            ))}
            
            {/* Mobile Featured Button */}
            <button
              onClick={() => {
                setMenuOpen(false);
                onFeaturedClick();
              }}
              className="flex items-center gap-2 px-3 py-2 text-yellow-300 border border-yellow-600/30 rounded hover:text-yellow-100 hover:bg-yellow-900/20 transition"
            >
              <StarIcon className="w-5 h-5" />
              Get Featured
            </button>

            <button
              onClick={() => {
                setMenuOpen(false);
                navigate("/twitterscan");
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-mono tracking-widest text-[#00FF00] bg-[#002b00] hover:bg-[#004400] rounded-md transition"
            >
              &gt;_ EXEC TWITTERSCAN
            </button>
            <div className="relative">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/shillerscan");
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-mono tracking-widest text-cyan-400 bg-[#001f2e] hover:bg-[#003f5c] rounded-md transition"
              >
                &gt;_ EXEC SHILLERSCAN
              </button>
              <span className="absolute -top-2 -right-2 text-[10px] font-bold bg-purple-600 text-white px-1.5 py-0.5 rounded shadow-md uppercase tracking-wide">
                BETA
              </span>
            </div>
            <div className="relative">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/stocksanalyzer");
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-mono tracking-widest text-pink-400 bg-[#2a003f] hover:bg-[#440066] rounded-md transition"
              >
                &gt;_ EXEC STOCKSANALYZER
              </button>
              <span className="absolute -top-2 -right-2 text-[10px] font-bold bg-yellow-600 text-white px-1.5 py-0.5 rounded shadow-md uppercase tracking-wide">
                SOON
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Featured Promotion Bar */}
      <div className="w-full bg-gradient-to-r from-yellow-900/30 via-orange-900/30 to-yellow-900/30 border-b border-yellow-600/20 backdrop-blur-sm">
        <div className="px-6 md:px-10 py-3">
          <div className="flex items-center justify-center gap-4 text-center">
            <div className="flex items-center gap-2 text-yellow-300">
              <SparklesIcon className="w-5 h-5 animate-pulse" />
              <span className="hidden sm:inline text-sm font-medium">
                Get your token featured in the top 3 spots
              </span>
              <span className="sm:hidden text-sm font-medium">
                Feature your token
              </span>
            </div>
            
            <button
              onClick={onFeaturedClick}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white text-sm font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg"
            >
              <StarIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Get Featured Now</span>
              <span className="sm:hidden">Get Featured</span>
            </button>
            
            <div className="hidden md:flex items-center gap-4 text-xs text-yellow-200/80">
              <span>• From $5 USDC</span>
              <span>• 3-24 hour options</span>
              <span>• Instant activation</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;