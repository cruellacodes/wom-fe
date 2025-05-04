// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bars3Icon,
  XMarkIcon,
  TrophyIcon,
  ChartBarIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";
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
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition rounded-md cursor-pointer"
            >
              {icon}
              {label}
            </button>
          ))}

          {/* TwitterScan Terminal Button */}
          <button
            onClick={() => navigate("/twitterscan")}
            className="px-4 py-2 font-mono tracking-widest text-sm text-[#00FF00] bg-[#002b00] hover:bg-[#004400] rounded-md transition cursor-pointer"
          >
            &gt;_ EXEC TWITTERSCAN
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
              className="flex items-center gap-2 px-3 py-2 rounded hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              {icon}
              {label}
            </button>
          ))}
          <button
            onClick={() => navigate("/twitterscan")}
            className="flex items-center gap-2 px-4 py-2 text-sm font-mono tracking-widest text-[#00FF00] bg-[#002b00] hover:bg-[#004400] rounded-md transition cursor-pointer"
          >
            &gt;_ EXEC TWITTERSCAN
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
