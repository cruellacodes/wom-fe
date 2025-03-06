import React from "react";
import { FaTwitter, FaTelegramPlane, FaGithub } from "react-icons/fa";
import Logo from "../assets/logo.png";

const Footer = () => {
  return (
    <footer className="relative bg-[#050A0A] text-gray-400 py-10 px-6 border-t border-green-900/40">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-10 text-center sm:text-left">

        {/* About Section */}
        <div className="flex flex-col items-center sm:items-start">
          <img src={Logo} alt="WOM Logo" className="w-16 h-16 mb-3 opacity-90 hover:opacity-100 transition duration-300" />
          <h2 className="text-lg font-semibold text-white">About</h2>
          <p className="text-sm max-w-xs leading-relaxed text-gray-400">
            WOM tracks real-time sentiment analysis of crypto tokens.
            Stay informed, track trends, and gain insights into the market.
          </p>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-col items-center sm:items-start">
          <h3 className="text-lg font-semibold text-white mb-4">Navigation</h3>
          <ul className="space-y-2">
            {["Premium", "API Plans", "Docs", "Contact"].map((link, index) => (
              <li key={index}>
                <a href={`/${link.toLowerCase().replace(" ", "-")}`} 
                   className="text-sm text-gray-400 hover:text-green-400 transition duration-300 hover:tracking-wider">
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Socials */}
        <div className="flex flex-col items-center sm:items-start">
          <h3 className="text-lg font-semibold text-white mb-4">Follow Us</h3>
          <div className="flex gap-5">
            {[
              { icon: <FaTwitter className="w-6 h-6 text-blue-400" />, name: "Twitter", link: "https://twitter.com/YOUR_TWITTER_HANDLE" },
              { icon: <FaTelegramPlane className="w-6 h-6 text-blue-500" />, name: "Telegram", link: "https://t.me/YOUR_TELEGRAM_HANDLE" },
              { icon: <FaGithub className="w-6 h-6 text-gray-300" />, name: "GitHub", link: "https://github.com/YOUR_GITHUB_HANDLE" }
            ].map((social, index) => (
              <a 
                key={index} 
                href={social.link} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition duration-300 hover:scale-105"
              >
                {social.icon} {social.name}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="mt-10 pt-4 text-center text-xs text-gray-500 border-t border-green-800/40">
        © {new Date().getFullYear()} WOM. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;
