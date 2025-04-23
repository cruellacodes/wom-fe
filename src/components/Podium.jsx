import React from "react";
import ReactApexChart from "react-apexcharts";
import { motion } from "framer-motion";

const podiumColors = ["#8A2BE2", "#FFD700", "#00BFFF"];

const PodiumPolarChart = ({ tokens }) => {

  // Filter and prepare top 3 tokens safely
  const topTokens = [...tokens]
  .sort((a, b) => b.tweet_count - a.tweet_count)
  .slice(0, 3);


  const chartOptions = {
    chart: {
      type: "polarArea",
      animations: { enabled: true },
      toolbar: { show: false },
      background: "transparent",
    },
    labels: topTokens.map((token) => token.token_symbol),
    colors: podiumColors,
    stroke: {
      width: 1,
      colors: ["#fff"],
    },
    fill: {
      opacity: 0.75,
    },
    plotOptions: {
      polarArea: {
        rings: {
          strokeWidth: 1,
        },
        spokes: {
          strokeWidth: 1,
        },
      },
    },
    legend: {
      position: "bottom",
      labels: {
        colors: "#22C55E",
        useSeriesColors: true,
      },
    },
    tooltip: {
      theme: "dark",
      fillSeriesColor: false,
      style: { fontSize: "12px" },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
      className="p-3 rounded-md bg-[#0A0F0A] border border-green-800/40 backdrop-blur-lg 
      bg-opacity-90 shadow-md hover:shadow-lg transition-all duration-300 max-w-md mx-auto w-full"
    >
      <h2 className="text-sm font-semibold text-green-300 text-center mb-1">
        Talk of the Day
      </h2>
      <p className="text-center text-gray-400 text-xs italic mb-3">
        Based on filtered tweet volume
      </p>

      {topTokens.length > 0 ? (
        <div className="w-[90%] mx-auto">
          <ReactApexChart
            options={chartOptions}
            series={topTokens.map((token) => token.tweet_count)}
            type="polarArea"
            height={230}
          />
        </div>
      ) : (
        <p className="text-center text-gray-400 text-sm">No tweet data available.</p>
      )}
    </motion.div>
  );
};

export default PodiumPolarChart;