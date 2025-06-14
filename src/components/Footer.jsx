/* eslint-disable react/prop-types */
// eslint-disable-next-line no-unused-vars
import React from "react";
import { ArrowUpIcon } from "@heroicons/react/24/solid";
import Logo from "../assets/logo.webp";
import { Link } from "react-router-dom";

// Lightweight custom SVG icons to replace react-icons
const GitHubIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

const XIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-black text-white/90 px-6 pt-12 pb-6 relative">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">

        {/* Left: Logo + Description */}
        <div className="flex flex-col gap-4">
          <img src={Logo} alt="WOM Logo" className="w-24 h-24 object-contain" />
          <p className="text-sm leading-relaxed text-white/80">
            WoM (Word of Mouth) is your signal in the noise, an AI powered engine tuned to the pulse of the web.
            It captures real-time narratives, filters out the fluff, and reveals what&apos;s really moving the crowd.
            Designed to spot momentum before it becomes mainstream.
          </p>
        </div>

        {/* Right: Links + Socials */}
        <div className="flex flex-col md:items-end items-start gap-6 justify-between h-full">
          <ul className="flex flex-wrap gap-6 text-sm">
            {[
              { label: "Docs", path: "https://github.com/cruellacodes/wom/blob/main/README.md" },
              // { label: "Premium", path: "/premiuminfo" },
              { label: "WOM Score", path: "https://github.com/cruellacodes/wom/blob/main/wom/sentimentEngine.md" },
              { label: "Contact", path: "/contact" },
            ].map(({ label, path }, i) => (
              <li key={i}>
                {path.startsWith("http") ? (
                  <a
                    href={path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/70 hover:text-white transition"
                  >
                    {label}
                  </a>
                ) : (
                  <Link to={path} className="text-white/70 hover:text-white transition">
                    {label}
                  </Link>
                )}
              </li>
            ))}
          </ul>

          <div className="flex flex-col items-start md:items-end gap-2">
            <div className="flex gap-4">
              {[
                { icon: <XIcon className="w-5 h-5" />, link: "https://x.com/womdotfun" },
                // { icon: <FaTelegramPlane className="w-5 h-5" />, link: "https://t.me/" },
                { icon: <GitHubIcon className="w-5 h-5" />, link: "https://github.com/cruellacodes" },
              ].map(({ icon, link }, idx) => (
                <a
                  key={idx}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition hover:scale-110"
                >
                  {icon}
                </a>
              ))}
            </div>

            {/* Made by cruellacodes note */}
            <p className="text-xs text-white/50">
              made by{" "}
              <a
                href="https://x.com/Cruellacodes"
                target="_blank"
                rel="noopener noreferrer"
                className=" text-white/70 hover:text-white"
              >
                cruellacodes
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Centered Tagline */}
      <div className="mt-10 text-center text-xs text-white/60">
        AI that reads degens so you don&apos;t have to.
      </div>

      {/* Bottom row: copyright + scroll up */}
      <div className="mt-4 pt-4 flex justify-between items-center text-xs">
        <p className="text-green-400">© {new Date().getFullYear()} WOM. All rights reserved.</p>
        <button
          onClick={scrollToTop}
          className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition hover:scale-110"
          aria-label="Scroll to top"
        >
          <ArrowUpIcon className="w-4 h-4 text-green-300" />
        </button>
      </div>
    </footer>
  );
};

export default Footer;