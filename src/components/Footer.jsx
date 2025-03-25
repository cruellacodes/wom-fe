import React from "react";
import { FaTelegramPlane, FaGithub } from "react-icons/fa";
import { SiX } from "react-icons/si";
import Logo from "../assets/logo.png";

const Footer = () => {
  return (
    <footer className="relative bg-[#050A0A] text-gray-400 px-6 pt-14 pb-10 border-t border-green-900/40 backdrop-blur-lg bg-opacity-90 shadow-inner">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left items-start">

        {/* About WOM */}
        <div className="flex flex-col items-center md:items-start">
          <img
            src={Logo}
            alt="WOM Logo"
            className="w-24 h-24 mb-4 opacity-95 hover:opacity-100 transition duration-300"
          />
          <h2 className="text-lg font-semibold text-white mb-2 tracking-wide">What is WOM?</h2>
          <p className="text-sm leading-relaxed text-gray-400 max-w-sm">
            WOM (Word of Mouth) is a real-time sentiment signal for the crypto market.
            It uses AI (via CryptoBERT) to scan Twitter, detect emerging hype, and quantify what the crowd is feeling.
            By filtering out spam, shills, and noise, WOM helps you spot early traction and evolving token narratives.
          </p>
        </div>

        {/* Explore Links */}
        <div className="flex flex-col items-center md:items-start">
          <h3 className="text-lg font-semibold text-white mb-4 tracking-wide">Explore</h3>
          <ul className="space-y-2">
            {[
              { label: "Premium", path: "/premium" },
              { label: "WOM Score & CryptoBERT", path: "https://github.com/YOUR_GITHUB_HANDLE/README.md" },
              { label: "Docs", path: "/docs" },
              { label: "Contact", path: "/contact" },
            ].map(({ label, path }, i) => (
              <li key={i}>
                <a
                  href={path}
                  target={path.startsWith("http") ? "_blank" : "_self"}
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 hover:text-white transition duration-300"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Socials */}
        <div className="flex flex-col items-center md:items-start">
          <h3 className="text-lg font-semibold text-white mb-4 tracking-wide">Connect</h3>
          <div className="flex flex-col space-y-3 w-full">
            {[
              {
                name: "X",
                icon: <SiX className="w-5 h-5 text-white" />,
                link: "https://x.com/YOUR_HANDLE"
              },
              {
                name: "Telegram",
                icon: <FaTelegramPlane className="w-5 h-5 text-[#229ED9]" />,
                link: "https://t.me/YOUR_HANDLE"
              },
              {
                name: "GitHub",
                icon: <FaGithub className="w-5 h-5 text-gray-300" />,
                link: "https://github.com/YOUR_GITHUB_HANDLE"
              }
            ].map(({ name, icon, link }, i) => (
              <a
                key={i}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 px-3 py-2 bg-green-900/10 rounded-md hover:bg-green-800/30 transition-all duration-200 hover:scale-[1.03]"
              >
                {icon}
                <span className="text-sm text-gray-300 group-hover:text-white">{name}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Tagline */}
      <div className="mt-12 text-center text-sm text-gray-500 italic tracking-wide">
        AI that decodes degens so you don’t have to.
      </div>

      {/* Copyright */}
      <div className="mt-4 pt-4 text-center text-xs text-gray-500 border-t border-green-800/30">
        © {new Date().getFullYear()} WOM. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
