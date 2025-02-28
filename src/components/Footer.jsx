import React from "react";
// 1) Import the FontAwesomeIcon component
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// 2) Import the X (Twitter) brand icon
import { faXTwitter } from "@fortawesome/free-brands-svg-icons";

const Footer = () => {
  return (
    <footer className="bg-black py-6">
      <div className="container mx-auto text-center">
        <a
          href="https://twitter.com/yourtwitteraccount"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white hover:text-green-500 transition-colors duration-200"
        >
          {/* 3) Use the FontAwesomeIcon component with faXTwitter */}
          <FontAwesomeIcon icon={faXTwitter} size="2x" />
        </a>
      </div>
    </footer>
  );
};

export default Footer;
