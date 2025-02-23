import React from "react";

const XIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 inline-block"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const Footer = () => {
  return (
    <footer className="bg-black py-6">
      <div className="container mx-auto text-center">
        <a
          href="https://twitter.com/yourtwitteraccount"  // Replace with your Twitter account URL
          target="_blank"
          rel="noopener noreferrer"
          className="text-white hover:text-green-500 transition-colors duration-200"
        >
          <XIcon />
        </a>
      </div>
    </footer>
  );
};

export default Footer;
