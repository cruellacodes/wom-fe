import React from "react";
import ReactApexChart from "react-apexcharts";
import { motion } from "framer-motion";

// Podium Colors Matching Glow Effects
const podiumColors = ["#8A2BE2", "#FFD700", "#00BFFF"]

const PodiumPolarChart = ({ tokens }) => {
  // Select Top 3 Tokens by Tweet Count
  const topTokens = [...tokens].sort((a, b) => b.TweetCount - a.TweetCount).slice(0, 3);

  // Chart Data
  const chartOptions = {
    chart: {
      type: "polarArea",
      animations: { enabled: true },
      toolbar: { show: false }
    },
    labels: topTokens.map(token => token.Token), // Token Names
    colors: podiumColors,
    stroke: { width: 1, colors: ["#fff"] }, // White border on segments
    fill: { opacity: 0.8 },
    plotOptions: {
      polarArea: { rings: { strokeWidth: 1 }, spokes: { strokeWidth: 1 } }
    },
    legend: {
      position: "bottom",
      labels: { colors: "#22C55E", useSeriesColors: true }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
      className="p-6 rounded-xl bg-[#0A0F0A] border border-green-900/40 backdrop-blur-lg 
      bg-opacity-90 shadow-[0px_0px_40px_rgba(34,197,94,0.15)] hover:shadow-[0px_0px_60px_rgba(34,197,94,0.3)]
      transition-all duration-300 max-w-lg mx-auto"
    >
      <h2 className="text-xl font-bold text-green-400 text-center mb-2">Talk of the Day</h2>
        <p className="text-center text-gray-400 text-sm italic mb-12">Based on our filtered tweet system</p>

      {/* Polar Area Chart */}
      <ReactApexChart options={chartOptions} series={topTokens.map(token => token.TweetCount)} type="polarArea" height={350} />
    </motion.div>
  );
};

export default PodiumPolarChart;
