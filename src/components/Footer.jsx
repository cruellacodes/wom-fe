// eslint-disable-next-line no-unused-vars
import React from "react";
import { FaTelegramPlane, FaGithub } from "react-icons/fa";
import { SiX } from "react-icons/si";
import { ArrowUpIcon } from "@heroicons/react/24/solid";
import Logo from "../assets/logo.png";

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
            WOM (Word of Mouth AI) is your signal in the noise, an AI powered engine tuned to the pulse of the web.
            It captures real-time narratives, filters out the fluff, and reveals what’s really moving the crowd.
            Designed to spot momentum before it becomes mainstream.
          </p>
        </div>

        {/* Right: Links + Socials */}
        <div className="flex flex-col md:items-end items-start gap-6 justify-between h-full">
          <ul className="flex flex-wrap gap-6 text-sm">
            {[
              { label: "Docs", path: "https://github.com/cruellacodes/wom/blob/main/README.md" },
              { label: "Premium", path: "/premium" },
              { label: "WOM Score", path: "https://github.com/cruellacodes/wom/blob/main/wom/cryptoBertPaper.md" },
              { label: "Contact", path: "/contact" },
            ].map(({ label, path }, i) => (
              <li key={i}>
                <a
                  href={path}
                  target={path.startsWith("http") ? "_blank" : "_self"}
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-white transition"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex gap-4">
            {[
              { icon: <SiX className="w-5 h-5" />, link: "https://x.com/wordofmouth_ai" },
              { icon: <FaTelegramPlane className="w-5 h-5" />, link: "https://t.me/YOUR_HANDLE" },
              { icon: <FaGithub className="w-5 h-5" />, link: "https://github.com/cruellacodes" },
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
