// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bars3Icon,
  XMarkIcon,
  ChartBarIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";
import Logo from "../assets/logo.png";

const Header = () => {
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
    <header className="w-full px-6 md:px-10 py-4 bg-black text-white z-50 relative">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div
          onClick={() => navigate("/")}
          className="flex items-center cursor-pointer hover:opacity-90 transition"
        >
          <img src={Logo} alt="Logo" className="w-20 md:w-24 h-20 md:h-24 object-contain" />
        </div>

        {/* LIVE Badge */}
        <div className="absolute left-1/2 -translate-x-1/2 top-4 md:static md:translate-x-0">
          <div className="flex items-center gap-2 px-4 py-1 bg-gradient-to-r from-yellow-900/40 via-zinc-900 to-green-800/40 rounded shadow-inner border border-yellow-500/20">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75 animate-heartbeat"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-300 shadow-[0_0_6px_#facc15]"></span>
            </span>
            <span className="text-xs font-mono text-[#00FF00] tracking-widest">
              LIVE
            </span>
          </div>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
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
          <button
            onClick={() => navigate("/twitterscan")}
            className="px-4 py-2 font-mono tracking-widest text-sm text-[#00FF00] bg-[#002b00] hover:bg-[#004400] rounded-md transition"
          >
            &gt;_ EXEC TWITTERSCAN
          </button>
          <div className="relative">
            <button
              onClick={() => navigate("/shillerscan")}
              className="px-4 py-2 font-mono tracking-widest text-sm text-cyan-400 bg-[#001f2e] hover:bg-[#003f5c] rounded-md transition"
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
              className="px-4 py-2 font-mono tracking-widest text-sm text-pink-400 bg-[#2a003f] hover:bg-[#440066] rounded-md transition"
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
  );
};

export default Header;
