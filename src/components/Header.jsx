import {
  Bars3Icon,
  XMarkIcon,
  TrophyIcon,
  ChartBarIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";
// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/logo.png";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    {
      icon: <TrophyIcon className="w-5 h-5" />,
      label: "Leaderboard",
      action: () => navigate("/", { state: { scrollTo: "leaderboard" } }),
    },
    {
      icon: <ChartBarIcon className="w-5 h-5" />,
      label: "Sentiment",
      action: () => navigate("/", { state: { scrollTo: "sentiment" } }),
    },
    {
      icon: <BookOpenIcon className="w-5 h-5" />,
      label: "How it works",
      action: () => navigate("/about"),
    },
  ];

  return (
    <header className="w-full px-6 md:px-10 py-4 bg-black text-white z-40">
      <div className="flex items-center justify-between relative">
        {/* Logo */}
        <div
          onClick={() => navigate("/")}
          className="flex items-center cursor-pointer hover:opacity-90 transition"
        >
          <img src={Logo} alt="Logo" className="w-24 h-24 object-contain" />
        </div>

        {/* LIVE Badge */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-2 px-4 py-1 bg-gradient-to-r from-yellow-900/40 via-zinc-900 to-green-800/40 rounded shadow-inner border border-yellow-500/20 animate-pulse-fast">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75 animate-ping-slow"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-300 shadow-[0_0_6px_#facc15]"></span>
            </span>
            <span className="text-xs font-mono text-[#00FF00] tracking-widest animate-glow">
              LIVE
            </span>
          </div>
        </div>

        {/* Desktop Nav & CTA */}
        <div className="hidden md:flex items-center gap-6">
          {navItems.map(({ icon, label, action }) => (
            <button
              key={label}
              onClick={action}
              className="flex items-center gap-2 text-sm text-zinc-300 hover:text-white transition"
            >
              {icon}
              {label}
            </button>
          ))}

          {/* TwitterScan Terminal Button */}
          <button
            onClick={() => navigate("/twitterscan")}
            className="px-4 py-2 font-mono bg-black hover:bg-green-500/5 rounded-md tracking-widest text-sm border border-transparent transition text-[#00FF00] w-[22ch]"
          >
            <span className="flex items-center gap-1">
              <span>&gt;_</span>
              <span className="relative block">
                <span className="typewriter">EXEC TWITTERSCAN</span>
              </span>
            </span>
          </button>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 hover:bg-zinc-800 rounded"
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
      {menuOpen && (
        <div className="md:hidden mt-4 flex flex-col gap-3 text-sm text-zinc-300">
          {navItems.map(({ icon, label, action }) => (
            <button
              key={label}
              onClick={action}
              className="flex items-center gap-2 hover:text-white transition"
            >
              {icon}
              {label}
            </button>
          ))}
          <button
            onClick={() => navigate("/twitterscan")}
            className="flex items-center gap-2 px-4 py-2 border border-transparent text-green-300 hover:bg-green-500/10 hover:text-white transition rounded-md font-mono text-sm tracking-widest"
          >
            <span className="flex items-center whitespace-nowrap">
              <span className="overflow-hidden whitespace-nowrap typewriter-mobile">&gt;_ EXEC TWITTERSCAN</span>
            </span>
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
