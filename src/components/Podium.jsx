import React from "react";
import ReactApexChart from "react-apexcharts";
import { motion } from "framer-motion";

// Podium Colors Matching Glow Effects
const podiumColors = ["#8A2BE2", "#FFD700", "#00BFFF"];

const PodiumPolarChart = ({ tokens }) => {
  // Select Top 3 Tokens by Tweet Count
  const topTokens = [...tokens]
    .sort((a, b) => b.TweetCount - a.TweetCount)
    .slice(0, 3);

  // Chart Data
  const chartOptions = {
    chart: {
      type: "polarArea",
      animations: { enabled: true },
      toolbar: { show: false }, 
    },
    labels: topTokens.map((token) => token.Token), 
    colors: podiumColors,
    stroke: { width: 1, colors: ["#fff"] }, 
    fill: { opacity: 0.7 },
    plotOptions: {
      polarArea: { rings: { strokeWidth: 1 }, spokes: { strokeWidth: 1 } },
    },
    legend: {
      position: "bottom",
      labels: { colors: "#22C55E", useSeriesColors: true },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
      className="p-2 rounded-md bg-[#0A0F0A] border border-green-800/40 backdrop-blur-lg 
      bg-opacity-90 shadow-md hover:shadow-lg transition-all duration-300 max-w-md mx-auto"
    >
      <h2 className="text-s font-semibold text-green-300 text-center mb-1">
        Talk of the Day
      </h2>
      <p className="text-center text-gray-400 text-xs italic mb-2">
        Based on our filtered tweet system
      </p>
  
      <div className="w-[90%] mx-auto">
        <ReactApexChart
          options={chartOptions}
          series={topTokens.map((token) => token.TweetCount)}
          type="polarArea"
          height={230} 
        />
      </div>
    </motion.div>
  );
};

export default PodiumPolarChart;