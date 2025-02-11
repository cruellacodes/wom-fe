import React from "react";
import { motion } from "framer-motion";
import GoldMedal from "../assets/trophy1.png";
import SilverMedal from "../assets/trophy2.png";
import BronzeMedal from "../assets/trophy3.png";


// Podium Styles: Heights, Glows, and Local Icons
const podiumStyles = [
    { height: "h-48", glow: "shadow-yellow-500/50", icon: <img src={GoldMedal} alt="Gold Medal" className="h-14 w-14" />, position: "order-2" }, 
    { height: "h-40", glow: "shadow-blue-500/50", icon: <img src={SilverMedal} alt="Silver Medal" className="h-12 w-12" />, position: "order-1" }, 
    { height: "h-36", glow: "shadow-purple-500/50", icon: <img src={BronzeMedal} alt="Bronze Medal" className="h-12 w-12" />, position: "order-3" }, // 🥉 3rd (Right)
];

const Podium = ({ tokens }) => {
  // Select Top 3 Tokens by Tweet Count
  const topTokens = [...tokens].sort((a, b) => b.TweetCount - a.TweetCount).slice(0, 3);

  return (
    <div className="flex justify-center items-end gap-6 mb-12 relative">
      
      {/* Neon Glow Base for Podium */}
      <div className="absolute bottom-[-10px] w-[90%] h-4 bg-green-500/20 blur-lg rounded-full"></div>

      <div className="grid grid-cols-3 gap-4 items-end">
        {topTokens.map((token, index) => (
          <motion.div
            key={token.Token}
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: index * 0.3, type: "spring", bounce: 0.4 }}
            className={`relative flex flex-col items-center justify-center rounded-xl 
            bg-black/30 ${podiumStyles[index].glow} ${podiumStyles[index].height} 
            w-32 backdrop-blur-md shadow-lg transition-all duration-300 hover:scale-105 ${podiumStyles[index].position}`}
          >
            {/* Token Name (On Top of Box) */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 + index * 0.2 }}
              className="absolute top-[-28px] px-3 py-1 text-lg font-bold uppercase bg-black/90 border border-green-300 rounded-md shadow-lg"
            >
              {token.Token}
            </motion.p>

            {/* Centered Icon Inside Podium Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.6 + index * 0.2 }}
            >
              {podiumStyles[index].icon}
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Podium;
