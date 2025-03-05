import React from "react";
import { FaTwitter, FaTelegramPlane, FaGithub } from "react-icons/fa";
import Logo from "../assets/logo.png";

const Footer = () => {
  return (
    <footer className="relative bg-[#050A0A] text-gray-400 py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">

        {/* About Section */}
        <div className="flex flex-col items-center md:items-start">
          <img src={Logo} alt="WOM Logo" className="w-20 h-20 mb-3" />
          <h2 className="text-lg font-semibold text-white">About</h2>
          <p className="text-sm max-w-xs leading-relaxed">
            WOM tracks real-time sentiment analysis of crypto tokens.  
            Stay informed, track trends, and gain insights into the market.
          </p>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-col items-center md:items-start">
          <h3 className="text-lg font-semibold text-white mb-3">Navigation</h3>
          <ul className="space-y-2">
            <li><a href="/premium" className="text-sm hover:text-green-400 transition">Premium</a></li>
            <li><a href="/api-plans" className="text-sm hover:text-green-400 transition">API Plans</a></li>
            <li><a href="/docs" className="text-sm hover:text-green-400 transition">Docs</a></li>
            <li><a href="/contact" className="text-sm hover:text-green-400 transition">Contact</a></li>
          </ul>
        </div>

        {/* Socials */}
        <div className="flex flex-col items-center md:items-start">
          <h3 className="text-lg font-semibold text-white mb-3">Follow Us</h3>
          <div className="flex gap-6">
            <a href="https://twitter.com/YOUR_TWITTER_HANDLE" target="_blank" rel="noopener noreferrer" 
              className="flex items-center gap-2 text-sm hover:text-green-400 transition">
              <FaTwitter className="w-5 h-5 text-blue-400" />
              Twitter
            </a>
            <a href="https://t.me/YOUR_TELEGRAM_HANDLE" target="_blank" rel="noopener noreferrer" 
              className="flex items-center gap-2 text-sm hover:text-green-400 transition">
              <FaTelegramPlane className="w-5 h-5 text-blue-500" />
              Telegram
            </a>
            <a href="https://github.com/YOUR_GITHUB_HANDLE" target="_blank" rel="noopener noreferrer" 
              className="flex items-center gap-2 text-sm hover:text-green-400 transition">
              <FaGithub className="w-5 h-5 text-gray-300" />
              GitHub
            </a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-green-800/40 mt-10 pt-4 text-center text-xs text-gray-500">
        © 2025 WOM. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;
